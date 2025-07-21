'use client'

import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { CSVMapper } from './csv-mapper'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/Card'
import { 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Users,
  Loader2
} from 'lucide-react'

interface ImportPlayersModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  onImportComplete: (result: ImportResult) => void
}

interface ImportResult {
  totalRows: number
  successCount: number
  errorCount: number
  errors: Array<{
    row: number
    field: string
    value: string
    error: string
  }>
}

enum ImportStep {
  UPLOAD = 'upload',
  MAPPING = 'mapping',
  VALIDATION = 'validation',
  IMPORTING = 'importing',
  COMPLETE = 'complete'
}

export function ImportPlayersModal({ 
  isOpen, 
  onClose, 
  teamId, 
  onImportComplete 
}: ImportPlayersModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>(ImportStep.UPLOAD)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<Array<any>>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const resetModal = useCallback(() => {
    setCurrentStep(ImportStep.UPLOAD)
    setSelectedFile(null)
    setCsvData([])
    setHeaders([])
    setMapping({})
    setValidationErrors([])
    setImportProgress(0)
    setImportResult(null)
    setIsProcessing(false)
  }, [])

  const handleClose = useCallback(() => {
    resetModal()
    onClose()
  }, [resetModal, onClose])

  // Parse CSV/Excel file
  const parseFile = useCallback(async (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          let workbook: XLSX.WorkBook
          
          if (file.name.endsWith('.csv')) {
            workbook = XLSX.read(data, { type: 'string' })
          } else {
            workbook = XLSX.read(data, { type: 'array' })
          }
          
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet, { 
            header: 1,
            defval: ''
          }) as string[][]
          
          resolve(jsonData)
        } catch (error) {
          reject(new Error('Errore nella lettura del file. Assicurati che sia un file CSV o Excel valido.'))
        }
      }
      
      reader.onerror = () => reject(new Error('Errore nella lettura del file'))
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true)
    setSelectedFile(file)
    
    try {
      const data = await parseFile(file)
      
      if (data.length === 0) {
        throw new Error('Il file è vuoto')
      }
      
      const [headerRow, ...dataRows] = data
      setHeaders(headerRow.filter(h => h && h.trim() !== ''))
      setCsvData(dataRows.filter(row => row.some(cell => cell && cell.trim() !== '')))
      
      setCurrentStep(ImportStep.MAPPING)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert(error instanceof Error ? error.message : 'Errore nella lettura del file')
    } finally {
      setIsProcessing(false)
    }
  }, [parseFile])

  const validateData = useCallback(() => {
    const errors: Array<any> = []
    const usedNumbers: Set<number> = new Set()
    
    csvData.forEach((row, index) => {
      const rowData: Record<string, string> = {}
      
      // Map row data according to mapping
      Object.entries(mapping).forEach(([field, headerName]) => {
        const columnIndex = headers.indexOf(headerName)
        if (columnIndex >= 0) {
          rowData[field] = row[columnIndex]?.toString().trim() || ''
        }
      })
      
      // Validate required fields
      if (!rowData.firstName) {
        errors.push({
          row: index + 2, // +2 because of header and 0-based index
          field: 'Nome',
          value: rowData.firstName || '',
          error: 'Campo obbligatorio mancante'
        })
      }
      
      if (!rowData.lastName) {
        errors.push({
          row: index + 2,
          field: 'Cognome', 
          value: rowData.lastName || '',
          error: 'Campo obbligatorio mancante'
        })
      }
      
      if (!rowData.birthDate) {
        errors.push({
          row: index + 2,
          field: 'Data di nascita',
          value: rowData.birthDate || '',
          error: 'Campo obbligatorio mancante'
        })
      } else {
        // Validate date format
        const date = new Date(rowData.birthDate)
        if (isNaN(date.getTime())) {
          errors.push({
            row: index + 2,
            field: 'Data di nascita',
            value: rowData.birthDate,
            error: 'Formato data non valido'
          })
        } else {
          // Check minimum age (5 years)
          const age = new Date().getFullYear() - date.getFullYear()
          if (age < 5) {
            errors.push({
              row: index + 2,
              field: 'Data di nascita',
              value: rowData.birthDate,
              error: 'Età minima 5 anni'
            })
          }
        }
      }
      
      // Validate jersey number uniqueness
      if (rowData.number) {
        const number = parseInt(rowData.number)
        if (isNaN(number) || number < 1 || number > 99) {
          errors.push({
            row: index + 2,
            field: 'Numero maglia',
            value: rowData.number,
            error: 'Numero deve essere tra 1 e 99'
          })
        } else if (usedNumbers.has(number)) {
          errors.push({
            row: index + 2,
            field: 'Numero maglia',
            value: rowData.number,
            error: 'Numero già utilizzato'
          })
        } else {
          usedNumbers.add(number)
        }
      }
      
      // Validate email format
      if (rowData.playerEmail && rowData.playerEmail.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(rowData.playerEmail)) {
          errors.push({
            row: index + 2,
            field: 'Email',
            value: rowData.playerEmail,
            error: 'Formato email non valido'
          })
        }
      }
    })
    
    setValidationErrors(errors)
    setCurrentStep(ImportStep.VALIDATION)
  }, [csvData, mapping, headers])

  const performImport = useCallback(async () => {
    setCurrentStep(ImportStep.IMPORTING)
    setImportProgress(0)
    
    try {
      // Prepare all players data for bulk import
      const playersData: any[] = []
      
      csvData.forEach((row, index) => {
        // Map row data according to mapping
        const playerData: any = {}
        
        Object.entries(mapping).forEach(([field, headerName]) => {
          const columnIndex = headers.indexOf(headerName)
          if (columnIndex >= 0) {
            let value = row[columnIndex]?.toString().trim()
            
            // Type conversion
            if (field === 'number' && value) {
              playerData[field] = parseInt(value)
            } else if (field === 'height' && value) {
              playerData[field] = parseInt(value)
            } else if (field === 'weight' && value) {
              playerData[field] = parseInt(value)
            } else if (field === 'birthDate' && value) {
              playerData[field] = new Date(value).toISOString()
            } else if (value !== undefined && value !== '') {
              playerData[field] = value
            }
          }
        })
        
        // Add import timestamp
        playerData.importedAt = new Date().toISOString()
        playersData.push(playerData)
      })
      
      setImportProgress(25)
      
      // Send bulk import request
      const response = await fetch(`/api/teams/${teamId}/players/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: playersData,
          skipDuplicates: true
        })
      })
      
      setImportProgress(75)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore durante l\'importazione')
      }
      
      const results: ImportResult = await response.json()
      
      setImportProgress(100)
      setImportResult(results)
      setCurrentStep(ImportStep.COMPLETE)
      
      // Notify parent component
      onImportComplete(results)
      
    } catch (error) {
      console.error('Import error:', error)
      alert(error instanceof Error ? error.message : 'Errore durante l\'importazione')
    }
  }, [csvData, mapping, headers, teamId, onImportComplete])

  const downloadTemplate = useCallback(() => {
    const templateData = [
      ['Nome', 'Cognome', 'Data di nascita', 'Numero maglia', 'Ruolo', 'Email', 'Nome genitore', 'Telefono genitore'],
      ['Mario', 'Rossi', '2005-03-15', '10', 'Attaccante', 'mario.rossi@email.com', 'Giuseppe Rossi', '+39 333 1234567'],
      ['Luca', 'Bianchi', '2006-07-22', '7', 'Centrocampista', '', 'Anna Bianchi', '+39 333 7654321']
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template Giocatori')
    
    // Add instructions
    const instructions = [
      ['ISTRUZIONI PER L\'IMPORTAZIONE GIOCATORI'],
      [''],
      ['1. Compila i dati seguendo il formato del template'],
      ['2. I campi Nome, Cognome e Data di nascita sono OBBLIGATORI'],
      ['3. La data deve essere in formato YYYY-MM-DD (es: 2005-03-15)'],
      ['4. Il numero maglia deve essere unico e tra 1 e 99'],
      ['5. Salva il file come CSV o Excel (.xlsx)'],
      ['6. La dimensione massima del file è 5MB'],
      [''],
      ['FORMATI SUPPORTATI:'],
      ['• CSV (Comma Separated Values)'],
      ['• Excel (.xlsx, .xls)'],
      [''],
      ['ESEMPI DI RUOLI:'],
      ['Calcio: Portiere, Difensore, Centrocampista, Attaccante'],
      ['Basket: Playmaker, Guardia, Ala, Centro'],
      ['Volley: Palleggiatore, Schiacciatore, Centrale, Libero']
    ]
    
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions)
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Istruzioni')
    
    XLSX.writeFile(wb, 'template_importazione_giocatori.xlsx')
  }, [])

  const getStepContent = () => {
    switch (currentStep) {
      case ImportStep.UPLOAD:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Importa giocatori da file
              </h3>
              <p className="text-gray-600">
                Carica un file CSV o Excel con i dati dei giocatori
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Scarica template CSV
              </Button>
            </div>

            <FileDropzone
              onFileSelect={handleFileSelect}
              acceptedTypes={['.csv', '.xlsx', '.xls']}
              maxSizeMB={5}
              disabled={isProcessing}
            />

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analisi file in corso...</span>
              </div>
            )}
          </div>
        )

      case ImportStep.MAPPING:
        return (
          <CSVMapper
            headers={headers}
            previewData={csvData}
            onMappingChange={setMapping}
            onContinue={validateData}
            onBack={() => setCurrentStep(ImportStep.UPLOAD)}
          />
        )

      case ImportStep.VALIDATION:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Validazione dati
              </h3>
              <p className="text-gray-600">
                Verifica degli errori prima dell'importazione
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{csvData.length}</div>
                <div className="text-sm text-gray-500">Giocatori totali</div>
              </Card>
              
              <Card className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {csvData.length - validationErrors.filter(e => ['Nome', 'Cognome', 'Data di nascita'].includes(e.field)).length}
                </div>
                <div className="text-sm text-gray-500">Validi</div>
              </Card>
              
              <Card className="p-4 text-center">
                <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{validationErrors.length}</div>
                <div className="text-sm text-gray-500">Errori</div>
              </Card>
            </div>

            {validationErrors.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium text-red-900 mb-3">
                  Errori trovati ({validationErrors.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Badge variant="destructive" className="text-xs">
                        Riga {error.row}
                      </Badge>
                      <span className="font-medium text-gray-900">{error.field}:</span>
                      <span className="text-gray-600">"{error.value}" - {error.error}</span>
                    </div>
                  ))}
                  {validationErrors.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ...e altri {validationErrors.length - 10} errori
                    </p>
                  )}
                </div>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(ImportStep.MAPPING)}>
                Indietro
              </Button>
              
              <Button 
                onClick={performImport}
                disabled={validationErrors.some(e => ['Nome', 'Cognome', 'Data di nascita'].includes(e.field))}
              >
                {validationErrors.length > 0 ? 'Importa solo validi' : 'Inizia importazione'}
              </Button>
            </div>
          </div>
        )

      case ImportStep.IMPORTING:
        return (
          <div className="space-y-6 text-center">
            <div>
              <Upload className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Importazione in corso...
              </h3>
              <p className="text-gray-600">
                Non chiudere questa finestra durante l'importazione
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Progress value={importProgress} className="mb-2" />
              <p className="text-sm text-gray-500">
                {Math.round(importProgress)}% completato
              </p>
            </div>
          </div>
        )

      case ImportStep.COMPLETE:
        return (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Importazione completata!
              </h3>
            </div>

            {importResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{importResult.totalRows}</div>
                  <div className="text-sm text-gray-500">Righe processate</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.successCount}</div>
                  <div className="text-sm text-gray-500">Importati</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.errorCount}</div>
                  <div className="text-sm text-gray-500">Errori</div>
                </Card>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleClose}>
                Chiudi
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importa giocatori
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {getStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}