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

package com.shadmin.core.database

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object Users : UUIDTable("users") {
    val username = varchar("username", 100).uniqueIndex()
    val email = varchar("email", 255).uniqueIndex()
    val phone = varchar("phone", 20).nullable()
    val password = varchar("password", 255)
    val avatar = text("avatar").nullable()
    val isAdmin = bool("is_admin").default(false)
    val status = varchar("status", 20).default("active")
    val isActive = bool("is_active").default(true)
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
    val invitedAt = datetime("invited_at").nullable()
    val invitedBy = varchar("invited_by", 36).nullable()
}

object Roles : UUIDTable("roles") {
    val name = varchar("name", 100).uniqueIndex()
    val isSystem = bool("is_system").default(false)
    val sequence = integer("sequence").default(0)
    val dataScope = varchar("data_scope", 30).default("ALL")
    val status = varchar("status", 20).default("active")
    val parentId = varchar("parent_id", 36).nullable().index()
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object UserRoles : Table("user_roles") {
    val userId = reference("user_id", Users, onDelete = ReferenceOption.CASCADE)
    val roleId = reference("role_id", Roles, onDelete = ReferenceOption.CASCADE)
    override val primaryKey = PrimaryKey(userId, roleId)
}

object Menus : UUIDTable("menus") {
    val name = varchar("name", 100)
    val description = text("description").nullable()
    val sequence = integer("sequence").default(0)
    val type = varchar("type", 20).default("menu")
    val path = text("path").nullable()
    val icon = varchar("icon", 100).default("")
    val component = text("component").nullable()
    val routeName = varchar("route_name", 100).nullable()
    val query = text("query").nullable()
    val isFrame = bool("is_frame").default(false)
    val visible = varchar("visible", 20).default("show")
    val permissions = text("permissions").nullable()
    val status = varchar("status", 20).default("active")
    val parentId = varchar("parent_id", 36).nullable().index()
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object RoleMenus : Table("role_menus") {
    val roleId = reference("role_id", Roles, onDelete = ReferenceOption.CASCADE)
    val menuId = reference("menu_id", Menus, onDelete = ReferenceOption.CASCADE)
    override val primaryKey = PrimaryKey(roleId, menuId)
}

object MenuApiResources : Table("menu_api_resources") {
    val menuId = reference("menu_id", Menus, onDelete = ReferenceOption.CASCADE)
    val apiResourceId = varchar("api_resource_id", 36)
    override val primaryKey = PrimaryKey(menuId, apiResourceId)
}

object ApiResources : UUIDTable("api_resources") {
    val name = varchar("name", 100)
    val path = varchar("path", 255)
    val method = varchar("method", 10)
    val module = varchar("module", 100).nullable()
    val description = text("description").nullable()
    val status = varchar("status", 20).default("active")
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object LoginLogs : UUIDTable("login_logs") {
    val username = varchar("username", 100)
    val loginIp = varchar("login_ip", 45)
    val userAgent = text("user_agent").nullable()
    val status = varchar("status", 20).default("success")
    val failureReason = text("failure_reason").nullable()
    val createdAt = datetime("created_at").default(LocalDateTime.now())
}

object DictTypes : UUIDTable("dict_types") {
    val name = varchar("name", 100)
    val code = varchar("code", 100).uniqueIndex()
    val status = varchar("status", 20).default("active")
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object DictItems : UUIDTable("dict_items") {
    val typeId = reference("type_id", DictTypes, onDelete = ReferenceOption.CASCADE)
    val label = varchar("label", 100)
    val value = varchar("value", 100)
    val sequence = integer("sequence").default(0)
    val status = varchar("status", 20).default("active")
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object RefreshTokens : UUIDTable("refresh_tokens") {
    val userId = reference("user_id", Users, onDelete = ReferenceOption.CASCADE)
    val tokenHash = varchar("token_hash", 255).uniqueIndex()
    val expiresAt = datetime("expires_at")
    val createdAt = datetime("created_at").default(LocalDateTime.now())
}

object Departments : UUIDTable("departments") {
    val name = varchar("name", 100)
    val code = varchar("code", 100).uniqueIndex()
    val parentId = varchar("parent_id", 36).nullable().index()
    val sequence = integer("sequence").default(0)
    val status = varchar("status", 20).default("active")
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object UserDepartments : Table("user_departments") {
    val userId = reference("user_id", Users, onDelete = ReferenceOption.CASCADE)
    val departmentId = reference("department_id", Departments, onDelete = ReferenceOption.CASCADE)
    override val primaryKey = PrimaryKey(userId, departmentId)
}

object Permissions : UUIDTable("permissions") {
    val code = varchar("code", 100).uniqueIndex()
    val name = varchar("name", 100)
    val module = varchar("module", 50)
    val description = text("description").nullable()
    val status = varchar("status", 20).default("active")
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
}

object RolePermissions : Table("role_permissions") {
    val roleId = reference("role_id", Roles, onDelete = ReferenceOption.CASCADE)
    val permissionId = reference("permission_id", Permissions, onDelete = ReferenceOption.CASCADE)
    override val primaryKey = PrimaryKey(roleId, permissionId)
}
