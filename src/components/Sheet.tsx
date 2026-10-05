import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

/** Modal built on the native <dialog>: focus trapping, Esc and backdrop for free. */
export function Sheet({ open, onClose, label, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // click on backdrop
      }}
    >
      {open && (
        <div className="sheet__body">
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            ×
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
