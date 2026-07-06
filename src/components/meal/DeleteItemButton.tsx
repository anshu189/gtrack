import { Button } from '@/components/ui/button'

interface DeleteItemButtonProps {
  onClick: () => void
  label?: string
}

const DeleteItemButton = ({ onClick, label = 'Delete' }: DeleteItemButtonProps) => {
  return (
    <Button size="sm" variant="ghost" onClick={onClick}>
      {label}
    </Button>
  )
}

export default DeleteItemButton
