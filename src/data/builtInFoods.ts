import type { Food } from '@/types'

const now = new Date().toISOString()

const builtInFoods: Food[] = [
  {
    id: 'food:apple',
    name: 'Apple, raw',
    category: 'cat:fruits',
    servingSize: 100,
    servingUnit: 'g',
    measures: [
      { id: 'm:100g', label: '100 g', quantity: 100, unit: 'g', grams: 100 },
      { id: 'm:1-medium', label: '1 medium (182 g)', quantity: 1, unit: 'medium', grams: 182 },
    ],
    source: 'builtin',
    nutrition: {
      calories: 52,
      protein: 0.26,
      carbs: 13.81,
      fat: 0.17,
      fiber: 2.4,
      sugar: 10.39,
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'food:chicken-breast-cooked',
    name: 'Chicken breast, cooked',
    category: 'cat:meat',
    servingSize: 100,
    servingUnit: 'g',
    measures: [
      { id: 'm:100g', label: '100 g', quantity: 100, unit: 'g', grams: 100 },
      { id: 'm:1-piece-120g', label: '1 fillet (120 g)', quantity: 1, unit: 'fillet', grams: 120 },
    ],
    source: 'builtin',
    nutrition: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'food:rice-white-cooked',
    name: 'Rice, white, cooked',
    category: 'cat:grains',
    servingSize: 100,
    servingUnit: 'g',
    measures: [
      { id: 'm:100g', label: '100 g', quantity: 100, unit: 'g', grams: 100 },
      { id: 'm:1-cup', label: '1 cup (158 g)', quantity: 1, unit: 'cup', grams: 158 },
    ],
    source: 'builtin',
    nutrition: {
      calories: 130,
      protein: 2.4,
      carbs: 28,
      fat: 0.3,
    },
    createdAt: now,
    updatedAt: now,
  },
]

export default builtInFoods
