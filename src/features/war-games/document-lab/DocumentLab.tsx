"use client"

import { UploadZoneWrapper } from "./interface/upload-zone"
import { FileText } from "lucide-react"

export function DocumentLab() {
  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div className="flex flex-col items-start pt-6 pb-4 justify-start text-left">
        <div className="flex gap-2 items-center">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="size-6 text-primary" />
          </div>
          <div className="flex flex-col items-start justify-start text-left">
            <p className="text-sm text-muted-foreground">AI Document Analysis</p>
            <h1 className="text-2xl lg:text-3xl font-bold">Document Lab</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-pretty text-sm max-w-2xl">
          Upload a PDF document and ask questions about it. Files are processed
          in-memory with OpenAI - nothing is stored.
        </p>
      </div>
      <UploadZoneWrapper />
    </div>
  )
}
