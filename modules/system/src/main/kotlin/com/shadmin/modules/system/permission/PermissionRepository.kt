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

package com.shadmin.modules.system.permission

import com.shadmin.core.database.Permissions
import com.shadmin.core.database.RolePermissions
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class PermissionRepository {
    fun create(request: CreatePermissionRequest): Permission = transaction {
        val id = UUID.randomUUID()
        Permissions.insert { row ->
            row[Permissions.id] = id
            row[code] = request.code
            row[name] = request.name
            row[module] = request.module
            row[description] = request.description
            row[status] = request.status
        }
        findById(id.toString())!!
    }

    fun findById(id: String): Permission? = transaction {
        Permissions.selectAll().where { Permissions.id eq UUID.fromString(id) }
            .map { it.toPermission() }.singleOrNull()
    }

    fun findByCode(code: String): Permission? = transaction {
        Permissions.selectAll().where { Permissions.code eq code }
            .map { it.toPermission() }.singleOrNull()
    }

    fun findAll(page: Int = 1, pageSize: Int = 20): PagedResult<Permission> = transaction {
        val total = Permissions.selectAll().count().toInt()
        val list = Permissions.selectAll()
            .orderBy(Permissions.code to SortOrder.ASC)
            .limit(pageSize).offset(((page - 1) * pageSize).toLong())
            .map { it.toPermission() }
        PagedResult(
            list = list,
            total = total,
            page = page,
            page_size = pageSize,
            total_pages = if (total == 0) 0 else (total + pageSize - 1) / pageSize
        )
    }

    fun update(id: String, request: UpdatePermissionRequest): Permission? = transaction {
        Permissions.update({ Permissions.id eq UUID.fromString(id) }) { row ->
            request.code?.let { row[code] = it }
            request.name?.let { row[name] = it }
            request.module?.let { row[module] = it }
            request.description?.let { row[description] = it }
            request.status?.let { row[status] = it }
        }
        findById(id)
    }

    fun delete(id: String): Boolean = transaction {
        Permissions.deleteWhere { Permissions.id eq UUID.fromString(id) } > 0
    }

    fun getRolePermissionCodes(roleIds: List<String>): List<String> = transaction {
        if (roleIds.isEmpty()) return@transaction emptyList()
        val roleUUIDs = roleIds.map { UUID.fromString(it) }
        RolePermissions.innerJoin(Permissions)
            .select(Permissions.code)
            .where { RolePermissions.roleId inList roleUUIDs }
            .distinct()
            .map { it[Permissions.code] }
    }

    private fun ResultRow.toPermission(): Permission {
        val pid = this[Permissions.id].value.toString()
        return Permission(
            id = pid,
            code = this[Permissions.code],
            name = this[Permissions.name],
            module = this[Permissions.module],
            description = this[Permissions.description],
            status = this[Permissions.status],
            created_at = this[Permissions.createdAt].toIsoString(),
            updated_at = this[Permissions.updatedAt].toIsoString()
        )
    }
}
