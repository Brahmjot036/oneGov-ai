'use client'
import { Send, Mic, X } from 'lucide-react'
import { useState, KeyboardEvent } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface InputBarProps {
  onSend: (message: string) => void
  onVoiceMode?: () => void
  voiceMode?: boolean
  disabled?: boolean
  placeholder?: string
  language?: string
}

export default function InputBar({
  onSend,
  onVoiceMode,
  voiceMode = false,
  disabled = false,
  placeholder = 'Ask about government schemes, eligibility, documents...',
  language = 'en',
}: InputBarProps) {
  const [input, setInput] = useState('')
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceTranscription = (text: string) => {
    setInput(text)
    setShowVoiceRecorder(false)
    if (onVoiceMode) {
      onVoiceMode()
    }
  }

  const handleVoiceSend = (text: string) => {
    onSend(text)
    setShowVoiceRecorder(false)
    if (onVoiceMode) {
      onVoiceMode()
    }
  }

  if (voiceMode || showVoiceRecorder) {
    return (
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Voice Mode</span>
          <button
            onClick={() => {
              setShowVoiceRecorder(false)
              if (onVoiceMode) onVoiceMode()
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <VoiceRecorder
          onTranscriptionReady={handleVoiceTranscription}
          onSend={handleVoiceSend}
          onCancel={() => {
            setShowVoiceRecorder(false)
            if (onVoiceMode) onVoiceMode()
          }}
          language={language as any}
        />
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-600 text-black"
            style={{ minHeight: '48px', maxHeight: '120px', color: '#000000' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="p-3 text-gray-600 hover:text-[#004AAD] hover:bg-blue-50 rounded-xl transition-all"
            title="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="p-3 bg-[#004AAD] text-white rounded-xl hover:bg-[#003080] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

