'use client'
import { Persona, ChatHistory } from '../../types'
import { X, History, Filter, Plus } from 'lucide-react'
import PersonaSelector from './PersonaSelector'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  persona: Persona
  onPersonaChange: (persona: Persona) => void
  state?: string
  onStateChange?: (state: string) => void
  chatHistory?: ChatHistory[]
  onSelectHistory?: (id: string) => void
  onNewChat?: () => void
}

const indianStates = [
  'Punjab',
  'Bihar',
  'Uttar Pradesh',
  'Maharashtra',
  'West Bengal',
  'Tamil Nadu',
  'Karnataka',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
]

export default function Sidebar({
  isOpen,
  onClose,
  persona,
  onPersonaChange,
  state,
  onStateChange,
  chatHistory = [],
  onSelectHistory,
  onNewChat,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto`}
      >
        <div className="p-4">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#004AAD]" />
              <h3 className="font-semibold text-[#004AAD]">Filters</h3>
            </div>

            {/* Persona Selector */}
            <div className="mb-6">
              <PersonaSelector value={persona} onChange={onPersonaChange} />
            </div>

            {/* State Selector */}
            {onStateChange && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-[#004AAD] mb-2 block">
                  Select Your State
                </label>
                <select
                  value={state || ''}
                  onChange={(e) => onStateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004AAD] focus:border-[#004AAD] outline-none text-gray-900"
                >
                  <option value="">All States</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {state && (
                  <p className="text-xs text-gray-600 mt-1">
                    Showing schemes for: <span className="font-semibold">{state}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Chat History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#004AAD]" />
                <h3 className="font-semibold text-[#004AAD]">Recent Chats</h3>
              </div>
              {onNewChat && (
                <button
                  onClick={onNewChat}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4 text-[#004AAD]" />
                </button>
              )}
            </div>
            {chatHistory.length > 0 ? (
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectHistory && onSelectHistory(chat.id)}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-700 mt-1 truncate">{chat.lastMessage}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700">No recent chats</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

