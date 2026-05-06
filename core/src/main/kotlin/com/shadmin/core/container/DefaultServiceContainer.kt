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

package com.shadmin.core.container

import com.shadmin.core.spi.RouteRegistrar
import com.shadmin.core.spi.ServiceRegistry
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import kotlin.reflect.KClass

class DefaultServiceContainer(
    private val config: ApplicationConfig,
    private val database: Database
) : ServiceContainer {

    private val registry = SimpleServiceRegistry()
    private val routeRegistrars = mutableListOf<RouteRegistrar>()

    override fun getConfig(): ApplicationConfig = config
    override fun getDatabase(): Database = database

    override fun <T : Any> register(type: KClass<T>, instance: T) = registry.register(type, instance)
    override fun <T : Any> register(type: KClass<T>, qualifier: String, instance: T) = registry.register(type, qualifier, instance)
    override fun <T : Any> resolve(type: KClass<T>): T = registry.resolve(type)
    override fun <T : Any> resolve(type: KClass<T>, qualifier: String): T = registry.resolve(type, qualifier)
    override fun <T : Any> resolveAll(type: KClass<T>): List<T> = registry.resolveAll(type)
    override fun <T : Any> resolveOrNull(type: KClass<T>): T? = registry.resolveOrNull(type)
    override fun <T : Any> has(type: KClass<T>): Boolean = registry.has(type)

    override fun registerRoutes(registrar: RouteRegistrar) {
        routeRegistrars.add(registrar)
    }

    /** Get all collected route registrars */
    fun getRouteRegistrars(): List<RouteRegistrar> = routeRegistrars.toList()
}

// Simple map-based implementation
private class SimpleServiceRegistry : ServiceRegistry {
    private val singletons = mutableMapOf<Pair<KClass<*>, String>, Any>()

    @Suppress("UNCHECKED_CAST")
    override fun <T : Any> register(type: KClass<T>, instance: T) {
        singletons[type to ""] = instance
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : Any> register(type: KClass<T>, qualifier: String, instance: T) {
        singletons[type to qualifier] = instance
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : Any> resolve(type: KClass<T>): T {
        return singletons[type to ""] as? T
            ?: throw IllegalStateException("No service registered for ${type.simpleName}")
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : Any> resolve(type: KClass<T>, qualifier: String): T {
        return singletons[type to qualifier] as? T
            ?: throw IllegalStateException("No service registered for ${type.simpleName} (qualifier: $qualifier)")
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : Any> resolveAll(type: KClass<T>): List<T> {
        return singletons.entries
            .filter { it.key.first == type }
            .map { it.value as T }
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : Any> resolveOrNull(type: KClass<T>): T? {
        return singletons[type to ""] as? T
    }

    override fun <T : Any> has(type: KClass<T>): Boolean {
        return singletons.keys.any { it.first == type }
    }
}
