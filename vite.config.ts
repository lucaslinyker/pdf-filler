/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Aplicação 100 % estática: sem backend, sem proxy, sem chamadas externas.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
