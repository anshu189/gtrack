import React from 'react'
import { Button } from '@/components/ui/button'

interface DeleteItemButtonProps {
  onDelete: () => void
}

const DeleteItemButton: React.FC<DeleteItemButtonProps> = ({ onDelete }) => {
  return (
    <Button size="sm" variant="secondary" onClick={onDelete}>
      Delete
    </Button>
  )
}

export default DeleteItemButton
