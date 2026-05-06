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

package com.shadmin.modules.system.dict

import com.shadmin.core.database.DictItems
import com.shadmin.core.database.DictTypes
import com.shadmin.core.domain.*
import com.shadmin.core.utils.toIsoString
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.like
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class DictRepository {
    fun createType(request: CreateDictTypeRequest): DictType = transaction {
        val id = UUID.randomUUID()
        DictTypes.insert { row -> row[DictTypes.id] = id; row[name] = request.name; row[code] = request.code; row[status] = request.status }
        findTypeById(id.toString())!!
    }
    fun findAllTypes(page: Int = 1, pageSize: Int = 20): PagedResult<DictType> = transaction {
        val total = DictTypes.selectAll().count().toInt()
        val list = DictTypes.selectAll()
            .limit(pageSize).offset(((page - 1) * pageSize).toLong())
            .map { it.toDictType() }
        PagedResult(
            list = list,
            total = total,
            page = page,
            page_size = pageSize,
            total_pages = if (total == 0) 0 else (total + pageSize - 1) / pageSize
        )
    }
    fun findTypeById(id: String): DictType? = transaction { DictTypes.selectAll().where { DictTypes.id eq UUID.fromString(id) }.map { it.toDictType() }.singleOrNull() }
    fun updateType(id: String, request: UpdateDictTypeRequest): DictType? = transaction {
        DictTypes.update({ DictTypes.id eq UUID.fromString(id) }) { row -> request.name?.let { row[name] = it }; request.code?.let { row[code] = it }; request.status?.let { row[status] = it } }
        findTypeById(id)
    }
    fun deleteType(id: String): Boolean = transaction { DictItems.deleteWhere { typeId eq UUID.fromString(id) }; DictTypes.deleteWhere { DictTypes.id eq UUID.fromString(id) } > 0 }

    fun createItem(request: CreateDictItemRequest): DictItem = transaction {
        val id = UUID.randomUUID()
        DictItems.insert { row -> row[DictItems.id] = id; row[typeId] = UUID.fromString(request.type_id); row[label] = request.label; row[value] = request.value; row[sequence] = request.sequence; row[status] = request.status }
        findItemById(id.toString())!!
    }
    fun findItemsByTypeId(typeId: String): List<DictItem> = transaction { DictItems.selectAll().where { DictItems.typeId eq UUID.fromString(typeId) }.orderBy(DictItems.sequence to SortOrder.ASC).map { it.toDictItem() } }
    fun findItemsByTypeCode(code: String): List<DictItem> = transaction {
        val type = DictTypes.selectAll().where { DictTypes.code eq code }.singleOrNull() ?: return@transaction emptyList()
        DictItems.selectAll().where { DictItems.typeId eq type[DictTypes.id] }.orderBy(DictItems.sequence to SortOrder.ASC).map { it.toDictItem() }
    }
    fun findItemById(id: String): DictItem? = transaction { DictItems.selectAll().where { DictItems.id eq UUID.fromString(id) }.map { it.toDictItem() }.singleOrNull() }
    fun updateItem(id: String, request: UpdateDictItemRequest): DictItem? = transaction {
        DictItems.update({ DictItems.id eq UUID.fromString(id) }) { row -> request.label?.let { row[label] = it }; request.value?.let { row[value] = it }; request.sequence?.let { row[sequence] = it }; request.status?.let { row[status] = it } }
        findItemById(id)
    }
    fun deleteItem(id: String): Boolean = transaction { DictItems.deleteWhere { DictItems.id eq UUID.fromString(id) } > 0 }

    private fun ResultRow.toDictType(): DictType = DictType(id = this[DictTypes.id].value.toString(), name = this[DictTypes.name], code = this[DictTypes.code], status = this[DictTypes.status], created_at = this[DictTypes.createdAt].toIsoString(), updated_at = this[DictTypes.updatedAt].toIsoString())
    private fun ResultRow.toDictItem(): DictItem = DictItem(id = this[DictItems.id].value.toString(), type_id = this[DictItems.typeId].value.toString(), label = this[DictItems.label], value = this[DictItems.value], sequence = this[DictItems.sequence], status = this[DictItems.status], created_at = this[DictItems.createdAt].toIsoString(), updated_at = this[DictItems.updatedAt].toIsoString())
}
