export type WeightID = string

export interface WeightEntry {
  id: WeightID
  date: string
  weight: number
  unit: 'kg' | 'lbs'
  notes?: string
  createdAt?: string
  updatedAt?: string
}
