
import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface AchievementCardProps {
  icon: LucideIcon
  title: string
  status: 'earned' | 'locked'
  description?: string
}

export default function AchievementCard({ icon: Icon, title, status, description }: AchievementCardProps) {
  return (
    <div className={`
      rounded-xl p-6 transition-all duration-200 hover:scale-105 cursor-pointer
      ${status === 'earned' 
        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300' 
        : 'bg-gray-600 border-gray-500'
      }
      border
    `}>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${status === 'earned' ? 'bg-yellow-500' : 'bg-gray-500'}
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <h3 className={`font-space-grotesk font-semibold ${status === 'earned' ? 'text-gray-800' : 'text-gray-300'}`}>
          {title}
        </h3>
        
        {status === 'earned' && (
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Earned
          </span>
        )}
        
        {description && (
          <p className={`text-sm ${status === 'earned' ? 'text-gray-600' : 'text-gray-400'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
