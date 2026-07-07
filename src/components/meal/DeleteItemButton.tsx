import { Button } from '@/components/ui/button'

interface DeleteItemButtonProps {
  onClick: () => void
  label?: string
}

const DeleteItemButton = ({ onClick, label = 'Delete' }: DeleteItemButtonProps) => {
  return (
    <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-400" onClick={onClick}>
      {label}
    </Button>
  )
}

export default DeleteItemButton
