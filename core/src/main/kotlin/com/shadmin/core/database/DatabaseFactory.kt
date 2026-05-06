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

package com.shadmin.core.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import javax.sql.DataSource

object DatabaseFactory {

    fun init(config: ApplicationConfig): Database {
        val dbType = config.property("app.database.type").getString()
        val dataSource = when (dbType) {
            "postgres" -> createPostgresDataSource(config)
            "mysql" -> createMySQLDataSource(config)
            else -> createH2DataSource(config)
        }
        val database = Database.connect(dataSource)

        transaction {
            SchemaUtils.create(
                Users, Roles, UserRoles,
                Menus, RoleMenus, MenuApiResources,
                ApiResources, LoginLogs, DictTypes, DictItems,
                RefreshTokens,
                Departments, UserDepartments,
                Permissions, RolePermissions
            )
        }
        return database
    }

    private fun createH2DataSource(config: ApplicationConfig): DataSource {
        val hikariConfig = HikariConfig().apply {
            driverClassName = "org.h2.Driver"
            jdbcUrl = config.propertyOrNull("app.database.url")?.getString()
                ?: "jdbc:h2:file:./data/shadmin;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE;MODE=PostgreSQL"
            username = config.propertyOrNull("app.database.user")?.getString() ?: "sa"
            password = config.propertyOrNull("app.database.password")?.getString() ?: ""
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(hikariConfig)
    }

    private fun createPostgresDataSource(config: ApplicationConfig): DataSource {
        val hikariConfig = HikariConfig().apply {
            driverClassName = "org.postgresql.Driver"
            jdbcUrl = config.propertyOrNull("app.database.url")?.getString()
                ?: error("Database URL required for PostgreSQL")
            username = config.propertyOrNull("app.database.user")?.getString() ?: ""
            password = config.propertyOrNull("app.database.password")?.getString() ?: ""
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(hikariConfig)
    }

    private fun createMySQLDataSource(config: ApplicationConfig): DataSource {
        val hikariConfig = HikariConfig().apply {
            driverClassName = "com.mysql.cj.jdbc.Driver"
            jdbcUrl = config.propertyOrNull("app.database.url")?.getString()
                ?: error("Database URL required for MySQL")
            username = config.propertyOrNull("app.database.user")?.getString() ?: ""
            password = config.propertyOrNull("app.database.password")?.getString() ?: ""
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(hikariConfig)
    }
}
