import { Button, Icon } from '@/components/ds'

interface DeleteItemButtonProps {
  onClick: () => void
  label?: string
}

const DeleteItemButton = ({ onClick, label = 'Delete' }: DeleteItemButtonProps) => (
  <Button
    variant="secondary"
    size="sm"
    className="h-11 text-protein hover:text-protein"
    icon={<Icon name="trash" size={16} />}
    onClick={onClick}
  >
    {label}
  </Button>
)

export default DeleteItemButton
