'use client'
import { TaskStep } from '../../types'
import { ChevronLeft, ChevronRight, Download, Share2, Star, FileText } from 'lucide-react'
import { useState } from 'react'

interface TaskWizardProps {
  steps: TaskStep[]
  onSaveGuide?: () => void
  onShare?: () => void
  onDownloadPDF?: () => void
}

export default function TaskWizard({
  steps,
  onSaveGuide,
  onShare,
  onDownloadPDF,
}: TaskWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = steps.length

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLastStep = currentStep === totalSteps - 1
  const step = steps[currentStep]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      {/* Step Tracker */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                idx <= currentStep
                  ? 'bg-[#004AAD] border-[#004AAD] text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            {idx < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  idx < currentStep ? 'bg-[#004AAD]' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
        <p className="text-gray-600 mb-4">{step.description}</p>

        {/* Required Documents */}
        {step.documents && step.documents.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#004AAD]" />
              <h4 className="font-semibold text-gray-700">Required Documents:</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {step.documents.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {!isLastStep ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-[#004AAD] text-white rounded-lg hover:bg-[#003080] transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Completion Panel */}
      {isLastStep && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Your process checklist is ready!
            </h3>
            <p className="text-gray-600 text-sm">
              You can save this guide for future reference or share it with others.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onSaveGuide}
              className="flex items-center gap-2 px-6 py-3 bg-[#FFB300] text-white rounded-lg hover:bg-[#E6A000] transition-all font-semibold"
            >
              <Star className="w-5 h-5" />
              Save as Guide
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              <Share2 className="w-5 h-5" />
              Share via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

