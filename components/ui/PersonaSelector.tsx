'use client'
import { Persona } from '../../types'
import { GraduationCap, Wheat, BookOpen, Heart, Briefcase, User } from 'lucide-react'

interface PersonaSelectorProps {
  value: Persona
  onChange: (persona: Persona) => void
}

const personas: { code: Persona; label: string; icon: any; description: string }[] = [
  { code: 'teacher', label: 'Teacher', icon: GraduationCap, description: 'Education schemes' },
  { code: 'farmer', label: 'Farmer', icon: Wheat, description: 'Agricultural benefits' },
  { code: 'student', label: 'Student', icon: BookOpen, description: 'Scholarships & policies' },
  { code: 'senior', label: 'Senior Citizen', icon: Heart, description: 'Pension & healthcare' },
  { code: 'job_seeker', label: 'Job Seeker', icon: Briefcase, description: 'Employment schemes' },
  { code: 'general', label: 'General', icon: User, description: 'All schemes' },
]

export default function PersonaSelector({ value, onChange }: PersonaSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">Select Your Profile</label>
      <div className="grid grid-cols-2 gap-2">
        {personas.map((persona) => {
          const Icon = persona.icon
          const isSelected = value === persona.code
          return (
            <button
              key={persona.code}
              onClick={() => onChange(persona.code)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-[#004AAD] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-5 h-5 ${isSelected ? 'text-[#004AAD]' : 'text-gray-600'}`}
                />
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-[#004AAD]' : 'text-gray-800'
                    }`}
                  >
                    {persona.label}
                  </div>
                  <div className="text-xs text-gray-500">{persona.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

