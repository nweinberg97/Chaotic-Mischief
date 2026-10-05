import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Content that only exists on paper. Rendered next to #root so the print
 * stylesheet can hide the whole app and print just this.
 */
export function PrintSheet({ title, children }: { title: string; children: ReactNode }) {
  return createPortal(
    <div className="print-only print-sheet">
      <h1 className="print-sheet__title">{title}</h1>
      {children}
    </div>,
    document.body,
  );
}
