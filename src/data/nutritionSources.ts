import type { NutritionSource } from '@/types'

const now = new Date().toISOString()

const nutritionSources: NutritionSource[] = [
  {
    id: 'ns:usda-fdc',
    name: 'USDA FoodData Central',
    description: 'USDA FoodData Central datasets',
    version: 'FDC 1.0',
    url: 'https://fdc.nal.usda.gov/',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'ns:local-composite',
    name: 'GTrak Local Composite',
    description: 'Local curated composite values for common foods',
    version: '1.0',
    createdAt: now,
    updatedAt: now,
  },
]

export default nutritionSources
