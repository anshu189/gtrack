import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore: vite-tsconfig-paths has no bundled types in this environment
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
})
