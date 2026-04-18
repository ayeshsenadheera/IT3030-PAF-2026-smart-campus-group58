import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={36} className="text-primary-400" />
        </div>
        <h1 className="text-6xl font-bold text-slate-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Page not found</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary">
          <Home size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}