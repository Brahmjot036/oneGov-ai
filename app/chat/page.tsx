'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Message, ChatMode, Persona, Language, ChatHistory, User } from '../../types'
import ChatNavbar from '../../components/ui/ChatNavbar'
import Sidebar from '../../components/ui/Sidebar'
import ChatContainer from '../../components/ui/ChatContainer'
import InputBar from '../../components/ui/InputBar'
import { Loader2 } from 'lucide-react'

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'How do I update my Aadhaar address?',
    timestamp: new Date(),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'I can help you update your Aadhaar address. Here is a step-by-step guide:',
    mode: 'task_wizard',
    steps: [
      {
        id: 'step1',
        title: 'Create Login',
        description:
          'Visit uidai.gov.in and log in with your Aadhaar number. If you don\'t have an account, click "Create Login" and follow the registration process.',
        documents: ['Aadhaar number', 'Mobile number linked to Aadhaar'],
      },
      {
        id: 'step2',
        title: 'Upload Documents',
        description:
          'Upload proof of address like electricity bill, rent agreement, bank statement, or any government-issued document with your new address.',
        documents: [
          'Electricity bill (not older than 3 months)',
          'Rent agreement (if applicable)',
          'Bank statement',
        ],
      },
      {
        id: 'step3',
        title: 'Track Status',
        description:
          'After submission, you will receive an Update Request Number (URN). Use this URN to track the status of your address update on the portal.',
        documents: ['Update Request Number (URN)'],
      },
    ],
    sources: [
      {
        title: 'UIDAI Official Portal',
        url: 'https://uidai.gov.in',
        lastVerified: '2024-11-01',
        verified: true,
      },
    ],
    confidence: 0.95,
    lastUpdated: '2024-11-01',
    timestamp: new Date(),
  },
]

