import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'
import { Icon } from './Icon'

/**
 * Jump back to the top of a long screen.
 *
 * Intentional addition to Gtrak DS: the DS has no scroll affordance, because
 * it was measured on short phone screens. Gtrak's Dashboard is long enough
 * that returning to the date controls means a lot of swiping.
 *
 * Shaped like the DS Fab (ink circle, shadow-float) but smaller, so it reads
 * as secondary to a real action. It sits above the floating tab pill.
 */
const SHOW_AFTER_FRACTION = 0.7

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * SHOW_AFTER_FRACTION)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-[96px] right-[30px] z-40 grid size-11 place-items-center rounded-pill',
        'bg-ink text-on-ink shadow-float',
        'transition-[opacity,transform] duration-200',
        visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        PRESS,
        FOCUS,
      )}
    >
      <Icon name="arrow-up" size={20} />
    </button>
  )
}
