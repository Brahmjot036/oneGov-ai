'use client'
import { ChatMode, Language, User } from '../../types'
import { Menu, User as UserIcon, LogOut, Bookmark, Settings, Download } from 'lucide-react'
import { useState } from 'react'
import ModeIndicator from './ModeIndicator'
import LanguageSelector from './LanguageSelector'

interface ChatNavbarProps {
  mode: ChatMode
  language: Language
  onLanguageChange: (lang: Language) => void
  user?: User
  onMenuClick: () => void
  onLogout?: () => void
  onDownloadPDF?: () => void
}

export default function ChatNavbar({
  mode,
  language,
  onLanguageChange,
  user,
  onMenuClick,
  onLogout,
  onDownloadPDF,
}: ChatNavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#004AAD] to-[#003080] bg-clip-text text-transparent">
            🇮🇳 ONEGOV AI
          </h1>
          <ModeIndicator mode={mode} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector value={language} onChange={onLanguageChange} />

        {/* Download PDF Button */}
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download Chat as PDF"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#004AAD] to-[#003080] rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.name || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="p-3 border-b border-gray-200">
                  <div className="font-semibold text-gray-800">{user?.name || 'User'}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <Bookmark className="w-4 h-4" />
                    Saved Guides
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout()
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

