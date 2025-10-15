'use client'

import { useState, useEffect, useRef } from 'react'
import { trackStoryViewAction } from '@/app/actions/stories'

interface Story {
  id: string
  video_url: string
  caption: string
  patient_name: string | null
  views_count: number
  hospitals: {
    hospital_name: string
  }
}

export function StoryViewer({ 
  stories, 
  initialIndex, 
  onClose 
}: { 
  stories: Story[]
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const videoRef = useRef<HTMLVideoElement>(null)
  const currentStory = stories[currentIndex]

  // Track view
  useEffect(() => { 
    trackStoryViewAction(currentStory.id) 
  }, [currentStory.id])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 z-10 text-white hover:scale-110 transition"
        aria-label="Close"
      >
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white opacity-50 hover:opacity-100 p-6 transition"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      )}

      {/* Next Button */}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white opacity-50 hover:opacity-100 p-6 transition"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      )}

      {/* Content */}
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        {/* Video */}
        <div className="flex items-center justify-center mb-6">
          <video
            ref={videoRef}
            src={currentStory.video_url}
            className="max-h-[500px] max-w-full rounded-xl shadow-2xl border-2 border-white/20"
            autoPlay
            controls
            style={{ background: '#1a1a1a' }}
          />
        </div>

        {/* Story Info */}
        <div className="w-full max-w-xl">
          {/* Patient & Hospital */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {currentStory.patient_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="font-bold text-lg text-white">
                {currentStory.patient_name || 'Patient'}
              </p>
              <p className="text-xs text-rose-300">
                {currentStory.hospitals?.hospital_name || 'Hospital'}
              </p>
            </div>
          </div>

          {/* Caption */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
            <p className="text-white/90 text-sm leading-relaxed">
              {currentStory.caption}
            </p>
          </div>

          {/* Views Only - NO LIKES */}
          <div className="flex items-center gap-2 text-pink-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{currentStory.views_count} views</span>
          </div>
        </div>
      </div>
    </div>
  )
}
