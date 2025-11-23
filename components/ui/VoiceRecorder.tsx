'use client'
import { Mic, MicOff, Send, RotateCcw } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Language } from '../../types'

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface VoiceRecorderProps {
  onTranscriptionReady?: (text: string) => void
  onSend?: (text: string) => void
  onCancel?: () => void
  language?: Language
}

export default function VoiceRecorder({
  onTranscriptionReady,
  onSend,
  onCancel,
  language = 'en',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)
  const animationRef = useRef<number>()
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Get proper language code for speech recognition
  const getRecognitionLanguage = (lang: Language): string => {
    const langMap: Record<Language, string> = {
      'en': 'en-IN', // Indian English
      'hi': 'hi-IN', // Hindi (India)
    }
    return langMap[lang] || 'en-IN'
  }

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      // Stop any active recognition when component unmounts
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors when stopping on unmount
        }
        recognitionRef.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Simulate recording animation
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)
      }
      animate()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording])

  const startRecording = () => {
    if (typeof window === 'undefined') return

    // Stop any existing recognition before starting a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore errors when stopping existing recognition
      }
      recognitionRef.current = null
    }

    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      // Fallback: use mock transcription if browser doesn't support it
      setIsRecording(true)
      setShowTranscription(false)
      setTranscription('')
      setTimeout(() => {
        setIsRecording(false)
        const mockTranscription = 'How do I update my Aadhaar address?'
        setTranscription(mockTranscription)
        setShowTranscription(true)
        if (onTranscriptionReady) {
          onTranscriptionReady(mockTranscription)
        }
      }, 2000)
      return
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = getRecognitionLanguage(language)

    let currentTranscript = ''

    recognition.onstart = () => {
      setIsRecording(true)
      setShowTranscription(false)
      setTranscription('')
      currentTranscript = ''
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      currentTranscript = finalTranscript || interimTranscript
      setTranscription(currentTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Don't treat "aborted" as an error - it's intentional when user stops
      if (event.error === 'aborted') {
        setIsRecording(false)
        return
      }
      
      // Only log/show actual errors
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
      }
      
      setIsRecording(false)
      
      // Only show alerts for specific errors
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.')
      } else if (event.error === 'network') {
        alert('Network error. Please check your connection.')
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      const finalText = transcription.trim() || currentTranscript.trim()
      if (finalText) {
        setTranscription(finalText)
        setShowTranscription(true)
        if (onTranscriptionReady) {
          onTranscriptionReady(finalText)
        }
      }
    }

    recognitionRef.current = recognition
    
    try {
      recognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setIsRecording(false)
      alert('Failed to start voice recording. Please try again.')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  const handleSend = () => {
    if (transcription.trim() && onSend) {
      onSend(transcription)
      setTranscription('')
      setShowTranscription(false)
    }
  }

  const handleRetry = () => {
    setTranscription('')
    setShowTranscription(false)
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="w-full">
      {/* Transcription Preview */}
      {showTranscription && transcription && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-gray-700 mb-2">Transcription:</p>
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent outline-none text-black"
            style={{ color: '#000000' }}
            rows={3}
            placeholder="Edit your transcription..."
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-[#004AAD] text-white rounded-lg hover:bg-[#003080] transition-all"
            >
              <Send className="w-4 h-4" />
              Use this input
            </button>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Retry recording
            </button>
          </div>
        </div>
      )}

      {/* Recording Interface */}
      <div className="flex items-center justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-[#004AAD] hover:bg-[#003080]'
          } text-white shadow-lg`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-8 h-8" />
              {/* Pulsing animation */}
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            </>
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>
      {isRecording && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 text-red-600 font-semibold">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            Recording...
          </div>
          <p className="text-sm text-gray-500 mt-1">Click again to stop</p>
        </div>
      )}
    </div>
  )
}

