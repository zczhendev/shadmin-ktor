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

package com.shadmin.modules.system

import com.google.auto.service.AutoService
import com.shadmin.core.container.ServiceContainer
import com.shadmin.core.domain.*
import com.shadmin.core.security.PasswordHasher
import com.shadmin.core.security.matchWildcard
import com.shadmin.core.spi.ModulePlugin
import com.shadmin.core.spi.RouteRegistrar
import com.shadmin.core.spi.register
import com.shadmin.core.spi.resolve
import com.shadmin.modules.system.api.ApiResourceRepository
import com.shadmin.modules.system.dept.DepartmentRepository
import com.shadmin.modules.system.dict.DictRepository
import com.shadmin.modules.system.log.LoginLogRepository
import com.shadmin.modules.system.menu.MenuRepository
import com.shadmin.modules.system.permission.PermissionRepository
import com.shadmin.modules.system.role.RoleRepository
import com.shadmin.modules.system.user.UserRepository
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

/**
 * System management module — User, Role, Menu, Dict, LoginLog.
 * Discovered automatically via SPI.
 */
@AutoService(ModulePlugin::class)
class SystemModule : ModulePlugin, RouteRegistrar {
    override val name = "system"
    override val priority = 20

    override fun configure(container: ServiceContainer) {
        // Register repositories into container so other modules can resolve them
        container.register(UserRepository())
        container.register(RoleRepository())
        container.register(MenuRepository())
        container.register(LoginLogRepository())
        container.register(DictRepository())
        container.register(ApiResourceRepository())
        container.register(PermissionRepository())
        container.register(DepartmentRepository())

        container.registerRoutes(this)
    }

    override fun registerRoutes(route: Route, container: ServiceContainer) {
        val userRepo = container.resolve(UserRepository::class)
        val roleRepo = container.resolve(RoleRepository::class)
        val menuRepo = container.resolve(MenuRepository::class)
        val logRepo = container.resolve(LoginLogRepository::class)
        val dictRepo = container.resolve(DictRepository::class)
        val apiResourceRepo = container.resolve(ApiResourceRepository::class)
        val permissionRepo = container.resolve(PermissionRepository::class)
        val deptRepo = container.resolve(DepartmentRepository::class)

        fun hasPermission(principal: JWTPrincipal?, permissionCode: String): Boolean {
            if (principal == null) return false
            val isAdmin = principal.payload.getClaim("is_admin")?.asBoolean() ?: false
            if (isAdmin) return true
            val permissions = principal.payload.getClaim("permissions")?.asList(String::class.java) ?: emptyList()
            return permissions.any { it == permissionCode || matchWildcard(it, permissionCode) }
        }

        suspend fun requirePermission(call: ApplicationCall, permissionCode: String): Boolean {
            val principal = call.principal<JWTPrincipal>()
            if (!hasPermission(principal, permissionCode)) {
                call.respond(HttpStatusCode.Forbidden, error("Permission denied: $permissionCode", code = 403))
                return false
            }
            return true
        }


        fun validateCreateUser(req: CreateUserRequest): String? {
            if (req.username.isBlank()) return "Username is required"
            if (req.username.length < 3 || req.username.length > 50) return "Username must be 3-50 characters"
            if (req.email.isBlank()) return "Email is required"
            if (!req.email.matches(Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))) return "Invalid email format"
            if (req.password.length < 6) return "Password must be at least 6 characters"
            return null
        }

