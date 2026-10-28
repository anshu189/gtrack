// Gtrak — component bundle source. Built with esbuild (classic JSX → window.React.createElement)
// and Tailwind CSS v4 (classes compiled into components/bundle.css; theme mapped onto tokens.css variables).
import { Icon, ICONS } from './icons.jsx';
export { WheelPicker, WheelPickerGroup } from './wheel.jsx';

const React = window.React;
const { useState, useMemo, useId } = React;

const cx = (...a) => a.filter(Boolean).join(' ');
const useControlled = (value, defaultValue, onChange) => {
  const [inner, setInner] = useState(defaultValue);
  const isCtl = value !== undefined;
  return [isCtl ? value : inner, (v) => { if (!isCtl) setInner(v); onChange && onChange(v); }];
};

const FOCUS = 'outline-none focus-visible:shadow-focus';
const PRESS = 'transition duration-150 ease-out active:scale-[0.97]';

export const MACROS = {
  protein: { label: 'Protein', icon: 'protein', text: 'text-protein', stroke: 'var(--protein)' },
  carbs: { label: 'Carbs', icon: 'carbs', text: 'text-carbs', stroke: 'var(--carbs)' },
  fat: { label: 'Fats', icon: 'fat', text: 'text-fat', stroke: 'var(--fat)' },
};

/* ───────────────────────── Atoms ───────────────────────── */

export function Button({ variant = 'primary', size = 'lg', icon, iconRight, block, className, children, ...rest }) {
  const v = {
    primary: 'bg-ink text-on-ink hover:bg-ink/85 active:bg-ink/80 disabled:bg-disabled disabled:text-on-ink',
    black: 'bg-black text-on-ink hover:bg-black/85 active:bg-black/80 disabled:bg-disabled',
    outline: 'bg-surface text-black border-2 border-black hover:bg-surface-2 active:bg-fill-subtle disabled:border-disabled disabled:text-disabled',
    secondary: 'bg-surface text-black border border-line-strong hover:bg-fill-subtle active:bg-fill disabled:opacity-40',
    ghost: 'bg-transparent text-ink-2 hover:text-black hover:bg-fill-subtle disabled:opacity-40',
  }[variant];
  const s = variant === 'ghost' ? 'h-9 px-3' : { md: 'h-12 px-6', lg: 'h-[58px] px-8' }[size];
  return (
    <button type="button" {...rest}
      className={cx('inline-flex items-center justify-center gap-2 rounded-pill btn-label whitespace-nowrap select-none cursor-pointer',
        'disabled:pointer-events-none', PRESS, FOCUS, v, s, block && 'w-full', className)}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  );
}

export function IconButton({ icon, label, variant = 'light', size = 40, iconSize = 20, className, ...rest }) {
  const v = {
    light: 'bg-surface-2 text-black hover:bg-fill-subtle active:bg-track',
    surface: 'bg-surface text-black shadow-float hover:bg-fill-subtle',
    glass: 'bg-glass text-on-ink backdrop-blur-xl hover:brightness-125',
    ghost: 'bg-transparent text-ink-2 hover:text-black hover:bg-fill-subtle',
  }[variant];
  return (
    <button type="button" aria-label={label} title={label} {...rest} style={{ width: size, height: size }}
      className={cx('inline-flex shrink-0 items-center justify-center rounded-pill cursor-pointer', PRESS, FOCUS, v, className)}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

export function Fab({ label = 'Log food', onClick, className }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className={cx('inline-flex size-16 shrink-0 items-center justify-center rounded-pill bg-ink text-on-ink shadow-float cursor-pointer',
        'transition duration-150 ease-out hover:scale-105 hover:bg-ink/90 active:scale-95', FOCUS, className)}>
      <Icon name="plus" size={30} />
    </button>
  );
}

export function Stepper({ value, defaultValue = 1, min = 0, max = 99, step = 1, onChange, label = 'Servings', className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  const btn = 'inline-flex size-9 items-center justify-center rounded-pill text-black hover:bg-fill-subtle active:bg-fill disabled:opacity-30 disabled:pointer-events-none cursor-pointer ' + FOCUS + ' ' + PRESS;
  return (
    <div role="group" aria-label={label} className={cx('inline-flex h-11 items-center gap-1 rounded-pill border border-line-strong bg-surface px-1', className)}>
      <button type="button" className={btn} aria-label="Decrease" disabled={v <= min} onClick={() => set(Math.max(min, v - step))}><Icon name="minus" size={18} /></button>
      <span className="min-w-8 text-center headline text-black tabular-nums" aria-live="polite">{v}</span>
      <button type="button" className={btn} aria-label="Increase" disabled={v >= max} onClick={() => set(Math.min(max, v + step))}><Icon name="plus" size={18} /></button>
    </div>
  );
}

export function Switch({ checked, defaultChecked = false, onChange, label, className }) {
  const [on, set] = useControlled(checked, defaultChecked, onChange);
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)}
      className={cx('relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-pill transition-colors duration-200 cursor-pointer', FOCUS,
        on ? 'bg-black' : 'bg-track hover:bg-line-strong', className)}>
      <span className={cx('absolute left-[2px] size-[27px] rounded-pill bg-surface shadow-float transition-transform duration-200 ease-out', on && 'translate-x-5')} />
    </button>
  );
}

export function SegmentedControl({ options = ['90D', '6M', '1Y', 'ALL'], value, defaultValue, onChange, label = 'Range', className }) {
  const [v, set] = useControlled(value, defaultValue ?? options[0], onChange);
  return (
    <div role="tablist" aria-label={label} className={cx('flex h-10 w-full items-center rounded-pill bg-fill p-1', className)}>
      {options.map((o) => (
        <button key={o} type="button" role="tab" aria-selected={v === o} onClick={() => set(o)}
          className={cx('h-full flex-1 rounded-pill chip transition-all duration-200 cursor-pointer', FOCUS,
            v === o ? 'bg-surface text-black shadow-card' : 'text-ink-2 hover:text-black')}>{o}</button>
      ))}
    </div>
  );
}

