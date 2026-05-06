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

import com.shadmin.core.database.RefreshTokens
import com.shadmin.core.domain.*
import com.shadmin.core.security.JwtService
import com.shadmin.core.security.LoginSecurityManager
import com.shadmin.core.security.PasswordHasher
import com.shadmin.modules.system.log.LoginLogRepository
import com.shadmin.modules.system.permission.PermissionService
import com.shadmin.modules.system.user.UserRepository
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import java.time.LocalDateTime
import java.util.*

class AuthService(
    private val userRepository: UserRepository,
    private val loginLogRepository: LoginLogRepository,
    private val jwtService: JwtService,
    private val securityManager: LoginSecurityManager,
    private val permissionService: PermissionService
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    fun login(request: LoginRequest, clientIp: String, userAgent: String?): ApiResponse<LoginResponse> {
        if (securityManager.isLocked(request.username)) {
            @Suppress("UNCHECKED_CAST")
            return error("账户已被锁定，请在 ${securityManager.getRemainingLockTime(request.username)} 秒后重试", code = 423) as ApiResponse<LoginResponse>
        }

        val user = userRepository.findByUsername(request.username)
        if (user == null) {
            securityManager.recordFailedAttempt(request.username)
            recordLoginLog(request.username, clientIp, userAgent, "failed", "用户不存在")
            @Suppress("UNCHECKED_CAST")
            return error("用户名或密码错误") as ApiResponse<LoginResponse>
        }

        if (!PasswordHasher.verify(request.password, user.password ?: "")) {
            securityManager.recordFailedAttempt(request.username)
            recordLoginLog(request.username, clientIp, userAgent, "failed", "密码错误")
            @Suppress("UNCHECKED_CAST")
            return error("用户名或密码错误") as ApiResponse<LoginResponse>
        }

        securityManager.recordSuccessfulLogin(request.username)
        val roles = userRepository.getUserRoles(user.id)
        val permissions = permissionService.getUserPermissions(user.id)
        val tokens = jwtService.createTokenPair(user.copy(role = roles), roles, permissions)
        storeRefreshToken(user.id, tokens.refreshToken)
        recordLoginLog(request.username, clientIp, userAgent, "success", null)
        return success(LoginResponse(accessToken = tokens.accessToken, refreshToken = tokens.refreshToken))
    }

    fun refresh(request: RefreshTokenRequest): ApiResponse<RefreshTokenResponse> {
        val userId = jwtService.verifyRefreshToken(request.refreshToken)
        if (userId == null) {
            @Suppress("UNCHECKED_CAST")
            return error("Invalid refresh token", code = 401) as ApiResponse<RefreshTokenResponse>
        }

        // Validate and revoke in a single transaction to prevent race conditions
        val tokenValid = transaction {
            val now = LocalDateTime.now()
            val hash = hashToken(request.refreshToken)
            val exists = RefreshTokens.selectAll()
                .where { RefreshTokens.tokenHash eq hash and (RefreshTokens.expiresAt greater now) }
                .count() > 0
            if (exists) {
                RefreshTokens.deleteWhere { RefreshTokens.tokenHash eq hash }
            }
            exists
        }

        if (!tokenValid) {
            @Suppress("UNCHECKED_CAST")
            return error("Invalid refresh token", code = 401) as ApiResponse<RefreshTokenResponse>
        }

        val user = userRepository.findById(userId) ?: @Suppress("UNCHECKED_CAST")
        return error("User not found", code = 401) as ApiResponse<RefreshTokenResponse>
        val roles = userRepository.getUserRoles(user.id)
        val permissions = permissionService.getUserPermissions(user.id)
        val tokens = jwtService.createTokenPair(user, roles, permissions)
        storeRefreshToken(user.id, tokens.refreshToken)
        return success(RefreshTokenResponse(accessToken = tokens.accessToken, refreshToken = tokens.refreshToken))
    }

    fun logout(userId: String?, accessToken: String?, refreshToken: String?): ApiResponse<String> = transaction {
        if (!refreshToken.isNullOrBlank()) {
            RefreshTokens.deleteWhere { RefreshTokens.tokenHash eq hashToken(refreshToken) }
        } else if (!userId.isNullOrBlank()) {
            RefreshTokens.deleteWhere { RefreshTokens.userId eq UUID.fromString(userId) }
        }
        success("Logout successful")
    }

    private fun storeRefreshToken(userId: String, token: String) = transaction {
        RefreshTokens.insert { row ->
            row[RefreshTokens.id] = UUID.randomUUID()
            row[RefreshTokens.userId] = UUID.fromString(userId)
            row[RefreshTokens.tokenHash] = hashToken(token)
            row[RefreshTokens.expiresAt] = LocalDateTime.now().plusDays(7)
        }
    }

    private fun hashToken(token: String): String {
        val bytes = java.security.MessageDigest.getInstance("SHA-256").digest(token.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    private fun recordLoginLog(username: String, ip: String, userAgent: String?, status: String, failureReason: String?) {
        try {
            loginLogRepository.create(CreateLoginLogRequest(username = username, login_ip = ip, user_agent = userAgent, status = status, failure_reason = failureReason))
        } catch (e: Exception) {
            logger.error("Failed to record login log for user $username", e)
        }
    }
}
