import { useEffect, useState, useRef } from 'react'
import type { MealAutoCompletion } from '@/lib/services/mealAutoCompletion'
import { mealAutoCompletionService } from '@/lib/services/mealAutoCompletion'

interface UseMealAutoCompleteOptions {
  debounceMs?: number
  limit?: number
}

export function useMealAutoComplete(query: string, options: UseMealAutoCompleteOptions = {}) {
  const { debounceMs = 100, limit = 5 } = options
  const [suggestions, setSuggestions] = useState<MealAutoCompletion[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    
    if (!query) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await mealAutoCompletionService.getSuggestionsByPrefix(query, limit)
        setSuggestions(results)
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query, debounceMs, limit])

  return { suggestions, loading }
}

export function useMealAutoCompleteAll(options: UseMealAutoCompleteOptions = {}) {
  const { limit = 10 } = options
  const [suggestions, setSuggestions] = useState<MealAutoCompletion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const results = await mealAutoCompletionService.getSuggestions(limit)
        setSuggestions(results)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [limit])

  return { suggestions, loading }
}
