import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Building2, CalendarDays, Wrench, Bell,
  Users, ArrowRight, CheckCircle, Star, ChevronRight,
  Zap, Lock, BarChart3, Globe,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Building2, color: 'from-blue-500 to-blue-600',
    title: 'Facility Management',
    desc: 'Browse and manage all campus rooms, labs, and equipment in one place. Real-time availability at your fingertips.',
  },
  {
    icon: CalendarDays, color: 'from-violet-500 to-violet-600',
    title: 'Smart Booking System',
    desc: 'Request and track resource bookings with automated conflict detection. Admins approve with one click.',
  },
  {
    icon: Wrench, color: 'from-orange-500 to-orange-600',
    title: 'Maintenance Tickets',
    desc: 'Report incidents and track repairs from open to resolved. Technicians get assigned automatically.',
  },
  {
    icon: Bell, color: 'from-green-500 to-green-600',
    title: 'Real-time Notifications',
    desc: 'Stay updated on booking approvals, ticket status changes, and new assignments instantly.',
  },
  {
    icon: Users, color: 'from-pink-500 to-pink-600',
    title: 'Role-based Access',
    desc: 'Different views for Students, Technicians, and Admins. Everyone sees exactly what they need.',
  },
  {
    icon: BarChart3, color: 'from-teal-500 to-teal-600',
    title: 'Dashboard Analytics',
    desc: 'Live statistics on resource usage, pending requests, and ticket resolution rates.',
  },
]

const STATS = [
  { value: '500+', label: 'Resources Managed' },
  { value: '2,000+', label: 'Bookings Monthly' },
  { value: '98%', label: 'Uptime Guaranteed' },
  { value: '< 2min', label: 'Avg. Response Time' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign in with your account', desc: 'Use your Google or SLIIT Microsoft account — no new password needed.' },
  { step: '02', title: 'Browse available resources', desc: 'Search rooms, labs, and equipment filtered by type, location, or availability.' },
  { step: '03', title: 'Submit your request', desc: 'Book a resource or report a maintenance issue in under 60 seconds.' },
  { step: '04', title: 'Track in real-time', desc: 'Get notified the moment your booking is approved or your ticket is resolved.' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  useEffect(() => { if (user) navigate('/dashboard', { replace: true }) }, [user, navigate])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-sm">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Campus<span className="text-primary-600">Flow</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How it Works</a>
            <a href="#stats" className="hover:text-primary-600 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors px-3 py-1.5 hidden sm:block">
              Sign In
            </Link>
            <Link to="/login" className="btn-primary btn-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-primary-200 mb-8 backdrop-blur-sm">
            <Zap size={12} className="text-yellow-400" />
            University Campus Operations Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Everything your campus<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-violet-300 to-accent-300">
              needs in one place
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            CampusFlow brings facility bookings, maintenance tracking, and real-time
            notifications together — built for students, staff, and administrators.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5">
              Start for Free <ArrowRight size={16} />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl border border-white/20 transition-all backdrop-blur-sm">
              Explore Features <ChevronRight size={16} />
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-400 font-medium">
            {['OAuth2 Secured', 'Role-based Access', 'Real-time Updates', 'Mobile Friendly'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section id="stats" className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Built for modern campus operations
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Every tool your university needs to manage facilities efficiently,
              from booking to maintenance — all in one intuitive system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card card-body group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Get up and running in minutes — no training required.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center mx-auto mb-4 relative z-10 bg-white">
                  <span className="text-xl font-bold text-primary-600">{step}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-600 to-accent-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to modernise your campus?
          </h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto leading-relaxed">
            Sign in with your university Google or Microsoft account — no registration needed, instant access.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Sign in now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                <Shield size={13} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Campus<span style={{color:"#93c5fd"}}>Flow</span></span>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} CampusFlow — University Campus Operations Platform
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <Globe size={12} />
              <span>Built with React + Spring Boot</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
