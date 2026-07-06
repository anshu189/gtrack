export type WaterID = string

export interface WaterLog {
  id: WaterID
  date: string
  amount: number
  unit: 'ml' | 'oz' | 'cups'
  timestamp: string
  notes?: string
  createdAt?: string
}

export interface WaterGoal {
  daily: number
  unit: 'ml' | 'oz' | 'cups'
}
