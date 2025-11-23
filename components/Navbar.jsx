'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  return (
    <nav className="backdrop-blur-xl bg-white/80 fixed w-full z-50 shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🇮🇳 ONEGOV AI
          </div>
          <div className="text-sm text-gray-600 hidden md:block">All government schemes — explained</div>
        </motion.div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="hidden md:inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-[#004AAD] to-[#003080] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
          </motion.button>
          <button 
            className="md:hidden p-2" 
            onClick={()=>setOpen(!open)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
