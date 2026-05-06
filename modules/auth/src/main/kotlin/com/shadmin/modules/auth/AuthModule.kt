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

package com.shadmin.modules.auth

import com.google.auto.service.AutoService
import com.shadmin.core.container.ServiceContainer
import com.shadmin.core.domain.*
import com.shadmin.core.security.JwtService
import com.shadmin.core.security.LoginSecurityManager
import com.shadmin.core.spi.ModulePlugin
import com.shadmin.core.spi.RouteRegistrar
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import com.shadmin.core.utils.getClientIp
import com.shadmin.core.utils.getUserAgent

/**
 * Auth module — handles login, refresh, logout.
 * Discovered automatically via SPI (@AutoService).
 */
@AutoService(ModulePlugin::class)
class AuthModule : ModulePlugin, RouteRegistrar {
    override val name = "auth"
    override val priority = 10  // Load early — other modules may depend on auth

    override fun configure(container: ServiceContainer) {
        // Auth service is self-contained — no external deps needed
        container.registerRoutes(this)
    }

    override fun registerRoutes(route: Route, container: ServiceContainer) {
        val jwtService = container.resolve(JwtService::class)
        val securityManager = container.resolve(LoginSecurityManager::class)
        // Resolve UserRepository from core container (registered by system module or core init)
        val userRepo = container.resolve(com.shadmin.modules.system.user.UserRepository::class)
        val loginLogRepo = container.resolve(com.shadmin.modules.system.log.LoginLogRepository::class)
        val permissionRepo = container.resolve(com.shadmin.modules.system.permission.PermissionRepository::class)
        val roleRepo = container.resolve(com.shadmin.modules.system.role.RoleRepository::class)
        val permissionService = com.shadmin.modules.system.permission.PermissionService(userRepo, permissionRepo, roleRepo)

        val authService = AuthService(userRepo, loginLogRepo, jwtService, securityManager, permissionService)

        route.route("/api/v1/auth") {
            post("/login") {
                val request = call.receive<LoginRequest>()
                val result = authService.login(request, call.getClientIp(), call.getUserAgent())
                val status = when (result.code) {
                    0 -> HttpStatusCode.OK
                    423 -> HttpStatusCode.Locked
                    else -> HttpStatusCode.Unauthorized
                }
                call.respond(status, result)
            }

            post("/refresh") {
                val request = call.receive<RefreshTokenRequest>()
                val result = authService.refresh(request)
                call.respond(if (result.code == 0) HttpStatusCode.OK else HttpStatusCode.Unauthorized, result)
            }

            post("/logout") {
                val request = try { call.receive<LogoutRequest>() } catch (e: Exception) { LogoutRequest() }
                val userId = call.principal<io.ktor.server.auth.jwt.JWTPrincipal>()?.subject
                val accessToken = call.request.headers["Authorization"]?.removePrefix("Bearer ")?.trim()
                val result = authService.logout(userId, accessToken, request.refresh_token)
                call.respond(HttpStatusCode.OK, result)
            }
        }
    }
}
