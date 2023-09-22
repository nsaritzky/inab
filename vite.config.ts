/// <reference types="vitest">
import solid from "solid-start/vite"
import { defineConfig } from "vite"
import devtools from "solid-devtools/vite"

export default defineConfig({
  // test: {
  //   environment: "jsdom",
  //   transformMode: { web: [/\.[jt]sx?$/] },
  //   deps: {
  //     inline: [/solid-js/, /@solidjs/],
  //   },
  // },
  plugins: [solid(), devtools({ autoname: true })],
  optimizeDeps: {
    exclude: ["@modular-forms/solid"],
  },
  ssr: {
    external: ["@prisma/client"],
    noExternal: ["@kobalte/core", "@modular-forms/solid"],
  },
})
