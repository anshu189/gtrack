import { useEffect, useMemo, useState } from 'react'
import { foodSearchService } from '@/lib/search/foodSearch'
import type { Food } from '@/types'

export function useFoodSearch(query: string, limit = 25) {
  const [results, setResults] = useState<{ item: Food; score?: number }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function run() {
      setLoading(true)
      try {
        await foodSearchService.refreshIfStale()
        const res = await foodSearchService.search(query, limit)
        if (mounted) setResults(res)
      } catch (e) {
        // ignore — caller handles empty results
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // debounce simple
    const id = setTimeout(() => {
      run()
    }, 150)

    return () => {
      mounted = false
      clearTimeout(id)
    }
  }, [query, limit])

  const all = useMemo(() => results.map((r) => r.item), [results])
  return { results, items: all, loading }
}

export default useFoodSearch
