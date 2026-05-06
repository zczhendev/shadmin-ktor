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

package com.shadmin.modules.system.api

import com.shadmin.core.database.ApiResources
import com.shadmin.core.domain.ApiResource
import com.shadmin.core.domain.CreateApiResourceRequest
import com.shadmin.core.domain.PagedResult
import com.shadmin.core.domain.UpdateApiResourceRequest
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.util.*

class ApiResourceRepository {

    fun findAll(page: Int = 1, pageSize: Int = 10, method: String? = null, module: String? = null, path: String? = null): PagedResult<ApiResource> = transaction {
        val query = ApiResources.selectAll()

        if (!method.isNullOrBlank()) {
            query.andWhere { ApiResources.method eq method }
        }
        if (!module.isNullOrBlank()) {
            query.andWhere { ApiResources.module eq module }
        }
        if (!path.isNullOrBlank()) {
            query.andWhere { ApiResources.path like "%${path}%" }
        }

        val total = query.count()
        val items = query
            .orderBy(ApiResources.createdAt to SortOrder.DESC)
            .limit(pageSize).offset((page - 1L) * pageSize)
            .map { it.toApiResource() }

        PagedResult(
            list = items,
            total = total.toInt(),
            page = page,
            page_size = pageSize,
            total_pages = if (total == 0L) 0 else ((total + pageSize - 1) / pageSize).toInt()
        )
    }

    fun create(request: CreateApiResourceRequest): ApiResource = transaction {
        val id = UUID.randomUUID()
        ApiResources.insert { row ->
            row[ApiResources.id] = id
            row[name] = request.name
            row[path] = request.path
            row[method] = request.method
            row[module] = request.module
            row[description] = request.description
            row[status] = request.status
        }
        findById(id.toString())!!
    }

    fun findById(id: String): ApiResource? = transaction {
        ApiResources.selectAll()
            .where { ApiResources.id eq UUID.fromString(id) }
            .map { it.toApiResource() }
            .singleOrNull()
    }

    fun update(id: String, request: UpdateApiResourceRequest): ApiResource? = transaction {
        ApiResources.update({ ApiResources.id eq UUID.fromString(id) }) { row ->
            request.name?.let { row[name] = it }
            request.path?.let { row[path] = it }
            request.method?.let { row[method] = it }
            request.module?.let { row[module] = it }
            request.description?.let { row[description] = it }
            request.status?.let { row[status] = it }
            row[updatedAt] = LocalDateTime.now()
        }
        findById(id)
    }

    fun delete(id: String): Boolean = transaction {
        ApiResources.deleteWhere { ApiResources.id eq UUID.fromString(id) } > 0
    }

    private fun ResultRow.toApiResource(): ApiResource {
        return ApiResource(
            id = this[ApiResources.id].value.toString(),
            name = this[ApiResources.name],
            path = this[ApiResources.path],
            method = this[ApiResources.method],
            module = this[ApiResources.module],
            description = this[ApiResources.description],
            status = this[ApiResources.status],
            created_at = this[ApiResources.createdAt].toIsoString(),
            updated_at = this[ApiResources.updatedAt].toIsoString()
        )
    }
}
