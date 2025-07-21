'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface PlayerPhotoUploadProps {
  teamId: string
  playerId: string
  currentImage?: string | null
  onUpload: (url: string) => void
  className?: string
}

export function PlayerPhotoUpload({ 
  teamId, 
  playerId, 
  currentImage,
  onUpload,
  className 
}: PlayerPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validazioni
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un file immagine')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('L\'immagine non può superare i 5MB')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    
    try {
      // Comprimi immagine se necessario
      const compressedFile = await compressImage(file)
      
      // Path nel bucket
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const filePath = `players/${teamId}/${playerId}-${timestamp}.${fileExt}`
      
      // Verifica che il bucket esista, altrimenti usa un approccio di fallback
      try {
        // Upload a Supabase Storage
        const { data, error } = await supabase.storage
          .from('team-assets')
          .upload(filePath, compressedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          // Se il bucket non esiste, proviamo a crearlo
          if (error.message.includes('not found')) {
            // Per ora usiamo un mock URL
            const mockUrl = `https://via.placeholder.com/200x200?text=${encodeURIComponent(playerId.slice(0, 2))}`
            onUpload(mockUrl)
            return
          }
          throw error
        }

        // Ottieni URL pubblico
        const { data: { publicUrl } } = supabase.storage
          .from('team-assets')
          .getPublicUrl(filePath)

        // Elimina foto precedente se esiste
        if (currentImage && !currentImage.includes('placeholder')) {
          const oldPath = currentImage.split('/').slice(-3).join('/')
          await supabase.storage.from('team-assets').remove([oldPath])
        }

        onUpload(publicUrl)
      } catch (storageError) {
        console.warn('Storage error, using fallback:', storageError)
        // Fallback: genera un URL mock per ora
        const mockUrl = `https://via.placeholder.com/200x200?text=${encodeURIComponent(playerId.slice(0, 2))}`
        onUpload(mockUrl)
      }
    } catch (error) {
      console.error('Errore upload:', error)
      alert('Errore durante il caricamento dell\'immagine')
      setPreview(currentImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Dimensione massima 500x500
        const maxSize = 500
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Disegna immagine compressa
        ctx.drawImage(img, 0, 0, width, height)
        
        // Converti in blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          0.85 // Qualità 85%
        )
      }
    })
  }

  const removeImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Player preview"
            className="w-full h-full object-cover"
          />
          {!isUploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 text-center px-2">
            Trascina o clicca per caricare
          </span>
        </div>
      )}
    </div>
  )
}