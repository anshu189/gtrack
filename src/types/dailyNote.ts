export type DailyNoteID = string

export interface DailyNote {
  id: DailyNoteID
  date: string
  content: string
  createdAt?: string
  updatedAt?: string
}
