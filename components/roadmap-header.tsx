"use client"

import { Users } from "lucide-react"

interface RoadmapHeaderProps {
  className: string
  progress: number
}

export default function RoadmapHeader({ className, progress }: RoadmapHeaderProps) {
  return (
    <div className="w-full bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{className}</h1>
          <p className="text-sm text-slate-500 mt-1">Track your progress through the syllabus</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Progress indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-slate-600">{progress}% Complete</div>
            </div>
            <div className="w-[200px] h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Online users indicator */}
          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
            <Users size={16} />
            <span className="text-sm font-medium">2 online</span>
          </div>
        </div>
      </div>
    </div>
  )
}