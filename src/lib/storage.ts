export const save = (key: string, value: any) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
};

export const load = (key: string) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { console.error(e); return null; }
};
