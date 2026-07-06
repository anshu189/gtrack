import { create } from 'zustand';

type State = {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
};

export const useAppStore = create<State>((set: any) => ({
  theme: 'light',
  setTheme: (t: 'light' | 'dark') => set({ theme: t }),
}));

export default useAppStore;
