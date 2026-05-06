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

package com.shadmin.modules.system.init

import com.shadmin.core.database.*
import com.shadmin.core.domain.CreateMenuRequest
import com.shadmin.core.security.PasswordHasher
import com.shadmin.modules.system.api.ApiResourceRepository
import com.shadmin.modules.system.menu.MenuRepository
import com.shadmin.modules.system.permission.PermissionRepository
import com.shadmin.modules.system.role.RoleRepository
import com.shadmin.modules.system.user.UserRepository
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

/**
 * Initializes default admin user, role, and menus on first startup.
 */
class DefaultDataInitializer(
    private val config: ApplicationConfig,
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val menuRepository: MenuRepository,
    private val apiResourceRepository: ApiResourceRepository? = null,
    private val permissionRepository: PermissionRepository? = null
) {
    fun initialize() {
        transaction {
            val adminRoleId = ensureAdminRole()
            ensureAdminUser(adminRoleId)
            ensureDefaultDepartments()
            ensureDefaultPermissions(adminRoleId)
            ensureDefaultMenus()
            ensureDefaultApiResources()
        }
    }

    private fun ensureAdminRole(): UUID {
        val existing = Roles.selectAll().where { Roles.name eq "admin" }.singleOrNull()
        if (existing != null) return existing[Roles.id].value
        val id = UUID.randomUUID()
        Roles.insert { row ->
            row[Roles.id] = id; row[name] = "admin"; row[isSystem] = true; row[sequence] = 0; row[dataScope] = "ALL"; row[status] = "active"
        }
        return id
    }

    private fun ensureAdminUser(roleId: UUID) {
        val adminUsername = config.propertyOrNull("app.admin.username")?.getString() ?: "admin"
        val existing = Users.selectAll().where { Users.username eq adminUsername }.singleOrNull()
        if (existing == null) {
            val adminPassword = config.propertyOrNull("app.admin.password")?.getString() ?: "shadmin"
            val adminEmail = config.propertyOrNull("app.admin.email")?.getString() ?: "admin@gmail.com"
            val userId = UUID.randomUUID()
            Users.insert { row ->
                row[Users.id] = userId; row[username] = adminUsername; row[email] = adminEmail
                row[password] = PasswordHasher.hash(adminPassword); row[isAdmin] = true; row[status] = "active"
            }
            UserRoles.insert { ur -> ur[UserRoles.userId] = userId; ur[UserRoles.roleId] = roleId }
        }
    }

    private fun ensureDefaultMenus() {
        val count = Menus.selectAll().count()

        // If old English menus exist, reset them
        if (count > 0) {
            val hasOldMenus = Menus.selectAll()
                .where { Menus.name eq "Alarms Center" }
                .count() > 0
            if (!hasOldMenus) return
            // Clean up related tables first, then delete all menus
            MenuApiResources.deleteAll()
            RoleMenus.deleteAll()
            Menus.deleteAll()
        }

        fun insertMenu(name: String, icon: String, path: String? = null, component: String? = null, parentId: String? = null): String {
            val id = UUID.randomUUID()
            Menus.insert { row ->
                row[Menus.id] = id
                row[Menus.name] = name
                row[Menus.sequence] = 0
                row[Menus.type] = "menu"
                row[Menus.path] = path
                row[Menus.icon] = icon
                row[Menus.component] = component
                row[Menus.visible] = "show"
                row[Menus.status] = "active"
                row[Menus.parentId] = parentId
            }
            return id.toString()
        }

        // 仪表盘
        insertMenu("仪表盘", "LayoutDashboard", "/")

        // 系统管理（父菜单）
        val systemId = insertMenu("系统管理", "Settings")
        insertMenu("用户管理", "Users", "/system/user", parentId = systemId)
        insertMenu("角色管理", "ShieldCheck", "/system/role", parentId = systemId)
        insertMenu("菜单管理", "LayoutList", "/system/menu", parentId = systemId)
        insertMenu("API资源", "Webhook", "/system/api-resources", parentId = systemId)
        insertMenu("字典管理", "BookOpen", "/system/dict", parentId = systemId)
        insertMenu("登录日志", "History", "/system/login-logs", parentId = systemId)

        // 设置（父菜单）
        val settingsId = insertMenu("设置", "Settings2")
        insertMenu("个人资料", "User", "/settings", component = "settings", parentId = settingsId)
        insertMenu("账户设置", "UserCog", "/settings/account", parentId = settingsId)
        insertMenu("外观设置", "Palette", "/settings/appearance", parentId = settingsId)

        // 帮助中心
        insertMenu("帮助中心", "HelpCircle", "/docs")

    }

    private fun ensureDefaultDepartments() {
        val existing = Departments.selectAll().where { Departments.code eq "ROOT" }.singleOrNull()
        if (existing != null) return
        Departments.insert { row ->
            row[Departments.id] = UUID.randomUUID()
            row[name] = "总公司"
            row[code] = "ROOT"
            row[parentId] = null
            row[sequence] = 0
            row[status] = "active"
        }
    }

    private fun ensureDefaultPermissions(adminRoleId: UUID) {
        if (permissionRepository == null) return
        val count = Permissions.selectAll().count()
        if (count > 0) return

        val defaults = listOf(
            "system:user:list" to "获取用户列表",
            "system:user:create" to "创建用户",
            "system:user:update" to "更新用户",
            "system:user:delete" to "删除用户",
            "system:role:list" to "获取角色列表",
            "system:role:create" to "创建角色",
            "system:role:update" to "更新角色",
            "system:role:delete" to "删除角色",
            "system:menu:list" to "获取菜单列表",
            "system:menu:create" to "创建菜单",
            "system:menu:update" to "更新菜单",
            "system:menu:delete" to "删除菜单",
            "system:api-resource:list" to "获取API资源列表",
            "system:api-resource:create" to "创建API资源",
            "system:api-resource:update" to "更新API资源",
            "system:api-resource:delete" to "删除API资源",
            "system:dict:list" to "获取字典列表",
            "system:dict:create" to "创建字典",
            "system:dict:update" to "更新字典",
            "system:dict:delete" to "删除字典",
            "system:login-log:list" to "获取登录日志",
            "system:login-log:delete" to "删除登录日志",
            "system:dept:list" to "获取部门列表",
            "system:dept:create" to "创建部门",
            "system:dept:update" to "更新部门",
            "system:dept:delete" to "删除部门",
        )

        defaults.forEach { (code, name) ->
            val permId = UUID.randomUUID()
            Permissions.insert { row ->
                row[Permissions.id] = permId
                row[Permissions.code] = code
                row[Permissions.name] = name
                row[Permissions.module] = "system"
                row[Permissions.description] = name
                row[Permissions.status] = "active"
            }
            RolePermissions.insert { row ->
                row[roleId] = adminRoleId
                row[permissionId] = permId
            }
        }
    }

    private fun ensureDefaultApiResources() {
        if (apiResourceRepository == null) return
        val count = ApiResources.selectAll().count()
        if (count > 0) return

        val defaults = listOf(
            Triple("获取用户列表", "/api/v1/system/user", "GET") to "system",
            Triple("创建用户", "/api/v1/system/user", "POST") to "system",
            Triple("获取角色列表", "/api/v1/system/role", "GET") to "system",
            Triple("创建角色", "/api/v1/system/role", "POST") to "system",
            Triple("获取菜单列表", "/api/v1/system/menu", "GET") to "system",
            Triple("获取菜单树", "/api/v1/system/menu/tree", "GET") to "system",
            Triple("获取API资源列表", "/api/v1/system/api-resources", "GET") to "system",
            Triple("创建API资源", "/api/v1/system/api-resources", "POST") to "system",
            Triple("获取登录日志", "/api/v1/system/login-logs", "GET") to "system",
            Triple("获取字典类型", "/api/v1/system/dict/types", "GET") to "system",
            Triple("用户登录", "/api/v1/auth/login", "POST") to "auth",
            Triple("刷新Token", "/api/v1/auth/refresh", "POST") to "auth",
        )

        defaults.forEach { (triple, module) ->
            val (name, path, method) = triple
            ApiResources.insert { row ->
                row[ApiResources.id] = UUID.randomUUID()
                row[ApiResources.name] = name
                row[ApiResources.path] = path
                row[ApiResources.method] = method
                row[ApiResources.module] = module
                row[ApiResources.description] = "$method $path"
                row[ApiResources.status] = "active"
            }
        }
    }
}
