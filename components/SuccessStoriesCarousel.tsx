'use client'

import { useState } from 'react'
import { StoryViewer } from './StoryViewer'

interface Story {
  id: string
  hospital_id: string
  video_url: string
  thumbnail_url: string | null
  caption: string
  patient_name: string | null
  likes_count: number
  views_count: number
  created_at: string
  hospitals: {
    hospital_name: string
  }
}

export function SuccessStoriesCarousel({ stories }: { stories: Story[] }) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)

  if (!stories || stories.length === 0) return null

  return (
    <>
      <div className="mb-4 px-2">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStoryIndex(index)}
              className="flex flex-col items-center group"
              style={{ minWidth: 86 }}
            >
              {/* Patient name above */}
              <span className="text-rose-500 font-bold text-xs mb-2 w-20 truncate text-center">
                {story.patient_name || 'Patient'}
              </span>

              {/* Story Circle with 3D Spinning Heart */}
              <div className="relative w-20 h-20 mb-1">
                {/* Gradient Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-red-400 p-[3px] group-hover:scale-105 transition-transform" />
                
                {/* White Inner Ring */}
                <div className="relative w-full h-full rounded-full bg-white p-[3px]">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center overflow-hidden perspective-500">
                    {/* 3D Rotating Pink Heart */}
                    <svg 
                      className="w-10 h-10 text-pink-500 animate-spin-3d" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3))' }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hospital name below */}
              <span className="text-[10px] text-gray-500 max-w-[80px] truncate text-center block mt-1">
                {story.hospitals?.hospital_name || '-'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {/* Custom CSS for 3D rotation */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        }
        .scrollbar-hide { 
          scrollbar-width: none; 
          -ms-overflow-style: none; 
        }
        .perspective-500 {
          perspective: 500px;
        }
        @keyframes spin-3d {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: rotateY(180deg) rotateZ(180deg) scale(1.1);
          }
          100% {
            transform: rotateY(360deg) rotateZ(360deg);
          }
        }
        .animate-spin-3d {
          animation: spin-3d 4s ease-in-out infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </>
  )
}
