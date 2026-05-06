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

package com.shadmin.core.security

import io.ktor.server.config.*
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

class LoginSecurityManager(config: ApplicationConfig) {
    private val maxFailures: Int = config.propertyOrNull("app.security.max-login-failures")?.getString()?.toInt() ?: 5
    private val lockoutDuration: Long = config.propertyOrNull("app.security.lockout-duration-seconds")?.getString()?.toLong() ?: 300
    private data class LockEntry(val failedAttempts: Int = 0, val lockedUntil: Long? = null)
    private val attempts = ConcurrentHashMap<String, LockEntry>()

    fun isLocked(username: String): Boolean {
        val entry = attempts[username] ?: return false
        val lockedUntil = entry.lockedUntil ?: return false
        return Instant.now().epochSecond < lockedUntil
    }

    fun getRemainingLockTime(username: String): Long {
        val lockedUntil = attempts[username]?.lockedUntil ?: return 0
        val remaining = lockedUntil - Instant.now().epochSecond
        return if (remaining > 0) remaining else 0
    }

    fun recordFailedAttempt(username: String) {
        val entry = attempts[username] ?: LockEntry()
        val newAttempts = entry.failedAttempts + 1
        if (newAttempts >= maxFailures) {
            attempts[username] = entry.copy(failedAttempts = newAttempts, lockedUntil = Instant.now().epochSecond + lockoutDuration)
        } else {
            attempts[username] = entry.copy(failedAttempts = newAttempts)
        }
    }

    fun recordSuccessfulLogin(username: String) { attempts.remove(username) }
}
