import { cn } from '@/lib/utils'

interface PlayerAvatarProps {
  firstName: string
  lastName: string
  profileImage?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function PlayerAvatar({
  firstName,
  lastName,
  profileImage,
  size = 'md',
  className
}: PlayerAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl'
  }

  // Genera colore background basato sul nome
  const getBackgroundColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500'
    ]
    const index = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length
    return colors[index]
  }

  if (profileImage) {
    return (
      <div className={cn('relative overflow-hidden rounded-full', sizeClasses[size], className)}>
        <img
          src={profileImage}
          alt={`${firstName} ${lastName}`}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white',
        sizeClasses[size],
        getBackgroundColor(),
        className
      )}
    >
      {initials}
    </div>
  )
}