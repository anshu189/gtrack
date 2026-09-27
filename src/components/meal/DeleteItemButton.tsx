interface DeleteItemButtonProps {
  onClick: () => void
  label?: string
}

const DeleteItemButton = ({ onClick, label = 'Delete' }: DeleteItemButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg py-2 text-sm font-medium text-protein border border-line hover:bg-surface-2 transition-colors"
    >
      {label}
    </button>
  )
}

export default DeleteItemButton
