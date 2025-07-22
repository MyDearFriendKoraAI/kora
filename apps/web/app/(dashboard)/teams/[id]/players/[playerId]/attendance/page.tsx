'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AttendanceHistory } from '@/components/features/attendance/attendance-history'

export default function PlayerAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const playerId = params.playerId as string

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/teams/${teamId}/players`)}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Torna ai Giocatori
        </Button>
      </div>

      <AttendanceHistory
        playerId={playerId}
      />
    </div>
  )
}