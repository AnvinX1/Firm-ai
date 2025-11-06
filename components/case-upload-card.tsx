"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Sparkles, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CaseUploadCardProps {
  onUpload: (file: File, title: string) => void
}

export default function CaseUploadCard({ onUpload }: CaseUploadCardProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type === "application/pdf") {
      setFile(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (file && title) {
      setIsUploading(true)
      try {
        await onUpload(file, title)
        setTitle("")
        setFile(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Card className="border-2 border-firm-red-600/30 bg-gradient-to-br from-firm-red-600/5 via-firm-black-900 to-firm-black-900 sticky top-4">
      <CardHeader className="border-b border-firm-black-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-firm-red-600/20 rounded-lg">
            <Upload className="w-5 h-5 text-firm-red-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-white">Upload Case</CardTitle>
            <CardDescription className="text-gray-400">Add a new legal case for AI analysis</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-gray-300">
              Case Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Smith v. Jones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-2 border-firm-black-700 bg-firm-black-800 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-firm-red-600/30 focus-visible:border-firm-red-600/50"
              disabled={isUploading}
            />
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-firm-red-600 bg-firm-red-600/10 scale-[1.02] shadow-lg shadow-firm-red-600/20"
                : "border-firm-black-700 hover:border-firm-red-600/50 hover:bg-firm-black-800/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0])
                }
              }}
              className="hidden"
              id="file-input"
              disabled={isUploading}
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-firm-red-600 to-firm-red-700 shadow-lg shadow-firm-red-600/30">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white truncate px-4">
                      {file.name}
                    </p>
                    <Badge className="text-xs bg-firm-black-700 text-gray-300 border-0 font-bold">
                      {formatFileSize(file.size)}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="mt-2 hover:bg-firm-black-700 text-gray-400 hover:text-white"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="p-4 rounded-full bg-firm-red-600/20 border-2 border-firm-red-600/30">
                      <Upload className="w-10 h-10 text-firm-red-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Drag PDF here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF files only • Max 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-firm-red-600 hover:bg-firm-red-700 text-white font-bold shadow-lg shadow-firm-red-600/30 h-11"
            disabled={!file || !title || isUploading}
          >
            {isUploading ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Uploading & Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Upload & Analyze
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
