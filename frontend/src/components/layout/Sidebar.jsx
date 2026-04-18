import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Building2, CalendarDays, Wrench,
  Users, X, Shield, BookOpen, ChevronRight, Home, BarChart3, Bell,
} from 'lucide-react'
import { cn } from '@/utils/helpers'

export default function Sidebar({ open, onClose }) {
  const { isAdmin, isTechnician } = useAuth()

  const NAV_ITEMS = [
    { to: '/home',      label: 'Home',        icon: Home,            show: true },
    { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, show: true },
    { to: '/resources', label: 'Resources',  icon: Building2,       show: true },
    // Technician ට Bookings menu show කරන්නේ නෑ
    { to: '/bookings',  label: 'Bookings',   icon: CalendarDays,    show: !isTechnician() },
    { to: '/tickets',   label: 'Tickets',    icon: Wrench,          show: true },
    { to: '/notification-preferences', label: 'Notifications',  icon: Bell, show: true },
  ].filter(i => i.show)

  const ADMIN_ITEMS = [
    { to: '/admin/users',     label: 'Users',            icon: Users },
    { to: '/admin/bookings',  label: 'All Bookings',     icon: BookOpen },
    { to: '/admin/resources', label: 'Manage Resources', icon: Building2 },
    { to: '/admin/tickets',   label: 'All Tickets',      icon: Wrench },
    { to: '/admin/analytics', label: 'Analytics',         icon: BarChart3 },
  ]

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col',
      'transform transition-transform duration-300 ease-in-out',
      'lg:relative lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">CampusFlow</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Operations</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            cn('sidebar-link', isActive && 'active')
          }>
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}

        {isAdmin() && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Administration
              </p>
            </div>
            {ADMIN_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active')
              }>
                <Icon size={17} />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
          All systems operational
        </div>
      </div>
    </aside>
  )
}