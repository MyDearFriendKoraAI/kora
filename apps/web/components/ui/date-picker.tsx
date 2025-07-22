'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleziona data',
  minDate,
  maxDate,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'dd MMMM yyyy', { locale: it }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) =>
            (minDate && date < minDate) || (maxDate && date > maxDate) || false
          }
          initialFocus
          locale={it}
        />
      </PopoverContent>
    </Popover>
  )
}