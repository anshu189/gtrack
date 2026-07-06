import React, { useState, useEffect, useRef } from 'react'
import type { Food } from '@/types'
import { Button } from '@/components/ui/button'
import { foodRepository } from '@/lib/repositories/foodRepository'

interface FoodPickerProps {
  onSelect: (food: Food) => void
  placeholder?: string
}

const FoodPicker: React.FC<FoodPickerProps> = ({ onSelect, placeholder = 'Search foods' }) => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = window.setTimeout(async () => {
      try {
        // use repository search (simple filter)
        const res = await foodRepository.searchByName(q)
        // map to full Food objects by fetching by id
        const full = await Promise.all(res.map((r) => foodRepository.getById(r.id)))
        setResults(full.filter(Boolean) as Food[])
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [q])

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 border border-gray-200 rounded-sm"
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          placeholder={placeholder}
        />
        <Button onClick={() => setQ('')} variant="ghost">Clear</Button>
      </div>
      <div className="mt-2 max-h-56 overflow-auto">
        {loading && <div className="text-sm text-gray-500">Searching...</div>}
        {!loading && results.length === 0 && q && <div className="text-sm text-gray-500">No results</div>}
        <ul className="flex flex-col gap-1">
          {results.map((f) => (
            <li key={f.id} className="p-2 hover:bg-gray-50 rounded-sm flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-xs text-gray-600">{f.servingSize}{f.servingUnit ? ` ${f.servingUnit}` : ''}</div>
              </div>
              <Button size="sm" onClick={() => onSelect(f)}>
                Select
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default FoodPicker
