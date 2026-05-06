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

import com.shadmin.core.spi.ModulePlugin
import io.ktor.server.application.*
import java.util.*

/**
 * Discovers all [ModulePlugin] implementations via SPI (ServiceLoader).
 * Uses Google AutoService to generate META-INF/services entries automatically.
 */
object ModuleLoader {

    fun discoverModules(): List<ModulePlugin> {
        val modules = ServiceLoader.load(ModulePlugin::class.java).toList()
        return modules.sortedBy { it.priority }
    }

    fun loadAll(container: ServiceContainer, log: (String) -> Unit = {}) {
        val modules = discoverModules()
        log("Discovered ${modules.size} module(s) via SPI")

        modules.forEach { module ->
            log("Configuring module: ${module.name} (priority=${module.priority})")
            module.configure(container)
        }
    }
}
