import React, { useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store';
import { hideToast } from '@/store/slices/uiSlice';
import { theme } from '@/constants/theme';

export const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast?.visible, dispatch]);

  if (!toast?.visible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'error':
        return theme.colors.error[500];
      case 'success':
        return theme.colors.success[500];
      case 'warning':
        return theme.colors.warning[500];
      case 'info':
        return theme.colors.info[500];
      default:
        return theme.colors.neutral[700];
    }
  };

  const getTextColor = () => {
    return theme.colors.white;
  };

  return (
    <Snackbar
      visible={toast.visible}
      onDismiss={() => dispatch(hideToast())}
      duration={4000}
      style={{
        backgroundColor: getBackgroundColor(),
        marginBottom: theme.spacing.lg,
      }}
      theme={{
        colors: {
          onSurface: getTextColor(),
          surface: getBackgroundColor(),
        },
      }}
      action={{
        label: 'Dismiss',
        onPress: () => dispatch(hideToast()),
        textColor: getTextColor(),
      }}
    >
      {toast.message}
    </Snackbar>
  );
};
