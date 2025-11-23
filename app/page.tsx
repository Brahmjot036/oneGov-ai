'use client'
import Link from 'next/link'
import {
  MessageSquare,
  Users,
  ListChecks,
  Mic,
  Shield,
  Bookmark,
  ArrowRight,
  Check,
  GraduationCap,
  Wheat,
  BookOpen,
  Heart,
  Briefcase,
  Play,
  Globe,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-gradient-to-r from-[#004AAD] to-[#003080] text-white rounded-full text-sm font-semibold">
                  🇮🇳 Made for India
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                <span className="text-black">
                  Government help,
                </span>
                <br />
                <span className="text-black">explained simply.</span>
              </h1>
              <p className="text-xl text-black mb-8 leading-relaxed">
                ONEGOV AI helps you understand government schemes, eligibility, documents, and application processes in English and Hindi — with chat and voice support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#004AAD] to-[#003080] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start using ONEGOV AI
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-black rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  <Play className="w-5 h-5" />
                  Watch 1-minute demo
                </button>
              </div>
            </motion.div>

            {/* Mock Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-[#004AAD] to-[#003080] text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                      How do I update my Aadhaar address?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] text-black">
                      I can help you with that! Here's a step-by-step guide...
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Everything you need
            </h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Powerful features designed to make government services accessible to everyone
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Multilingual Support',
                description: 'Ask questions in English or Hindi with perfect pronunciation',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Users,
                title: 'Personalized for You',
                description: 'Choose your profile (teacher, farmer, student, senior, job seeker) for relevant answers',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: ListChecks,
                title: 'Step-by-Step Guides',
                description: 'Detailed task wizards with documents, eligibility, and application processes',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Mic,
                title: 'Voice Input',
                description: 'Speak your query in any language, get instant transcriptions and answers',
                color: 'from-red-500 to-orange-500',
              },
              {
                icon: Shield,
                title: 'Verified Sources',
                description: 'Every response includes verified source badges and links to official government portals',
                color: 'from-yellow-500 to-amber-500',
              },
              {
                icon: Bookmark,
                title: 'Save & Download',
                description: 'Chat history auto-saves and can be downloaded as PDF',
                color: 'from-indigo-500 to-blue-500',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                  <p className="text-black">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-xl text-black">Get started in three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Sign up and choose your profile',
                description:
                  'Create a free account and select your profile (teacher, farmer, student, senior citizen, job seeker) for personalized answers',
              },
              {
                step: '2',
                title: 'Ask any question',
                description:
                  'Ask about schemes, laws, or services by chat or voice in English or Hindi',
              },
              {
                step: '3',
                title: 'Get detailed answers',
                description:
                  'Receive clear instructions, required documents, verified source badges, and links to official government portals',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#004AAD] to-[#003080] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-black">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Built for real people
            </h2>
            <p className="text-xl text-black">Designed with different citizens in mind</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Teacher',
                description: 'Find training schemes, allowances, and education policies',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Wheat,
                title: 'Farmer',
                description: 'Know about crop insurance, subsidies, and agricultural schemes',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: BookOpen,
                title: 'Student',
                description: 'Scholarships, education loans, and exam-related schemes',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Heart,
                title: 'Senior Citizen',
                description: 'Pension schemes, health benefits, and senior citizen programs',
                color: 'from-red-500 to-orange-500',
              },
              {
                icon: Briefcase,
                title: 'Job Seeker',
                description: 'Skill development programs, employment schemes, and job training',
                color: 'from-indigo-500 to-blue-500',
              },
            ].map((persona, idx) => {
              const Icon = persona.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{persona.title}</h3>
                  <p className="text-black text-sm">{persona.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Shield className="w-16 h-16 text-[#004AAD] mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-black mb-6">Why ONEGOV AI?</h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="space-y-4 text-left mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Verified Sources</h3>
                    <p className="text-black text-sm">
                      All sources link to official government portals with verification badges. Every response includes verified source links.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Always Cross-Check</h3>
                    <p className="text-black text-sm">
                      We recommend verifying details on official government portals. This is a prototype, not an official government product.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Privacy First</h3>
                    <p className="text-black text-sm">
                      We store only what we need to help you better. Your chat history is saved securely and can be downloaded as PDF.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-gray-200">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  AI-powered, human-friendly
                </span>
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  Built for Indian citizens
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Supports English & Hindi
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshots Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-black mb-4">See it in action</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {['Chat Mode', 'Task Wizard', 'Voice Input'].map((title, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-100 rounded-xl p-6 shadow-md"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-black font-semibold">{title}</span>
                </div>
                <h3 className="font-semibold text-black">{title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#004AAD] via-[#003080] to-[#004AAD]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to try ONEGOV AI?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Takes less than 1 minute. No govt login required, just email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#004AAD] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">🇮🇳 ONEGOV AI</h3>
              <p className="text-sm">
                Your AI-powered guide for Indian government schemes, laws, policies and services.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/chat" className="hover:text-white transition-colors">
                    App
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Note</h4>
              <p className="text-sm">
                Prototype created for a state-level hackathon. Not an official government product.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 ONEGOV AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

