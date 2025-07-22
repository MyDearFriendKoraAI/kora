'use client'

import { useState, useRef } from 'react'
import {
  QrCodeIcon,
  DownloadIcon,
  RefreshCwIcon,
  ShareIcon,
  PrinterIcon,
  CopyIcon,
  CheckIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'

interface QRCheckInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainingId: string
}

export function QRCheckInModal({
  open,
  onOpenChange,
  trainingId,
}: QRCheckInModalProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [checkInUrl, setCheckInUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate QR code quando il modal si apre
  useState(() => {
    if (open) {
      generateQRCode()
    }
  })

  const generateQRCode = async () => {
    setLoading(true)
    try {
      // In un'implementazione reale, genera un token unico per questo allenamento
      const token = `training_${trainingId}_${Date.now()}`
      const baseUrl = window.location.origin
      const url = `${baseUrl}/checkin/${token}`
      
      setCheckInUrl(url)
      
      // Genera QR code usando una libreria come qrcode o API esterna
      // Per ora uso un placeholder
      const qrCodeDataUrl = await generateQRCodeImage(url)
      setQrCode(qrCodeDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCodeImage = async (text: string): Promise<string> => {
    // In un'implementazione reale, usa una libreria QR code
    // Per ora return un placeholder SVG
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="110" text-anchor="middle" fill="black" font-size="12">QR CODE</text>
        <text x="100" y="130" text-anchor="middle" fill="black" font-size="8">${trainingId}</text>
      </svg>
    `)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a')
      link.download = `qr-checkin-${trainingId}.png`
      link.href = qrCode
      link.click()
    }
  }

  const printQRCode = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && qrCode) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code Check-in - Allenamento</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 40px; }
              .qr-container { max-width: 400px; margin: 0 auto; }
              .qr-code { width: 300px; height: 300px; margin: 20px 0; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
              .instructions { font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="title">Check-in Allenamento</div>
              <div class="subtitle">${new Date().toLocaleDateString('it-IT')}</div>
              <img src="${qrCode}" alt="QR Code" class="qr-code" />
              <div class="instructions">
                <p>Scansiona questo QR code con il tuo telefono per registrare la presenza</p>
                <p>Oppure vai su: <strong>${checkInUrl}</strong></p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Check-in Allenamento',
          text: 'Scansiona questo QR code per registrare la presenza',
          url: checkInUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback - copy to clipboard
      copyToClipboard()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5" />
            QR Check-in Allenamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <Card className="p-6 text-center">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : qrCode ? (
              <div ref={qrRef} className="space-y-4">
                <img
                  src={qrCode}
                  alt="QR Code per check-in"
                  className="w-48 h-48 mx-auto border rounded-lg"
                />
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    I giocatori possono scansionare questo QR code per registrare automaticamente la presenza
                  </p>
                  <Badge variant="secondary">
                    Valido per questo allenamento
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                Errore nel generare il QR code
              </div>
            )}
          </Card>

          {/* URL Display */}
          {checkInUrl && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Link diretto:</p>
                  <p className="text-xs text-gray-600 truncate">{checkInUrl}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-3 w-3" />
                      Copiato
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-3 w-3" />
                      Copia
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={downloadQRCode}
              disabled={!qrCode}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Scarica
            </Button>
            
            <Button
              variant="outline"
              onClick={printQRCode}
              disabled={!qrCode}
              className="flex items-center gap-2"
            >
              <PrinterIcon className="h-4 w-4" />
              Stampa
            </Button>
            
            <Button
              variant="outline"
              onClick={shareQRCode}
              disabled={!qrCode}
              className="flex items-center gap-2"
            >
              <ShareIcon className="h-4 w-4" />
              Condividi
            </Button>
            
            <Button
              variant="outline"
              onClick={generateQRCode}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Rigenera
            </Button>
          </div>

          {/* Instructions */}
          <Card className="p-4 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">Come funziona:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Condividi o stampa il QR code</li>
              <li>2. I giocatori scansionano il QR code con il telefono</li>
              <li>3. Si aprirà una pagina dove possono confermare la presenza</li>
              <li>4. Le presenze vengono registrate automaticamente</li>
            </ol>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}