        fun validateUpdateUser(req: UpdateUserRequest): String? {
            req.username?.let { if (it.length < 3 || it.length > 50) return "Username must be 3-50 characters" }
            req.email?.let { if (!it.matches(Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))) return "Invalid email format" }
            req.password?.let { if (it.length < 6) return "Password must be at least 6 characters" }
            return null
        }

        route.authenticate("auth-jwt") {
            route("/api/v1/system") {

                // ─── Users ───
                route("/user") {
                    get("") {
                        if (!requirePermission(call, "system:user:list")) return@get
                        val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                        val pageSize = call.request.queryParameters["page_size"]?.toIntOrNull() ?: 10
                        val filter = UserQueryFilter(status = call.request.queryParameters["status"] ?: "",
                            username = call.request.queryParameters["username"] ?: "", page = page, page_size = pageSize)
                        val currentUserId = call.principal<JWTPrincipal>()?.subject
                        call.respond(HttpStatusCode.OK, success(userRepo.query(filter, currentUserId)))
                    }
                    post("") {
                        if (!requirePermission(call, "system:user:create")) return@post
                        val req = call.receive<CreateUserRequest>()
                        validateCreateUser(req)?.let { call.respond(HttpStatusCode.BadRequest, error(it)); return@post }
                        if (userRepo.findByUsername(req.username) != null) { call.respond(HttpStatusCode.Conflict, error("Username already exists")); return@post }
                        if (userRepo.findByEmail(req.email) != null) { call.respond(HttpStatusCode.Conflict, error("Email already exists")); return@post }
                        call.respond(HttpStatusCode.OK, success(userRepo.create(req, PasswordHasher.hash(req.password))))
                    }
                    get("/{id}") {
                        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(userRepo.findById(id) ?: return@get call.respond(HttpStatusCode.NotFound, error("User not found", 404))))
                    }
                    put("/{id}") {
                        if (!requirePermission(call, "system:user:update")) return@put
                        val id = call.parameters["id"] ?: return@put call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        val req = call.receive<UpdateUserRequest>()
                        validateUpdateUser(req)?.let { call.respond(HttpStatusCode.BadRequest, error(it)); return@put }
                        call.respond(HttpStatusCode.OK, success(userRepo.update(id, req) ?: error("User not found", 404)))
                    }
                    delete("/{id}") {
                        if (!requirePermission(call, "system:user:delete")) return@delete
                        val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        val currentUserId = call.principal<JWTPrincipal>()?.subject ?: ""
                        if (id == currentUserId) { call.respond(HttpStatusCode.BadRequest, error("不能删除自己")); return@delete }
                        val user = userRepo.findById(id) ?: return@delete call.respond(HttpStatusCode.NotFound, error("User not found", 404))
                        if (user.is_admin) { call.respond(HttpStatusCode.Forbidden, error("不能删除管理员账户")); return@delete }
                        call.respond(HttpStatusCode.OK, success(userRepo.delete(id)))
                    }
                    get("/{id}/roles") {
                        call.respond(HttpStatusCode.OK, success(userRepo.getUserRoles(call.parameters["id"] ?: "")))
                    }
                }

                // ─── Roles ───
                route("/role") {
                    get("") { call.respond(HttpStatusCode.OK, success(roleRepo.findAll())) }
                    post("") {
                        if (!requirePermission(call, "system:role:create")) return@post
                        val req = call.receive<CreateRoleRequest>()
                        val parentId = req.parent_id
                        if (parentId != null && roleRepo.findById(parentId) == null) {
                            call.respond(HttpStatusCode.BadRequest, error("父角色不存在"))
                            return@post
                        }
                        if (roleRepo.findAll().any { it.name == req.name }) { call.respond(HttpStatusCode.Conflict, error("Role name already exists")); return@post }
                        call.respond(HttpStatusCode.OK, success(roleRepo.create(req)))
                    }
                    get("/{id}") {
                        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(roleRepo.findById(id) ?: return@get call.respond(HttpStatusCode.NotFound, error("Role not found", 404))))
                    }
                    put("/{id}") {
                        if (!requirePermission(call, "system:role:update")) return@put
                        val id = call.parameters["id"] ?: return@put call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        val req = call.receive<UpdateRoleRequest>()
                        val parentId = req.parent_id
                        if (parentId != null) {
                            if (roleRepo.findById(parentId) == null) {
                                call.respond(HttpStatusCode.BadRequest, error("父角色不存在"))
                                return@put
                            }
                            if (roleRepo.hasCycle(id, parentId)) {
                                call.respond(HttpStatusCode.BadRequest, error("不能设置循环继承"))
                                return@put
                            }
                        }
                        call.respond(HttpStatusCode.OK, success(roleRepo.update(id, req) ?: error("Role not found", 404)))
                    }
                    delete("/{id}") {
                        if (!requirePermission(call, "system:role:delete")) return@delete
                        val role = roleRepo.findById(call.parameters["id"] ?: "") ?: return@delete call.respond(HttpStatusCode.NotFound, error("Role not found", 404))
                        if (role.is_system) { call.respond(HttpStatusCode.Forbidden, error("不能删除系统管理员角色")); return@delete }
                        val children = roleRepo.getChildRoles(role.id)
                        if (children.isNotEmpty()) {
                            call.respond(HttpStatusCode.BadRequest, error("该角色有子角色，不能删除"))
                            return@delete
                        }
                        call.respond(HttpStatusCode.OK, success(roleRepo.delete(role.id)))
                    }
                    get("/{id}/menus") {
                        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        val role = roleRepo.findById(id) ?: return@get call.respond(HttpStatusCode.NotFound, error("Role not found", 404))
                        call.respond(HttpStatusCode.OK, success(role.menus))
                    }
                    get("/{id}/permissions") {
                        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        val role = roleRepo.findById(id) ?: return@get call.respond(HttpStatusCode.NotFound, error("Role not found", 404))
                        call.respond(HttpStatusCode.OK, success(role.permissions))
                    }
                }

                // ─── Permissions ───
                route("/permissions") {
                    get("") { call.respond(HttpStatusCode.OK, success(permissionRepo.findAll())) }
                }

                // ─── Menus ───
                route("/menu") {
                    get("") { call.respond(HttpStatusCode.OK, success(menuRepo.findAll())) }
                    get("/tree") { call.respond(HttpStatusCode.OK, success(menuRepo.buildMenuTree())) }
                    post("") {
                        if (!requirePermission(call, "system:menu:create")) return@post
                        call.respond(HttpStatusCode.OK, success(menuRepo.create(call.receive())))
                    }
                    put("/{id}") {
                        if (!requirePermission(call, "system:menu:update")) return@put
                        call.respond(HttpStatusCode.OK, success(menuRepo.update(call.parameters["id"]!!, call.receive()) ?: return@put call.respond(HttpStatusCode.NotFound, error("Menu not found", 404))))
                    }
                    delete("/{id}") {
                        if (!requirePermission(call, "system:menu:delete")) return@delete
                        call.respond(HttpStatusCode.OK, success(menuRepo.delete(call.parameters["id"]!!)))
                    }
                }

                // ─── API Resources ───
                route("/api-resources") {
                    get("") {
                        val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                        val pageSize = call.request.queryParameters["page_size"]?.toIntOrNull() ?: 10
                        val method = call.request.queryParameters["method"]
                        val module = call.request.queryParameters["module"]
                        val path = call.request.queryParameters["path"]
                        call.respond(HttpStatusCode.OK, success(apiResourceRepo.findAll(page, pageSize, method, module, path)))
                    }
                    post("") {
                        if (!requirePermission(call, "system:api-resource:create")) return@post
                        call.respond(HttpStatusCode.OK, success(apiResourceRepo.create(call.receive())))
                    }
                    put("/{id}") {
                        if (!requirePermission(call, "system:api-resource:update")) return@put
                        val id = call.parameters["id"] ?: return@put call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(apiResourceRepo.update(id, call.receive()) ?: return@put call.respond(HttpStatusCode.NotFound, error("API resource not found", 404))))
                    }
                    delete("/{id}") {
                        if (!requirePermission(call, "system:api-resource:delete")) return@delete
                        val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(apiResourceRepo.delete(id)))
                    }
                }

                // ─── Login Logs ───
                route("/login-logs") {
                    get("") {
                        val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                        val pageSize = call.request.queryParameters["page_size"]?.toIntOrNull() ?: 10
                        call.respond(HttpStatusCode.OK, success(logRepo.findAll(page, pageSize)))
                    }
                    delete("") {
                        if (!requirePermission(call, "system:login-log:delete")) return@delete
                        call.respond(HttpStatusCode.OK, success(logRepo.clearAll()))
                    }
                }

                // ─── Departments ───
                route("/dept") {
                    get("") { call.respond(HttpStatusCode.OK, success(deptRepo.findAll())) }
                    get("/tree") { call.respond(HttpStatusCode.OK, success(deptRepo.buildDeptTree())) }
                    post("") {
                        if (!requirePermission(call, "system:dept:create")) return@post
                        val req = call.receive<CreateDepartmentRequest>()
                        if (deptRepo.findByCode(req.code) != null) { call.respond(HttpStatusCode.OK, error("Department code already exists")); return@post }
                        call.respond(HttpStatusCode.OK, success(deptRepo.create(req)))
                    }
                    put("/{id}") {
                        if (!requirePermission(call, "system:dept:update")) return@put
                        val id = call.parameters["id"] ?: return@put call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(deptRepo.update(id, call.receive()) ?: error("Department not found", 404)))
                    }
                    delete("/{id}") {
                        if (!requirePermission(call, "system:dept:delete")) return@delete
                        val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(deptRepo.delete(id)))
                    }
                    get("/{id}/users") {
                        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        call.respond(HttpStatusCode.OK, success(deptRepo.findUsersByDepartment(id)))
                    }
                    post("/{id}/users") {
                        if (!requirePermission(call, "system:dept:update")) return@post
                        val id = call.parameters["id"] ?: return@post call.respond(HttpStatusCode.BadRequest, error("ID required"))
                        val req = call.receive<Map<String, List<String>>>()
                        val userIds = req["user_ids"] ?: emptyList()
                        userIds.forEach { userId -> deptRepo.setUserDepartments(userId, listOf(id)) }
                        call.respond(HttpStatusCode.OK, success(true))
                    }
                }

                // ─── Dict ───
                route("/dict") {
                    get("/types") { call.respond(HttpStatusCode.OK, success(dictRepo.findAllTypes())) }
                    post("/types") {
                        if (!requirePermission(call, "system:dict:create")) return@post
                        call.respond(HttpStatusCode.OK, success(dictRepo.createType(call.receive())))
                    }
                    put("/types/{id}") {
                        if (!requirePermission(call, "system:dict:update")) return@put
                        call.respond(HttpStatusCode.OK, success(dictRepo.updateType(call.parameters["id"]!!, call.receive()) ?: error("Dict type not found", 404)))
                    }
                    delete("/types/{id}") {
                        if (!requirePermission(call, "system:dict:delete")) return@delete
                        call.respond(HttpStatusCode.OK, success(dictRepo.deleteType(call.parameters["id"]!!)))
                    }
                    get("/types/code/{code}/items") { call.respond(HttpStatusCode.OK, success(dictRepo.findItemsByTypeCode(call.parameters["code"]!!))) }

                    get("/items") {
                        val typeId = call.request.queryParameters["type_id"] ?: return@get call.respond(HttpStatusCode.BadRequest, error("type_id required"))
                        call.respond(HttpStatusCode.OK, success(dictRepo.findItemsByTypeId(typeId)))
                    }
                    post("/items") {
                        if (!requirePermission(call, "system:dict:create")) return@post
                        call.respond(HttpStatusCode.OK, success(dictRepo.createItem(call.receive())))
                    }
                    put("/items/{id}") {
                        if (!requirePermission(call, "system:dict:update")) return@put
                        call.respond(HttpStatusCode.OK, success(dictRepo.updateItem(call.parameters["id"]!!, call.receive()) ?: error("Dict item not found", 404)))
                    }
                    delete("/items/{id}") {
                        if (!requirePermission(call, "system:dict:delete")) return@delete
                        call.respond(HttpStatusCode.OK, success(dictRepo.deleteItem(call.parameters["id"]!!)))
                    }
                }
            }
        }
    }
}
