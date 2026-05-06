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

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.shadmin.core.domain.User
import io.ktor.server.config.*
import java.util.*

class JwtService(config: ApplicationConfig) {
    private val accessSecret = config.property("app.jwt.access-secret").getString()
    private val refreshSecret = config.property("app.jwt.refresh-secret").getString()
    private val accessExpiryMinute = config.property("app.jwt.access-expiry-minute").getString().toInt()
    private val refreshExpiryMinute = config.property("app.jwt.refresh-expiry-minute").getString().toInt()
    private val accessAlgorithm = Algorithm.HMAC256(accessSecret)
    private val refreshAlgorithm = Algorithm.HMAC256(refreshSecret)

    data class TokenPair(val accessToken: String, val refreshToken: String)
    data class AccessClaims(val userId: String, val username: String, val email: String, val isAdmin: Boolean, val roles: List<String>, val permissions: List<String>)

    fun createTokenPair(user: User, roles: List<String>, permissions: List<String> = emptyList()): TokenPair {
        val now = Date()
        val accessExpiry = Date(now.time + accessExpiryMinute * 60 * 1000L)
        val refreshExpiry = Date(now.time + refreshExpiryMinute * 60 * 1000L)

        val accessToken = JWT.create()
            .withSubject(user.id)
            .withClaim("name", user.username)
            .withClaim("email", user.email)
            .withClaim("is_admin", user.is_admin)
            .withClaim("roles", roles)
            .withClaim("permissions", permissions)
            .withIssuedAt(now)
            .withExpiresAt(accessExpiry)
            .sign(accessAlgorithm)

        val refreshToken = JWT.create()
            .withSubject(user.id)
            .withIssuedAt(now)
            .withExpiresAt(refreshExpiry)
            .sign(refreshAlgorithm)

        return TokenPair(accessToken, refreshToken)
    }

    fun verifyAccessToken(token: String): AccessClaims? = try {
        val decoded = JWT.require(accessAlgorithm).build().verify(token)
        AccessClaims(
            userId = decoded.subject ?: return null,
            username = decoded.getClaim("name").asString() ?: "",
            email = decoded.getClaim("email").asString() ?: "",
            isAdmin = decoded.getClaim("is_admin").asBoolean() ?: false,
            roles = decoded.getClaim("roles").asList(String::class.java) ?: emptyList(),
            permissions = decoded.getClaim("permissions").asList(String::class.java) ?: emptyList()
        )
    } catch (e: Exception) { null }

    fun verifyRefreshToken(token: String): String? = try {
        JWT.require(refreshAlgorithm).build().verify(token).subject
    } catch (e: Exception) { null }

    val accessAlgorithmForKtor: Algorithm get() = accessAlgorithm
}
