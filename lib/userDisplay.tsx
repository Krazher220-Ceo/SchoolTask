import React from 'react'

interface VisualEffects {
  nicknameColor: string | null
  avatarBorder: string | null
  customTitle: string | null
}

interface UserDisplayProps {
  name: string
  visualEffects?: VisualEffects | null
  className?: string
}

export function UserNameDisplay({ name, visualEffects, className = '' }: UserDisplayProps) {
  if (!visualEffects?.nicknameColor) {
    return <span className={className}>{name}</span>
  }

  try {
    const colorData = JSON.parse(visualEffects.nicknameColor)
    
    if (colorData.type === 'gradient') {
      const gradientClass = colorData.gradient === 'fire'
        ? 'from-orange-500 via-red-500 to-orange-500'
        : 'from-purple-500 via-pink-500 to-purple-500'
      
      return (
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientClass} ${className} animate-pulse`}>
          {name}
        </span>
      )
    } else if (colorData.type === 'solid') {
      const colorMap: Record<string, string> = {
        red: 'text-red-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
      }
      return (
        <span className={`${colorMap[colorData.color] || 'text-gray-900'} ${className}`}>
          {name}
        </span>
      )
    }
  } catch (e) {
    // Если не удалось распарсить, возвращаем обычное имя
  }

  return <span className={className}>{name}</span>
}

interface AvatarDisplayProps {
  avatar: string | null
  name: string
  visualEffects?: VisualEffects | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarDisplay({ avatar, name, visualEffects, size = 'md', className = '' }: AvatarDisplayProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const borderSize = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-4',
  }

  const getBorderClass = (borderType: string | null) => {
    if (!borderType) return ''
    
    switch (borderType) {
      case 'pulse':
        return 'animate-pulse border-gray-400'
      case 'crown':
        return 'border-yellow-400'
      case 'glitch':
        return 'border-purple-400'
      default:
        return 'border-gray-300'
    }
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`absolute inset-0 rounded-full ${getBorderClass(visualEffects?.avatarBorder || null)} ${borderSize[size]}`}></div>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

