'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function SignupForm({ onSuccess }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    
    // Client-side validation
    if (!name || !name.trim()) {
      setError('Name is required')
      return
    }
    
    if (!email || !email.trim()) {
      setError('Email is required')
      return
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)

    try {
      // Step 1: Create account
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const signupData = await signupRes.json()

      if (!signupRes.ok) {
        throw new Error(signupData.error || 'Signup failed')
      }

      // Step 2: Auto-login after successful signup
      setSuccess(true)
      
      try {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const loginData = await loginRes.json()

        if (!loginRes.ok) {
          // If auto-login fails, show success but ask user to login manually
          setTimeout(() => {
            if (onSuccess) {
              onSuccess()
            } else {
              router.push('/login')
            }
          }, 2000)
          return
        }

        // Store token and user data
        localStorage.setItem('authToken', loginData.token)
        localStorage.setItem('user', JSON.stringify(loginData.user))

        // Redirect to chatbot after a brief success message
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/chat')
          }
        }, 1500)
      } catch (loginErr) {
        // If auto-login fails, still show success and redirect to login page
        console.error('Auto-login failed:', loginErr)
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/login')
          }
        }, 2000)
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#004AAD] mb-2">Account Created!</h3>
        <p className="text-gray-800 mb-4">Logging you in...</p>
        <Loader2 className="w-6 h-6 animate-spin text-[#004AAD] mx-auto" />
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit(e)
      }}
      noValidate
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-semibold text-[#004AAD] mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#004AAD] focus:border-[#004AAD] outline-none transition-all text-gray-900"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#004AAD] mb-2">
          Email
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#004AAD] focus:border-[#004AAD] outline-none transition-all text-gray-900"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#004AAD] mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          data-lpignore="true"
          data-form-type="other"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#004AAD] focus:border-[#004AAD] outline-none transition-all text-gray-900"
          placeholder="••••••••"
        />
        <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-[#004AAD] text-white rounded-xl font-semibold shadow-lg hover:bg-[#003080] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </motion.button>
    </motion.form>
  )
}

