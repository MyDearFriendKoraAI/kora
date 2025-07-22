'use client'

import { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { PlusIcon, GripVerticalIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { ExerciseCard } from './exercise-card'

export interface Exercise {
  id: string
  name: string
  duration: number
  description?: string
  materials?: string
}

export interface TrainingSection {
  name: string
  exercises: Exercise[]
}

export interface TrainingPlan {
  warmup: Exercise[]
  main: Exercise[]
  cooldown: Exercise[]
}

interface TrainingPlanBuilderProps {
  value?: TrainingPlan
  onChange: (value: TrainingPlan) => void
  duration: number
}

export function TrainingPlanBuilder({
  value,
  onChange,
  duration,
}: TrainingPlanBuilderProps) {
  const [plan, setPlan] = useState<TrainingPlan>(
    value || {
      warmup: [],
      main: [],
      cooldown: [],
    }
  )
  const [editingExercise, setEditingExercise] = useState<{
    section: keyof TrainingPlan
    exercise?: Exercise
    index?: number
  } | null>(null)

  const sections: { key: keyof TrainingPlan; label: string; color: string }[] = [
    { key: 'warmup', label: 'Riscaldamento', color: 'bg-yellow-100' },
    { key: 'main', label: 'Parte Principale', color: 'bg-blue-100' },
    { key: 'cooldown', label: 'Defaticamento', color: 'bg-green-100' },
  ]

  const getTotalDuration = () => {
    return Object.values(plan).flat().reduce((sum, ex) => sum + ex.duration, 0)
  }

  const addExercise = (section: keyof TrainingPlan) => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: '',
      duration: 10,
    }
    setEditingExercise({ section, exercise: newExercise })
  }

  const saveExercise = (exercise: Exercise) => {
    if (!editingExercise) return

    const { section, index } = editingExercise
    const newPlan = { ...plan }
    
    if (index !== undefined) {
      newPlan[section][index] = exercise
    } else {
      newPlan[section].push(exercise)
    }
    
    setPlan(newPlan)
    onChange(newPlan)
    setEditingExercise(null)
  }

  const removeExercise = (section: keyof TrainingPlan, index: number) => {
    const newPlan = { ...plan }
    newPlan[section].splice(index, 1)
    setPlan(newPlan)
    onChange(newPlan)
  }

  const handleDragEnd = (event: DragEndEvent, section: keyof TrainingPlan) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const exercises = plan[section]
    const oldIndex = exercises.findIndex((ex) => ex.id === active.id)
    const newIndex = exercises.findIndex((ex) => ex.id === over.id)

    const newPlan = { ...plan }
    newPlan[section] = arrayMove(exercises, oldIndex, newIndex)
    setPlan(newPlan)
    onChange(newPlan)
  }

  const totalDuration = getTotalDuration()
  const timeRemaining = duration - totalDuration

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
        <span className="text-sm font-medium">Durata totale pianificata</span>
        <span className={`text-sm font-bold ${timeRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {totalDuration} / {duration} min
          {timeRemaining !== 0 && ` (${timeRemaining > 0 ? '+' : ''}${timeRemaining})`}
        </span>
      </div>

      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <div className={`p-3 rounded-lg ${section.color}`}>
            <h4 className="font-medium">{section.label}</h4>
          </div>
          
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, section.key)}
          >
            <SortableContext
              items={plan[section.key]}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {plan[section.key].map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={() => setEditingExercise({ section: section.key, exercise, index })}
                    onRemove={() => removeExercise(section.key, index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => addExercise(section.key)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Aggiungi esercizio
          </Button>
        </div>
      ))}

      {editingExercise && (
        <ExerciseForm
          exercise={editingExercise.exercise}
          onSave={saveExercise}
          onCancel={() => setEditingExercise(null)}
        />
      )}
    </div>
  )
}

interface ExerciseFormProps {
  exercise?: Exercise
  onSave: (exercise: Exercise) => void
  onCancel: () => void
}

function ExerciseForm({ exercise, onSave, onCancel }: ExerciseFormProps) {
  const [formData, setFormData] = useState<Exercise>(
    exercise || {
      id: `ex-${Date.now()}`,
      name: '',
      duration: 10,
      description: '',
      materials: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          {exercise ? 'Modifica' : 'Nuovo'} Esercizio
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome esercizio</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="es. Possesso palla 4v4"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium">Durata (minuti)</label>
            <Input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descrizione</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrivi l'esercizio..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Materiali</label>
            <Input
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="es. 10 coni, 4 casacche"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">Salva</Button>
          </div>
        </form>
      </div>
    </div>
  )
}