export function TextField({ label, hint, error, suffix, icon, action, className, id, ...rest }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && <label htmlFor={fid} className="footnote text-ink-2">{label}</label>}
      <div className={cx('group flex h-[63px] items-center gap-2 rounded-md border pl-4 transition duration-150',
        action ? 'pr-2' : 'pr-4',
        'bg-surface-2 border-transparent hover:border-track',
        'focus-within:bg-surface focus-within:border-black',
        error && 'border-protein bg-surface')}>
        {icon && <Icon name={icon} size={18} className="text-ink-3 group-focus-within:text-black" />}
        <input id={fid} aria-invalid={!!error} aria-describedby={hint || error ? fid + '-h' : undefined} {...rest}
          className="min-w-0 flex-1 bg-transparent subhead text-black placeholder:text-ink-3 outline-none" />
        {suffix && <span className="subhead text-ink-2">{suffix}</span>}
        {action && (
          <button type="button" onClick={action.onClick} disabled={action.disabled}
            className={cx('h-9 shrink-0 rounded-pill px-4 btn-label text-on-ink cursor-pointer', PRESS, FOCUS,
              action.disabled ? 'bg-disabled-2 pointer-events-none' : 'bg-black hover:bg-black/85')}>{action.label}</button>
        )}
      </div>
      {(error || hint) && (
        <p id={fid + '-h'} className={cx('footnote flex items-center gap-1.5', error ? 'text-black' : 'text-ink-2')}>
          {error && <span className="size-2 rounded-pill bg-protein" aria-hidden="true" />}{error || hint}
        </p>
      )}
    </div>
  );
}

export function Chip({ variant = 'neutral', icon, iconClass, className, children, ...rest }) {
  const v = {
    neutral: 'h-6 px-2 rounded-xs bg-fill-subtle text-black caption',
    outline: 'h-8 px-3 rounded-pill bg-surface-2 border border-line text-ink-2 caption',
    streak: 'h-9 px-3 rounded-pill bg-surface text-black headline shadow-float',
    success: 'min-h-7 px-3 py-1 rounded-sm bg-success-soft text-success-text footnote font-semibold',
    overlay: 'h-10 px-4 rounded-pill bg-surface text-black chip shadow-float',
    trend: 'h-6 px-1 text-success caption font-semibold',
    lang: 'h-7 px-3 rounded-[10px] bg-surface-2 text-black caption',
    muted: 'h-7 px-3 rounded-pill bg-track text-black chip',
    soft: 'h-11 px-5 rounded-pill bg-surface-2 text-black option',
  }[variant];
  return (
    <span {...rest} className={cx('inline-flex items-center gap-1 whitespace-nowrap', v, className)}>
      {icon && <Icon name={icon} size={variant === 'streak' ? 18 : 14} className={iconClass} />}
      {children}
    </span>
  );
}

export function ReactionChip({ emoji = 'flame', count = 0, selected, defaultSelected = false, onChange, label = 'Fire', className }) {
  const [on, set] = useControlled(selected, defaultSelected, onChange);
  const n = count - (defaultSelected ? 1 : 0) + (on ? 1 : 0); // `count` includes the viewer's default reaction
  return (
    <button type="button" aria-pressed={on} aria-label={label + ' ' + n} onClick={() => set(!on)}
      className={cx('inline-flex h-8 items-center gap-1.5 rounded-pill px-3 headline cursor-pointer', PRESS, FOCUS,
        on ? 'bg-surface text-black border-[1.5px] border-black' : 'bg-surface-2 text-black border-[1.5px] border-transparent hover:border-line-strong')}>
      <Icon name={emoji} size={16} className={emoji === 'flame' ? 'text-streak' : 'text-ink-2'} />
      <span className="tabular-nums">{n}</span>
    </button>
  );
}

export function Avatar({ initials = 'JD', src, size = 40, streak, crown, alt = '', className }) {
  return (
    <span className={cx('relative inline-flex shrink-0 flex-col items-center', className)}>
      <span style={{ width: size, height: size }}
        className={cx('inline-flex items-center justify-center overflow-hidden rounded-pill text-on-ink font-semibold',
          !src && 'bg-linear-to-br from-avatar-2 to-avatar', crown && 'ring-2 ring-streak ring-offset-2 ring-offset-surface')}>
        {src ? <img src={src} alt={alt} className="size-full object-cover" /> : <span style={{ fontSize: size * 0.36 }}>{initials}</span>}
      </span>
      {streak != null && (
        <span className="-mt-2.5 inline-flex h-5 items-center gap-0.5 rounded-pill bg-surface px-1.5 caption text-black shadow-card">
          <Icon name="flame" size={11} className="text-streak" />{streak}
        </span>
      )}
    </span>
  );
}

