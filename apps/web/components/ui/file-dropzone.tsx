'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string[]
  maxSizeMB?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function FileDropzone({
  onFileSelect,
  acceptedTypes = ['.csv', '.xlsx', '.xls'],
  maxSizeMB = 5,
  multiple = false,
  disabled = false,
  className,
  children
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `File troppo grande. Massimo ${maxSizeMB}MB consentiti.`
    }

    // Check file type
    if (acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isAccepted = acceptedTypes.some(type => 
        type.toLowerCase() === fileExtension
      )
      
      if (!isAccepted) {
        return `Formato file non supportato. Formati accettati: ${acceptedTypes.join(', ')}`
      }
    }

    return null
  }, [acceptedTypes, maxSizeMB])

  const handleFiles = useCallback((files: FileList) => {
    setError(null)
    
    if (files.length === 0) return

    const file = files[0] // Take first file only
    const validationError = validateFile(file)
    
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }, [validateFile, onFileSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) return

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [disabled])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [disabled, handleFiles])

  const handleClick = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <Upload className="h-8 w-8" />
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'csv':
        return <FileText className="h-8 w-8" />
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-8 w-8" />
      default:
        return <Upload className="h-8 w-8" />
    }
  }

  const clearError = () => setError(null)

  if (children) {
    return (
      <div
        className={cn(
          'relative',
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="mt-1 h-auto p-0 text-red-600 hover:text-red-700"
              >
                Nascondi
              </Button>
            </div>
          </div>
        )}
        
        {dragActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-primary font-medium">Rilascia il file qui</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          dragActive && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="text-gray-400">
            {getFileIcon()}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              Trascina un file qui o clicca per selezionare
            </p>
            <p className="text-sm text-gray-500">
              Formati supportati: {acceptedTypes.join(', ')} • Massimo {maxSizeMB}MB
            </p>
          </div>
          
          <Button
            variant="outline"
            disabled={disabled}
            className="pointer-events-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            Seleziona file
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-1 h-auto p-0 text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3 mr-1" />
              Nascondi errore
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}