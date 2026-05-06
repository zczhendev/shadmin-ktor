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

package com.shadmin.core.spi

import kotlin.reflect.KClass

/**
 * Lightweight service registry — modules register services, other modules resolve them.
 */
interface ServiceRegistry {
    /** Register a singleton service */
    fun <T : Any> register(type: KClass<T>, instance: T)

    /** Register with a qualifier name */
    fun <T : Any> register(type: KClass<T>, qualifier: String, instance: T)

    /** Resolve a service — throws if not found */
    fun <T : Any> resolve(type: KClass<T>): T

    /** Resolve with qualifier */
    fun <T : Any> resolve(type: KClass<T>, qualifier: String): T

    /** Resolve all implementations (for multi-binding) */
    fun <T : Any> resolveAll(type: KClass<T>): List<T>

    /** Try resolve — returns null if not found */
    fun <T : Any> resolveOrNull(type: KClass<T>): T?

    /** Check if a service is registered */
    fun <T : Any> has(type: KClass<T>): Boolean
}

// Inline reified helpers
inline fun <reified T : Any> ServiceRegistry.register(instance: T) = register(T::class, instance)
inline fun <reified T : Any> ServiceRegistry.register(qualifier: String, instance: T) = register(T::class, qualifier, instance)
inline fun <reified T : Any> ServiceRegistry.resolve() = resolve(T::class)
inline fun <reified T : Any> ServiceRegistry.resolve(qualifier: String) = resolve(T::class, qualifier)
inline fun <reified T : Any> ServiceRegistry.resolveAll() = resolveAll(T::class)
inline fun <reified T : Any> ServiceRegistry.resolveOrNull() = resolveOrNull(T::class)
inline fun <reified T : Any> ServiceRegistry.has() = has(T::class)
