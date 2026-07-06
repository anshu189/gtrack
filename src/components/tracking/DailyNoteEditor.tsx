import { useEffect, useRef, useState } from 'react'
import type { DailyNote } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

interface DailyNoteEditorProps {
  date: string
  note?: DailyNote
  onSave: (note: DailyNote) => void
}

export const DailyNoteEditor = ({ date, note, onSave }: DailyNoteEditorProps) => {
  const [content, setContent] = useState(note?.content ?? '')
  const debouncedContent = useDebounce(content, 500)
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    setContent(note?.content ?? '')
  }, [note?.content])

  useEffect(() => {
    if (debouncedContent === (note?.content ?? '')) return

    const now = new Date().toISOString()
    onSaveRef.current({
      id: note?.id ?? `note:${date}`,
      date,
      content: debouncedContent,
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    })
  }, [debouncedContent, date, note?.content, note?.createdAt, note?.id])

  return (
    <textarea
      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
      placeholder="No notes for today."
      value={content}
      onChange={(e) => setContent(e.target.value)}
      rows={4}
      aria-label="Daily note"
    />
  )
}

export default DailyNoteEditor
