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

package com.shadmin.modules.system.dept

import com.shadmin.core.database.Departments
import com.shadmin.core.database.UserDepartments
import com.shadmin.core.database.Users
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class DepartmentRepository {

    fun create(request: CreateDepartmentRequest): Department = transaction {
        val id = UUID.randomUUID()
        Departments.insert { row ->
            row[Departments.id] = id
            row[name] = request.name
            row[code] = request.code
            row[parentId] = request.parent_id
            row[sequence] = request.sequence
            row[status] = request.status
        }
        findById(id.toString())!!
    }

    fun findById(id: String): Department? = transaction {
        Departments.selectAll().where { Departments.id eq UUID.fromString(id) }
            .map { it.toDepartment() }.singleOrNull()
    }

    fun findByCode(code: String): Department? = transaction {
        Departments.selectAll().where { Departments.code eq code }
            .map { it.toDepartment() }.singleOrNull()
    }

    fun findAll(page: Int = 1, pageSize: Int = 20): PagedResult<Department> = transaction {
        val total = Departments.selectAll().count().toInt()
        val list = Departments.selectAll()
            .orderBy(Departments.sequence to SortOrder.ASC)
            .limit(pageSize).offset(((page - 1) * pageSize).toLong())
            .map { it.toDepartment() }
        PagedResult(
            list = list,
            total = total,
            page = page,
            page_size = pageSize,
            total_pages = if (total == 0) 0 else (total + pageSize - 1) / pageSize
        )
    }

    fun buildDeptTree(): List<Department> = transaction {
        val all = Departments.selectAll().orderBy(Departments.sequence to SortOrder.ASC)
            .map { it.toDepartment() }
        buildTree(all)
    }

    fun update(id: String, request: UpdateDepartmentRequest): Department? = transaction {
        Departments.update({ Departments.id eq UUID.fromString(id) }) { row ->
            request.name?.let { row[name] = it }
            request.code?.let { row[code] = it }
            request.parent_id?.let { row[parentId] = it }
            request.sequence?.let { row[sequence] = it }
            request.status?.let { row[status] = it }
        }
        findById(id)
    }

    fun delete(id: String): Boolean = transaction {
        // Delete child departments recursively
        val childIds = Departments.selectAll().where { Departments.parentId eq id }
            .map { it[Departments.id].value.toString() }
        childIds.forEach { delete(it) }
        // Delete user associations
        UserDepartments.deleteWhere { UserDepartments.departmentId eq UUID.fromString(id) }
        Departments.deleteWhere { Departments.id eq UUID.fromString(id) } > 0
    }

    fun getUserDepartments(userId: String): List<String> = transaction {
        UserDepartments.selectAll().where { UserDepartments.userId eq UUID.fromString(userId) }
            .map { it[UserDepartments.departmentId].value.toString() }
    }

    fun setUserDepartments(userId: String, deptIds: List<String>) = transaction {
        UserDepartments.deleteWhere { UserDepartments.userId eq UUID.fromString(userId) }
        deptIds.forEach { deptId ->
            UserDepartments.insert { ud ->
                ud[UserDepartments.userId] = UUID.fromString(userId)
                ud[UserDepartments.departmentId] = UUID.fromString(deptId)
            }
        }
    }

    fun findUsersByDepartment(deptId: String): List<User> = transaction {
        UserDepartments.innerJoin(Users)
            .select(Users.id, Users.username, Users.email, Users.phone, Users.avatar, Users.isAdmin, Users.status, Users.isActive, Users.createdAt, Users.updatedAt)
            .where { UserDepartments.departmentId eq UUID.fromString(deptId) }
            .map { row ->
                User(
                    id = row[Users.id].value.toString(),
                    username = row[Users.username],
                    email = row[Users.email],
                    phone = row[Users.phone],
                    avatar = row[Users.avatar],
                    is_admin = row[Users.isAdmin],
                    status = row[Users.status],
                    is_active = row[Users.isActive],
                    created_at = row[Users.createdAt].toIsoString(),
                    updated_at = row[Users.updatedAt].toIsoString()
                )
            }
    }

    private fun buildTree(nodes: List<Department>): List<Department> {
        val nodeMap = nodes.associateBy { it.id }.toMutableMap()
        val roots = mutableListOf<Department>()
        nodes.forEach { node ->
            val parentId = node.parent_id
            if (parentId == null) {
                roots.add(nodeMap[node.id]!!)
            } else {
                val parent = nodeMap[parentId]
                if (parent != null) {
                    val updated = parent.copy(children = parent.children + nodeMap[node.id]!!)
                    nodeMap[parentId] = updated
                }
            }
        }
        return roots.map { buildChildren(it, nodeMap) }
    }

    private fun buildChildren(node: Department, nodeMap: Map<String, Department>): Department {
        val children = nodeMap.values.filter { it.parent_id == node.id }.map { buildChildren(it, nodeMap) }
        return node.copy(children = children)
    }

    private fun ResultRow.toDepartment(): Department {
        val did = this[Departments.id].value.toString()
        return Department(
            id = did,
            name = this[Departments.name],
            code = this[Departments.code],
            parent_id = this[Departments.parentId],
            sequence = this[Departments.sequence],
            status = this[Departments.status],
            created_at = this[Departments.createdAt].toIsoString(),
            updated_at = this[Departments.updatedAt].toIsoString()
        )
    }
}
