import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, Shield, Lock, AlertCircle, CheckCircle,
} from 'lucide-react'

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

function getPasswordStrength(pwd) {
  let score = 0
  if (pwd.length >= 8)           score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors  = ['', 'text-red-500', 'text-yellow-600', 'text-blue-600', 'text-green-600']
  const bars    = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  return { score, label: labels[score] || '', color: colors[score] || '', bar: bars[score] || 'bg-slate-200' }
}

export default function ResetPasswordPage() {
  const [searchParams]        = useSearchParams()
  const navigate               = useNavigate()
  const token                  = searchParams.get('token')
  const [showP, setShowP]      = useState(false)
  const [showC, setShowC]      = useState(false)
  const [success, setSuccess]  = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  })

  const pwd      = watch('password', '')
  const strength = getPasswordStrength(pwd)

  const mutation = useMutation({
    mutationFn: (d) =>
      api.post(`/auth/reset-password?token=${token}`, { password: d.password }),
    onSuccess: () => {
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? 'Reset failed. The link may have expired.'),
  })

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Invalid Link</h2>
          <p className="text-sm text-slate-500 mb-6">
            This password reset link is invalid or missing a token.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Password Reset!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your password has been reset successfully. Redirecting you to sign in…
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* ── LEFT PANEL ───────────────────────────────── */}
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
              <p className="text-white font-bold leading-tight">Campus<span style={{ color: '#93c5fd' }}>Flow</span></p>
              <p className="text-primary-300 text-[10px] uppercase tracking-widest font-medium">Hub</p>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
              Set your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-violet-300">
                new password
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Choose a strong password to keep your CampusFlow account secure.
            </p>
          </div>

          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} CampusFlow</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 overflow-y-auto">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Campus<span className="text-primary-600">Flow</span></span>
        </Link>

        <div className="w-full max-w-[400px]">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
            <Lock size={22} className="text-primary-600" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset your password</h2>
            <p className="text-sm text-slate-500">Enter and confirm your new password below.</p>
          </div>

          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">

            {/* New Password */}
            <div>
              <label className="form-label">New Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Lock size={14} className="text-slate-400" />
                </div>
                <input
                  {...register('password')}
                  type={showP ? 'text' : 'password'}
                  placeholder="Min 8 chars · 1 uppercase · 1 number"
                  className="form-input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowP(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showP ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwd.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-all ${i < strength.score ? strength.bar : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[11px] font-semibold ${strength.color}`}>{strength.label}</p>
                </div>
              )}
              {errors.password && (
                <p className="form-error flex items-center gap-1 mt-1">
                  <AlertCircle size={11} />{errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Lock size={14} className="text-slate-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showC ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  className="form-input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowC(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showC ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error flex items-center gap-1 mt-1">
                  <AlertCircle size={11} />{errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center py-2.5 text-sm"
            >
              {mutation.isPending ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
