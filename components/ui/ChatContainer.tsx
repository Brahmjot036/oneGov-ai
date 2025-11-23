'use client'
import { Message, ChatMode, Language } from '../../types'
import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TaskWizard from './TaskWizard'
import { Loader2 } from 'lucide-react'

interface ChatContainerProps {
  messages: Message[]
  isLoading?: boolean
  onBookmark?: (messageId: string) => void
  onSaveGuide?: () => void
  onShare?: () => void
  onDownloadPDF?: () => void
  language?: Language
}

export default function ChatContainer({
  messages,
  isLoading,
  onBookmark,
  onSaveGuide,
  onShare,
  onDownloadPDF,
  language = 'en',
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          {message.mode === 'task_wizard' && message.steps ? (
            <div className="mb-4">
              <MessageBubble message={message} onBookmark={onBookmark} language={language} />
              <div className="mt-4">
                <TaskWizard
                  steps={message.steps}
                  onSaveGuide={onSaveGuide}
                  onShare={onShare}
                  onDownloadPDF={onDownloadPDF}
                />
              </div>
            </div>
          ) : (
            <MessageBubble message={message} onBookmark={onBookmark} language={language} />
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-gray-500 text-sm">Thinking...</span>
            </div>
            {/* Typing skeleton */}
            <div className="mt-2 space-y-2">
              <div className="h-2 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

