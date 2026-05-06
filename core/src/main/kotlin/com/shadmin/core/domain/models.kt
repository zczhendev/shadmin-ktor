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

package com.shadmin.core.domain

import kotlinx.serialization.Serializable

// ─── 通用响应 ───
@Serializable
data class ApiResponse<T>(
    val code: Int = 0,
    val msg: String = "OK",
    val data: T? = null
)

fun <T> success(data: T? = null) = ApiResponse(code = 0, msg = "OK", data = data)
fun error(message: String, code: Int = 1) = ApiResponse<Nothing>(code = code, msg = message, data = null)

// ─── 分页 ───
@Serializable
data class PagedResult<T>(
    val list: List<T> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val page_size: Int = 10,
    val total_pages: Int = 0
)

@Serializable
data class QueryParams(
    val page: Int = 1,
    val page_size: Int = 10,
    val sort_by: String? = null,
    val sort_order: String = "desc"
)

// ─── 用户 ───
@Serializable
data class User(
    val id: String,
    val username: String,
    val email: String,
    val phone: String? = null,
    @kotlinx.serialization.Transient
    val password: String? = null,
    val avatar: String? = null,
    val is_admin: Boolean = false,
    val status: String = "active",
    val role: List<String> = emptyList(),
    val is_active: Boolean = true,
    val created_at: String? = null,
    val updated_at: String? = null
)

@Serializable
data class UserQueryFilter(
    val status: String = "",
    val username: String = "",
    val email: String = "",
    val page: Int = 1,
    val page_size: Int = 10
)

// ─── 角色 ───
@Serializable
data class Role(
    val id: String,
    val name: String,
    val is_system: Boolean = false,
    val sequence: Int = 0,
    val data_scope: String = "ALL",
    val status: String = "active",
    val parent_id: String? = null,
    val menus: List<String> = emptyList(),
    val permissions: List<String> = emptyList(),
    val inherited_menus: List<String> = emptyList(),
    val inherited_permissions: List<String> = emptyList(),
    val created_at: String? = null,
    val updated_at: String? = null
)

// ─── 菜单 ───
@Serializable
data class Menu(
    val id: String,
    val name: String,
    val description: String? = null,
    val sequence: Int = 0,
    val type: String = "menu",
    val path: String? = null,
    val icon: String = "",
    val component: String? = null,
    val route_name: String? = null,
    val query: String? = null,
    val is_frame: Boolean = false,
    val visible: String = "show",
    val permissions: String? = null,
    val status: String = "active",
    val parent_id: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null,
    val children: List<Menu> = emptyList(),
    val apiResources: List<String> = emptyList()
)

@Serializable
data class MenuTreeNode(
    val id: String,
    val name: String,
    val sequence: Int = 0,
    val type: String = "menu",
    val path: String? = null,
    val icon: String = "",
    val component: String? = null,
    val route_name: String? = null,
    val query: String? = null,
    val is_frame: Boolean = false,
    val visible: String = "show",
    val permissions: String? = null,
    val status: String = "active",
    val parent_id: String? = null,
    val children: List<MenuTreeNode> = emptyList(),
    val apiResources: List<String> = emptyList(),
    val roles: List<String> = emptyList()
)

// ─── 登录日志 ───
@Serializable
data class LoginLog(
    val id: String,
    val username: String,
    val login_ip: String,
    val user_agent: String? = null,
    val status: String = "success",
    val failure_reason: String? = null,
    val created_at: String? = null
)

// ─── API资源 ───
@Serializable
data class ApiResource(
    val id: String,
    val name: String,
    val path: String,
    val method: String,
    val module: String? = null,
    val description: String? = null,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null
)

// ─── 字典 ───
@Serializable
data class DictType(
    val id: String,
    val name: String,
    val code: String,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null
)

@Serializable
data class DictItem(
    val id: String,
    val type_id: String,
    val label: String,
    val value: String,
    val sequence: Int = 0,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null
)

// ─── 部门 ───
@Serializable
data class Department(
    val id: String,
    val name: String,
    val code: String,
    val parent_id: String? = null,
    val sequence: Int = 0,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null,
    val children: List<Department> = emptyList()
)

// ─── 权限 ───
@Serializable
data class Permission(
    val id: String,
    val code: String,
    val name: String,
    val module: String? = null,
    val description: String? = null,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null
)

// ─── Resource / Nav ───
@Serializable
data class NavItem(val title: String, val url: String, val icon: String, val items: List<NavItem>? = null)
@Serializable
data class NavGroup(val title: String, val icon: String, val items: List<NavItem>)
@Serializable
data class ResourceUserInfo(val name: String, val email: String, val avatar: String)
@Serializable
data class ResourceResponse(val user: ResourceUserInfo, val navGroups: List<NavGroup>)

@Serializable
data class BackendResourcesResponse(
    val menus: List<MenuTreeNode> = emptyList(),
    val permissions: List<String> = emptyList(),
    val roles: List<String> = emptyList(),
    val is_admin: Boolean = false
)
