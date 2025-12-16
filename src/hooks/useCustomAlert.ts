// src/hooks/useCustomAlert.ts - FRESH CUSTOM ALERT HOOK

import { useState } from "react";
import { CustomAlert } from "@components/common/CustomAlert";

export interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  type?: "default" | "warning" | "error" | "success";
  confirmStyle?: "default" | "destructive";
}

export const useCustomAlert = () => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | null>(null);

  const showAlert = (
    options: AlertOptions,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlertOptions(options);
    setOnConfirmCallback(() => onConfirm || (() => {}));
    setOnCancelCallback(() => onCancel || (() => {}));
    setAlertVisible(true);
  };

  const handleConfirm = () => {
    setAlertVisible(false);
    if (onConfirmCallback) {
      onConfirmCallback();
    }
  };

  const handleCancel = () => {
    setAlertVisible(false);
    if (onCancelCallback) {
      onCancelCallback();
    }
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alertVisible}
      title={alertOptions?.title || ""}
      message={alertOptions?.message || ""}
      confirmText={alertOptions?.confirmText}
      cancelText={alertOptions?.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      showCancel={alertOptions?.showCancel}
      type={alertOptions?.type}
      confirmStyle={alertOptions?.confirmStyle}
    />
  );

  return {
    showAlert,
    AlertComponent,
    hideAlert: () => setAlertVisible(false),
  };
};

export default useCustomAlert;