// components/Toastr.tsx
import React, { useEffect } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

/**
 * Initializes toastr configuration globally.
 * This component should be rendered once at the root level (e.g., _app.tsx).
 */
const Toastr: React.FC = () => {
  useEffect(() => {
    // Configure toastr options individually to avoid TypeScript read-only error
    toastr.options.closeButton = true;
    toastr.options.debug = false;
    toastr.options.positionClass = 'toast-top-right';
    toastr.options.onclick = undefined;
    // toastr.options.showDuration = 300;
    // toastr.options.hideDuration = 1000;
    // toastr.options.timeOut = 5000;
    // toastr.options.extendedTimeOut = 1000;
    toastr.options.showEasing = 'swing';
    toastr.options.hideEasing = 'linear';
    toastr.options.showMethod = 'fadeIn';
    toastr.options.hideMethod = 'fadeOut';
  }, []);

  return null; // No UI needed
};

// Export reusable toast functions for use throughout the app
export const showSuccess = (message: string, title?: string) => toastr.success(message, title);
export const showError = (message: string, title?: string) => toastr.error(message, title);
export const showInfo = (message: string, title?: string) => toastr.info(message, title);
export const showWarning = (message: string, title?: string) => toastr.warning(message, title);

export default Toastr;
