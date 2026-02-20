'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Download, Trash2, File } from 'lucide-react'

type Document = {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  uploadedBy: { name: string; email: string }
  createdAt: string
}

export default function MissionDocuments({ missionId }: { missionId: string }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [missionId])

  const loadDocuments = async () => {
    const res = await fetch(`/api/missions/${missionId}/documents`)
    if (res.ok) {
      const data = await res.json()
      setDocuments(data)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/missions/${missionId}/documents`, {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      loadDocuments()
    } else {
      const error = await res.json()
      alert(error.error || 'Upload failed')
    }
    
    setUploading(false)
    e.target.value = ''
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Delete this document?')) return

    const res = await fetch(`/api/missions/${missionId}/documents?documentId=${documentId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      loadDocuments()
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    const res = await fetch(`/api/missions/${missionId}/documents/${documentId}`)
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Documents</h3>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button disabled={uploading} size="sm">
            <Upload size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </label>
      </div>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No documents uploaded yet</p>
        ) : (
          documents.map(doc => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <File size={20} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} • Uploaded by {doc.uploadedBy.name} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
