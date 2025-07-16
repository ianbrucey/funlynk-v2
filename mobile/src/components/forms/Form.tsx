import React from 'react';
import { useForm, FormProvider, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface FormProps<T extends FieldValues> extends Omit<ViewProps, 'children'> {
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode);
  onSubmit: (data: T) => void | Promise<void>;
  formOptions?: UseFormProps<T>;
  gap?: keyof typeof theme.spacing;
}

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  formOptions,
  gap = 'md',
  style,
  ...props
}: FormProps<T>) {
  const methods = useForm<T>(formOptions);

  return (
    <FormProvider {...methods}>
      <View style={[styles.container, { gap: theme.spacing[gap] }, style]} {...props}>
        {typeof children === 'function' ? children(methods) : children}
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
});

// Export form utilities for convenience
export { useFormContext, useController, useWatch } from 'react-hook-form';
export type { FieldValues, UseFormReturn, Control, FieldError } from 'react-hook-form';
