'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

interface CSVMapperProps {
  headers: string[]
  previewData: string[][]
  onMappingChange: (mapping: Record<string, string>) => void
  onContinue: () => void
  onBack: () => void
}

// Mapping delle colonne standard
const STANDARD_FIELDS = {
  firstName: { 
    label: 'Nome', 
    required: true,
    keywords: ['nome', 'name', 'first', 'firstname', 'first_name']
  },
  lastName: { 
    label: 'Cognome', 
    required: true,
    keywords: ['cognome', 'surname', 'last', 'lastname', 'last_name']
  },
  birthDate: { 
    label: 'Data di nascita', 
    required: true,
    keywords: ['data', 'nascita', 'birth', 'birthdate', 'birth_date', 'birthday', 'date']
  },
  number: { 
    label: 'Numero maglia', 
    required: false,
    keywords: ['numero', 'number', 'maglia', 'shirt', 'jersey']
  },
  role: { 
    label: 'Ruolo', 
    required: false,
    keywords: ['ruolo', 'role', 'position', 'posizione']
  },
  height: { 
    label: 'Altezza', 
    required: false,
    keywords: ['altezza', 'height', 'h']
  },
  weight: { 
    label: 'Peso', 
    required: false,
    keywords: ['peso', 'weight', 'w']
  },
  playerEmail: { 
    label: 'Email', 
    required: false,
    keywords: ['email', 'mail', 'e-mail']
  },
  parent1Name: { 
    label: 'Nome genitore', 
    required: false,
    keywords: ['genitore', 'parent', 'padre', 'madre', 'tutore', 'guardian']
  },
  parent1Phone: { 
    label: 'Telefono genitore', 
    required: false,
    keywords: ['telefono', 'phone', 'cell', 'mobile', 'cellulare']
  },
}

export function CSVMapper({ 
  headers, 
  previewData, 
  onMappingChange, 
  onContinue, 
  onBack 
}: CSVMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({})

  // Auto-detect mapping based on header names
  const autoMapping = useMemo(() => {
    const detected: Record<string, string> = {}
    
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim()
      
      Object.entries(STANDARD_FIELDS).forEach(([field, config]) => {
        if (config.keywords.some(keyword => 
          normalizedHeader.includes(keyword.toLowerCase())
        )) {
          detected[field] = header
        }
      })
    })
    
    return detected
  }, [headers])

  // Initialize mapping with auto-detected values
  useMemo(() => {
    setMapping(autoMapping)
    onMappingChange(autoMapping)
  }, [autoMapping, onMappingChange])

  const handleMappingChange = (field: string, header: string) => {
    const newMapping = { ...mapping }
    
    if (header === '') {
      delete newMapping[field]
    } else {
      // Remove this header from other fields
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === header && key !== field) {
          delete newMapping[key]
        }
      })
      newMapping[field] = header
    }
    
    setMapping(newMapping)
    onMappingChange(newMapping)
  }

  // Check if required fields are mapped
  const requiredFields = Object.entries(STANDARD_FIELDS)
    .filter(([_, config]) => config.required)
    .map(([field, _]) => field)
  
  const missingRequiredFields = requiredFields.filter(field => !mapping[field])
  const canContinue = missingRequiredFields.length === 0

  // Get used headers
  const usedHeaders = Object.values(mapping)
  const unusedHeaders = headers.filter(header => !usedHeaders.includes(header))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Mappatura colonne
        </h3>
        <p className="text-sm text-gray-600">
          Associa le colonne del tuo file ai campi del sistema. 
          I campi obbligatori sono contrassegnati con *.
        </p>
      </div>

      {/* Auto-detection info */}
      {Object.keys(autoMapping).length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Mappatura automatica rilevata
            </p>
            <p className="text-sm text-green-700">
              Abbiamo riconosciuto {Object.keys(autoMapping).length} colonne automaticamente. 
              Controlla che siano corrette prima di continuare.
            </p>
          </div>
        </div>
      )}

      {/* Missing required fields warning */}
      {missingRequiredFields.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Campi obbligatori mancanti
            </p>
            <p className="text-sm text-amber-700">
              Associa le seguenti colonne per continuare: {' '}
              {missingRequiredFields.map(field => STANDARD_FIELDS[field as keyof typeof STANDARD_FIELDS].label).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Mapping */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Campi sistema</h4>
          <div className="space-y-3">
            {Object.entries(STANDARD_FIELDS).map(([field, config]) => (
              <div key={field} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {config.label}
                    {config.required && <span className="text-red-500">*</span>}
                  </span>
                  {mapping[field] && (
                    <Badge variant="secondary" className="text-xs">
                      Mappato
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={mapping[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Seleziona colonna</option>
                    {headers.map(header => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Anteprima dati (prime 5 righe)</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {headers.map(header => (
                    <th key={header} className="text-left p-2 font-medium text-gray-900">
                      <div className="flex items-center gap-1">
                        {header}
                        {usedHeaders.includes(header) && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2 text-gray-600">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Unused headers info */}
      {unusedHeaders.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Colonne non utilizzate
          </p>
          <p className="text-sm text-blue-700">
            Le seguenti colonne non verranno importate: {unusedHeaders.join(', ')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        
        <Button 
          onClick={onContinue}
          disabled={!canContinue}
          className="min-w-[120px]"
        >
          Continua
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}