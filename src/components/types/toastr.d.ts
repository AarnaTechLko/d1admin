declare module 'toastr' {
    export function success(message: string, title?: string): void;
    export function error(message: string, title?: string): void;
    export function info(message: string, title?: string): void;
    export function warning(message: string, title?: string): void;
  
    export const options: {
      closeButton?: boolean;
      debug?: boolean;
      positionClass?: string;
      onclick?: (() => void) | null;
      showDuration?: string;
      hideDuration?: string;
      timeOut?: string;
      extendedTimeOut?: string;
      showEasing?: string;
      hideEasing?: string;
      showMethod?: string;
      hideMethod?: string;
    };
  }
  