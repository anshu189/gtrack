import { useEffect, useRef, useState } from 'react'
import { TextArea } from '@astryxdesign/core'
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
    <TextArea
      label="Daily note"
      isLabelHidden
      value={content}
      onChange={(val) => setContent(val)}
      placeholder="No notes for today."
      rows={4}
    />
  )
}

export default DailyNoteEditor
