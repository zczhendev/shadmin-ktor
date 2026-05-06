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

package com.shadmin.modules.resource

import com.google.auto.service.AutoService
import com.shadmin.core.container.ServiceContainer
import com.shadmin.core.domain.*
import com.shadmin.core.spi.ModulePlugin
import com.shadmin.core.spi.RouteRegistrar
import com.shadmin.modules.system.menu.MenuRepository
import com.shadmin.modules.system.user.UserRepository
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

/**
 * Resource module — provides sidebar navigation data for the frontend.
 * Discovered automatically via SPI.
 */
@AutoService(ModulePlugin::class)
class ResourceModule : ModulePlugin, RouteRegistrar {
    override val name = "resource"
    override val priority = 40

    override fun configure(container: ServiceContainer) {
        container.registerRoutes(this)
    }

    override fun registerRoutes(route: Route, container: ServiceContainer) {
        val userRepo = container.resolve(UserRepository::class)
        val menuRepo = container.resolve(MenuRepository::class)

        route.authenticate("auth-jwt") {
            route("/api/v1/resources") {
                get("") {
                    val userId = call.principal<JWTPrincipal>()?.subject
                        ?: return@get call.respond(HttpStatusCode.Unauthorized, error("Unauthorized"))
                    val user = userRepo.findById(userId) ?: return@get call.respond(HttpStatusCode.OK, error("User not found", 404))
                    val roles = userRepo.getUserRoles(userId)
                    val menuTree = menuRepo.buildMenuTree()

                    // Collect permission strings from all menus
                    val permissions = menuTree.flatMap { collectPermissions(it) }.filter { it.isNotBlank() }.distinct()

                    call.respond(HttpStatusCode.OK, success(BackendResourcesResponse(
                        menus = menuTree,
                        permissions = permissions,
                        roles = roles,
                        is_admin = user.is_admin
                    )))
                }
            }
        }
    }

    private fun collectPermissions(node: MenuTreeNode): List<String> {
        val perms = mutableListOf<String>()
        node.permissions?.let { perms.add(it) }
        node.children.forEach { perms.addAll(collectPermissions(it)) }
        return perms
    }
}
