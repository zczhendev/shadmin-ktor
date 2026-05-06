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

// ── Page layout shell ──
export { PageShell, PageHeader, PageContent } from './page-shell'

// ── Page status feedback ──
export { PageLoading, PageError, PageEmpty } from './page-status'

// ── Layout components ──
export { AppSidebar } from './layout/app-sidebar'
export { AppTitle } from './layout/app-title'
export { AuthenticatedLayout } from './layout/authenticated-layout'
export { Header } from './layout/header'
export { Main } from './layout/main'
export { NavGroup } from './layout/nav-group'
export { NavUser } from './layout/nav-user'
export { TeamSwitcher } from './layout/team-switcher'
export { TopNav } from './layout/top-nav'
export type {
  SidebarData,
  NavGroup as NavGroupType,
  NavItem,
  NavCollapsible,
  NavLink,
} from './layout/types'

// ── Auth components ──
export { PermissionButton } from './auth/PermissionButton'
export { PermissionGuard } from './auth/PermissionGuard'

// ── Data table components ──
export {
  DataTablePagination,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableViewOptions,
  DataTableToolbar,
  DataTableBulkActions,
} from './data-table'

// ── Form components ──
export { PasswordInput } from './password-input'
export { SelectDropdown } from './select-dropdown'
export { MultiSelectDropdown } from './multi-select-dropdown'
export { DatePicker } from './date-picker'
export { IconPicker } from './icon-picker'

// ── Dialog components ──
export { ConfirmDialog } from './confirm-dialog'
export { SignOutDialog } from './sign-out-dialog'

// ── Feedback / Utility components ──
export { ComingSoon } from './coming-soon'
export { LearnMore } from './learn-more'
export { LongText } from './long-text'
export { CommandMenu } from './command-menu'
export { ConfigDrawer } from './config-drawer'
export { ProfileDropdown } from './profile-dropdown'
export { Search } from './search'
export { ThemeSwitch } from './theme-switch'
export { NavigationProgress } from './navigation-progress'
export { SkipToMain } from './skip-to-main'
