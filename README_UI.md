# ONEGOV AI - Frontend UI Documentation

## 🎨 Complete UI System Built

This document describes the complete frontend UI system for ONEGOV AI, built with Next.js, TypeScript, Tailwind CSS, and lucide-react.

## 📁 Project Structure

```
my-nextjs-app/
├── app/
│   ├── page.tsx              # Landing page (root route)
│   ├── chat/
│   │   └── page.tsx          # Main chat UI with all modes
│   ├── login/
│   │   └── page.js          # Login/Signup page
│   └── chatbot/
│       └── page.js           # Legacy chatbot (redirects to /chat)
├── components/
│   └── ui/                   # Reusable UI components
│       ├── ChatContainer.tsx
│       ├── ChatNavbar.tsx
│       ├── InputBar.tsx
│       ├── MessageBubble.tsx
│       ├── ModeIndicator.tsx
│       ├── PersonaSelector.tsx
│       ├── Sidebar.tsx
│       ├── TaskWizard.tsx
│       ├── VoiceRecorder.tsx
│       ├── LanguageSelector.tsx
│   └── ...                   # Other components (Navbar, etc.)
└── types/
    └── index.ts              # TypeScript type definitions
```

## 🚀 Features Implemented

### Part 1: Chat UI (`/chat`)

#### ✅ Three Interaction Modes

1. **Chat Mode** (Default)
   - Normal conversational AI messages
   - Bubble-style UI similar to WhatsApp/ChatGPT
   - Auto-scroll to latest message
   - Typing indicators

2. **Task Wizard Mode**
   - Step-by-step process UI
   - Step tracker with progress indicators
   - Document requirements per step
   - Navigation (Previous/Next)
   - Completion panel with save/share options

3. **Voice Mode**
   - Microphone interface
   - Recording animation
   - Transcription preview
   - Edit and send functionality

#### ✅ Layout Components

- **Navbar**: Mode indicator, language selector, user menu
- **Sidebar**: Persona selector, state filter, saved guides, chat history
- **Chat Container**: Message display with mode-specific rendering
- **Input Bar**: Text input with voice mode toggle

#### ✅ UI Features

- Fully responsive (mobile-first)
- Smooth animations (Framer Motion)
- Modern design with Tailwind CSS
- Color scheme: Primary #004AAD, Accent #FFB300
- Verified source badges
- Bookmark functionality
- Copy message feature

### Part 2: Landing Page (`/`)

#### ✅ Sections Implemented

1. **Hero Section**
   - Headline and subheadline
   - Primary and secondary CTAs
   - Mock chat preview

2. **Key Features** (6 cards)
   - Ask in your language
   - Personalized for you
   - Task Wizards
   - Voice-first
   - Verified sources
   - Save guides

3. **How It Works** (3 steps)
   - Sign up and choose profile
   - Ask any question
   - Get simple steps

4. **Personas** (4 cards)
   - Teacher
   - Farmer
   - Student
   - Senior Citizen

5. **Trust & Safety**
   - Verified links
   - Privacy note
   - Trust badges

6. **Screenshots Preview**
   - Chat Mode preview
   - Task Wizard preview
   - Voice Input preview

7. **CTA Section**
   - Login and Sign Up buttons

8. **Footer**
   - Quick links
   - Note about prototype

## 🎯 Component Architecture

### Type Definitions (`types/index.ts`)

```typescript
- ChatMode: 'chat' | 'task_wizard' | 'voice'
- Persona: 'teacher' | 'farmer' | 'student' | 'senior' | 'job_seeker' | 'general'
- Language: 'en' | 'hi'
- Message: Complete message structure with mode, sources, steps
- TaskStep: Step structure for wizard mode
- SavedGuide, ChatHistory, User: Supporting types
```

### UI Components

All components are:
- **TypeScript** typed
- **Reusable** and presentational
- **Responsive** with Tailwind
- **Accessible** with proper ARIA labels

## 🔌 API Integration

The chat UI is ready to integrate with existing backend:

- **POST /api/chat**: Sends message, receives AI response
- **POST /api/auth/verify**: Verifies user session
- **POST /api/auth/login**: User authentication
- **POST /api/auth/signup**: User registration

### Mock Data

The chat page includes mock data for demonstration:
- Sample messages
- Task wizard steps
- Saved guides
- Chat history

## 🎨 Design System

### Colors
- Primary: `#004AAD` (Deep Blue)
- Accent: `#FFB300` (Gov Saffron)
- Success: `#2ECC71`
- Background: `gray-50` / `white`

### Typography
- Headings: Bold, large sizes
- Body: Regular, readable sizes
- UI Text: Small, subtle

### Spacing
- Consistent padding/margins
- Responsive gaps
- Container max-widths

## 📱 Responsive Design

- **Mobile**: Collapsible sidebar, stacked layouts
- **Tablet**: Side-by-side where appropriate
- **Desktop**: Full sidebar, optimized layouts

## 🚦 Routing

- `/` - Landing page
- `/chat` - Main chat UI (requires auth)
- `/login` - Login/Signup page
- `/chatbot` - Legacy route (redirects to `/chat`)

## 🔐 Authentication

- Protected routes check for `authToken` in localStorage
- Redirects to `/login` if not authenticated
- User data stored in localStorage
- Session verification via `/api/auth/verify`

## 🎭 Mode Switching

Modes can be:
1. **Auto-detected** from API response (`response.mode` or `response.steps`)
2. **Manually switched** via UI controls
3. **Voice mode** activated via mic button

## 📝 Next Steps

To fully integrate:

1. **Connect Voice API**: Update `VoiceRecorder` to use `/api/voice`
2. **Save Guides**: Implement backend endpoint for bookmarks
3. **Chat History**: Connect to backend for persistent history
4. **PDF Generation**: Implement PDF download for task wizards
5. **WhatsApp Share**: Add sharing functionality

## 🛠️ Development

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📦 Dependencies

- Next.js 16.0.3
- React 19.2.0
- TypeScript (via tsconfig.json)
- Tailwind CSS 4
- Framer Motion 12.23.24
- lucide-react 0.554.0

## ✅ Acceptance Criteria Met

- ✅ Fully responsive layout
- ✅ Clean, modern styling with Tailwind
- ✅ Mode switching (Chat ↔ Task Wizard ↔ Voice)
- ✅ Reusable, typed components
- ✅ Works with mock data
- ✅ Ready for API integration
- ✅ No breaking changes to backend
- ✅ Landing page at `/`
- ✅ Chat UI at `/chat`

## 🎉 Ready to Use!

The complete UI system is built and ready. All components are functional, typed, and styled. The system works with mock data and can be easily connected to your existing backend APIs.

