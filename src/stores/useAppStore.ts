import create from 'zustand';

type State = {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
};

export const useAppStore = create<State>((set) => ({
  theme: 'light',
  setTheme: (t) => set({ theme: t }),
}));

export default useAppStore;
