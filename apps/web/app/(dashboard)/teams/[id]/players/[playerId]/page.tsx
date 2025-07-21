'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  MoreVertical, 
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  FileText,
  BarChart3,
  Clock,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayerAvatar } from '@/components/features/player/player-avatar'
import { PlayerStatusBadge } from '@/components/features/player/player-status-badge'
import { usePlayer } from '@/hooks/use-players'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const playerId = params.playerId as string

  const { player, loading, error, updatePlayer } = usePlayer(teamId, playerId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-500">Caricamento giocatore...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-900">Errore</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <Button className="mt-4" onClick={() => router.push(`/teams/${teamId}/players`)}>
            Torna ai giocatori
          </Button>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Giocatore non trovato</h2>
          <p className="text-sm text-gray-500 mt-1">Il giocatore richiesto non esiste</p>
          <Button className="mt-4" onClick={() => router.push(`/teams/${teamId}/players`)}>
            Torna ai giocatori
          </Button>
        </div>
      </div>
    )
  }

  const attendancePercentage = Math.round((player.attendanceLastMonth / 10) * 100)

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-start justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/teams/${teamId}/players`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai giocatori
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`?edit=true`)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem>
                Segna infortunato
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Archivia giocatore
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info principali */}
        <div className="flex flex-col sm:flex-row gap-6">
          <PlayerAvatar
            firstName={player.firstName}
            lastName={player.lastName}
            profileImage={player.profileImage}
            size="xl"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {player.firstName} {player.lastName}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-gray-500">
                  {player.number && (
                    <>
                      <span className="font-medium">#{player.number}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{player.role || 'Nessun ruolo'}</span>
                  <span>•</span>
                  <span>{player.age} anni</span>
                </div>
              </div>
              <PlayerStatusBadge status={player.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{player.recentAttendances?.length || 0}</div>
                <div className="text-xs text-gray-500">Allenamenti</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{attendancePercentage}%</div>
                <div className="text-xs text-gray-500">Presenze</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">-</div>
                <div className="text-xs text-gray-500">Goal</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">-</div>
                <div className="text-xs text-gray-500">Assist</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="stats">Statistiche</TabsTrigger>
            <TabsTrigger value="history">Storico</TabsTrigger>
            <TabsTrigger value="documents">Documenti</TabsTrigger>
          </TabsList>

          {/* Tab Panoramica */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Info personali */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Informazioni personali</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Data di nascita</dt>
                    <dd className="font-medium">
                      {format(new Date(player.birthDate), 'dd MMMM yyyy', { locale: it })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Età</dt>
                    <dd className="font-medium">{player.age} anni</dd>
                  </div>
                  {player.height && (
                    <div>
                      <dt className="text-sm text-gray-500">Altezza</dt>
                      <dd className="font-medium">{player.height} cm</dd>
                    </div>
                  )}
                  {player.weight && (
                    <div>
                      <dt className="text-sm text-gray-500">Peso</dt>
                      <dd className="font-medium">{player.weight} kg</dd>
                    </div>
                  )}
                  {player.preferredFoot && (
                    <div>
                      <dt className="text-sm text-gray-500">Piede preferito</dt>
                      <dd className="font-medium capitalize">
                        {player.preferredFoot === 'both' ? 'Ambidestro' : 
                         player.preferredFoot === 'left' ? 'Sinistro' : 'Destro'}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">In squadra dal</dt>
                    <dd className="font-medium">
                      {format(new Date(player.createdAt), 'dd MMMM yyyy', { locale: it })}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Contatti */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contatti</h3>
                <div className="space-y-3">
                  {player.playerEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Email</div>
                        <div className="text-gray-500">{player.playerEmail}</div>
                      </div>
                    </div>
                  )}
                  {player.parentName && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">{player.parentName}</div>
                        {player.parentPhone && (
                          <div className="text-gray-500">{player.parentPhone}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {player.emergencyContact && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Emergenza</div>
                        <div className="text-gray-500">{player.emergencyContact}</div>
                      </div>
                    </div>
                  )}
                  {!player.playerEmail && !player.parentName && !player.emergencyContact && (
                    <p className="text-sm text-gray-500">Nessun contatto disponibile</p>
                  )}
                </div>
              </Card>

              {/* Note tecniche */}
              {player.technicalNotes && (
                <Card className="p-6 lg:col-span-3">
                  <h3 className="font-semibold text-gray-900 mb-4">Note tecniche</h3>
                  <p className="text-sm text-gray-600">{player.technicalNotes}</p>
                </Card>
              )}

              {/* Timeline presenze */}
              <Card className="p-6 lg:col-span-3">
                <h3 className="font-semibold text-gray-900 mb-4">Presenze recenti</h3>
                {player.recentAttendances && player.recentAttendances.length > 0 ? (
                  <div className="space-y-2">
                    {player.recentAttendances.map((attendance) => (
                      <div key={attendance.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium">
                              {attendance.trainingTitle}
                            </span>
                            <div className="text-xs text-gray-500">
                              {format(new Date(attendance.date), 'EEEE dd MMMM', { locale: it })}
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${
                          attendance.presente ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {attendance.presente ? 'Presente' : 'Assente'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nessuna presenza registrata</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Tab Statistiche */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistiche stagione</h3>
              <p className="text-sm text-gray-500">Le statistiche dettagliate saranno disponibili a breve</p>
            </Card>
          </TabsContent>

          {/* Tab Storico */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Storico infortuni</h3>
              {player.status === 'injured' && player.injuryReturnDate ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Infortunio attuale</div>
                      <div className="text-sm text-gray-500">
                        Rientro previsto: {format(new Date(player.injuryReturnDate), 'dd MMMM yyyy', { locale: it })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nessun infortunio registrato</p>
              )}
            </Card>
          </TabsContent>

          {/* Tab Documenti */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Documenti</h3>
              <p className="text-sm text-gray-500">La gestione documenti sarà disponibile a breve</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}