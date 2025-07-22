'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, SendIcon, UserIcon } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { AbsenceReason } from '@prisma/client'

const formSchema = z.object({
  reason: z.nativeEnum(AbsenceReason),
  justification: z.string().min(3, 'Inserisci almeno 3 caratteri'),
  expectedReturnDate: z.date().optional(),
  notifyParents: z.boolean(),
  applyToFuture: z.boolean(),
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

interface AbsenceJustificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlayers: Player[]
  onJustify: (reason: AbsenceReason, justification: string, data: Partial<FormData>) => void
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

export function AbsenceJustificationModal({
  open,
  onOpenChange,
  selectedPlayers,
  onJustify,
}: AbsenceJustificationModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: 'ILLNESS',
      justification: '',
      notifyParents: true,
      applyToFuture: false,
    },
  })

  const onSubmit = (data: FormData) => {
    onJustify(data.reason, data.justification, data)
    form.reset()
  }

  const selectedReason = form.watch('reason')
  const requiresReturnDate = ['INJURY', 'ILLNESS'].includes(selectedReason)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Giustifica Assenze</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Giocatori selezionati ({selectedPlayers.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                {player.profileImage ? (
                  <img
                    src={player.profileImage}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-sm font-medium">
                  {player.firstName} {player.lastName}
                </span>
                {player.number && (
                  <Badge variant="outline" className="text-xs">
                    #{player.number}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo Assenza</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {value === 'ILLNESS' && '🤒'}
                            {value === 'STUDY' && '📚'}
                            {value === 'FAMILY' && '👨‍👩‍👧‍👦'}
                            {value === 'INJURY' && '🏥'}
                            {value === 'VACATION' && '✈️'}
                            {value === 'DISCIPLINARY' && '⚠️'}
                            {value === 'OTHER' && '❓'}
                            {label}
                          </div>
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
                      placeholder="Descrivi il motivo dell'assenza..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresReturnDate && (
              <FormField
                control={form.control}
                name="expectedReturnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Rientro Prevista</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        minDate={new Date()}
                        placeholder="Seleziona data rientro"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="notifyParents"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Notifica ai genitori (per minorenni)
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Invierà automaticamente una email ai genitori dei giocatori minorenni
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applyToFuture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Applica ai prossimi allenamenti
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Se il giocatore sarà assente anche nei prossimi allenamenti fino al rientro
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={selectedPlayers.length === 0}
                className="flex items-center gap-2"
              >
                <SendIcon className="h-4 w-4" />
                Giustifica Assenze
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}