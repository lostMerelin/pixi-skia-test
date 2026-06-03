import CanvasKitInit from 'canvaskit-wasm/bin/canvaskit.js';
import wasmUrl from 'canvaskit-wasm/bin/canvaskit.wasm?url';

export async function initSkia() {
  const CanvasKit = await CanvasKitInit({
    locateFile: () => wasmUrl,
  });

  return CanvasKit;
}