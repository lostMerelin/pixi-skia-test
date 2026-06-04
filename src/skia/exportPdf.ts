import * as PIXI from 'pixi.js-legacy';

import { SkiaRenderer } from './SkiaRenderer';

type CanvasKitWithOptionalPdf = any;

export function canExportPdf(CanvasKit: CanvasKitWithOptionalPdf): boolean {
  return (
    typeof CanvasKit.MakePDFDocument === 'function' ||
    typeof CanvasKit.MakeSkPDFDocument === 'function'
  );
}

export function exportContainerToPdf(
  CanvasKit: CanvasKitWithOptionalPdf,
  container: PIXI.Container,
  width: number,
  height: number,
): void {
  if (!canExportPdf(CanvasKit)) {
    throw new Error(
      'Skia PDF backend is not available in the current CanvasKit WASM build.',
    );
  }

  /**
   * This branch will be implemented after connecting a custom CanvasKit build
   * with Skia PDF backend enabled.
   *
   * Expected flow:
   * 1. Create PDF document through CanvasKit.MakePDFDocument or MakeSkPDFDocument.
   * 2. Begin page.
   * 3. Render PIXI.Container into the PDF page canvas using the same vector commands.
   * 4. End page.
   * 5. Save Uint8Array as application/pdf.
   */
  throw new Error('PDF export is not implemented for this CanvasKit build yet.');

  // Пример будущей структуры:
  //
  // const pdfDocument = CanvasKit.MakePDFDocument();
  // const pdfCanvas = pdfDocument.beginPage(width, height);
  //
  // const pdfRenderer = new SkiaRenderer(CanvasKit, {
  //   getCanvas: () => pdfCanvas,
  //   flush: () => undefined,
  // });
  //
  // pdfRenderer.render(container);
  //
  // pdfDocument.endPage();
  // const pdfBytes = pdfDocument.close();
  //
  // downloadPdf(pdfBytes, 'pixi-skia-export.pdf');
}

export function downloadPdf(
  pdfBytes: Uint8Array,
  fileName = 'pixi-skia-export.pdf',
): void {
  const arrayBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;

  const blob = new Blob([arrayBuffer], {
    type: 'application/pdf',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}