'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { TeamColors } from '@/lib/validations/team';
import { uploadTeamLogoAction } from '@/app/actions/team';

interface LogoUploadProps {
  teamId: string;
  currentLogo?: string;
  teamName: string;
  teamColors?: TeamColors;
  onLogoUpdate: (url: string) => void;
}

export function LogoUpload({ 
  teamId, 
  currentLogo, 
  teamName, 
  teamColors,
  onLogoUpdate 
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File troppo grande. Massimo 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato non supportato. Usa JPG, PNG o WebP');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload file
      const formData = new FormData();
      formData.append('logo', file);
      
      const result = await uploadTeamLogoAction(teamId, formData);

      if (result?.error) {
        toast.error(result.error);
        setPreviewUrl(null);
        return;
      }

      if (result?.success && result.url) {
        toast.success(result.message);
        onLogoUpdate(result.url);
        // Keep preview until page refresh
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'upload');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [teamId, onLogoUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    disabled: isUploading,
  });

  // Generate initials for fallback
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayLogo = previewUrl || currentLogo;

  return (
    <div className="flex items-start space-x-6">
      {/* Current logo display */}
      <div className="flex-shrink-0">
        <div className="relative">
          {displayLogo ? (
            <img
              src={displayLogo}
              alt={`Logo ${teamName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg"
              style={{
                background: teamColors?.primary 
                  ? `linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary || teamColors.primary})`
                  : 'linear-gradient(135deg, #6366F1, #EC4899)'
              }}
            >
              {initials}
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Upload area */}
      <div className="flex-1">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">
              {isDragActive 
                ? 'Rilascia il file qui...' 
                : 'Clicca per caricare o trascina qui'
              }
            </p>
            <p className="text-xs text-gray-600">
              PNG, JPG, WebP fino a 5MB
            </p>
          </div>
        </div>

        {/* Upload tips */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>• Usa un'immagine quadrata per risultati migliori</p>
          <p>• Il logo verrà mostrato nei vari elementi della squadra</p>
          <p>• Formato consigliato: 200x200px o superiore</p>
        </div>

        {/* Remove logo button */}
        {(currentLogo || previewUrl) && (
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onLogoUpdate('');
              toast.success('Logo rimosso');
            }}
            disabled={isUploading}
            className="mt-3 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Rimuovi logo
          </button>
        )}
      </div>
    </div>
  );
}