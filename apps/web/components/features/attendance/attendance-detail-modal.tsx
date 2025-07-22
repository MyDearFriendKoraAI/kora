'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  UserIcon,
  ClockIcon,
  MapPinIcon,
  FileTextIcon,
  CalendarIcon,
  SaveIcon,
  CheckIcon,
  XIcon,
  HeartPulseIcon,
  LogOutIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/Card'
import { AttendanceStatus, AbsenceReason } from '@prisma/client'

const formSchema = z.object({
  status: z.nativeEnum(AttendanceStatus),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  absenceReason: z.nativeEnum(AbsenceReason).optional(),
  justification: z.string().optional(),
  note: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Player {
  id: string
  firstName: string
  lastName: string
  number?: number
  role?: string
  profileImage?: string
}

interface AttendanceRecord {
  id: string | null
  playerId: string
  status: AttendanceStatus
  arrivalTime?: string
  departureTime?: string
  absenceReason?: AbsenceReason
  isJustified: boolean
  justification?: string
  note?: string
  player: Player
}

interface AttendanceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: AttendanceRecord | null
  onUpdate: (attendance: AttendanceRecord) => void
}

const statusConfig = {
  PRESENT: { icon: CheckIcon, label: 'Presente', color: 'text-green-700' },
  ABSENT: { icon: XIcon, label: 'Assente', color: 'text-red-700' },
  LATE: { icon: ClockIcon, label: 'In Ritardo', color: 'text-orange-700' },
  INJURED: { icon: HeartPulseIcon, label: 'Infortunato', color: 'text-yellow-700' },
  EARLY_DEPARTURE: { icon: LogOutIcon, label: 'Uscita Anticipata', color: 'text-purple-700' },
}

const reasonLabels: Record<AbsenceReason, string> = {
  ILLNESS: 'Malattia',
  STUDY: 'Studio/Scuola',
  FAMILY: 'Motivi Familiari',
  INJURY: 'Infortunio',
  VACATION: 'Vacanza',
  DISCIPLINARY: 'Disciplinare',
  OTHER: 'Altro',
}

export function AttendanceDetailModal({
  open,
  onOpenChange,
  attendance,
  onUpdate,
}: AttendanceDetailModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (attendance && open) {
      form.reset({
        status: attendance.status,
        arrivalTime: attendance.arrivalTime ? new Date(attendance.arrivalTime).toTimeString().slice(0, 5) : '',
        departureTime: attendance.departureTime ? new Date(attendance.departureTime).toTimeString().slice(0, 5) : '',
        absenceReason: attendance.absenceReason,
        justification: attendance.justification || '',
        note: attendance.note || '',
      })
    }
  }, [attendance, open, form])

  const onSubmit = (data: FormData) => {
    if (!attendance) return

    const updatedAttendance: AttendanceRecord = {
      ...attendance,
      status: data.status,
      arrivalTime: data.arrivalTime 
        ? new Date(`${new Date().toDateString()} ${data.arrivalTime}`).toISOString() 
        : undefined,
      departureTime: data.departureTime 
        ? new Date(`${new Date().toDateString()} ${data.departureTime}`).toISOString() 
        : undefined,
      absenceReason: data.absenceReason,
      justification: data.justification,
      note: data.note,
      isJustified: !!(data.absenceReason && data.justification),
    }

    onUpdate(updatedAttendance)
    onOpenChange(false)
  }

  if (!attendance) return null

  const { player } = attendance
  const currentStatus = form.watch('status')
  const StatusIcon = statusConfig[currentStatus]?.icon || UserIcon

  const requiresArrival = ['LATE'].includes(currentStatus)
  const requiresDeparture = ['EARLY_DEPARTURE'].includes(currentStatus)
  const requiresReason = ['ABSENT', 'INJURED'].includes(currentStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {player.profileImage ? (
                <img
                  src={player.profileImage}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <span className="font-bold">
                  {player.firstName} {player.lastName}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {player.number && (
                    <Badge variant="outline" className="text-xs">
                      #{player.number}
                    </Badge>
                  )}
                  {player.role && (
                    <Badge variant="secondary" className="text-xs">
                      {player.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      Stato Presenza
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, config]) => {
                          const Icon = config.icon
                          return (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Orari */}
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Orari
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="arrivalTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Orario Arrivo {requiresArrival && '*'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={!requiresArrival}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Orario Uscita {requiresDeparture && '*'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={!requiresDeparture}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Giustificazione */}
            {requiresReason && (
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Giustificazione
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="absenceReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(reasonLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrizione</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descrivi il motivo..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            )}

            {/* Note */}
            <Card className="p-4">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4" />
                      Note Aggiuntive
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Note libere per questo giocatore..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <SaveIcon className="h-4 w-4" />
                Salva Modifiche
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}