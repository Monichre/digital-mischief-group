"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Check, X, HelpCircle } from "lucide-react"

const ENRICHMENT_FIELDS = [
  { key: "domain", label: "Domain / URL", description: "Company website or domain", required: true },
  { key: "email", label: "Email", description: "Business email to extract domain from" },
  { key: "company_name", label: "Company Name", description: "Company name (for reference)" },
  { key: "first_name", label: "First Name", description: "Contact first name" },
  { key: "last_name", label: "Last Name", description: "Contact last name" },
  { key: "title", label: "Job Title", description: "Contact job title" },
] as const

type EnrichmentFieldKey = (typeof ENRICHMENT_FIELDS)[number]["key"]

interface FieldMapperProps {
  csvHeaders: string[]
  onMappingComplete: (mapping: Record<EnrichmentFieldKey, string | null>) => void
  onCancel: () => void
}

export function FieldMapper({ csvHeaders, onMappingComplete, onCancel }: FieldMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string | null>>({})

  // Auto-detect mappings on mount
  useEffect(() => {
    const autoMapping: Record<string, string | null> = {}

    ENRICHMENT_FIELDS.forEach((field) => {
      const match = csvHeaders.find((h) => {
        const headerLower = h.toLowerCase().replace(/[_\s-]/g, "")
        const fieldLower = field.key.toLowerCase().replace(/[_\s-]/g, "")
        const labelLower = field.label.toLowerCase().replace(/[_\s-]/g, "")

        return (
          headerLower === fieldLower ||
          headerLower === labelLower ||
          headerLower.includes(fieldLower) ||
          fieldLower.includes(headerLower)
        )
      })
      autoMapping[field.key] = match || null
    })

    setMapping(autoMapping)
  }, [csvHeaders])

  const handleFieldChange = (fieldKey: string, csvHeader: string | null) => {
    setMapping((prev) => ({ ...prev, [fieldKey]: csvHeader }))
  }

  const hasDomainOrEmail = mapping.domain || mapping.email
  const isValid = hasDomainOrEmail

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Map Your Fields</h3>
          <p className="text-sm text-zinc-500">Match your CSV columns to enrichment fields</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-zinc-800 transition-colors">
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Mapping Grid */}
      <div className="space-y-3">
        {ENRICHMENT_FIELDS.map((field) => (
          <div
            key={field.key}
            className={`
              flex items-center gap-4 p-4 border transition-colors
              ${mapping[field.key] ? "border-orange-500/50 bg-orange-500/5" : "border-zinc-800 bg-zinc-900/30"}
            `}
          >
            {/* Field Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">{field.label}</span>
                {field.required && <span className="text-[10px] text-orange-500 uppercase">Required*</span>}
              </div>
              <p className="text-xs text-zinc-500 truncate">{field.description}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />

            {/* CSV Column Selector */}
            <div className="w-48 flex-shrink-0">
              <select
                value={mapping[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value || null)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">-- Skip --</option>
                {csvHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="w-6 flex-shrink-0">
              {mapping[field.key] ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border border-zinc-700 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Validation Message */}
      {!hasDomainOrEmail && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>You must map either Domain/URL or Email to enrich your leads</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => onMappingComplete(mapping as Record<EnrichmentFieldKey, string | null>)}
          disabled={!isValid}
          className="px-6 py-2 bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Enrichment
        </button>
      </div>
    </div>
  )
}
