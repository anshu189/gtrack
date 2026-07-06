export type QuantityPresetID = string

export interface QuantityPreset {
  id: QuantityPresetID
  /** Human friendly label, e.g. "1 cup", "1 serving" */
  label: string
  /** Default quantity value (numeric) */
  quantity: number
  /** Unit for the preset, e.g. 'g', 'cup', 'serving' */
  unit: string
  /** Optional linked food id to scope preset to a specific food */
  foodId?: string
  /** Optional category id to scope preset to a category */
  categoryId?: string
  createdAt?: string
  updatedAt?: string
}
