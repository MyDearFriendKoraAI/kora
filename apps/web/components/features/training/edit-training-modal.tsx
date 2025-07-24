'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrainingType } from '@prisma/client'
import { useUpdateTraining } from '@/hooks/queries/useTrainings'

const formSchema = z.object({
  date: z.date({
    required_error: 'Seleziona una data',
  }),
  startTime: z.string().min(1, 'Seleziona un orario'),
  duration: z.string().min(1, 'Seleziona la durata'),
  location: z.string().min(1, 'Inserisci il luogo'),
  type: z.nativeEnum(TrainingType),
  plannedPlayers: z.number().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditTrainingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  training: any
  teamId: string
}

const typeOptions: { value: TrainingType; label: string; color: string }[] = [
  { value: 'REGULAR', label: 'Allenamento Regolare', color: 'bg-blue-500' },
  { value: 'MATCH_PREP', label: 'Preparazione Partita', color: 'bg-green-500' },
  { value: 'RECOVERY', label: 'Recupero', color: 'bg-yellow-500' },
  { value: 'TACTICAL', label: 'Tattico', color: 'bg-purple-500' },
  { value: 'TECHNICAL', label: 'Tecnico', color: 'bg-cyan-500' },
  { value: 'PHYSICAL', label: 'Fisico', color: 'bg-red-500' },
]

export function EditTrainingModal({
  open,
  onOpenChange,
  training,
  teamId,
}: EditTrainingModalProps) {
  const updateTraining = useUpdateTraining(teamId)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      startTime: '17:00',
      duration: '90',
      type: 'REGULAR',
      location: 'Campo Principale',
    },
  })

  // Popola il form quando si apre il modal
  useEffect(() => {
    if (open && training) {
      const trainingDate = new Date(training.date)
      
      form.reset({
        date: trainingDate,
        startTime: trainingDate.toTimeString().slice(0, 5),
        duration: training.duration.toString(),
        location: training.location || 'Campo Principale',
        type: training.type,
        plannedPlayers: training.plannedPlayers || undefined,
      })
    }
  }, [open, training, form])

  const onSubmit = async (data: FormData) => {
    try {
      // Combina data e ora
      const [hours, minutes] = data.startTime.split(':').map(Number)
      const combinedDate = new Date(data.date)
      combinedDate.setHours(hours, minutes, 0, 0)

      // Prepara i dati per l'aggiornamento
      const updateData = {
        date: combinedDate.toISOString(),
        startTime: data.startTime,
        duration: parseInt(data.duration),
        type: data.type,
        location: data.location,
        plannedPlayers: data.plannedPlayers,
      }

      updateTraining.mutate({
        trainingId: training.id,
        data: updateData
      })

      onOpenChange(false)
      
      // Ricarica la pagina per mostrare le modifiche
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error updating training:', error)
      alert('Errore nella modifica dell\'allenamento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Allenamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? 
                        new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000)
                          .toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [year, month, day] = e.target.value.split('-').map(Number);
                          const localDate = new Date(year, month - 1, day);
                          field.onChange(localDate);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora inizio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durata</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="60">60 minuti</SelectItem>
                        <SelectItem value="90">90 minuti</SelectItem>
                        <SelectItem value="120">120 minuti</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luogo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Campo Principale">Campo Principale</SelectItem>
                      <SelectItem value="Campo Secondario">Campo Secondario</SelectItem>
                      <SelectItem value="Palestra">Palestra</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di allenamento</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {typeOptions.map((type) => (
                        <div
                          key={type.value}
                          className={`p-2 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                            field.value === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => field.onChange(type.value)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${type.color}`} />
                            <span className="text-xs font-medium">
                              {type.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plannedPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero giocatori previsti</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button 
                type="submit"
                disabled={updateTraining.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateTraining.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}