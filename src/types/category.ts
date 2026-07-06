export type CategoryID = string

export interface Category {
  id: CategoryID
  name: string
  description?: string
  parentId?: CategoryID | null
  createdAt?: string
  updatedAt?: string
}
