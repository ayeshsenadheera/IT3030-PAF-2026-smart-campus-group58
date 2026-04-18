import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { useMutation } from '@tanstack/react-query'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, Shield, ArrowLeft,
  Mail, Lock, User, AlertCircle, CheckCircle,
} from 'lucide-react'

const GOOGLE_URL    = 'http://localhost:8080/oauth2/authorize/google?redirect_uri=http://localhost:5173/oauth2/redirect&prompt=select_account'
const MICROSOFT_URL = 'http://localhost:8080/oauth2/authorize/microsoft?redirect_uri=http://localhost:5173/oauth2/redirect'

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  fullName:        z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

function getPasswordStrength(pwd) {
  let score = 0
  if (pwd.length >= 8)           score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors  = ['', 'text-red-500', 'text-yellow-600', 'text-blue-600', 'text-green-600']
  const bars    = ['', 'bg-red-400',   'bg-yellow-400',   'bg-blue-400',   'bg-green-500']
  return { score, label: labels[score] || '', color: colors[score] || '', bar: bars[score] || 'bg-slate-200' }
}

export default function LoginPage() {
  const { user }  = useAuth()
  const navigate   = useNavigate()
  const [view, setView] = useState('signin')

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }) }, [user, navigate])

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* ── LEFT PANEL (desktop) ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 relative overflow-hidden flex-col">
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold leading-tight">Campus<span style={{color:"#93c5fd"}}>Flow</span></p>
              <p className="text-primary-300 text-[10px] uppercase tracking-widest font-medium">Hub</p>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
              One platform for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-violet-300">
                your campus
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-10">
              Manage facility bookings, maintenance tickets, and real-time
              notifications — all from a single modern interface.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Book rooms and labs instantly',    cls: 'bg-blue-500/15 text-blue-300 border-blue-500/25'   },
                { label: 'Track maintenance in real-time',   cls: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
                { label: 'Role-based access for everyone',   cls: 'bg-green-500/15 text-green-300 border-green-500/25'  },
              ].map(f => (
                <div key={f.label} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium ${f.cls}`}>
                  <CheckCircle size={12} />
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} CampusFlow</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 overflow-y-auto">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Campus<span className="text-primary-600">Flow</span></span>
        </Link>

        <div className="w-full max-w-[400px]">
          {view === 'signin'      && <SignInView     setView={setView} />}
          {view === 'register'    && <RegisterView   setView={setView} />}
          {view === 'forgot'      && <ForgotView     setView={setView} />}
          {view === 'forgot-sent' && <ForgotSentView setView={setView} />}
        </div>
      </div>
    </div>
  )
}

/* ── SIGN IN ──────────────────────────────────────────────── */
function SignInView({ setView }) {
  const { login }  = useAuth()
  const navigate    = useNavigate()
  const [show, setShow] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: (d) => api.post('/auth/login', d),
    onSuccess: (res) => {
      const token = res.data?.data?.token
      if (token) { login(token); navigate('/dashboard', { replace: true }) }
      else toast.error('Login response missing token')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Invalid email or password'),
  })

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to your CampusFlow account</p>
      </div>

      <div className="space-y-2.5 mb-5">
        <a href={GOOGLE_URL}><SocialBtn icon={<GIcon />} label="Continue with Google" /></a>
        <a href={MICROSOFT_URL}><SocialBtn icon={<MsIcon />} label="Continue with Microsoft / SLIIT" /></a>
      </div>

      <Divider text="or sign in with email" />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 mt-5">
        <Field label="Email Address" error={errors.email?.message} icon={<Mail size={14} className="text-slate-400" />}>
          <input {...register('email')} type="email" placeholder="you@sliit.lk" className="form-input pl-9" />
        </Field>

        <Field label="Password" error={errors.password?.message} icon={<Lock size={14} className="text-slate-400" />}>
          <div className="relative">
            <input {...register('password')} type={show ? 'text' : 'password'}
              placeholder="••••••••" className="form-input pl-9 pr-10" />
            <EyeToggle show={show} toggle={() => setShow(p => !p)} />
          </div>
          <div className="flex justify-end mt-1.5">
            <button type="button" onClick={() => setView('forgot')}
              className="text-xs text-primary-600 font-medium hover:underline">
              Forgot password?
            </button>
          </div>
        </Field>

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-2.5 text-sm">
          {mutation.isPending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <button onClick={() => setView('register')} className="text-primary-600 font-semibold hover:underline">
          Create one
        </button>
      </p>
    </>
  )
}

/* ── REGISTER ─────────────────────────────────────────────── */
function RegisterView({ setView }) {
  const { login }   = useAuth()
  const navigate     = useNavigate()
  const [showP, setShowP] = useState(false)
  const [showC, setShowC] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) })
  const pwd      = watch('password', '')
  const strength = getPasswordStrength(pwd)

  const mutation = useMutation({
    mutationFn: (d) => api.post('/auth/register', { fullName: d.fullName, email: d.email, password: d.password }),
    onSuccess: (res) => {
      const token = res.data?.data?.token
      if (token) { toast.success('Account created! Welcome.'); login(token); navigate('/dashboard', { replace: true }) }
      else { toast.success('Account created! Please sign in.'); setView('signin') }
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Registration failed. Try again.'),
  })

  return (
    <>
      <button onClick={() => setView('signin')} className="btn-ghost btn-sm mb-5 -ml-2">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
        <p className="text-sm text-slate-500">Join CampusFlow today</p>
      </div>

      <div className="space-y-2.5 mb-5">
        <a href={GOOGLE_URL}><SocialBtn icon={<GIcon />} label="Sign up with Google" /></a>
        <a href={MICROSOFT_URL}><SocialBtn icon={<MsIcon />} label="Sign up with Microsoft / SLIIT" /></a>
      </div>

      <Divider text="or register with email" />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 mt-5">
        <Field label="Full Name" error={errors.fullName?.message} icon={<User size={14} className="text-slate-400" />}>
          <input {...register('fullName')} placeholder="John Smith" className="form-input pl-9" />
        </Field>

        <Field label="Email Address" error={errors.email?.message} icon={<Mail size={14} className="text-slate-400" />}>
          <input {...register('email')} type="email" placeholder="you@sliit.lk" className="form-input pl-9" />
        </Field>

        <Field label="Password" error={errors.password?.message} icon={<Lock size={14} className="text-slate-400" />}>
          <div className="relative">
            <input {...register('password')} type={showP ? 'text' : 'password'}
              placeholder="Min 8 chars · 1 uppercase · 1 number" className="form-input pl-9 pr-10" />
            <EyeToggle show={showP} toggle={() => setShowP(p => !p)} />
          </div>
          {pwd.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5 mb-1">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`flex-1 rounded-full transition-all ${i < strength.score ? strength.bar : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className={`text-[11px] font-semibold ${strength.color}`}>{strength.label}</p>
            </div>
          )}
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword?.message} icon={<Lock size={14} className="text-slate-400" />}>
          <div className="relative">
            <input {...register('confirmPassword')} type={showC ? 'text' : 'password'}
              placeholder="Repeat your password" className="form-input pl-9 pr-10" />
            <EyeToggle show={showC} toggle={() => setShowC(p => !p)} />
          </div>
        </Field>

        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          By creating an account you agree to the campus IT policy and terms of service.
        </p>

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-2.5 text-sm">
          {mutation.isPending ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <button onClick={() => setView('signin')} className="text-primary-600 font-semibold hover:underline">Sign in</button>
      </p>
    </>
  )
}

