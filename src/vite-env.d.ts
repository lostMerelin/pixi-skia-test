/// <reference types="vite/client" />

declare module 'canvaskit-wasm/bin/canvaskit.js';

declare module '*.wasm?url' {
  const src: string;
  export default src;
}