export function ProgressRing({ value = 0, max = 100, size = 72, stroke = 8, color = 'var(--ink)', track = 'var(--ring-track)', dashed, className, children, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <span className={cx('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}
      role="img" aria-label={label || `${Math.round(pct * 100)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke}
          strokeDasharray={dashed ? '3 4' : undefined} />
        {pct > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1)' }} />}
      </svg>
      <span className="relative inline-flex items-center justify-center">{children}</span>
    </span>
  );
}

export function ProgressBar({ value = 0, max = 100, className, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}
      className={cx('h-2 w-full overflow-hidden rounded-pill bg-track', className)}>
      <div className="h-full rounded-pill bg-ink transition-[width] duration-500" style={{ width: pct + '%' }} />
    </div>
  );
}

export function PageDots({ count = 3, active = 0, onChange, className }) {
  return (
    <div className={cx('flex items-center justify-center gap-1.5', className)}>
      {Array.from({ length: count }, (_, i) => (
        <button key={i} type="button" aria-label={`Page ${i + 1}`} aria-current={i === active} onClick={() => onChange && onChange(i)}
          className={cx('size-2 rounded-pill transition-colors cursor-pointer', FOCUS, i === active ? 'bg-ink' : 'bg-track hover:bg-line-strong')} />
      ))}
    </div>
  );
}

export function Photo({ src, alt = '', className, rounded = 'rounded-md' }) {
  return src
    ? <img src={src} alt={alt} className={cx('object-cover', rounded, className)} />
    : (
      <div role="img" aria-label={alt || 'Photo placeholder'}
        className={cx('grid place-items-center bg-linear-to-br from-fill to-track text-ink-3', rounded, className)}>
        <Icon name="image" size={24} />
      </div>
    );
}

export function MacroTile({ macro = 'protein', value = '8g', className }) {
  const m = MACROS[macro];
  return (
    <div className={cx('flex flex-col gap-1 rounded-md border border-line bg-surface px-3 py-2.5', className)}>
      <span className="flex items-center gap-1.5 caption text-ink-2">
        <span className="inline-grid size-5 place-items-center rounded-pill bg-surface-2"><Icon name={m.icon} size={12} className={m.text} /></span>
        {m.label}
      </span>
      <span className="headline text-black">{value}</span>
    </div>
  );
}

/* ───────────────────────── Molecules ───────────────────────── */

const TABS = [
  { id: 'home', label: 'Home', icon: 'home', activeIcon: 'home-fill' },
  { id: 'progress', label: 'Progress', icon: 'progress' },
  { id: 'groups', label: 'Groups', icon: 'groups' },
  { id: 'profile', label: 'Profile', avatar: 'JD' },
];

const BAR_TABS = [
  { id: 'home', label: 'Home', icon: 'home', activeIcon: 'home-fill' },
  { id: 'progress', label: 'Progress', icon: 'progress' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export function TabBar({ variant = 'pill', items, value, defaultValue = 'home', onChange, onAdd, className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  if (variant === 'bar') {
    const list = items || BAR_TABS;
    return (
      <div className={cx('relative', className)}>
        <Fab onClick={onAdd} className="absolute -top-8 right-[30px]" />
        <nav aria-label="Main" className="flex h-[88px] items-start gap-2 bg-surface px-6 pt-3 shadow-[0_-1px_0_var(--line)]">
          {list.map((t) => {
            const on = v === t.id;
            return (
              <button key={t.id} type="button" aria-current={on ? 'page' : undefined} onClick={() => set(t.id)}
                className={cx('flex w-[76px] flex-col items-center gap-1 rounded-sm py-1 caption transition-colors cursor-pointer', FOCUS,
                  on ? 'text-black font-semibold' : 'text-ink-2 hover:text-black')}>
                <Icon name={on && t.activeIcon ? t.activeIcon : t.icon} size={24} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }
  items = items || TABS;
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <nav aria-label="Main" className="flex h-16 flex-1 items-center gap-1 rounded-pill bg-surface p-1.5 shadow-float">
        {items.map((t) => {
          const on = v === t.id;
          return (
            <button key={t.id} type="button" aria-current={on ? 'page' : undefined} onClick={() => set(t.id)}
              className={cx('flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-pill caption transition-colors cursor-pointer', FOCUS,
                on ? 'bg-fill-strong text-black font-semibold' : 'text-ink-2 hover:text-black')}>
              {t.avatar
                ? <Avatar initials={t.avatar} size={24} />
                : <Icon name={on && t.activeIcon ? t.activeIcon : t.icon} size={22} />}
              {t.label}
            </button>
          );
        })}
      </nav>
      <Fab onClick={onAdd} />
    </div>
  );
}

const WEEK = [
  { d: 'Sun', n: 10, status: 'over' }, { d: 'Mon', n: 11, status: 'empty' }, { d: 'Tue', n: 12, status: 'met' },
  { d: 'Wed', n: 13, status: 'partial', pct: 0.5 }, { d: 'Thu', n: 14, status: 'future' }, { d: 'Fri', n: 15, status: 'future' }, { d: 'Sat', n: 16, status: 'future' },
];

const WEEK_L = [
  { d: 'W', n: 27, status: 'empty' }, { d: 'T', n: 28, status: 'empty' }, { d: 'F', n: 29, status: 'empty' },
  { d: 'S', n: 30, status: 'empty' }, { d: 'S', n: 31, status: 'empty' }, { d: 'M', n: 1, status: 'today' }, { d: 'T', n: 2, status: 'future' },
];

export function WeekStrip({ variant = 'rings', days, value, defaultValue, onChange, className }) {
  const letters = variant === 'letters';
  days = days || (letters ? WEEK_L : WEEK);
  const [v, set] = useControlled(value, defaultValue ?? (letters ? 1 : 13), onChange);
  if (letters) {
    return (
      <div role="tablist" aria-label="Week" className={cx('grid grid-cols-7', className)}>
        {days.map((day, i) => {
          const on = v === day.n;
          const future = day.status === 'future';
          return (
            <button key={i} type="button" role="tab" aria-selected={on} onClick={() => set(day.n)}
              className={cx('flex flex-col items-center gap-2 rounded-sm py-1 cursor-pointer', FOCUS)}>
              <span className={cx('grid size-8 place-items-center rounded-pill caption font-semibold transition',
                future ? 'text-ink-3' : 'text-black border-[1.5px] border-dashed',
                !future && (on ? 'border-black' : 'border-ink-3'), on && 'bg-surface')}>{day.d}</span>
              <span className={cx('headline font-medium tabular-nums', future ? 'text-ink-3' : 'text-black', on && 'font-semibold')}>{day.n}</span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div role="tablist" aria-label="Week" className={cx('grid grid-cols-7 gap-1', className)}>
      {days.map((day) => {
        const on = v === day.n;
        const future = day.status === 'future';
        const ring = { over: 'var(--day-over)', met: 'var(--day-met)', partial: 'var(--ink)' }[day.status];
        return (
          <button key={day.n} type="button" role="tab" aria-selected={on} onClick={() => set(day.n)}
            className={cx('flex flex-col items-center gap-1.5 rounded-md py-2 transition cursor-pointer', FOCUS,
              on ? 'bg-surface shadow-card' : 'hover:bg-surface/60', future && !on && 'opacity-50')}>
            <span className={cx('caption', on ? 'text-black font-semibold' : 'text-ink-2')}>{day.d}</span>
            <ProgressRing size={36} stroke={2} value={day.status === 'partial' ? day.pct : (ring ? 1 : 0)} max={1}
              color={ring} dashed={day.status === 'empty'} label={`${day.d} ${day.n}`}>
              <span className="chip text-black tabular-nums">{day.n}</span>
            </ProgressRing>
          </button>
        );
      })}
    </div>
  );
}

export function CalorieCard({ mode = 'left', eaten = 0, goal = 2583, className }) {
  const left = Math.max(0, goal - eaten);
  return (
    <div className={cx('flex items-center justify-between gap-4 rounded-lg bg-surface py-5 pl-8 pr-5 shadow-card', className)}>
      <div>
        <div className="flex items-baseline">
          <span className="stat-xl text-black tabular-nums">{mode === 'left' ? left : eaten}</span>
          {mode !== 'left' && <span className="title-2 font-normal text-ink-2">/{goal}</span>}
        </div>
        <p className="caption text-black mt-1">{mode === 'left' ? 'Calories left' : 'Calories eaten'}</p>
      </div>
      <ProgressRing value={eaten} max={goal} size={108} stroke={12} label={`${eaten} of ${goal} calories eaten`}>
        <Icon name="flame" size={20} className="text-black" />
      </ProgressRing>
    </div>
  );
}

export function MacroCard({ macro = 'protein', mode = 'left', eaten = 0, goal = 184, unit = 'g', className }) {
  const m = MACROS[macro];
  const name = m.label === 'Fats' ? 'Fat' : m.label;
  const shown = mode === 'left' ? Math.max(0, goal - eaten) : eaten;
  return (
    <div className={cx('flex flex-col rounded-lg bg-surface p-3 shadow-card', className)}>
      <div className="flex items-baseline">
        <span className="stat-md text-black tabular-nums">{shown}{mode === 'left' ? unit : ''}</span>
        {mode !== 'left' && <span className="footnote text-ink-2">/{goal}{unit}</span>}
      </div>
      <p className="caption text-black">{name} {mode === 'left' ? 'left' : 'eaten'}</p>
      <ProgressRing value={eaten} max={goal} size={68} stroke={6} color={m.stroke} className="mt-4 self-center" label={`${m.label} ${eaten} of ${goal}${unit}`}>
        <span className="grid size-7 place-items-center rounded-pill bg-surface-2"><Icon name={m.icon} size={14} className={m.text} /></span>
      </ProgressRing>
    </div>
  );
}

export function MacroInline({ protein, carbs, fat, className }) {
  return (
    <span className={cx('flex items-center gap-3 caption text-ink-2', className)}>
      {[['protein', protein], ['carbs', carbs], ['fat', fat]].map(([k, v]) => v != null && (
        <span key={k} className="inline-flex items-center gap-1"><Icon name={MACROS[k].icon} size={13} className={MACROS[k].text} />{v}</span>
      ))}
    </span>
  );
}

export function FoodLogCard({ name = 'Grilled Salmon', time = '12:37pm', calories = 550, protein = '35g', carbs = '40g', fat = '28g', image, onClick, className }) {
  return (
    <button type="button" onClick={onClick}
      className={cx('flex h-[112px] w-full overflow-hidden rounded-lg bg-surface-2 text-left transition hover:bg-fill-subtle cursor-pointer', PRESS, FOCUS, className)}>
      <Photo src={image} alt={name} rounded="rounded-none" className="h-full w-[112px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4">
        <div className="flex items-start justify-between gap-2">
          <span className="chip text-black truncate">{name}</span>
          <span className="footnote text-ink-2 shrink-0">{time}</span>
        </div>
        <span className="flex items-center gap-1 headline text-black"><Icon name="flame" size={16} />{calories} Calories</span>
        <MacroInline protein={protein} carbs={carbs} fat={fat} />
      </div>
    </button>
  );
}

export function IngredientRow({ name = 'Lettuce', calories = 20, amount = '1.5 cups', onClick, className }) {
  return (
    <button type="button" onClick={onClick}
      className={cx('flex h-12 w-full items-center justify-between rounded-sm bg-fill-subtle px-4 text-left transition hover:bg-fill cursor-pointer', FOCUS, className)}>
      <span className="chip text-black">{name} <span className="label text-ink-2">• {calories} cal</span></span>
      <span className="label text-ink-2">{amount}</span>
    </button>
  );
}

export function ScreenHeader({ title = 'Compare', variant = 'nav', onBack, trailing, overPhoto, className }) {
  if (variant === 'large') {
    return (
      <header className={cx('flex items-center justify-between', className)}>
        <h1 className="large-title text-black">{title}</h1>
        {trailing}
      </header>
    );
  }
  return (
    <header className={cx('grid grid-cols-[1fr_auto_1fr] items-center', className)}>
      <div className="justify-self-start">
        <IconButton icon="arrow-left" label="Back" variant={overPhoto ? 'glass' : 'light'} onClick={onBack} />
      </div>
      <h1 className={cx('headline', overPhoto ? 'text-on-ink' : 'text-black')}>{title}</h1>
      <div className="flex gap-2 justify-self-end">{trailing}</div>
    </header>
  );
}

export function WeightCard({ weight = 132.1, goal = 140, start = 125, unit = 'lbs', onLog, className }) {
  return (
    <div className={cx('flex flex-col overflow-hidden rounded-lg bg-surface shadow-card', className)}>
      <div className="flex flex-col items-center gap-1 px-5 pt-5 pb-4">
        <span className="label text-black">Your Weight</span>
        <span className="title-1 text-black tabular-nums">{weight} {unit}</span>
        <ProgressBar value={weight - start} max={goal - start} className="mt-2" label="Progress to goal" />
        <span className="label text-ink-2 mt-1">Goal <b className="font-semibold text-black">{goal} {unit}</b></span>
      </div>
      <button type="button" onClick={onLog}
        className={cx('flex h-12 items-center justify-between bg-ink px-5 btn-label text-on-ink transition hover:bg-ink/90 cursor-pointer', FOCUS)}>
        Log Weight <Icon name="arrow-right" size={18} />
      </button>
    </div>
  );
}

export function StreakCard({ days = 21, week = [true, true, false, false, false, false, false], className }) {
  const L = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div className={cx('flex flex-col items-center rounded-lg bg-surface px-4 pt-4 pb-5 shadow-card', className)}>
      <span className="relative grid h-[84px] w-20 place-items-start justify-center">
        <Icon name="flame" size={68} className="text-streak" />
        <span className="absolute bottom-0 stat-lg text-streak [-webkit-text-stroke:4px_var(--surface)] [paint-order:stroke_fill] tabular-nums">{days}</span>
      </span>
      <span className="headline text-streak mt-0.5">Day Streak</span>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {week.map((on, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            <span className="caption text-ink-2">{L[i]}</span>
            <span className={cx('grid size-5 place-items-center rounded-pill', on ? 'bg-streak text-on-ink' : 'bg-track')}>
              {on && <Icon name="check" size={12} />}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const SERIES = [120.5, 122.5, 122, 124.5, 123, 126.5, 130, 128, 126, 124.5, 123.8, 125.5, 127, 126.8, 128, 131.2, 128.8, 131, 134, 136, 134, 137.2, 138];
const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

const weekLabel = (i) => new Date(2025, 4, 27 + i * 7).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function WeightChartCard({ data = SERIES, labels, goalPct = 80, defaultIndex = 15, unit = 'lbs', message = 'Great job! Consistency is key, and you’re mastering it!', className }) {
  const [idx, setIdx] = useState(defaultIndex);
  const [range, setRange] = useState('6M');
  const W = 340, H = 180, padL = 30, padB = 22, padT = 8;
  const lo = 120, hi = 140;
  const x = (i) => padL + (i / (data.length - 1)) * (W - padL - 6);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const path = (from, to) => data.slice(from, to + 1).map((v, j) => {
    const i = from + j;
    if (j === 0) return `M${x(i)},${y(v)}`;
    const px = x(i - 1), py = y(data[i - 1]), cxp = (px + x(i)) / 2;
    return `C${cxp},${py} ${cxp},${y(v)} ${x(i)},${y(v)}`;
  }).join(' ');
  const past = path(0, idx), future = path(idx, data.length - 1);
  const area = `${future} L${x(data.length - 1)},${H - padB} L${x(idx)},${H - padB} Z`;
  const gid = useId().replace(/:/g, '');
  const tipX = Math.min(Math.max(x(idx), 60), W - 60);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - padL) / (W - padL - 6)) * (data.length - 1));
    setIdx(Math.max(0, Math.min(data.length - 1, i)));
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
    if (e.key === 'ArrowRight') setIdx((i) => Math.min(data.length - 1, i + 1));
  };
  return (
    <div className={cx('flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-card', className)}>
      <div className="flex items-center justify-between">
        <h3 className="title-2 text-black">Weight Progress</h3>
        <Chip variant="outline" icon="flag"><b className="font-semibold text-black">{goalPct}%</b> of goal</Chip>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className={cx('w-full touch-none cursor-crosshair rounded-xs', FOCUS)} tabIndex={0}
        role="img" aria-label={`Weight chart. Selected ${data[idx]} ${unit}. Use arrow keys to move.`}
        onPointerMove={onMove} onKeyDown={onKey}>
        <defs>
          <linearGradient id={'a' + gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ink)" stopOpacity="0.10" />
            <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={'g' + gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--success)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[140, 135, 130, 125, 120].map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--track)" strokeDasharray="3 4" />
            <text x={0} y={y(t) + 4} fontSize="11" fill="var(--ink-2)">{t}</text>
          </g>
        ))}
        {MONTHS.map((m, i) => <text key={m} x={padL + i * ((W - padL - 26) / 5)} y={H - 4} fontSize="11" fill="var(--ink-2)">{m}</text>)}
        <path d={area} fill={`url(#a${gid})`} />
        <path d={`${past} L${x(idx)},${H - padB} L${x(0)},${H - padB} Z`} fill={`url(#g${gid})`} />
        <path d={future} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={past} fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={x(idx)} x2={x(idx)} y1={y(data[idx])} y2={H - padB} stroke="var(--success)" strokeWidth="2" />
        <circle cx={x(idx)} cy={y(data[idx])} r="5" fill="var(--surface)" stroke="var(--success)" strokeWidth="2.5" />
        <g transform={`translate(${tipX - 54},${Math.max(0, y(data[idx]) - 50)})`}>
          <rect width="108" height="40" rx="10" fill="var(--ink)" />
          <text x="10" y="17" fontSize="12" fontWeight="600" fill="var(--on-ink)">{data[idx]} {unit}</text>
          <text x="10" y="32" fontSize="11" fill="var(--on-ink-muted)">{labels ? labels[idx] : weekLabel(idx)}</text>
        </g>
      </svg>
      <SegmentedControl value={range} onChange={setRange} />
      <Chip variant="success" className="justify-center text-center whitespace-normal">{message}</Chip>
    </div>
  );
}

export function FeedPost({ author = 'Cole Belvins', time = 'Today at 3:49pm', title = 'Grilled Chicken with Avocado, Garlic Spinach, and Toast', image,
  calories = 480, protein = '38g', carbs = '23g', fat = '24g', fire = 4, clap = 1, comments = 2, className }) {
  const macro = (label, icon, cls, v) => (
    <div className="flex flex-col">
      <span className={cx('flex items-center gap-1 caption', cls)}><Icon name={icon} size={12} />{label}</span>
      <span className="headline text-black">{v}</span>
    </div>
  );
  return (
    <article className={cx('flex flex-col rounded-lg bg-surface shadow-card', className)}>
      <div className="flex flex-col gap-3 p-4">
        <header className="flex items-center gap-3">
          <Avatar initials={author.split(' ').map((w) => w[0]).join('')} size={36} />
          <div className="flex-1 min-w-0">
            <p className="chip text-black">{author}</p>
            <p className="footnote text-ink-3">{time}</p>
          </div>
          <IconButton icon="more" label="More" variant="ghost" size={36} />
        </header>
        <h3 className="title-2 text-black">{title}</h3>
        <Photo src={image} alt={title} className="aspect-[4/3] w-full" />
        <div className="grid grid-cols-4 gap-2">
          {macro('Calories', 'flame', 'text-black', calories)}
          {macro('Protein', 'protein', 'text-protein', protein)}
          {macro('Carbs', 'carbs', 'text-carbs', carbs)}
          {macro('Fats', 'fat', 'text-fat', fat)}
        </div>
        <div className="flex items-center gap-2">
          <ReactionChip emoji="flame" count={fire} defaultSelected label="Fire" />
          <ReactionChip emoji="sparkle" count={clap} label="Applause" />
          <span className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-pill bg-surface-2 px-3 chip text-ink-2">
            <Icon name="comment" size={16} />{comments}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-line">
        <Button variant="ghost" icon="react" className="h-12 rounded-none rounded-bl-lg">React</Button>
        <Button variant="ghost" icon="comment" className="h-12 rounded-none rounded-br-lg">Comment</Button>
      </div>
    </article>
  );
}

const MODES = [{ id: 'food', label: 'Scan Food', icon: 'scan' }, { id: 'barcode', label: 'Barcode', icon: 'barcode' }, { id: 'label', label: 'Food Label', icon: 'label' }];

export function CameraControls({ value, defaultValue = 'food', onChange, onCapture, className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  return (
    <div className={cx('flex flex-col items-center gap-6', className)}>
      <div role="tablist" aria-label="Scan mode" className="grid w-full grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="tab" aria-selected={v === m.id} onClick={() => set(m.id)}
            className={cx('flex h-[60px] flex-col items-center justify-center gap-1 rounded-md caption transition cursor-pointer', PRESS, FOCUS,
              v === m.id ? 'bg-surface text-black' : 'bg-camera-tile text-on-ink/85 hover:text-on-ink hover:bg-camera-tile/80')}>
            <Icon name={m.icon} size={20} />{m.label}
          </button>
        ))}
      </div>
      <div className="flex w-full items-center justify-evenly">
        <IconButton icon="flash-off" label="Flash off" variant="glass" size={48} />
        <button type="button" aria-label="Take photo" onClick={onCapture}
          className={cx('grid size-[76px] place-items-center rounded-pill border-4 border-on-ink/35 cursor-pointer', FOCUS)}>
          <span className="size-[60px] rounded-pill bg-surface transition-transform duration-150 hover:scale-95 active:scale-90" />
        </button>
        <IconButton icon="image" label="Choose from library" variant="glass" size={48} />
      </div>
    </div>
  );
}

export function CalorieTile({ calories = 330, className }) {
  return (
    <div className={cx('flex items-center gap-4 rounded-lg bg-surface p-4 shadow-float', className)}>
      <span className="grid size-16 place-items-center rounded-md bg-surface-2"><Icon name="flame" size={24} className="text-black" /></span>
      <div>
        <p className="label text-ink-2">Calories</p>
        <p className="stat-lg text-black tabular-nums">{calories}</p>
      </div>
    </div>
  );
}

export function ActionBar({ secondary = 'Fix Results', primary = 'Done', onSecondary, onPrimary, className }) {
  return (
    <div className={cx('grid grid-cols-2 gap-3 bg-surface', className)}>
      <Button variant="secondary" size="md" icon="sparkle" onClick={onSecondary}>{secondary}</Button>
      <Button size="md" onClick={onPrimary}>{primary}</Button>
    </div>
  );
}

export function SettingRow({ label = 'Hide weight', checked, defaultChecked, onChange, className }) {
  return (
    <label className={cx('flex h-14 items-center justify-between gap-4 cursor-pointer', className)}>
      <span className="body text-black">{label}</span>
      <Switch checked={checked} defaultChecked={defaultChecked} onChange={onChange} label={label} />
    </label>
  );
}

/* ───────────────────────── Onboarding (v2, from the Figma set) ───────────────────────── */

export function StepHeader({ step = 3, total = 20, onBack, trailing, className }) {
  const pct = Math.max(0, Math.min(1, step / total));
  return (
    <div className={cx('flex h-10 items-center gap-[26px]', className)}>
      <IconButton icon="arrow-left" label="Back" onClick={onBack} />
      <div role="progressbar" aria-label="Onboarding progress" aria-valuenow={step} aria-valuemin={0} aria-valuemax={total}
        className="h-[3px] flex-1 overflow-hidden rounded-pill bg-track">
        <div className="h-full rounded-pill bg-black transition-[width] duration-500 ease-out" style={{ width: pct * 100 + '%' }} />
      </div>
      {trailing}
    </div>
  );
}

export function OptionCard({ label, description, icon, iconNode, selected, onClick, className, ...rest }) {
  return (
    <button type="button" role="radio" aria-checked={!!selected} onClick={onClick} {...rest}
      className={cx('flex w-full items-center gap-3 rounded-md px-4 text-left transition-colors duration-150 cursor-pointer', PRESS, FOCUS,
        description ? 'min-h-[90px]' : 'min-h-[69px]', (icon || iconNode) ? 'justify-start' : 'justify-center',
        selected ? 'bg-black text-on-ink' : 'bg-surface-2 text-black hover:bg-fill-subtle', className)}>
      {(icon || iconNode) && (
        <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-surface text-black">
          {iconNode || <Icon name={icon} size={18} />}
        </span>
      )}
      <span className="flex flex-col gap-0.5">
        <span className="option">{label}</span>
        {description && <span className={cx('footnote', selected ? 'text-on-ink' : 'text-black')}>{description}</span>}
      </span>
    </button>
  );
}

export function OptionGroup({ options = [{ label: 'Male' }, { label: 'Female' }, { label: 'Other' }], value, defaultValue = null, onChange, label = 'Options', className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  const onKey = (e) => {
    const i = options.findIndex((o) => (o.value ?? o.label) === v);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const n = options[(i + 1) % options.length]; set(n.value ?? n.label); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const n = options[(i - 1 + options.length) % options.length]; set(n.value ?? n.label); }
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey} className={cx('flex flex-col gap-3', className)}>
      {options.map((o) => {
        const key = o.value ?? o.label;
        return <OptionCard key={key} {...o} selected={v === key} onClick={() => set(key)} tabIndex={v === key || (v == null && o === options[0]) ? 0 : -1} />;
      })}
    </div>
  );
}

export function ContinueBar({ label = 'Continue', disabled, onClick, secondary, onSecondary, className }) {
  return (
    <div className={cx('relative bg-[#fafafa] px-4 pt-4 pb-3', className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-[72px] h-[72px] bg-linear-to-b from-transparent to-[#f0f0f0]/70" />
      <Button block disabled={disabled} onClick={onClick}>{label}</Button>
      {secondary && <button type="button" onClick={onSecondary} className={cx('mt-3 block w-full rounded-sm py-1 text-center btn-label text-black cursor-pointer', FOCUS)}>{secondary}</button>}
    </div>
  );
}

export function YesNo({ no = 'No', yes = 'Yes', onNo, onYes, className }) {
  return (
    <div className={cx('grid grid-cols-2 gap-6', className)}>
      <Button onClick={onNo}>{no}</Button>
      <Button onClick={onYes}>{yes}</Button>
    </div>
  );
}

export function UnitSwitch({ value, defaultValue = 'imperial', onChange, left = 'Imperial', right = 'Metric', className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  const metric = v === 'metric';
  return (
    <div className={cx('flex items-center justify-center gap-6', className)}>
      <button type="button" onClick={() => set('imperial')} className={cx('text-[22px] leading-7 font-semibold transition-colors cursor-pointer rounded-xs', FOCUS, metric ? 'text-ink-4' : 'text-black')}>{left}</button>
      <Switch checked={metric} onChange={(on) => set(on ? 'metric' : 'imperial')} label={`${left} or ${right}`} />
      <button type="button" onClick={() => set('metric')} className={cx('text-[22px] leading-7 font-semibold transition-colors cursor-pointer rounded-xs', FOCUS, metric ? 'text-black' : 'text-ink-4')}>{right}</button>
    </div>
  );
}

export function RulerPicker({ label = 'Gain weight', value, defaultValue = 77, min = 40, max = 150, step = 0.1, unit = 'kg', onChange, className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  const PX = 8.5; // px per step
  const drag = React.useRef(null);
  const clamp = (x) => Math.round(Math.max(min, Math.min(max, x)) / step) * step;
  const onDown = (e) => { drag.current = { x: e.clientX, v }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if (!drag.current) return; set(+clamp(drag.current.v - ((e.clientX - drag.current.x) / PX) * step).toFixed(1)); };
  const onUp = () => { drag.current = null; };
  const onKey = (e) => { if (e.key === 'ArrowLeft') set(+clamp(v - step).toFixed(1)); if (e.key === 'ArrowRight') set(+clamp(v + step).toFixed(1)); };
  const ticks = [];
  const first = Math.floor((v - 26 * step) / step);
  for (let i = first; i < first + 54; i++) {
    const val = i * step;
    if (val < min - 1e-9 || val > max + 1e-9) continue;
    const major = Math.abs(val - Math.round(val)) < 1e-6;
    ticks.push(<span key={i} className="absolute bottom-0 w-px bg-black/70" style={{ left: `calc(50% + ${((val - v) / step) * PX}px)`, height: major ? 44 : 30 }} />);
  }
  return (
    <div className={cx('flex flex-col items-center', className)}>
      <p className="body text-black">{label}</p>
      <p className="stat-lg text-black mt-4 tabular-nums">{v.toFixed(1)} {unit}</p>
      <div tabIndex={0} role="slider" aria-label={label} aria-valuenow={v} aria-valuemin={min} aria-valuemax={max} aria-valuetext={`${v.toFixed(1)} ${unit}`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onKeyDown={onKey}
        className={cx('relative mt-5 h-[70px] w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing', FOCUS)}>
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1/2 bg-[#e3e3e3]" />
        {ticks}
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-black" />
      </div>
    </div>
  );
}

export function SpeedSlider({ label = 'Gain weight speed per week', value, defaultValue = 1.0, min = 0.1, max = 1.5, step = 0.1, unit = 'kg', recommended = [0.6, 1.0], onChange, className }) {
  const [v, set] = useControlled(value, defaultValue, onChange);
  const pct = (v - min) / (max - min);
  const rec = v >= recommended[0] - 1e-9 && v <= recommended[1] + 1e-9;
  const mid = +((min + max) / 2).toFixed(1);
  return (
    <div className={cx('flex flex-col items-center', className)}>
      <p className="body text-black">{label}</p>
      <p className="stat-lg text-black mt-3 tabular-nums">{v.toFixed(1)} {unit}</p>
      <div className="mt-6 flex w-full justify-between px-1 text-accent" aria-hidden="true">
        <Icon name="speed-1" size={28} className={v < mid - 0.2 ? 'text-accent' : 'text-ink-4'} />
        <Icon name="speed-2" size={28} className={Math.abs(v - mid) <= 0.2 ? 'text-accent' : 'text-ink-4'} />
        <Icon name="speed-3" size={28} className={v > mid + 0.2 ? 'text-accent' : 'text-ink-4'} />
      </div>
      <div className="relative mt-5 h-7 w-full px-[13px]">
        <div className="absolute inset-x-[13px] top-1/2 h-1 -translate-y-1/2 rounded-pill bg-slider-track" />
        <div className="absolute left-[13px] top-1/2 h-1 -translate-y-1/2 rounded-pill bg-black" style={{ width: `calc((100% - 26px) * ${pct})` }} />
        <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+(+e.target.value).toFixed(1))} aria-label={label}
          className="gt-range absolute inset-0 h-full w-full cursor-pointer" />
      </div>
      <div className="mt-3 flex w-full justify-between body text-black tabular-nums">
        <span>{min} {unit}</span><span>{mid} {unit}</span><span>{max} {unit}</span>
      </div>
      <div className={cx('mt-8 grid h-[50px] w-full place-items-center rounded-md bg-linear-to-r from-[#f1f1f1] to-[#f5f7f9] body text-black transition-opacity duration-200', rec ? 'opacity-100' : 'opacity-0')} aria-live="polite">
        {rec ? 'Recommended' : ''}
      </div>
    </div>
  );
}

export function Stars({ count = 5, size = 16, className }) {
  return (
    <span className={cx('inline-flex gap-0.5 text-accent', className)} role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" size={size} className={i < count ? '' : 'text-track'} />)}
    </span>
  );
}

export function RatingCard({ score = '4.8', label = '100K+ App Ratings', className }) {
  return (
    <div className={cx('flex h-[93px] items-center justify-center gap-3 rounded-md border border-track bg-surface', className)}>
      <div className="flex flex-col items-center">
        <span className="flex items-center gap-2"><span className="stat-md text-black">{score}</span><Stars size={18} /></span>
        <span className="body text-ink-2">{label}</span>
      </div>
    </div>
  );
}

export function ReviewCard({ name = 'Jake Sullivan', initials = 'JS', avatar, rating = 5, quote = 'I lost 15 lbs in 2 months! I was about to go on Ozempic but decided to give this app a shot and it worked :)', className }) {
  return (
    <figure className={cx('flex flex-col gap-3 rounded-md bg-surface-2 p-5', className)}>
      <figcaption className="flex items-center gap-3">
        <Avatar initials={initials} src={avatar} size={32} />
        <span className="option flex-1 text-black">{name}</span>
        <Stars count={rating} size={15} />
      </figcaption>
      <blockquote className="body text-ink-2">{quote}</blockquote>
    </figure>
  );
}

export function SetupProgress({ percent = 18, title = 'We’re setting everything up for you', status = 'Customizing health plan…', items = ['Calories', 'Carbs', 'Protein', 'Fats', 'Health Score'], done = [], className }) {
  return (
    <div className={cx('flex flex-col items-center text-center', className)}>
      <p className="stat-xl text-black tabular-nums" aria-live="polite">{Math.round(percent)}%</p>
      <h2 className="mt-4 text-[28px] leading-[32px] font-semibold text-black">{title}</h2>
      <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="mt-8 h-2.5 w-full overflow-hidden rounded-pill bg-track">
        <div className="h-full rounded-pill bg-linear-to-r from-protein to-fat transition-[width] duration-500 ease-out" style={{ width: percent + '%' }} />
      </div>
      <p className="body mt-4 text-ink-2">{status}</p>
      <div className="mt-8 w-full rounded-md bg-surface-2 p-4 text-left">
        <p className="option text-black">Daily recommendation for</p>
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((it) => (
            <li key={it} className="flex items-center gap-2 body text-black">
              {done.includes(it) ? <Icon name="check-circle" size={16} /> : <span className="mx-[5px] size-1.5 rounded-pill bg-black" aria-hidden="true" />}{it}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PlanMacroCard({ label = 'Calories', icon = 'flame', iconClass = 'text-black', value = 2583, max = 3000, unit = '', color = 'var(--ink)', onEdit, className }) {
  return (
    <div className={cx('relative flex flex-col rounded-sm bg-surface p-3 shadow-card', className)}>
      <span className="flex items-center gap-2 headline font-medium text-black">
        <span className="grid size-6 place-items-center rounded-pill bg-surface-2"><Icon name={icon} size={13} className={iconClass} /></span>{label}
      </span>
      <ProgressRing value={value} max={max} size={66} stroke={5} color={color} className="mx-auto mt-3 mb-1" label={`${label} ${value}${unit}`}>
        <span className="headline text-black tabular-nums">{value}<span className="caption align-baseline">{unit}</span></span>
      </ProgressRing>
      <IconButton icon="pencil" label={`Edit ${label}`} variant="ghost" size={28} iconSize={14} onClick={onEdit} className="absolute right-2 bottom-2 text-black" />
    </div>
  );
}

export function PlanSummary({ calories = 2583, carbs = 300, protein = 184, fat = 71, className }) {
  return (
    <section className={cx('rounded-lg bg-surface-2 p-5', className)}>
      <h3 className="title-2 text-black">Daily recommendation</h3>
      <p className="body text-ink-3">You can edit this anytime</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <PlanMacroCard label="Calories" icon="flame" value={calories} max={calories * 1.35} color="var(--ink)" />
        <PlanMacroCard label="Carbs" icon="carbs" iconClass="text-carbs" value={carbs} max={carbs * 1.8} unit="g" color="var(--carbs)" />
        <PlanMacroCard label="Protein" icon="protein" iconClass="text-protein" value={protein} max={protein * 1.6} unit="g" color="var(--protein)" />
        <PlanMacroCard label="Fats" icon="fat" iconClass="text-fat" value={fat} max={fat * 1.9} unit="g" color="var(--fat)" />
      </div>
    </section>
  );
}

export function NoticeCard({ icon = 'bell', children = 'You can switch apps or turn off your phone. We’ll notify you when the analysis is done.', onClose, className }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div role="status" className={cx('flex items-center gap-3 rounded-md bg-surface px-4 py-3 shadow-card', className)}>
      <Icon name={icon} size={18} className="shrink-0 text-ink-2" />
      <p className="footnote flex-1 font-normal text-ink-2">{children}</p>
      <IconButton icon="close" label="Dismiss" variant="ghost" size={28} iconSize={16} onClick={() => { setOpen(false); onClose && onClose(); }} />
    </div>
  );
}

export function OnboardingLayout({ step = 3, total = 20, title = 'Choose your Gender', subtitle = 'This will be used to calibrate your custom plan.', children, cta = 'Continue', ctaDisabled, onContinue, onBack, trailing, className }) {
  return (
    <div className={cx('relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-canvas', className)}>
      <div className="h-[54px] shrink-0" aria-hidden="true" />
      <div className="px-4 pt-3"><StepHeader step={step} total={total} onBack={onBack} trailing={trailing} /></div>
      <div className="flex flex-1 flex-col px-6 pt-[7px]">
        <h1 className="large-title text-black">{title}</h1>
        {subtitle && <p className="body mt-5 max-w-[270px] text-black">{subtitle}</p>}
        <div className="flex flex-1 flex-col justify-center pb-1">{children}</div>
      </div>
      <ContinueBar label={cta} disabled={ctaDisabled} onClick={onContinue} className="pb-[50px]" />
    </div>
  );
}

export { Icon, ICONS };