/* ── FORGOT PASSWORD ──────────────────────────────────────── */
function ForgotView({ setView }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotSchema) })

  const mutation = useMutation({
    mutationFn: (d) => api.post('/auth/forgot-password', d),
    onSuccess:  () => setView('forgot-sent'),
    onError:    () => setView('forgot-sent'), // don't reveal if email exists
  })

  return (
    <>
      <button onClick={() => setView('signin')} className="btn-ghost btn-sm mb-5 -ml-2">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
        <Lock size={22} className="text-primary-600" />
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset password</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Field label="Email Address" error={errors.email?.message} icon={<Mail size={14} className="text-slate-400" />}>
          <input {...register('email')} type="email" placeholder="you@sliit.lk" className="form-input pl-9" />
        </Field>
        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-2.5 text-sm">
          {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </>
  )
}

/* ── FORGOT SENT ──────────────────────────────────────────── */
function ForgotSentView({ setView }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={28} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h2>
      <p className="text-sm text-slate-500 leading-relaxed mb-2">
        We've sent a password reset link to your email address.
      </p>
      <p className="text-xs text-slate-400 mb-6">
        Didn't receive it? Check your spam folder or try again.
      </p>
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-left mb-8">
        <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Using Google or Microsoft?</strong> Use the social login buttons — 
          password reset is only for email/password accounts.
        </p>
      </div>
      <button onClick={() => setView('signin')} className="btn-primary w-full justify-center">
        Back to Sign In
      </button>
    </div>
  )
}

/* ── REUSABLE UI ──────────────────────────────────────────── */
function SocialBtn({ icon, label }) {
  return (
    <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-2.5
      bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700
      hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]">
      {icon}{label}
    </button>
  )
}

function Divider({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

function Field({ label, error, icon, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">{icon}</div>}
        {children}
      </div>
      {error && <p className="form-error flex items-center gap-1 mt-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  )
}

function EyeToggle({ show, toggle }) {
  return (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )
}

function GIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" className="shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function MsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" className="shrink-0">
      <rect x="1"  y="1"  width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1"  width="10" height="10" fill="#7FBA00"/>
      <rect x="1"  y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  )
}
