'use client'
import { ChatMode } from '../../types'
import { MessageSquare, ListChecks, Mic } from 'lucide-react'
import { motion } from 'framer-motion'

interface ModeIndicatorProps {
  mode: ChatMode
}

const modeConfig = {
  chat: {
    icon: MessageSquare,
    label: 'Chat Mode',
    color: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
  },
  task_wizard: {
    icon: ListChecks,
    label: 'Guided Process Mode',
    color: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
  },
  voice: {
    icon: Mic,
    label: 'Listening...',
    color: 'bg-red-100 text-red-700',
    iconColor: 'text-red-600',
  },
}

export default function ModeIndicator({ mode }: ModeIndicatorProps) {
  const config = modeConfig[mode]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.color} border border-current/20`}
    >
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className="text-sm font-semibold">{config.label}</span>
    </motion.div>
  )
}

