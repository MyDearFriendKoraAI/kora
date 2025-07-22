'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getSportPositions } from '@/lib/utils/sport-positions'
import { PlayerPhotoUpload } from './player-photo-upload'
import { usePlayerPermissions, useCanAddPlayers } from '@/hooks/use-player-permissions'

const playerSchema = z.object({
  // Step 1: Dati base
  firstName: z.string().min(2, 'Nome deve avere almeno 2 caratteri'),
  lastName: z.string().min(2, 'Cognome deve avere almeno 2 caratteri'),
  birthDate: z.date({
    required_error: 'Data di nascita obbligatoria',
  }).refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 5
  }, 'Il giocatore deve avere almeno 5 anni'),
  number: z.number().min(1, 'Numero maglia deve essere maggiore di 0').max(99, 'Numero maglia massimo 99'),
  
  // Step 2: Info sportive
  role: z.string().min(1, 'Seleziona un ruolo'),
  preferredFoot: z.enum(['destro', 'sinistro', 'ambidestro']).optional(),
  technicalNotes: z.string().optional(),
  
  // Step 3: Contatti
  playerEmail: z.string().email('Email non valida').optional().or(z.literal('')),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
})

type PlayerFormData = z.infer<typeof playerSchema>

interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: PlayerFormData) => void
  teamId: string
  teamSport: string
  existingNumbers?: number[]
}

export function AddPlayerModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  teamId, 
  teamSport,
  existingNumbers = []
}: AddPlayerModalProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  
  const positions = getSportPositions(teamSport)
  const permissions = usePlayerPermissions(teamId)
  const canAddPlayers = useCanAddPlayers(teamId, existingNumbers.length)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      preferredFoot: 'destro',
    }
  })

  const birthDate = watch('birthDate')
  const isMinor = birthDate ? new Date().getFullYear() - birthDate.getFullYear() < 18 : true

  const handleNext = async () => {
    let fieldsToValidate: (keyof PlayerFormData)[] = []
    
    switch (step) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'birthDate', 'number']
        break
      case 2:
        fieldsToValidate = ['role']
        break
    }
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const onSubmit = async (data: PlayerFormData) => {
    // Validazione permessi
    if (!permissions.canCreate) {
      alert('Non hai i permessi per aggiungere giocatori')
      return
    }

    // Validazione limite giocatori
    if (!canAddPlayers) {
      alert(`Hai raggiunto il limite di ${permissions.playerLimit} giocatori per il tuo piano`)
      return
    }

    // Validazione numero maglia unico
    if (existingNumbers.includes(data.number)) {
      alert(`Il numero ${data.number} è già assegnato a un altro giocatore`)
      return
    }

    setIsSubmitting(true)
    try {
      // Mappa i dati per l'API
      const mappedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        number: data.number,
        role: data.role,
        preferredFoot: data.preferredFoot,
        technicalNotes: data.technicalNotes || undefined,
        playerEmail: data.playerEmail || undefined,
        parentName: data.parentName || undefined,
        parentPhone: data.parentPhone || undefined,
        emergencyContact: data.emergencyContact || undefined,
        profileImage: profileImageUrl || undefined,
      }

      await onAdd(mappedData)
      reset()
      setStep(1)
      setProfileImageUrl(null)
    } catch (error) {
      console.error('Errore aggiunta giocatore:', error)
      alert('Errore durante l\'aggiunta del giocatore. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setStep(1)
    setProfileImageUrl(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Giocatore</DialogTitle>
          <DialogDescription>
            Step {step} di 3 - {step === 1 ? 'Dati base' : step === 2 ? 'Info sportive' : 'Contatti'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Dati base */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Upload foto */}
              <div>
                <Label>Foto profilo</Label>
                <PlayerPhotoUpload
                  teamId={teamId}
                  playerId={`new-${Date.now()}`}
                  onUpload={setProfileImageUrl}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Mario"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Cognome *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Rossi"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate">Data di nascita *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd/MM/yyyy") : "Seleziona data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={(date) => setValue('birthDate', date as Date)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.birthDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.birthDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="number">Numero maglia *</Label>
                <Input
                  id="number"
                  type="number"
                  {...register('number', { valueAsNumber: true })}
                  placeholder="10"
                  min="1"
                  max="99"
                />
                {errors.number && (
                  <p className="text-sm text-red-500 mt-1">{errors.number.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Info sportive */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Ruolo/Posizione *</Label>
                <Select 
                  onValueChange={(value) => setValue('role', value)}
                  defaultValue={watch('role')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                )}
              </div>

              {(teamSport === 'calcio' || teamSport === 'calcio a 5') && (
                <div>
                  <Label htmlFor="preferredFoot">Piede preferito</Label>
                  <Select 
                    onValueChange={(value) => setValue('preferredFoot', value as any)}
                    defaultValue={watch('preferredFoot')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="destro">Destro</SelectItem>
                      <SelectItem value="sinistro">Sinistro</SelectItem>
                      <SelectItem value="ambidestro">Ambidestro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="technicalNotes">Note tecniche</Label>
                <Textarea
                  id="technicalNotes"
                  {...register('technicalNotes')}
                  placeholder="Caratteristiche, punti di forza..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Contatti */}
          {step === 3 && (
            <div className="space-y-4">
              {!isMinor && (
                <div>
                  <Label htmlFor="playerEmail">Email giocatore</Label>
                  <Input
                    id="playerEmail"
                    type="email"
                    {...register('playerEmail')}
                    placeholder="mario.rossi@email.com"
                  />
                  {errors.playerEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.playerEmail.message}</p>
                  )}
                </div>
              )}

              {isMinor && (
                <>
                  <div>
                    <Label htmlFor="parentName">Nome genitore</Label>
                    <Input
                      id="parentName"
                      {...register('parentName')}
                      placeholder="Giuseppe Rossi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentPhone">Telefono genitore</Label>
                    <Input
                      id="parentPhone"
                      {...register('parentPhone')}
                      placeholder="+39 333 1234567"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="emergencyContact">Contatto emergenza</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  placeholder="Nome e telefono"
                />
              </div>
            </div>
          )}

          {/* Bottoni navigazione */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? handleClose : handleBack}
              disabled={isSubmitting}
            >
              {step === 1 ? 'Annulla' : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Indietro
                </>
              )}
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Avanti
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  'Aggiungi Giocatore'
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}