'use client';

import { useState, useRef } from 'react';
import { Team } from '@/lib/supabase/team';
import { uploadTeamLogoAction } from '@/app/actions/team-settings';

interface LogoManagerProps {
  team: Team;
  onUpdate: (data: Partial<Team>) => void;
}

export function LogoManager({ team, onUpdate }: LogoManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(team.logo);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Formato non supportato. Usa PNG, JPG o SVG.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert('File troppo grande. Massimo 2MB.');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const result = await uploadTeamLogoAction(team.id, formData);
      
      if (result.success) {
        onUpdate({ logo: result.url });
        setPreviewUrl(result.url);
      } else {
        alert(result.error || 'Errore durante l\'upload');
        setPreviewUrl(team.logo);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Errore durante l\'upload del logo');
      setPreviewUrl(team.logo);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(preview);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeLogo = async () => {
    setIsUploading(true);
    try {
      // In a real implementation, you'd call a delete action
      onUpdate({ logo: null });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Logo Display */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Logo ${team.name}`}
              className="w-24 h-24 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div 
              className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold text-2xl border border-gray-200"
              style={{
                background: team.colors?.primary 
                  ? `linear-gradient(135deg, ${team.colors.primary}, ${team.colors.secondary || team.colors.primary})`
                  : 'linear-gradient(135deg, #6366F1, #EC4899)'
              }}
            >
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">Logo Attuale</h4>
          <p className="text-sm text-gray-600 mb-4">
            {previewUrl ? 'Logo personalizzato caricato' : 'Usando logo generato automaticamente'}
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Caricando...' : previewUrl ? 'Cambia Logo' : 'Carica Logo'}
            </button>
            
            {previewUrl && (
              <button
                onClick={removeLogo}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900">Carica nuovo logo</h4>
            <p className="text-sm text-gray-600 mt-1">
              Trascina un file qui o clicca per selezionare
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Formati supportati: PNG, JPG, SVG</p>
            <p>Dimensione massima: 2MB</p>
            <p>Dimensioni consigliate: 512x512px</p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            Seleziona File
          </button>
        </div>
      </div>

      {/* Preview Sizes */}
      {previewUrl && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Preview Dimensioni</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { size: 'w-8 h-8', label: 'Icona (32px)' },
              { size: 'w-12 h-12', label: 'Piccolo (48px)' },
              { size: 'w-16 h-16', label: 'Medio (64px)' },
              { size: 'w-24 h-24', label: 'Grande (96px)' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <img
                  src={previewUrl}
                  alt={`Preview ${item.label}`}
                  className={`${item.size} rounded object-cover border border-gray-200 mx-auto`}
                />
                <p className="text-xs text-gray-600 mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}