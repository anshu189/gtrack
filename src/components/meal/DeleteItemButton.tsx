interface DeleteItemButtonProps {
  onClick: () => void
  label?: string
}

const DeleteItemButton = ({ onClick, label = 'Delete' }: DeleteItemButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg py-2 text-sm font-medium text-[var(--color-error)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors"
    >
      {label}
    </button>
  )
}

export default DeleteItemButton
