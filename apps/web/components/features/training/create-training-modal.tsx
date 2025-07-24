'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, MapPinIcon, ClockIcon, RepeatIcon } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { TrainingType } from '@prisma/client'
import { TrainingPlanBuilder } from './training-plan-builder'

const formSchema = z.object({
  // Step 1: When
  date: z.date({
    required_error: 'Seleziona una data',
  }),
  startTime: z.string().min(1, 'Seleziona un orario'),
  duration: z.string().min(1, 'Seleziona la durata'),
  recurrence: z.enum(['single', 'weekly']),
  recurrenceWeeks: z.number().optional(),
  
  // Step 2: Where and What
  location: z.string().min(1, 'Inserisci il luogo'),
  customLocation: z.string().optional(),
  type: z.nativeEnum(TrainingType),
  focusAreas: z.array(z.string()),
  plannedPlayers: z.number().optional(),
  
  // Step 3: Plan (optional)
  useTemplate: z.boolean(),
  templateId: z.string().optional(),
  plan: z.any().optional(),
  coachNotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateTrainingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  defaultDate?: Date | null
}

const focusAreaOptions = [
  { value: 'technique', label: 'Tecnica' },
  { value: 'tactics', label: 'Tattica' },
  { value: 'physical', label: 'Fisica' },
  { value: 'possession', label: 'Possesso' },
  { value: 'shooting', label: 'Tiri' },
  { value: 'defense', label: 'Difesa' },
  { value: 'attack', label: 'Attacco' },
  { value: 'setpieces', label: 'Calci piazzati' },
]

const typeOptions: { value: TrainingType; label: string; color: string }[] = [
  { value: 'REGULAR', label: 'Allenamento Regolare', color: 'bg-blue-500' },
  { value: 'MATCH_PREP', label: 'Preparazione Partita', color: 'bg-green-500' },
  { value: 'RECOVERY', label: 'Recupero', color: 'bg-yellow-500' },
  { value: 'TACTICAL', label: 'Tattico', color: 'bg-purple-500' },
  { value: 'TECHNICAL', label: 'Tecnico', color: 'bg-cyan-500' },
  { value: 'PHYSICAL', label: 'Fisico', color: 'bg-red-500' },
]

export function CreateTrainingModal({
  open,
  onOpenChange,
  teamId,
  defaultDate,
}: CreateTrainingModalProps) {
  const [step, setStep] = useState(1)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: defaultDate || new Date(),
      startTime: '17:00',
      duration: '90',
      recurrence: 'single',
      type: 'REGULAR',
      location: 'main',
      focusAreas: [],
      useTemplate: false,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Map location values to readable strings
      const locationMap: Record<string, string> = {
        main: 'Campo Principale',
        secondary: 'Campo Secondario',
        gym: 'Palestra',
        other: data.customLocation || 'Altro'
      };

      // Prepare the training data
      const trainingData = {
        date: data.date.toISOString(),
        startTime: data.startTime,
        duration: parseInt(data.duration),
        type: data.type,
        location: locationMap[data.location] || data.location,
        focusAreas: data.focusAreas,
        plannedPlayers: data.plannedPlayers,
        plan: data.plan,
        coachNotes: data.coachNotes,
      }

      // Create training via API
      const response = await fetch(`/api/teams/${teamId}/trainings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      })

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create training: ${errorData}`)
      }

      const newTraining = await response.json()
      
      // Close modal and reset form
      onOpenChange(false)
      form.reset()
      setStep(1)
      
      // Force reload to show the new training
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      alert('Errore nella creazione dell\'allenamento: ' + (error as Error).message)
    }
  }

  const nextStep = async () => {
    // Valida i campi del passo corrente prima di andare avanti
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['date', 'startTime', 'duration', 'recurrence'];
    } else if (step === 2) {
      fieldsToValidate = ['location', 'type'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pianifica Allenamento</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded-full ${
                s <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
            onKeyDown={(e) => {
              // Previeni submit del form con Enter eccetto nell'ultimo step
              if (e.key === 'Enter' && step < 3) {
                e.preventDefault();
              }
            }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Quando
                </h3>

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
                              // Crea la data nel fuso orario locale per evitare problemi di offset
                              const [year, month, day] = e.target.value.split('-').map(Number);
                              const localDate = new Date(year, month - 1, day);
                              field.onChange(localDate);
                            }
                          }}
                          min={new Date().toISOString().split('T')[0]}
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
                          defaultValue={field.value}
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
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ricorrenza</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Singolo</SelectItem>
                          <SelectItem value="weekly">
                            <div className="flex items-center gap-2">
                              <RepeatIcon className="h-4 w-4" />
                              Settimanale
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('recurrence') === 'weekly' && (
                  <FormField
                    control={form.control}
                    name="recurrenceWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per quante settimane?</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="2"
                            max="52"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Dove e Cosa
                </h3>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Luogo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona il campo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="main">Campo Principale</SelectItem>
                          <SelectItem value="secondary">Campo Secondario</SelectItem>
                          <SelectItem value="gym">Palestra</SelectItem>
                          <SelectItem value="other">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('location') === 'other' && (
                  <FormField
                    control={form.control}
                    name="customLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specifica il luogo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="es. Campo comunale" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo di allenamento</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          {typeOptions.map((type) => (
                            <div
                              key={type.value}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                field.value === type.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => field.onChange(type.value)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                <span className="text-sm font-medium">
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
                  name="focusAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus areas</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          {focusAreaOptions.map((area) => (
                            <div key={area.value} className="flex items-center gap-2">
                              <Checkbox
                                checked={field.value?.includes(area.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), area.value]
                                    : (field.value || []).filter((v) => v !== area.value)
                                  field.onChange(newValue)
                                }}
                              />
                              <label className="text-sm">{area.label}</label>
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
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Piano Allenamento (opzionale)
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Il piano di allenamento è opzionale. Puoi aggiungerlo ora o modificare l'allenamento in seguito.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TrainingPlanBuilder
                          value={field.value}
                          onChange={field.onChange}
                          duration={parseInt(form.watch('duration') || '90')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coachNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note allenatore</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Note aggiuntive per questo allenamento..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between pt-6 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (step === 1) {
                    onOpenChange(false)
                  } else {
                    prevStep()
                  }
                }}
              >
                {step === 1 ? 'Annulla' : 'Indietro'}
              </Button>
              {step < 3 ? (
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }}
                >
                  Avanti
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salva Allenamento
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}