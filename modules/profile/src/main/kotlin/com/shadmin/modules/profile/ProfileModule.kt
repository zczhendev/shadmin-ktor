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

package com.shadmin.modules.profile

import com.google.auto.service.AutoService
import com.shadmin.core.container.ServiceContainer
import com.shadmin.core.domain.*
import com.shadmin.core.security.PasswordHasher
import com.shadmin.core.spi.ModulePlugin
import com.shadmin.core.spi.RouteRegistrar
import com.shadmin.modules.system.user.UserRepository
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

/**
 * Profile module — user profile & password management.
 * Depends on system module's UserRepository (resolved from container).
 */
@AutoService(ModulePlugin::class)
class ProfileModule : ModulePlugin, RouteRegistrar {
    override val name = "profile"
    override val priority = 30

    override fun configure(container: ServiceContainer) {
        container.registerRoutes(this)
    }

    override fun registerRoutes(route: Route, container: ServiceContainer) {
        val userRepo = container.resolve(UserRepository::class)

        route.authenticate("auth-jwt") {
            route("/api/v1/profile") {
                get("") {
                    val userId = call.principal<JWTPrincipal>()?.subject
                        ?: return@get call.respond(HttpStatusCode.Unauthorized, error("Unauthorized"))
                    val user = userRepo.findById(userId) ?: return@get call.respond(HttpStatusCode.OK, error("User not found", 404))
                    call.respond(HttpStatusCode.OK, success(user))
                }

                put("") {
                    val userId = call.principal<JWTPrincipal>()?.subject
                        ?: return@put call.respond(HttpStatusCode.Unauthorized, error("Unauthorized"))
                    val update = call.receive<ProfileUpdate>()
                    val request = UpdateUserRequest(username = update.name)
                    val user = userRepo.update(userId, request) ?: return@put call.respond(HttpStatusCode.OK, error("User not found", 404))
                    call.respond(HttpStatusCode.OK, success(user))
                }

                put("/password") {
                    val userId = call.principal<JWTPrincipal>()?.subject
                        ?: return@put call.respond(HttpStatusCode.Unauthorized, error("Unauthorized"))
                    val update = call.receive<PasswordUpdate>()
                    val user = userRepo.findById(userId) ?: return@put call.respond(HttpStatusCode.OK, error("User not found", 404))
                    if (!PasswordHasher.verify(update.current_password, user.password ?: "")) {
                        call.respond(HttpStatusCode.OK, error("Current password is incorrect")); return@put
                    }
                    userRepo.updatePassword(userId, PasswordHasher.hash(update.new_password))
                    call.respond(HttpStatusCode.OK, success("Password updated successfully"))
                }
            }
        }
    }
}
