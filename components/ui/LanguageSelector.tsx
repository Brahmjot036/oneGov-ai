'use client'
import { Language } from '../../types'
import { Globe } from 'lucide-react'
import { useState } from 'react'

interface LanguageSelectorProps {
  value: Language
  onChange: (lang: Language) => void
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
]

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-black">
          {languages.find((l) => l.code === value)?.flag}{' '}
          {languages.find((l) => l.code === value)?.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-all ${
                  value === lang.code ? 'bg-blue-50 text-[#004AAD]' : 'text-black'
                }`}
              >
                <span className="text-sm">
                  {lang.flag} {lang.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

