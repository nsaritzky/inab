/// <reference types="vitest" />
/// <reference types="vite/client" />
// 👆 do not forget to add the references above
import { defineConfig } from "vite"
import solid from "solid-start/vite"
export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  test: {
    environment: "jsdom",
    globals: true,
    transformMode: { web: [/\.[jt]sx?$/] },
    deps: {
      registerNodeLoader: false,
    },
  },
  resolve: { conditions: ["development", "browser"] },
})
