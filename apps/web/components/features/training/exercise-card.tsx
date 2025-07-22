'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, EditIcon, TrashIcon, ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Exercise } from './training-plan-builder'

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: () => void
  onRemove: () => void
}

export function ExerciseCard({ exercise, onEdit, onRemove }: ExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="h-5 w-5" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">{exercise.name || 'Nuovo esercizio'}</h5>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{exercise.duration} min</span>
            </div>
          </div>
          
          {exercise.description && (
            <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
          )}
          
          {exercise.materials && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Materiali:</span> {exercise.materials}
            </p>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}