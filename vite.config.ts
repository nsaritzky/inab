/// <reference types="vitest">
import solid from "solid-start/vite"
import { defineConfig } from "vite"
import devtools from "solid-devtools/vite"

export default defineConfig({
  test: { environment: "jsdom", transformMode: { web: [/\.[jt]sx?$/] } },
  plugins: [solid({ ssr: true }), devtools()],
})
