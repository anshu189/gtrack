/*!
 * Gtrak WheelPicker — motion model ported from @ncdai/react-wheel-picker v1.2.3
 * https://github.com/ncdai/react-wheel-picker
 * MIT License · Copyright (c) 2025 ncdai
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
 * notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
// Same geometry, easing, inertia and overscroll constants as the reference; Gtrak skin and API on top.
const React = window.React;
const { useRef, useState, useEffect, useMemo, useCallback, useContext, createContext } = React;

const cx = (...a) => a.filter(Boolean).join(' ');
const OVERSCROLL_RESISTANCE = 0.3;   // drag past the ends moves at 30%
const MAX_VELOCITY = 30;             // items / second, fling cap
const BOUNCE_DECEL = 10;             // items / s², returning from overscroll
const easeOutCubic = (t) => Math.pow(t - 1, 3) + 1;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
const textOf = (o) => (o.textValue != null ? o.textValue : typeof o.label === 'string' ? o.label : String(o.value));

// next enabled index from `from` in direction `dir` (falls back to the other direction)
function nextEnabled(from, dir, list, infinite) {
  if (!list.length || !list.some((o) => !o.disabled)) return from;
  const walk = (d) => {
    let i = from;
    for (let n = 0; n < list.length; n++) {
      i += d;
      if (infinite) i = ((i % list.length) + list.length) % list.length;
      else if (i < 0 || i >= list.length) return -1;
      if (!list[i]?.disabled) return i;
    }
    return -1;
  };
  let r = walk(dir);
  if (r === -1) r = walk(-dir);
  return r === -1 ? from : r;
}

/* Group: shared 3D wrapper + ←/→ focus between columns */
const GroupCtx = createContext(null);

export function WheelPickerGroup({ children, className, style }) {
  const list = useRef([]);
  const api = useMemo(() => ({
    add(el) { if (el && !list.current.includes(el)) list.current.push(el); },
    remove(el) { list.current = list.current.filter((x) => x !== el); },
    move(el, dir) {
      const els = list.current.filter((x) => x.isConnected)
        .sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
      const i = els.indexOf(el);
      if (i === -1 || els.length < 2) return;
      els[(i + dir + els.length) % els.length].focus();
    },
  }), []);
  return (
    <GroupCtx.Provider value={api}>
      <div data-gt-wheel-wrap="" className={cx('gt-wheel-wrap', className)} style={style}>{children}</div>
    </GroupCtx.Provider>
  );
}

export function WheelPicker(props) {
  const group = useContext(GroupCtx);
  const picker = <WheelColumn {...props} />;
  return group ? picker : <WheelPickerGroup>{picker}</WheelPickerGroup>;
}

