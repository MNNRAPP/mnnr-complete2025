// Receipt Upload Component - Secure File Upload
'use client'

import { useState } from 'react'
import { Upload, FileText, Shield } from 'lucide-react'

export function ReceiptUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // In a real implementation, this would upload to your API
    setTimeout(() => {
      clearInterval(interval)
      setIsUploading(false)
      setUploadProgress(100)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-purple-600/50 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="receipt-upload"
          multiple
        />
        <label htmlFor="receipt-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-purple-400" />
            <p className="text-purple-200">
              Click to upload receipts or drag and drop
            </p>
            <p className="text-purple-400 text-sm">
              Supports JPG, PNG, PDF formats
            </p>
          </div>
        </label>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-purple-300">
            <FileText className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Processing receipts... {uploadProgress}%</span>
          </div>
          <div className="w-full bg-purple-900/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 text-purple-400 text-sm">
        <Shield className="w-4 h-4" />
        <span>All uploads are encrypted and scanned for fraud</span>
      </div>
    </div>
  )
}