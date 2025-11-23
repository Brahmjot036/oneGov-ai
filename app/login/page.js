'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import LoginForm from '../../components/LoginForm'
import SignupForm from '../../components/SignupForm'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-[#004AAD] text-white shadow-lg'
                  : 'text-gray-800 hover:text-[#004AAD]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-[#004AAD] text-white shadow-lg'
                  : 'text-gray-800 hover:text-[#004AAD]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {isLogin ? (
            <LoginForm onSuccess={() => router.push('/chatbot')} />
          ) : (
            <SignupForm onSuccess={() => router.push('/chatbot')} />
          )}
        </div>
      </motion.div>
    </div>
  )
}

