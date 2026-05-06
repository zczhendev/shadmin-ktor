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

package com.shadmin.modules.system.role

import com.shadmin.core.database.*
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class RoleRepository {
    fun create(request: CreateRoleRequest): Role = transaction {
        val id = UUID.randomUUID()
        Roles.insert { row ->
            row[Roles.id] = id
            row[name] = request.name
            row[sequence] = request.sequence
            row[dataScope] = request.data_scope
            row[status] = request.status
            row[parentId] = request.parent_id
        }
        request.menu_ids.forEach { menuId ->
            RoleMenus.insert { rm -> rm[roleId] = id; rm[RoleMenus.menuId] = UUID.fromString(menuId) }
        }
        request.permission_ids.forEach { permId ->
            RolePermissions.insert { rp -> rp[roleId] = id; rp[RolePermissions.permissionId] = UUID.fromString(permId) }
        }
        findById(id.toString())!!
    }

    fun findAll(page: Int = 1, pageSize: Int = 20): PagedResult<Role> = transaction {
        val total = Roles.selectAll().count().toInt()
        val rows = Roles.selectAll()
            .orderBy(Roles.sequence to SortOrder.ASC)
            .limit(pageSize).offset(((page - 1) * pageSize).toLong())
            .toList()
        val list = buildRolesWithAssociationsBatch(rows)
        PagedResult(
            list = list,
            total = total,
            page = page,
            page_size = pageSize,
            total_pages = if (total == 0) 0 else (total + pageSize - 1) / pageSize
        )
    }

    fun findById(id: String): Role? = transaction {
        val row = Roles.selectAll().where { Roles.id eq UUID.fromString(id) }.singleOrNull()
        if (row == null) null else {
            val menuIds = RoleMenus.selectAll().where { RoleMenus.roleId eq UUID.fromString(id) }
                .map { it[RoleMenus.menuId].value.toString() }
            val permIds = RolePermissions.selectAll().where { RolePermissions.roleId eq UUID.fromString(id) }
                .map { it[RolePermissions.permissionId].value.toString() }
            val permCodeById = resolvePermCodes(permIds.toSet())
            val parentId = row[Roles.parentId]
            row.toRole(
                menuIds = menuIds,
                permIds = permIds,
                permCodeById = permCodeById,
                inheritedPerms = if (parentId != null) getInheritedPermissions(parentId) else emptyList(),
                inheritedMenus = if (parentId != null) getInheritedMenus(parentId) else emptyList()
            )
        }
    }

    fun update(id: String, request: UpdateRoleRequest): Role? = transaction {
        Roles.update({ Roles.id eq UUID.fromString(id) }) { row ->
            request.name?.let { row[name] = it }
            request.sequence?.let { row[sequence] = it }
            request.data_scope?.let { row[dataScope] = it }
            request.status?.let { row[status] = it }
            row[parentId] = request.parent_id
        }
        request.menu_ids?.let { menuIds ->
            RoleMenus.deleteWhere { roleId eq UUID.fromString(id) }
            menuIds.forEach { menuId ->
                RoleMenus.insert { rm -> rm[roleId] = UUID.fromString(id); rm[RoleMenus.menuId] = UUID.fromString(menuId) }
            }
        }
        request.permission_ids?.let { permIds ->
            RolePermissions.deleteWhere { roleId eq UUID.fromString(id) }
            permIds.forEach { permId ->
                RolePermissions.insert { rp -> rp[roleId] = UUID.fromString(id); rp[RolePermissions.permissionId] = UUID.fromString(permId) }
            }
        }
        findById(id)
    }

    fun delete(id: String): Boolean = transaction {
        val roleUuid = UUID.fromString(id)
        // Nullify parent_id on child roles to prevent orphaned references
        Roles.update({ Roles.parentId eq id }) { row ->
            row[parentId] = null
        }
        RoleMenus.deleteWhere { roleId eq roleUuid }
        RolePermissions.deleteWhere { roleId eq roleUuid }
        Roles.deleteWhere { Roles.id eq roleUuid } > 0
    }

    /** Get direct child roles of a given role. */
    fun getChildRoles(roleId: String): List<Role> = transaction {
        val rows = Roles.selectAll().where { Roles.parentId eq roleId }.toList()
        buildRolesWithAssociationsBatch(rows)
    }

    /** Detect if setting parentId for roleId would create a cycle. */
    fun hasCycle(roleId: String, parentId: String?): Boolean {
        if (parentId == null) return false
        if (roleId == parentId) return true
        val ancestorIds = getAncestorChain(parentId)
        return ancestorIds.contains(roleId)
    }

    /** Get the ancestor chain (parent IDs) from a role upward. */
    fun getAncestorChain(roleId: String): List<String> = transaction {
        val chain = mutableListOf<String>()
        var currentId: String? = roleId
        val visited = mutableSetOf<String>()
        while (currentId != null && currentId !in visited) {
            visited.add(currentId)
            val parent = Roles.select(Roles.parentId).where { Roles.id eq UUID.fromString(currentId) }
                .map { it[Roles.parentId] }.singleOrNull()
            if (!parent.isNullOrBlank()) {
                chain.add(parent)
                currentId = parent
            } else {
                currentId = null
            }
        }
        chain
    }

    /** Get inherited permission codes from the ancestor chain. */
    fun getInheritedPermissions(parentId: String?): List<String> = transaction {
        if (parentId.isNullOrBlank()) return@transaction emptyList<String>()
        val uuids = getAncestorRoleUUIDs(parentId)
        RolePermissions.innerJoin(Permissions)
            .select(Permissions.code)
            .where { RolePermissions.roleId inList uuids }
            .distinct()
            .map { it[Permissions.code] }
    }

    /** Get inherited menu IDs from the ancestor chain. */
    fun getInheritedMenus(parentId: String?): List<String> = transaction {
        if (parentId.isNullOrBlank()) return@transaction emptyList<String>()
        val uuids = getAncestorRoleUUIDs(parentId)
        RoleMenus.select(RoleMenus.menuId)
            .where { RoleMenus.roleId inList uuids }
            .distinct()
            .map { it[RoleMenus.menuId].value.toString() }
    }

    // ─── Helpers ───

    /** Build Role objects from raw rows, loading menus, permissions, and inherited fields in batch. */

    /** Batch-optimized version: builds roles with inheritance computed entirely in-memory.
     *  Eliminates N+1 by fetching all role-permission and role-menu mappings in bulk. */
    private fun buildRolesWithAssociationsBatch(rows: List<ResultRow>): List<Role> {
        if (rows.isEmpty()) return emptyList()

        // 1. Collect all role IDs that appear in the result set + their ancestors
        val resultRoleIds = rows.map { it[Roles.id].value.toString() }.toSet()
        val allRoleIds = resultRoleIds.toMutableSet()
        val parentByRole = mutableMapOf<String, String?>()

        rows.forEach { row ->
            parentByRole[row[Roles.id].value.toString()] = row[Roles.parentId]
        }

        // Fetch ancestors for any role whose parent is not yet in our map
        val missingParents = parentByRole.values.filterNotNull().filter { it !in parentByRole }.toSet()
        if (missingParents.isNotEmpty()) {
            Roles.selectAll().where { Roles.id inList missingParents.map { UUID.fromString(it) } }
                .forEach { row ->
                    val rid = row[Roles.id].value.toString()
                    val pid = row[Roles.parentId]
                    parentByRole[rid] = pid
                    allRoleIds.add(rid)
                    if (pid != null) allRoleIds.add(pid)
                }
        }

        // Build complete ancestor chains in memory
        fun getAncestorChainInMemory(roleId: String): List<String> {
            val chain = mutableListOf<String>()
            var currentId: String? = parentByRole[roleId]
            val visited = mutableSetOf<String>()
            while (currentId != null && currentId !in visited) {
                visited.add(currentId)
                chain.add(currentId)
                currentId = parentByRole[currentId]
            }
            return chain
        }

        val allRoleUUIDs = allRoleIds.map { UUID.fromString(it) }

        // 2. Batch fetch ALL role-menu mappings for relevant roles
        val menusByRole = mutableMapOf<String, MutableSet<String>>()
        RoleMenus.selectAll().where { RoleMenus.roleId inList allRoleUUIDs }
            .forEach { row ->
                val rid = row[RoleMenus.roleId].value.toString()
                menusByRole.getOrPut(rid) { mutableSetOf() }.add(row[RoleMenus.menuId].value.toString())
            }

        // 3. Batch fetch ALL role-permission mappings for relevant roles
        val permsByRole = mutableMapOf<String, MutableSet<String>>()
        RolePermissions.selectAll().where { RolePermissions.roleId inList allRoleUUIDs }
            .forEach { row ->
                val rid = row[RolePermissions.roleId].value.toString()
                permsByRole.getOrPut(rid) { mutableSetOf() }.add(row[RolePermissions.permissionId].value.toString())
            }

        val allPermIds = permsByRole.values.flatten().toSet()
        val permCodeById = resolvePermCodes(allPermIds)

        // 4. Pre-compute inherited permissions and menus for every role
        val inheritedPermsByRole = mutableMapOf<String, List<String>>()
        val inheritedMenusByRole = mutableMapOf<String, List<String>>()

        resultRoleIds.forEach { roleId ->
            val ancestors = getAncestorChainInMemory(roleId)

            // Permissions: collect from ancestors
            val inheritedPermCodes = mutableSetOf<String>()
            ancestors.forEach { ancestorId ->
                permsByRole[ancestorId]?.forEach { permId ->
                    permCodeById[permId]?.let { inheritedPermCodes.add(it) }
                }
            }
            inheritedPermsByRole[roleId] = inheritedPermCodes.toList()

            // Menus: collect from ancestors
            val inheritedMenuIds = mutableSetOf<String>()
            ancestors.forEach { ancestorId ->
                menusByRole[ancestorId]?.let { inheritedMenuIds.addAll(it) }
            }
            inheritedMenusByRole[roleId] = inheritedMenuIds.toList()
        }

        // 5. Build final Role objects
        return rows.map { row ->
            val rid = row[Roles.id].value
            val ridStr = rid.toString()
            row.toRole(
                menuIds = menusByRole[ridStr]?.toList() ?: emptyList(),
                permIds = permsByRole[ridStr]?.map { permCodeById[it] ?: it } ?: emptyList(),
                permCodeById = permCodeById,
                inheritedPerms = inheritedPermsByRole[ridStr] ?: emptyList(),
                inheritedMenus = inheritedMenusByRole[ridStr] ?: emptyList()
            )
        }
    }

    /** Resolve permission IDs to their codes. */
    private fun resolvePermCodes(permIds: Set<String>): Map<String, String> =
        if (permIds.isEmpty()) {
            emptyMap()
        } else {
            Permissions.selectAll().where { Permissions.id inList permIds.map { UUID.fromString(it) } }
                .associate { it[Permissions.id].value.toString() to it[Permissions.code] }
        }

    /** Get the ancestor chain plus the starting role as UUIDs. */
    private fun getAncestorRoleUUIDs(roleId: String): List<UUID> {
        val chain = getAncestorChain(roleId).toMutableList()
        chain.add(0, roleId)
        return chain.map { UUID.fromString(it) }
    }

    private fun ResultRow.toRole(
        menuIds: List<String> = emptyList(),
        permIds: List<String> = emptyList(),
        permCodeById: Map<String, String> = emptyMap(),
        inheritedPerms: List<String> = emptyList(),
        inheritedMenus: List<String> = emptyList()
    ): Role {
        val rid = this[Roles.id].value.toString()
        return Role(
            id = rid,
            name = this[Roles.name],
            is_system = this[Roles.isSystem],
            sequence = this[Roles.sequence],
            data_scope = this[Roles.dataScope],
            status = this[Roles.status],
            parent_id = this[Roles.parentId],
            menus = menuIds,
            permissions = permIds.map { permCodeById[it] ?: it },
            inherited_menus = inheritedMenus,
            inherited_permissions = inheritedPerms,
            created_at = this[Roles.createdAt].toIsoString(),
            updated_at = this[Roles.updatedAt].toIsoString()
        )
    }
}
