/*
 * Copyright (c) 2026 zczhendev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package com.shadmin.modules.system.user

import com.shadmin.core.database.UserRoles
import com.shadmin.core.database.Users
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.SqlExpressionBuilder.like
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class UserRepository {

    fun create(request: CreateUserRequest, hashedPassword: String): User = transaction {
        val id = UUID.randomUUID()
        Users.insert { row ->
            row[Users.id] = id
            row[username] = request.username
            row[email] = request.email
            row[Users.phone] = request.phone
            row[Users.password] = hashedPassword
            row[status] = request.status
        }
        request.role_ids.forEach { roleId ->
            UserRoles.insert { ur -> ur[userId] = id; ur[UserRoles.roleId] = UUID.fromString(roleId) }
        }
        findById(id.toString())!!
    }

    fun findById(id: String): User? = transaction {
        Users.selectAll().where { Users.id eq UUID.fromString(id) }.map { it.toUser() }.singleOrNull()
    }

    fun findByUsername(username: String): User? = transaction {
        Users.selectAll().where { Users.username eq username }.map { it.toUser() }.singleOrNull()
    }

    fun findByEmail(email: String): User? = transaction {
        Users.selectAll().where { Users.email eq email }.map { it.toUser() }.singleOrNull()
    }

    fun query(filter: UserQueryFilter, currentUserId: String? = null): PagedResult<User> = transaction {
        val conditions = mutableListOf<Op<Boolean>>(Op.TRUE)
        if (filter.status.isNotBlank()) conditions.add(Users.status eq filter.status)
        if (filter.username.isNotBlank()) {
            conditions.add(Users.username like "%${filter.username}%")
        }

        // Apply data scope filtering
        if (currentUserId != null) {
            val dataScopeCondition = buildDataScopeCondition(currentUserId)
            if (dataScopeCondition != null) {
                conditions.add(dataScopeCondition)
            }
        }

        val whereClause = conditions.reduce { acc, op -> acc and op }
        val total = Users.selectAll().where { whereClause }.count().toInt()
        val userRows = Users.selectAll().where { whereClause }
            .limit(filter.page_size).offset(((filter.page - 1) * filter.page_size).toLong())
            .toList()

        val userIds = userRows.map { it[Users.id].value }
        val rolesByUser = mutableMapOf<UUID, MutableList<String>>()
        if (userIds.isNotEmpty()) {
            UserRoles.innerJoin(com.shadmin.core.database.Roles)
                .select(UserRoles.userId, com.shadmin.core.database.Roles.name)
                .where { UserRoles.userId inList userIds }
                .forEach { row ->
                    val uid = row[UserRoles.userId].value
                    val roleName = row[com.shadmin.core.database.Roles.name]
                    rolesByUser.getOrPut(uid) { mutableListOf() }.add(roleName)
                }
        }

        val list = userRows.map { row ->
            val uid = row[Users.id].value
            row.toUser().copy(role = rolesByUser[uid] ?: emptyList())
        }
        PagedResult(list, total, filter.page, filter.page_size, if (total == 0) 0 else (total + filter.page_size - 1) / filter.page_size)
    }

    /**
     * Check if [currentUserId] can access [targetUserId] based on their roles' data scopes.
     * Returns true if access is allowed, false otherwise.
     */
    fun canAccessUser(currentUserId: String, targetUserId: String): Boolean = transaction {
        val roleIds = getUserRoleIds(currentUserId)
        if (roleIds.isEmpty()) return@transaction currentUserId == targetUserId

        val scopes = com.shadmin.core.database.Roles
            .select(com.shadmin.core.database.Roles.dataScope)
            .where { com.shadmin.core.database.Roles.id inList roleIds.map { UUID.fromString(it) } }
            .map { it[com.shadmin.core.database.Roles.dataScope] }

        val effectiveScope = when {
            scopes.contains("ALL") -> "ALL"
            scopes.contains("DEPT_AND_CHILD") -> "DEPT_AND_CHILD"
            scopes.contains("DEPT") -> "DEPT"
            else -> "SELF"
        }

        when (effectiveScope) {
            "ALL" -> true
            "SELF" -> currentUserId == targetUserId
            "DEPT", "DEPT_AND_CHILD" -> {
                if (currentUserId == targetUserId) return@transaction true

                val deptIds = com.shadmin.core.database.UserDepartments
                    .select(com.shadmin.core.database.UserDepartments.departmentId)
                    .where { com.shadmin.core.database.UserDepartments.userId eq UUID.fromString(currentUserId) }
                    .map { it[com.shadmin.core.database.UserDepartments.departmentId].value.toString() }

                val accessibleDeptIds = if (effectiveScope == "DEPT_AND_CHILD") {
                    val allDeptIds = mutableSetOf<String>()
                    allDeptIds.addAll(deptIds)
                    deptIds.forEach { allDeptIds.addAll(getChildDepartmentIds(it)) }
                    allDeptIds.toList()
                } else {
                    deptIds
                }

                if (accessibleDeptIds.isEmpty()) {
                    currentUserId == targetUserId
                } else {
                    com.shadmin.core.database.UserDepartments
                        .select(com.shadmin.core.database.UserDepartments.userId)
                        .where {
                            com.shadmin.core.database.UserDepartments.departmentId inList accessibleDeptIds.map { UUID.fromString(it) }
                        }
                        .map { it[com.shadmin.core.database.UserDepartments.userId].value.toString() }
                        .contains(targetUserId)
                }
            }
            else -> currentUserId == targetUserId
        }
    }

    private fun buildDataScopeCondition(currentUserId: String): Op<Boolean>? {
        val roleIds = getUserRoleIds(currentUserId)
        if (roleIds.isEmpty()) return Users.id eq UUID.fromString(currentUserId)

        val scopes = com.shadmin.core.database.Roles
            .select(com.shadmin.core.database.Roles.dataScope)
            .where { com.shadmin.core.database.Roles.id inList roleIds.map { UUID.fromString(it) } }
            .map { it[com.shadmin.core.database.Roles.dataScope] }

        val effectiveScope = when {
            scopes.contains("ALL") -> "ALL"
            scopes.contains("DEPT_AND_CHILD") -> "DEPT_AND_CHILD"
            scopes.contains("DEPT") -> "DEPT"
            else -> "SELF"
        }

        return when (effectiveScope) {
            "ALL" -> null
            "SELF" -> Users.id eq UUID.fromString(currentUserId)
            "DEPT", "DEPT_AND_CHILD" -> {
                val deptIds = com.shadmin.core.database.UserDepartments
                    .select(com.shadmin.core.database.UserDepartments.departmentId)
                    .where { com.shadmin.core.database.UserDepartments.userId eq UUID.fromString(currentUserId) }
                    .map { it[com.shadmin.core.database.UserDepartments.departmentId].value.toString() }

                val accessibleDeptIds = if (effectiveScope == "DEPT_AND_CHILD") {
                    val allDeptIds = mutableSetOf<String>()
                    allDeptIds.addAll(deptIds)
                    deptIds.forEach { allDeptIds.addAll(getChildDepartmentIds(it)) }
                    allDeptIds.toList()
                } else {
                    deptIds
                }

                if (accessibleDeptIds.isEmpty()) {
                    Users.id eq UUID.fromString(currentUserId)
                } else {
                    val userIdsInDepts = com.shadmin.core.database.UserDepartments
                        .select(com.shadmin.core.database.UserDepartments.userId)
                        .where { com.shadmin.core.database.UserDepartments.departmentId inList accessibleDeptIds.map { UUID.fromString(it) } }
                        .map { it[com.shadmin.core.database.UserDepartments.userId].value }

                    if (userIdsInDepts.isEmpty()) {
                        Users.id eq UUID.fromString(currentUserId)
                    } else {
                        Users.id inList userIdsInDepts
                    }
                }
            }
            else -> Users.id eq UUID.fromString(currentUserId)
        }
    }

    private fun getChildDepartmentIds(parentId: String): List<String> {
        val children = com.shadmin.core.database.Departments
            .select(com.shadmin.core.database.Departments.id)
            .where { com.shadmin.core.database.Departments.parentId eq parentId }
            .map { it[com.shadmin.core.database.Departments.id].value.toString() }
        return children + children.flatMap { getChildDepartmentIds(it) }
    }

    fun update(userId: String, updates: UpdateUserRequest): User? = transaction {
        Users.update({ Users.id eq UUID.fromString(userId) }) { row ->
            updates.username?.let { row[username] = it }
            updates.email?.let { row[email] = it }
            updates.phone?.let { row[Users.phone] = it }
            updates.status?.let { row[status] = it }
            updates.avatar?.let { row[avatar] = it }
        }
        updates.role_ids?.let { roleIds ->
            UserRoles.deleteWhere { UserRoles.userId eq UUID.fromString(userId) }
            roleIds.forEach { roleId ->
                UserRoles.insert { ur -> ur[UserRoles.userId] = UUID.fromString(userId); ur[UserRoles.roleId] = UUID.fromString(roleId) }
            }
        }
        findById(userId)
    }

    fun updatePassword(userId: String, hashedPassword: String): Boolean = transaction {
        Users.update({ Users.id eq UUID.fromString(userId) }) { row -> row[password] = hashedPassword } > 0
    }

    fun delete(id: String): Boolean = transaction {
        Users.deleteWhere { Users.id eq UUID.fromString(id) } > 0
    }

    fun getUserRoles(userId: String): List<String> = transaction {
        UserRoles.innerJoin(com.shadmin.core.database.Roles).select(com.shadmin.core.database.Roles.name)
            .where { UserRoles.userId eq UUID.fromString(userId) }.map { it[com.shadmin.core.database.Roles.name] }
    }

    fun getUserRoleIds(userId: String): List<String> = transaction {
        UserRoles.select(UserRoles.roleId)
            .where { UserRoles.userId eq UUID.fromString(userId) }.map { it[UserRoles.roleId].value.toString() }
    }

    private fun ResultRow.toUser(): User {
        val uid = this[Users.id].value.toString()
        return User(id = uid, username = this[Users.username], email = this[Users.email], phone = this[Users.phone],
            password = this[Users.password], avatar = this[Users.avatar], is_admin = this[Users.isAdmin], status = this[Users.status],
            role = emptyList(), is_active = this[Users.isActive], created_at = this[Users.createdAt].toIsoString(),
            updated_at = this[Users.updatedAt].toIsoString())
    }
}
