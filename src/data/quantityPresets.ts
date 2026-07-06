import type { QuantityPreset } from '@/types'

const now = new Date().toISOString()

const quantityPresets: QuantityPreset[] = [
  { id: 'qp:1cup', label: '1 cup', quantity: 1, unit: 'cup', createdAt: now, updatedAt: now },
  { id: 'qp:100g', label: '100 g', quantity: 100, unit: 'g', createdAt: now, updatedAt: now },
  { id: 'qp:1tbsp', label: '1 tbsp', quantity: 1, unit: 'tbsp', createdAt: now, updatedAt: now },
  { id: 'qp:1tsp', label: '1 tsp', quantity: 1, unit: 'tsp', createdAt: now, updatedAt: now },
  { id: 'qp:1piece', label: '1 piece', quantity: 1, unit: 'piece', createdAt: now, updatedAt: now },
  { id: 'qp:1slice', label: '1 slice', quantity: 1, unit: 'slice', createdAt: now, updatedAt: now },
]

export default quantityPresets