const mockChatHistory: ChatHistory[] = [
  {
    id: 'chat1',
    title: 'Aadhaar Update Query',
    lastMessage: 'How do I update my Aadhaar address?',
    timestamp: new Date('2024-10-20'),
  },
]

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [mode, setMode] = useState<ChatMode>('chat')
  const [persona, setPersona] = useState<Persona>('general')
  const [language, setLanguage] = useState<Language>('en')
  const [state, setState] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const savedSessionRef = useRef<string | null>(null)
  const currentChatSessionIdRef = useRef<string | null>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()
        if (!data.valid) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        const userData = data.user
        setUser(userData)
        
        // Load user preferences from localStorage or set defaults
        const savedPersona = localStorage.getItem('userPersona') as Persona
        const savedState = localStorage.getItem('userState')
        const savedLanguage = localStorage.getItem('userLanguage') as Language
        if (savedPersona) setPersona(savedPersona)
        if (savedState) setState(savedState)
        if (savedLanguage) setLanguage(savedLanguage)
        
        // Load chat history
        if (userData?.id) {
          try {
            const historyRes = await fetch(`/api/chat/history?userId=${userData.id}`)
            const historyData = await historyRes.json()
            if (historyData.history) {
              setChatHistory(historyData.history)
            }
          } catch (error) {
            console.error('Error loading chat history:', error)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#004AAD] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setVoiceMode(false)

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          language,
          persona,
          state: state || undefined,
          userId: user?.id || 'default',
        }),
      })

      const data = await response.json()

      if (data.reply) {
        // Determine mode from response
        let detectedMode: ChatMode = 'chat'
        let steps = undefined

        // Check if response indicates task wizard mode
        if (data.mode === 'task_wizard' || data.steps || content.toLowerCase().includes('step')) {
          detectedMode = 'task_wizard'
          steps = data.steps || [
            {
              id: 'step1',
              title: 'Step 1',
              description: data.reply.split('\n')[0] || data.reply,
            },
          ]
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          mode: detectedMode,
          steps,
          sources: data.sources || [],
          confidence: data.confidence || 0.9,
          lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0],
          timestamp: new Date(),
        }

        setMessages((prev) => {
          const updatedMessages = [...prev, assistantMessage]
          // Auto-save chat history after assistant responds
          autoSaveChatHistory(updatedMessages)
          return updatedMessages
        })
        setMode(detectedMode)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save chat history function
  const autoSaveChatHistory = async (messagesToSave: Message[]) => {
    // Only save if we have at least a user message and assistant response
    if (!user?.id || messagesToSave.length < 2) return

    // Get the first user message as title
    const firstUserMessage = messagesToSave.find(m => m.role === 'user')
    if (!firstUserMessage) return

    // Create a unique session identifier based on the first message timestamp
    // This ensures we only save once per chat session
    const sessionKey = `chat-${user.id}-${firstUserMessage.timestamp?.getTime() || Date.now()}`

    // Check if this conversation was already saved
    if (currentChatSessionIdRef.current === sessionKey) {
      return // Already saved for this chat session, skip
    }

    try {
      const title = firstUserMessage.content.substring(0, 50) || 'Chat History'

      const res = await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          messages: messagesToSave.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          // Mark this chat session as saved using the session ID from backend
          currentChatSessionIdRef.current = sessionKey
          savedSessionRef.current = sessionKey
          
          // Reload chat history silently
          try {
            const historyRes = await fetch(`/api/chat/history?userId=${user.id}`)
            const historyData = await historyRes.json()
            if (historyData.history) {
              setChatHistory(historyData.history)
            }
          } catch (error) {
            // Silent fail for history reload
            console.error('Error reloading chat history:', error)
          }
        }
      }
    } catch (error) {
      // Silent fail for auto-save - don't interrupt user experience
      console.error('Error auto-saving chat history:', error)
    }
  }

  const handleBookmark = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      console.log('Bookmarking message:', messageId)
      // In real app, save to backend
    }
  }

  const handleSaveGuide = () => {
    console.log('Saving guide...')
    // In real app, save to backend
  }

  const handleShare = () => {
    console.log('Sharing guide...')
    // In real app, implement WhatsApp sharing
  }

  const handleDownloadPDF = async () => {
    if (messages.length === 0) return
    
    try {
      const res = await fetch('/api/chat/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          title: 'Chat History',
        }),
      })
      const data = await res.json()
      
      // Create a blob and download
      const blob = new Blob([data.html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.title || 'chat-history'}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // For actual PDF, we'd need a library like jsPDF or html2pdf
      // For now, we're providing HTML that can be printed to PDF
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download chat history')
    }
  }

  const handlePersonaChange = (newPersona: Persona) => {
    setPersona(newPersona)
    localStorage.setItem('userPersona', newPersona)
    // Update user profile in backend
    updateUserProfile({ persona: newPersona })
  }

  const handleStateChange = (newState: string) => {
    setState(newState)
    localStorage.setItem('userState', newState)
    // Update user profile in backend
    updateUserProfile({ state: newState })
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('userLanguage', newLanguage)
  }

  const updateUserProfile = async (updates: { persona?: Persona; state?: string }) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // In real app, call API to update user profile
      // await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(updates),
      // })
      
      console.log('Profile updated:', updates)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userPersona')
    localStorage.removeItem('userState')
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        persona={persona}
        onPersonaChange={handlePersonaChange}
        state={state}
        onStateChange={handleStateChange}
        chatHistory={chatHistory}
        onSelectHistory={async (id) => {
          try {
            const res = await fetch('/api/chat/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: id }),
            })
            const data = await res.json()
            if (data.messages) {
              setMessages(data.messages.map((msg: any, idx: number) => ({
                id: `${id}-${idx}`,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
              })))
            }
          } catch (error) {
            console.error('Error loading chat history:', error)
          }
        }}
        onNewChat={() => {
          setMessages([])
          setMode('chat')
          savedSessionRef.current = null // Reset saved session when starting new chat
          currentChatSessionIdRef.current = null // Reset current chat session
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <ChatNavbar
          mode={mode}
          language={language}
          onLanguageChange={handleLanguageChange}
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          onDownloadPDF={handleDownloadPDF}
        />

        {/* Chat Container */}
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onBookmark={handleBookmark}
          onSaveGuide={handleSaveGuide}
          onShare={handleShare}
          onDownloadPDF={handleDownloadPDF}
          language={language}
        />

        {/* Input Bar */}
        <InputBar
          onSend={handleSend}
          onVoiceMode={() => {
            setVoiceMode(!voiceMode)
            if (!voiceMode) {
              setMode('voice')
            }
          }}
          voiceMode={voiceMode}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

