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

// ─── Auth ───
@Serializable
data class LoginRequest(val username: String = "", val password: String = "")
@Serializable
data class RefreshTokenRequest(val refreshToken: String = "")
@Serializable
data class LogoutRequest(val refresh_token: String? = null)
@Serializable
data class LoginResponse(val accessToken: String, val refreshToken: String)
@Serializable
data class RefreshTokenResponse(val accessToken: String, val refreshToken: String)

// ─── User ───
@Serializable
data class CreateUserRequest(
    val username: String = "",
    val email: String = "",
    val phone: String? = null,
    val password: String = "",
    val status: String = "active",
    val role_ids: List<String> = emptyList()
)
@Serializable
data class InviteUserRequest(val email: String = "", val role_ids: List<String> = emptyList(), val message: String? = null)
@Serializable
data class UpdateUserRequest(
    val username: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val password: String? = null,
    val status: String? = null,
    val avatar: String? = null,
    val role_ids: List<String>? = null
)

// ─── Profile ───
@Serializable
data class ProfileUpdate(val name: String? = null, val avatar: String? = null, val bio: String? = null)
@Serializable
data class PasswordUpdate(val current_password: String = "", val new_password: String = "")

// ─── Role ───
@Serializable
data class CreateRoleRequest(val name: String = "", val sequence: Int = 0, val data_scope: String = "ALL", val status: String = "active", val parent_id: String? = null, val menu_ids: List<String> = emptyList(), val permission_ids: List<String> = emptyList())
@Serializable
data class UpdateRoleRequest(val name: String? = null, val sequence: Int? = null, val data_scope: String? = null, val status: String? = null, val parent_id: String? = null, val menu_ids: List<String>? = null, val permission_ids: List<String>? = null)

// ─── Permission ───
@Serializable
data class CreatePermissionRequest(
    val code: String = "",
    val name: String = "",
    val module: String = "",
    val description: String? = null,
    val status: String = "active"
)
@Serializable
data class UpdatePermissionRequest(
    val code: String? = null,
    val name: String? = null,
    val module: String? = null,
    val description: String? = null,
    val status: String? = null
)

// ─── Menu ───
@Serializable
data class CreateMenuRequest(
    val name: String = "", val sequence: Int = 0, val type: String = "menu",
    val path: String? = null, val icon: String = "", val component: String? = null,
    val route_name: String? = null, val query: String? = null, val is_frame: Boolean = false,
    val visible: String = "show", val permissions: String? = null,
    val apiResources: List<String> = emptyList(), val status: String = "active", val parent_id: String? = null
)
@Serializable
data class UpdateMenuRequest(
    val code: String? = null, val name: String? = null, val sequence: Int? = null,
    val type: String? = null, val path: String? = null, val icon: String? = null,
    val component: String? = null, val route_name: String? = null, val query: String? = null,
    val is_frame: Boolean? = null, val visible: String? = null, val permissions: String? = null,
    val parent_id: String? = null, val status: String? = null, val apiResources: List<String>? = null
)

// ─── Login Log ───
@Serializable
data class CreateLoginLogRequest(
    val username: String = "", val login_ip: String = "",
    val user_agent: String? = null, val status: String = "success", val failure_reason: String? = null
)

// ─── API Resource ───
@Serializable
data class CreateApiResourceRequest(
    val name: String = "",
    val path: String = "",
    val method: String = "GET",
    val module: String? = null,
    val description: String? = null,
    val status: String = "active"
)
@Serializable
data class UpdateApiResourceRequest(
    val name: String? = null,
    val path: String? = null,
    val method: String? = null,
    val module: String? = null,
    val description: String? = null,
    val status: String? = null
)

// ─── Department ───
@Serializable
data class CreateDepartmentRequest(
    val name: String = "",
    val code: String = "",
    val parent_id: String? = null,
    val sequence: Int = 0,
    val status: String = "active"
)
@Serializable
data class UpdateDepartmentRequest(
    val name: String? = null,
    val code: String? = null,
    val parent_id: String? = null,
    val sequence: Int? = null,
    val status: String? = null
)

// ─── Dict ───
@Serializable
data class CreateDictTypeRequest(val name: String = "", val code: String = "", val status: String = "active")
@Serializable
data class UpdateDictTypeRequest(val name: String? = null, val code: String? = null, val status: String? = null)
@Serializable
data class CreateDictItemRequest(val type_id: String = "", val label: String = "", val value: String = "", val sequence: Int = 0, val status: String = "active")
@Serializable
data class UpdateDictItemRequest(val label: String? = null, val value: String? = null, val sequence: Int? = null, val status: String? = null)
