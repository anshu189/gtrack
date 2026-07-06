import type { Category } from '@/types'

const now = new Date().toISOString()

const categories: Category[] = [
  { id: 'cat:fruits', name: 'Fruits', description: 'Fresh fruits', createdAt: now, updatedAt: now },
  { id: 'cat:vegetables', name: 'Vegetables', description: 'Fresh vegetables', createdAt: now, updatedAt: now },
  { id: 'cat:meat', name: 'Meat', description: 'Meat and poultry', createdAt: now, updatedAt: now },
  { id: 'cat:grains', name: 'Grains', description: 'Rice, wheat, and cereals', createdAt: now, updatedAt: now },
  { id: 'cat:dairy', name: 'Dairy', description: 'Milk, cheese, yogurt', createdAt: now, updatedAt: now },
  { id: 'cat:pantry', name: 'Pantry', description: 'Oils, spices, staples', createdAt: now, updatedAt: now },
]

export default categories
