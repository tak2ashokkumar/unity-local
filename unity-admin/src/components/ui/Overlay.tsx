import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { Button, IconAction } from './primitives';

function useEscape(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
}

/*
 * Every overlay is portaled to <body>.
 *
 * This is NOT cosmetic. Pages render inside `.content-fade`, whose fadeUp
 * animation uses `animation-fill-mode: both` and ends on `transform:
 * translateY(0)` - a transform value, not `none`. An ancestor with a transform
 * becomes the containing block for `position: fixed` descendants, so an overlay
 * rendered in place was sized against the page content box instead of the
 * viewport: `inset: 0` resolved to the full scroll height of the list, pushing a
 * centered dialog (and its action bar) below the fold. Portaling to <body> puts
 * the overlay outside every transformed ancestor, so `position: fixed` means the
 * viewport again.
 */
function OverlayPortal({ children }: { children: React.ReactNode }) {
  // document.body always exists by the time React renders in the browser.
  return createPortal(children, document.body);
}

/*
 * Click-outside-to-dismiss.
 *
 * The handler belongs on `.modal`, NOT on `.overlay-backdrop`. Both are
 * `position: fixed; inset: 0` at the same z-index, and `.modal` is painted after
 * the backdrop, so it covers it completely - a click in the dimmed area always
 * hit-tests to `.modal` and a handler on the backdrop could never fire
 * (verified with document.elementFromPoint across the dimmed area).
 *
 * The mousedown latch stops a drag that STARTS inside the card (selecting text in
 * a field) and ends outside it from closing the dialog and discarding the edit:
 * that gesture delivers its click event to the common ancestor, which is `.modal`.
 */
function useOverlayDismiss(onClose: () => void) {
  const pressedOverlay = React.useRef(false);
  return {
    onMouseDown: (e: React.MouseEvent) => {
      pressedOverlay.current = e.target === e.currentTarget;
    },
    onClick: (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && pressedOverlay.current) onClose();
    },
  };
}

// While an overlay is open the page behind it must not scroll - otherwise the
// wheel over the backdrop scrolls the list instead of the dialog.
function useScrollLock() {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}

/*
 * Centered form modal - the shape the legacy panel used (master_modal.html, whose
 * fields are laid out col-md-6 i.e. two per row). It is deliberately WIDE rather
 * than a side drawer: a one-column drawer pushed Save below the fold on every
 * record with more than a handful of fields.
 *
 * Layout contract: this renders the head only. The child (RecordForm) supplies
 * the scrolling body AND the pinned action bar, so the buttons stay visible
 * while the fields scroll.
 */
export function FormModal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEscape(onClose);
  useScrollLock();
  const dismiss = useOverlayDismiss(onClose);
  return (
    <OverlayPortal>
      <div className="overlay-backdrop" aria-hidden="true" />
      <div className="modal" {...dismiss}>
        <div className="modal-card form-modal" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
          <div className="form-modal-head">
            <div className="fmh-text">
              <h3>{title}</h3>
              {subtitle && <div className="fmh-sub">{subtitle}</div>}
            </div>
            <IconAction icon="x" title="Close" onClick={onClose} />
          </div>
          {children}
        </div>
      </div>
    </OverlayPortal>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEscape(onCancel);
  useScrollLock();
  const dismiss = useOverlayDismiss(onCancel);
  return (
    <OverlayPortal>
      <div className="overlay-backdrop" aria-hidden="true" />
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} {...dismiss}>
        <div className="modal-card">
          <div className="modal-body">
            <div className={`modal-icon ${danger ? 'danger' : ''}`}>
              <Icon name={danger ? 'alert-triangle' : 'help-circle'} size={22} />
            </div>
            <h3>{title}</h3>
            <p>{message}</p>
          </div>
          <div className="modal-foot">
            <Button variant="default" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
