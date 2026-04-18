import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { notificationsApi } from '@/api/notifications'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { cn } from '@/utils/helpers'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)
  const userRef  = useRef(null)
  const notifRef = useRef(null)

  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
    retry: false,
  })
  const unread = countData?.data?.data?.count ?? 0

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Right */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }}
            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell size={19} className="text-slate-600" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px]
                               font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 animate-slide-up">
              <NotificationPanel onClose={() => setNotifOpen(false)} />
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.fullName}
                     className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200" />
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500
                                flex items-center justify-center text-white text-xs font-semibold">
                  {user?.fullName?.charAt(0) ?? 'U'}
                </div>
            }
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400">{user?.roles?.[0] ?? 'USER'}</p>
            </div>
            <ChevronDown size={14} className={cn('text-slate-400 transition-transform', userOpen && 'rotate-180')} />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 bg-white rounded-2xl shadow-card-hover
                            border border-slate-100 py-1.5 animate-slide-up">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600
                           hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
