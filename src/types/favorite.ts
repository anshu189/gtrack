export type FavoriteID = string

export interface Favorite {
  id: FavoriteID
  foodId: string
  createdAt?: string
}
