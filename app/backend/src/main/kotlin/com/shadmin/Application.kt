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

package com.shadmin

import com.shadmin.core.container.DefaultServiceContainer
import com.shadmin.core.container.ModuleLoader
import com.shadmin.core.database.DatabaseFactory
import com.shadmin.core.domain.ApiResponse
import com.shadmin.core.security.JwtService
import com.shadmin.core.security.LoginSecurityManager
import com.shadmin.core.spi.RouteRegistrar
import com.shadmin.modules.system.api.ApiResourceRepository
import com.shadmin.modules.system.init.DefaultDataInitializer
import com.shadmin.modules.system.menu.MenuRepository
import com.shadmin.modules.system.permission.PermissionRepository
import com.shadmin.modules.system.role.RoleRepository
import com.shadmin.modules.system.user.UserRepository
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.engine.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.Serializable
import org.slf4j.event.Level
import java.io.File

@Serializable
data class HealthData(val status: String, val service: String)

fun main(args: Array<String>) {
    EngineMain.main(args)
}

@Suppress("unused")
fun Application.module() {
    val log = environment.log
    val appConfig = environment.config

    // ─── 1. Initialize infrastructure ───
    val database = DatabaseFactory.init(appConfig)
    val jwtService = JwtService(appConfig)
    val securityManager = LoginSecurityManager(appConfig)

    // ─── 2. Install Ktor plugins ───
    installPlugins(this, jwtService, appConfig)

    // ─── 3. Create service container ───
    val container = DefaultServiceContainer(appConfig, database)
    container.register(JwtService::class, jwtService)
    container.register(LoginSecurityManager::class, securityManager)

    // ─── 4. Discover & load all modules via SPI ───
    ModuleLoader.loadAll(container) { message ->
        log.info(message)
    }

    // ─── 5. Initialize default data (after all modules loaded) ───
    try {
        val userRepo = container.resolveOrNull(UserRepository::class)
        val roleRepo = container.resolveOrNull(RoleRepository::class)
        val menuRepo = container.resolveOrNull(MenuRepository::class)
        val apiResourceRepo = container.resolveOrNull(ApiResourceRepository::class)
        val permissionRepo = container.resolveOrNull(PermissionRepository::class)
        if (userRepo != null && roleRepo != null && menuRepo != null) {
            DefaultDataInitializer(appConfig, userRepo, roleRepo, menuRepo, apiResourceRepo, permissionRepo).initialize()
            log.info("Default data initialized")
        }
    } catch (e: Exception) {
        log.warn("Default data initialization skipped: ${e.message}")
    }

    // ─── 6. Mount all routes ───
    routing {
        get("/api/v1/health") {
            call.respond(HttpStatusCode.OK, ApiResponse(code = 0, msg = "OK", data = HealthData(status = "healthy", service = "shadmin")))
        }

        val registrars = container.getRouteRegistrars()
        log.info("Mounting ${registrars.size} route registrar(s)")
        registrars.forEach { registrar -> registrar.registerRoutes(this, container) }

        // Serve frontend static files
        val staticPath = resolveStaticPath()
        if (staticPath != null) {
            staticFiles("/assets", File(staticPath, "assets"))
            get("/{...}") {
                val indexFile = File(staticPath, "index.html")
                if (indexFile.exists()) call.respondFile(indexFile)
                else call.respondText("Frontend not built. Run ':app:frontend:build' first.", status = HttpStatusCode.NotFound)
            }
        }
    }
}

private fun installPlugins(app: Application, jwtService: JwtService, appConfig: ApplicationConfig) {
    app.apply {
        install(ContentNegotiation) {
            json(Json { prettyPrint = true; isLenient = true; ignoreUnknownKeys = true; encodeDefaults = true })
        }
        install(CORS) {
            allowMethod(HttpMethod.Options); allowMethod(HttpMethod.Get); allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Put); allowMethod(HttpMethod.Delete); allowMethod(HttpMethod.Patch)
            allowHeader(HttpHeaders.Authorization); allowHeader(HttpHeaders.ContentType)
            allowCredentials = true
            val env = appConfig.propertyOrNull("app.env")?.getString() ?: "development"
            val allowedHosts = appConfig.propertyOrNull("app.cors.allowed_hosts")?.getList() ?: emptyList()
            if (env == "development" || allowedHosts.isEmpty()) {
                anyHost()
            } else {
                allowedHosts.forEach { host ->
                    allowHost(host, listOf("http", "https"))
                }
            }
        }
        install(StatusPages) {
            exception<Throwable> { call, cause ->
                call.application.environment.log.error("Unhandled exception", cause)
                val env = appConfig.propertyOrNull("app.env")?.getString() ?: "development"
                val message = if (env == "development") cause.message ?: "Internal server error" else "Internal server error"
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiResponse(code = 1, msg = message, data = null)
                )
            }
        }
        install(DefaultHeaders) { header("X-Engine", "Ktor") }
        install(CallLogging) { level = Level.INFO }
        install(Authentication) {
            jwt("auth-jwt") {
                realm = "shadmin"
                verifier(com.auth0.jwt.JWT.require(jwtService.accessAlgorithmForKtor).build())
                validate { credential -> if (credential.subject != null) JWTPrincipal(credential.payload) else null }
                challenge { _, _ -> call.respond(HttpStatusCode.Unauthorized, ApiResponse<Unit>(code = 1, msg = "Not authorized", data = null)) }
            }
        }
    }
}

private fun Application.resolveStaticPath(): File? {
    // Only serve static files from classpath resources (copied by Gradle processResources).
    // This ensures :app:backend:run never serves frontend files even if app/frontend/dist exists.
    environment.classLoader.getResource("static/index.html")?.let { return File(it.toURI()).parentFile }
    return null
}
