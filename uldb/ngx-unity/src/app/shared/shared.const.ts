import { ModalOptions } from 'ngx-bootstrap/modal';

// ----- Modals -----

// Standard config for confirm/action modals (ESC to close, no backdrop dismiss).
export const CONFIRM_MODAL_CONFIG: Readonly<ModalOptions> = {
    keyboard: true,
    ignoreBackdropClick: true,
};
