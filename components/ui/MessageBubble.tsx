'use client'
import { Message, Language } from '../../types'
import { Copy, Bookmark, BookmarkCheck, ExternalLink, Shield, Volume2, VolumeX } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

// Format markdown-like text for better display
function formatMarkdown(text: string): JSX.Element {
  // Split by lines
  const lines = text.split('\n');
  const formatted: (JSX.Element | string)[] = [];
  let key = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Bold text **text** (standalone heading)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      const content = trimmed.slice(2, -2);
      formatted.push(
        <div key={key++} className="font-bold text-gray-900 text-lg mt-3 mb-2" style={{ color: '#111827' }}>
          {content}
        </div>
      );
    }
    // Section headers ###
    else if (trimmed.startsWith('###')) {
      const content = trimmed.slice(3).trim();
      formatted.push(
        <div key={key++} className="font-bold text-gray-900 text-base mt-4 mb-2" style={{ color: '#111827' }}>
          {content}
        </div>
      );
    }
    // Section headers ##
    else if (trimmed.startsWith('##')) {
      const content = trimmed.slice(2).trim();
      formatted.push(
        <div key={key++} className="font-bold text-gray-900 text-lg mt-4 mb-2">
          {content}
        </div>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      formatted.push(
        <div key={key++} className="ml-4 text-gray-900 mb-1" style={{ color: '#111827' }}>
          <span className="font-semibold mr-2">{trimmed.match(/^\d+\./)?.[0]}</span>
          {content}
        </div>
      );
    }
    // Bullet points
    else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const content = trimmed.slice(1).trim();
      formatted.push(
        <div key={key++} className="ml-4 text-gray-900 mb-1 flex items-start" style={{ color: '#111827' }}>
          <span className="mr-2 mt-1">•</span>
          <span>{content}</span>
        </div>
      );
    }
    // Regular paragraph
    else if (trimmed.length > 0) {
      // Check for markdown links [text](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = linkRegex.exec(trimmed)) !== null) {
        // Add text before link
        if (match.index > lastIndex) {
          parts.push(trimmed.substring(lastIndex, match.index));
        }
        // Add link
        parts.push(
          <a
            key={`link-${key++}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#004AAD] hover:underline font-medium"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      // Add remaining text
      if (lastIndex < trimmed.length) {
        parts.push(trimmed.substring(lastIndex));
      }
      
      // Replace **bold** with <strong>
      const processedParts = parts.map((part, idx) => {
        if (typeof part === 'string') {
          const boldRegex = /\*\*([^*]+)\*\*/g;
          const boldParts: (string | JSX.Element)[] = [];
          let boldLastIndex = 0;
          let boldMatch;
          
          while ((boldMatch = boldRegex.exec(part)) !== null) {
            if (boldMatch.index > boldLastIndex) {
              boldParts.push(part.substring(boldLastIndex, boldMatch.index));
            }
            boldParts.push(
              <strong key={`bold-${key++}`} className="font-semibold text-gray-900">
                {boldMatch[1]}
              </strong>
            );
            boldLastIndex = boldMatch.index + boldMatch[0].length;
          }
          if (boldLastIndex < part.length) {
            boldParts.push(part.substring(boldLastIndex));
          }
          return boldParts.length > 0 ? boldParts : part;
        }
        return part;
      });
      
      formatted.push(
        <div key={key++} className="text-gray-900 mb-2 leading-relaxed" style={{ color: '#111827' }}>
          {processedParts.length > 0 ? processedParts : trimmed}
        </div>
      );
    }
    // Empty line for spacing
    else if (index > 0 && lines[index - 1].trim().length > 0) {
      formatted.push(<div key={key++} className="h-2" />);
    }
  });

  return formatted.length > 0 ? <>{formatted}</> : <span>{text}</span>;
}

interface MessageBubbleProps {
  message: Message
  onBookmark?: (messageId: string) => void
  onCopy?: (content: string) => void
  language?: Language
}

export default function MessageBubble({ message, onBookmark, onCopy, language = 'en' }: MessageBubbleProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
    
    return () => {
      // Cleanup: stop speaking when component unmounts
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Get proper language code for speech synthesis
  const getSpeechLanguage = (lang: Language): string => {
    const langMap: Record<Language, string> = {
      'en': 'en-IN', // Indian English for better pronunciation
      'hi': 'hi-IN', // Hindi (India)
    }
    return langMap[lang] || 'en-IN'
  }

  const handleSpeak = () => {
    if (!synthRef.current) return

    if (isSpeaking) {
      // Stop speaking
      synthRef.current.cancel()
      setIsSpeaking(false)
      return
    }

    // Clean text for speech (remove markdown formatting)
    const cleanText = message.content
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/###?\s*/g, '') // Remove headers
      .replace(/^\d+\.\s*/gm, '') // Remove numbered list markers
      .replace(/^[-•]\s*/gm, '') // Remove bullet points
      .trim()

    if (!cleanText) return

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = getSpeechLanguage(language)
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content)
    } else {
      navigator.clipboard.writeText(message.content)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(message.id)
    }
    setIsBookmarked(!isBookmarked)
  }

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-[#004AAD] to-[#003080] text-white rounded-br-sm'
              : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
          }`}
        >
          {/* Verified Source Badge */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Verified Source</span>
              </div>
              {message.sources.length > 1 && (
                <span className="text-xs text-gray-600">
                  {message.sources.length} sources
                </span>
              )}
            </div>
          )}

          <div 
            className={`whitespace-pre-wrap break-words ${isUser ? 'text-white' : 'text-gray-900'} ${
              !isUser ? 'prose prose-sm max-w-none' : ''
            }`}
            style={!isUser ? {
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              lineHeight: '1.6',
              color: '#111827', // Ensure black text
            } : {}}
          >
            {!isUser ? formatMarkdown(message.content) : message.content}
          </div>

          {/* Metadata for all messages */}
          {(message.sources || message.confidence || message.lastUpdated) && (
            <div className={`mt-3 pt-3 border-t ${isUser ? 'border-white/20' : 'border-gray-200'} space-y-2`}>
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="space-y-1">
                  <p className={`text-xs font-semibold mb-2 ${isUser ? 'text-white/90' : 'text-gray-700'}`}>
                    Sources:
                  </p>
                  {message.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 text-xs hover:underline ${
                        isUser ? 'text-white/90' : 'text-[#004AAD]'
                      }`}
                    >
                      <Shield className={`w-3 h-3 ${isUser ? 'text-white/80' : 'text-green-600'}`} />
                      <span className="font-medium">{source.title}</span>
                      <ExternalLink className="w-3 h-3" />
                      {source.lastVerified && (
                        <span className={`ml-1 text-xs ${isUser ? 'text-white/70' : 'text-gray-600'}`}>
                          • Verified {source.lastVerified}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}

              {/* Confidence & Last Updated */}
              {(message.confidence || message.lastUpdated) && (
                <div className={`flex items-center gap-3 text-xs ${isUser ? 'text-white/80' : 'text-gray-700'}`}>
                  {message.confidence && (
                    <span>Accuracy: {Math.round(message.confidence * 100)}%</span>
                  )}
                  {message.lastUpdated && <span>Updated: {message.lastUpdated}</span>}
                </div>
              )}
            </div>
          )}

          {/* Actions for assistant messages */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  isSpeaking
                    ? 'text-[#004AAD] hover:text-[#003080]'
                    : 'text-gray-800 hover:text-[#004AAD]'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Speak message'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
                {isSpeaking ? 'Stop' : 'Speak'}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-800 hover:text-[#004AAD] transition-colors"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  isBookmarked
                    ? 'text-[#FFB300] hover:text-[#FFB300]'
                    : 'text-gray-800 hover:text-[#FFB300]'
                }`}
                title="Bookmark message"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-3 h-3" />
                ) : (
                  <Bookmark className="w-3 h-3" />
                )}
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
            </div>
          )}
        </div>
        {message.timestamp && (
          <span className={`text-xs mt-1 block ${isUser ? 'text-white/70' : 'text-gray-600'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}

