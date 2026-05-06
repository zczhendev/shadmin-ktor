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

package com.shadmin.modules.system.menu

import com.shadmin.core.database.*
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class MenuRepository {
    fun create(request: CreateMenuRequest): Menu = transaction {
        val id = UUID.randomUUID()
        Menus.insert { row ->
            row[Menus.id] = id; row[name] = request.name; row[sequence] = request.sequence; row[type] = request.type
            row[path] = request.path; row[icon] = request.icon; row[component] = request.component
            row[routeName] = request.route_name; row[query] = request.query; row[isFrame] = request.is_frame
            row[visible] = request.visible; row[permissions] = request.permissions; row[status] = request.status; row[parentId] = request.parent_id
        }
        request.apiResources.forEach { apiId -> MenuApiResources.insert { mar -> mar[menuId] = id; mar[apiResourceId] = apiId } }
        findById(id.toString())!!
    }
    fun findAll(page: Int = 1, pageSize: Int = 20): PagedResult<Menu> = transaction {
        val total = Menus.selectAll().count().toInt()
        val menuRows = Menus.selectAll()
            .orderBy(Menus.sequence to SortOrder.ASC)
            .limit(pageSize).offset(((page - 1) * pageSize).toLong())
            .toList()
        val menuIds = menuRows.map { it[Menus.id].value }
        val apisByMenu = mutableMapOf<UUID, MutableList<String>>()
        if (menuIds.isNotEmpty()) {
            MenuApiResources.selectAll().where { MenuApiResources.menuId inList menuIds }
                .forEach { row ->
                    val mid = row[MenuApiResources.menuId].value
                    val apiId = row[MenuApiResources.apiResourceId]
                    apisByMenu.getOrPut(mid) { mutableListOf() }.add(apiId)
                }
        }
        val list = menuRows.map { it.toMenu(apisByMenu[it[Menus.id].value] ?: emptyList()) }
        PagedResult(
            list = list,
            total = total,
            page = page,
            page_size = pageSize,
            total_pages = if (total == 0) 0 else (total + pageSize - 1) / pageSize
        )
    }
    fun findById(id: String): Menu? = transaction {
        val row = Menus.selectAll().where { Menus.id eq UUID.fromString(id) }.singleOrNull()
        if (row == null) null else {
            val apis = MenuApiResources.selectAll().where { MenuApiResources.menuId eq UUID.fromString(id) }
                .map { it[MenuApiResources.apiResourceId] }
            row.toMenu(apis)
        }
    }
    fun update(id: String, request: UpdateMenuRequest): Menu? = transaction {
        Menus.update({ Menus.id eq UUID.fromString(id) }) { row ->
            request.name?.let { row[name] = it }; request.sequence?.let { row[sequence] = it }; request.type?.let { row[type] = it }
            request.path?.let { row[path] = it }; request.icon?.let { row[icon] = it }; request.component?.let { row[component] = it }
            request.route_name?.let { row[routeName] = it }; request.query?.let { row[query] = it }; request.is_frame?.let { row[isFrame] = it }
            request.visible?.let { row[visible] = it }; request.permissions?.let { row[permissions] = it }; request.status?.let { row[status] = it }
            request.parent_id?.let { row[parentId] = it }
        }
        request.apiResources?.let { apis ->
            MenuApiResources.deleteWhere { menuId eq UUID.fromString(id) }
            apis.forEach { apiId -> MenuApiResources.insert { mar -> mar[menuId] = UUID.fromString(id); mar[apiResourceId] = apiId } }
        }
        findById(id)
    }
    fun delete(id: String): Boolean = transaction { Menus.deleteWhere { Menus.id eq UUID.fromString(id) } > 0 }

    fun buildMenuTree(): List<MenuTreeNode> = transaction {
        val menuRows = Menus.selectAll().where { Menus.status eq "active" }.orderBy(Menus.sequence to SortOrder.ASC).toList()
        val menuIds = menuRows.map { it[Menus.id].value }
        val apisByMenu = mutableMapOf<UUID, MutableList<String>>()
        if (menuIds.isNotEmpty()) {
            MenuApiResources.selectAll().where { MenuApiResources.menuId inList menuIds }
                .forEach { row ->
                    val mid = row[MenuApiResources.menuId].value
                    val apiId = row[MenuApiResources.apiResourceId]
                    apisByMenu.getOrPut(mid) { mutableListOf() }.add(apiId)
                }
        }
        val all = menuRows.map { it.toTreeNode(apisByMenu[it[Menus.id].value] ?: emptyList()) }
        buildTreeNodes(all)
    }

    private fun buildTreeNodes(nodes: List<MenuTreeNode>): List<MenuTreeNode> {
        val nodeMap = nodes.associateBy { it.id }.toMutableMap()
        val roots = mutableListOf<MenuTreeNode>()
        nodes.forEach { node ->
            val parentId = node.parent_id
            if (parentId == null) roots.add(nodeMap[node.id]!!)
            else {
                val parent = nodeMap[parentId]
                if (parent != null) { val updated = parent.copy(children = parent.children + nodeMap[node.id]!!); nodeMap[parentId] = updated }
            }
        }
        return roots.map { buildChildren(it, nodeMap) }
    }
    private fun buildChildren(node: MenuTreeNode, nodeMap: Map<String, MenuTreeNode>): MenuTreeNode {
        val children = nodeMap.values.filter { it.parent_id == node.id }.map { buildChildren(it, nodeMap) }
        return node.copy(children = children)
    }

    private fun ResultRow.toMenu(apis: List<String> = emptyList()): Menu {
        val mid = this[Menus.id].value.toString()
        return Menu(id = mid, name = this[Menus.name], description = this[Menus.description], sequence = this[Menus.sequence],
            type = this[Menus.type], path = this[Menus.path], icon = this[Menus.icon], component = this[Menus.component],
            route_name = this[Menus.routeName], query = this[Menus.query], is_frame = this[Menus.isFrame],
            visible = this[Menus.visible], permissions = this[Menus.permissions], status = this[Menus.status],
            parent_id = this[Menus.parentId], created_at = this[Menus.createdAt].toIsoString(),
            updated_at = this[Menus.updatedAt].toIsoString(), apiResources = apis)
    }
    private fun ResultRow.toTreeNode(apis: List<String> = emptyList()): MenuTreeNode {
        val mid = this[Menus.id].value.toString()
        return MenuTreeNode(id = mid, name = this[Menus.name], sequence = this[Menus.sequence], type = this[Menus.type],
            path = this[Menus.path], icon = this[Menus.icon], component = this[Menus.component],
            route_name = this[Menus.routeName], query = this[Menus.query], is_frame = this[Menus.isFrame],
            visible = this[Menus.visible], permissions = this[Menus.permissions], status = this[Menus.status],
            parent_id = this[Menus.parentId], apiResources = apis)
    }
}
