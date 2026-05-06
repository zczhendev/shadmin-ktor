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

package com.shadmin.modules.system.log

import com.shadmin.core.database.LoginLogs
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class LoginLogRepository {
    fun create(request: CreateLoginLogRequest): LoginLog = transaction {
        val id = UUID.randomUUID()
        LoginLogs.insert { row ->
            row[LoginLogs.id] = id; row[username] = request.username; row[loginIp] = request.login_ip
            row[userAgent] = request.user_agent; row[status] = request.status; row[failureReason] = request.failure_reason
        }
        findById(id.toString())!!
    }
    fun findAll(page: Int, pageSize: Int): PagedResult<LoginLog> = transaction {
        val total = LoginLogs.selectAll().count().toInt()
        val list = LoginLogs.selectAll().orderBy(LoginLogs.createdAt to SortOrder.DESC).limit(pageSize).offset(((page - 1) * pageSize).toLong()).map { it.toLoginLog() }
        PagedResult(list, total, page, pageSize, if (total == 0) 0 else (total + pageSize - 1) / pageSize)
    }
    fun clearAll(): Boolean = transaction { LoginLogs.deleteAll() > 0 }
    fun findById(id: String): LoginLog? = transaction { LoginLogs.selectAll().where { LoginLogs.id eq UUID.fromString(id) }.map { it.toLoginLog() }.singleOrNull() }
    private fun ResultRow.toLoginLog(): LoginLog = LoginLog(
        id = this[LoginLogs.id].value.toString(), username = this[LoginLogs.username], login_ip = this[LoginLogs.loginIp],
        user_agent = this[LoginLogs.userAgent], status = this[LoginLogs.status], failure_reason = this[LoginLogs.failureReason],
        created_at = this[LoginLogs.createdAt].toIsoString())
}
