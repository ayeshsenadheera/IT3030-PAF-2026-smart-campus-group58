import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function OAuth2Redirect() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const handled        = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      toast.error('Login failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    // Store token — AuthContext picks it up on next render via loadUser
    localStorage.setItem('token', token)
    navigate('/dashboard', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <LoadingSpinner fullPage />
}