function WheelColumn({
  options: optionsProp, items, value: valueProp, defaultValue, onChange, onValueChange,
  infinite = false, visibleCount = 20, dragSensitivity = 3, scrollSensitivity = 5, itemHeight = 30,
  label = 'Picker', width, className,
}) {
  const group = useContext(GroupCtx);
  const options = useMemo(() => optionsProp || (items || []).map((it) => ({ value: it, label: it })), [optionsProp, items]);
  const firstEnabled = useMemo(() => (options.find((o) => !o.disabled) || options[0] || {}).value, [options]);

  // controllable value
  const [inner, setInner] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const current = (controlled ? valueProp : inner) ?? firstEnabled;
  const cb = useRef(); cb.current = onValueChange || onChange;
  const setValue = useCallback((v) => {
    if (controlled) { if (v !== valueProp) cb.current && cb.current(v); }
    else setInner((prev) => { if (prev !== v) cb.current && cb.current(v); return v; });
  }, [controlled, valueProp]);

  // infinite: repeat the list until it can fill half the ring
  const list = useMemo(() => {
    if (!infinite || !options.length) return options;
    const out = []; const half = Math.ceil(visibleCount / 2);
    while (out.length < half) out.push(...options);
    return out;
  }, [options, infinite, visibleCount]);

  // geometry
  const H = itemHeight;
  const halfH = H * 0.5;
  const step = 360 / visibleCount;                               // degrees per item
  const radius = H / Math.tan((step * Math.PI) / 180);
  const containerH = Math.round(radius * 2 + H * 0.25);
  const quarter = visibleCount >> 2;                             // items visible on each side
  const decel = dragSensitivity * 10;                            // items / s²

  const root = useRef(null), ring = useRef(null), lens = useRef(null);
  const scroll = useRef(0), raf = useRef(0), dragging = useRef(false), lastWheel = useRef(0), dir = useRef(1);
  const drag = useRef({ startY: 0, samples: [], touchScroll: 0, isClick: true });
  const abort = useRef(null);
  const [focused, setFocused] = useState(false);

  const wrap = (i) => ((i % list.length) + list.length) % list.length;

  // paint the wheel at a (fractional) scroll position
  const paint = (pos) => {
    const p = infinite ? wrap(pos) : pos;
    if (ring.current) {
      ring.current.style.transform = `translateZ(${-radius}px) rotateX(${step * p}deg)`;
      ring.current.childNodes.forEach((li) => {
        const d = Math.abs(Number(li.dataset.index) - p);
        li.style.visibility = d > quarter ? 'hidden' : 'visible';
      });
    }
    if (lens.current) lens.current.style.transform = `translateY(${-p * H}px)`;
    return p;
  };
  const stop = () => cancelAnimationFrame(raf.current);
  const animate = (from, to, seconds, done) => {
    if (from === to || seconds === 0) { paint(from); return; }
    const t0 = performance.now(); const dist = to - from;
    const tick = (now) => {
      const t = (now - t0) / 1000;
      if (t < seconds) { scroll.current = paint(from + easeOutCubic(t / seconds) * dist); raf.current = requestAnimationFrame(tick); }
      else { stop(); scroll.current = paint(to); done && done(); }
    };
    requestAnimationFrame(tick);
  };
  const commit = (pos, d) => {
    const i = wrap(pos) | 0;
    const idx = infinite ? i : Math.min(Math.max(i, 0), list.length - 1);
    if (!infinite && idx !== pos) return;
    if (list[idx]?.disabled) {
      const delta = nextEnabled(idx, d != null ? d : dir.current, list, infinite) - scroll.current;
      if (delta !== 0) { scrollBy(delta); return; }
    }
    scroll.current = paint(idx);
    const o = list[scroll.current];
    if (o && !o.disabled) setValue(o.value);
  };
  const scrollBy = (delta) => {
    const from = scroll.current;
    let to = from + delta;
    to = infinite ? Math.round(to) : clamp(Math.round(to), 0, list.length - 1);
    const dist = Math.abs(to - from);
    if (dist === 0) return;
    const d = delta > 0 ? 1 : -1; dir.current = d;
    stop();
    animate(from, to, Math.sqrt(dist / scrollSensitivity), () => commit(scroll.current, d));
  };
  const jumpTo = (v) => {
    let i = list.findIndex((o) => o.value === v);
    if (i === -1) return;
    if (list[i]?.disabled) i = nextEnabled(i, 1, list, infinite);
    stop(); commit(i);
  };

  // click → which row was hit, using the projected (cosine-squashed) row heights
  const rowBands = useMemo(() => {
    const bands = []; let y = 0;
    for (let r = quarter - 1; r >= -quarter + 1; --r) {
      const h = H * Math.cos((r * step * Math.PI) / 180);
      bands.push([y, y + h]); y += h;
    }
    return bands;
  }, [step, H, quarter]);
  const clickAt = (clientY) => {
    const el = root.current; if (!el) return;
    const y = clientY - el.getBoundingClientRect().top;
    const row = rowBands.findIndex(([a, b]) => y >= a && y <= b);
    if (row === -1) return;
    const delta = -(quarter - row - 1);
    const target = scroll.current + delta;
    const idx = infinite ? wrap(target) : clamp(target, 0, list.length - 1);
    if (!list[idx]?.disabled) scrollBy(delta);
  };

  const pointY = (e) => (e.touches ? e.touches[0]?.clientY : e.clientY) || 0;
  const onDragMove = (e) => {
    if (!dragging.current && !(root.current && root.current.contains(e.target))) return;
    if (e.cancelable) e.preventDefault();
    if (!list.length) return;
    const y = pointY(e); const s = drag.current;
    if (s.isClick && Math.abs(y - s.startY) > 5) s.isClick = false;
    s.samples.push([y, Date.now()]); if (s.samples.length > 5) s.samples.shift();
    let pos = scroll.current + (s.startY - y) / H;
    if (infinite) pos = wrap(pos);
    else { const n = list.length; if (pos < 0) pos *= OVERSCROLL_RESISTANCE; else if (pos > n) pos = n + (pos - n) * OVERSCROLL_RESISTANCE; }
    s.touchScroll = paint(pos);
  };
  const startDrag = (e) => {
    dragging.current = true;
    const ac = new AbortController(); abort.current = ac;
    const opt = { signal: ac.signal, passive: false };
    root.current && root.current.addEventListener('touchmove', onDragMove, opt);
    document.addEventListener('mousemove', onDragMove, opt);
    const y = pointY(e);
    drag.current = { startY: y, samples: [[y, Date.now()]], touchScroll: scroll.current, isClick: true };
    stop();
  };
  const fling = (v) => {
    const from = scroll.current; let to = from; let a = v > 0 ? -decel : decel; let t = 0;
    const d = v > 0 ? 1 : -1; dir.current = d;
    if (infinite) {
      t = Math.abs(v / a); to = Math.round(from + v * t + 0.5 * a * t * t);
    } else if (from < 0 || from > list.length - 1) {           // released in overscroll: settle back
      const edge = clamp(from, 0, list.length - 1); a = BOUNCE_DECEL;
      t = Math.sqrt(Math.abs((from - edge) / a)); to = edge;
    } else {
      t = Math.abs(v / a);
      to = clamp(Math.round(from + v * t + 0.5 * a * t * t), 0, list.length - 1);
      t = Math.sqrt(Math.abs((to - from) / a));
    }
    animate(from, to, t, () => commit(scroll.current, d));
    commit(scroll.current, d);
  };
  const endDrag = () => {
    try {
      abort.current && abort.current.abort(); abort.current = null;
      const s = drag.current;
      if (s.isClick) { clickAt(s.startY); return; }
      let v = 0; const n = s.samples.length;
      if (n > 1) {
        const [y1, t1] = s.samples[n - 2]; const [y2, t2] = s.samples[n - 1]; const dt = t2 - t1;
        if (dt > 0) { const raw = (((y1 - y2) / H) * 1000) / dt; v = Math.min(Math.abs(raw), MAX_VELOCITY) * (raw > 0 ? 1 : -1); }
      }
      scroll.current = s.touchScroll != null ? s.touchScroll : scroll.current;
      fling(v);
    } finally { dragging.current = false; }
  };

  // latest handlers for the stable native listeners
  const h = useRef({}); h.current = { startDrag, endDrag, scrollBy };
  useEffect(() => {
    const el = root.current; if (!el) return;
    const inside = (e) => el.contains(e.target) || e.target === el;
    const down = (e) => { if ((dragging.current || inside(e)) && e.cancelable) { e.preventDefault(); if (list.length) h.current.startDrag(e); } };
    const up = (e) => { if (!list.length) return; if ((dragging.current || inside(e)) && e.cancelable) { e.preventDefault(); h.current.endDrag(); } };
    const wheel = (e) => {
      if (!list.length || !(dragging.current || inside(e)) || !e.cancelable) return;
      e.preventDefault();
      const now = Date.now(); if (now - lastWheel.current < 100) return;   // one row per 100 ms
      const s = Math.sign(e.deltaY);
      if (s) { lastWheel.current = now; dir.current = s; h.current.scrollBy(s); }
    };
    const o = { passive: false };
    el.addEventListener('touchstart', down, o); el.addEventListener('touchend', up, o); el.addEventListener('wheel', wheel, o);
    document.addEventListener('mousedown', down, o); document.addEventListener('mouseup', up, o);
    return () => {
      el.removeEventListener('touchstart', down); el.removeEventListener('touchend', up); el.removeEventListener('wheel', wheel);
      document.removeEventListener('mousedown', down); document.removeEventListener('mouseup', up);
    };
  }, [list.length]);

  useEffect(() => { jumpTo(current); }, [current, list]);   // external value → snap
  useEffect(() => { const el = root.current; group && group.add(el); return () => group && group.remove(el); }, [group]);

  // keyboard + type-ahead
  const typed = useRef(''); const typedT = useRef(null);
  const onKeyDown = (e) => {
    if (!list.length) return;
    const stepKey = (d) => {
      e.preventDefault();
      const cur = Math.round(scroll.current); let t = cur + d;
      if (!infinite && ((d === -1 && t < 0) || (d === 1 && t >= list.length))) return;
      const idx = infinite ? wrap(t) : t;
      if (list[idx]?.disabled) t = cur + d + (nextEnabled(idx, d, list, infinite) - idx);
      if (t - cur !== 0) scrollBy(t - cur);
    };
    const edge = (end) => {
      if (infinite) return; e.preventDefault();
      let i = end ? list.length - 1 : 0;
      if (list[i]?.disabled) i = nextEnabled(i, end ? -1 : 1, list, false);
      const d = i - scroll.current; if (d !== 0) scrollBy(d);
    };
    const map = { ArrowUp: () => stepKey(-1), ArrowDown: () => stepKey(1), Home: () => edge(false), End: () => edge(true),
      ArrowLeft: () => { e.preventDefault(); group && group.move(root.current, -1); },
      ArrowRight: () => { e.preventDefault(); group && group.move(root.current, 1); } };
    if (map[e.key]) return map[e.key]();
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); clearTimeout(typedT.current); typed.current += e.key.toLowerCase();
      const q = typed.current; const needle = q.length > 1 && [...q].every((c) => c === q[0]) ? q[0] : q;
      const enabled = list.map((o, i) => [o, i]).filter(([o]) => !o.disabled);
      const curI = Math.max(0, enabled.findIndex(([, i]) => i === Math.round(scroll.current)));
      let hit = -1;
      if (needle.length === 1) { for (let k = 1; k <= enabled.length; k++) { const j = (curI + k) % enabled.length; if (textOf(enabled[j][0]).toLowerCase().startsWith(needle)) { hit = j; break; } } }
      else hit = enabled.findIndex(([o]) => textOf(o).toLowerCase().startsWith(needle));
      if (hit !== -1) scrollBy(enabled[hit][1] - Math.round(scroll.current));
      typedT.current = setTimeout(() => { typed.current = ''; }, 500);
    }
  };

  const ringItems = useMemo(() => {
    const li = (o, i, deg) => (
      <li key={i} data-index={i} data-disabled={o.disabled || undefined} className="gt-wheel-option"
        style={{ top: -halfH, height: H, lineHeight: `${H}px`, transform: `rotateX(${deg}deg) translateZ(${radius}px)`, visibility: 'hidden' }}>{o.label}</li>
    );
    const out = list.map((o, i) => li(o, i, -step * i));
    if (infinite) for (let n = 0; n < quarter; ++n) {
      const before = -n - 1, after = n + list.length;
      out.unshift(li(list[list.length - n - 1], before, step * (n + 1)));
      out.push(li(list[n], after, -step * after));
    }
    return out;
  }, [list, H, halfH, radius, step, quarter, infinite]);

  const lensItems = useMemo(() => {
    const li = (o, k) => <li key={k} data-disabled={o.disabled || undefined} className="gt-wheel-lens-item" style={{ height: H }}>{o.label}</li>;
    const out = list.map((o, i) => li(o, i));
    if (infinite && list.length) { out.unshift(li(list[list.length - 1], 'start')); out.push(li(list[0], 'end')); }
    return out;
  }, [list, H, infinite]);

  return (
    <div ref={root} data-gt-wheel="" role="listbox" aria-label={label} tabIndex={0}
      aria-activedescendant={undefined} onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); typed.current = ''; }}
      className={cx('gt-wheel', className)} style={{ height: containerH, ...(width ? { flex: `0 0 ${width}px`, width } : null) }}>
      <ul ref={ring} className="gt-wheel-ring" aria-hidden="true">{ringItems}</ul>
      <div className="gt-wheel-lens" data-focused={focused || undefined} style={{ height: H, lineHeight: `${H}px` }}>
        <ul ref={lens} className="gt-wheel-lens-list" style={{ top: infinite ? -H : undefined }}>{lensItems}</ul>
      </div>
      <span className="sr-only" aria-live="polite">{String((options.find((o) => o.value === current) || {}).textValue ?? current ?? '')}</span>
    </div>
  );
}
