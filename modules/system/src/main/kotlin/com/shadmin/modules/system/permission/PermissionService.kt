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

package com.shadmin.modules.system.permission

import com.shadmin.modules.system.role.RoleRepository
import com.shadmin.modules.system.user.UserRepository

class PermissionService(
    private val userRepository: UserRepository,
    private val permissionRepository: PermissionRepository,
    private val roleRepository: RoleRepository
) {
    /**
     * Get all permission codes for a user's roles, including inherited permissions.
     */
    fun getUserPermissions(userId: String): List<String> {
        val roleIds = userRepository.getUserRoleIds(userId)
        if (roleIds.isEmpty()) return emptyList()

        // Collect all role IDs including ancestors for each role
        val allRoleIds = roleIds.toMutableSet()
        roleIds.forEach { roleId ->
            allRoleIds.addAll(roleRepository.getAncestorChain(roleId))
        }

        return permissionRepository.getRolePermissionCodes(allRoleIds.toList())
    }
}
