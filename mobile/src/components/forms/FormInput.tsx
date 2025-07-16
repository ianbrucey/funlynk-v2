import React from 'react';
import { useController, useFormContext, RegisterOptions } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { TextInputProps } from 'react-native-paper';

interface FormInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string;
  rules?: RegisterOptions;
  defaultValue?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  rules,
  defaultValue = '',
  ...props
}) => {
  const { control } = useFormContext();
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: rules || {},
    defaultValue,
  });

  return (
    <Input
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      error={error?.message}
      {...props}
    />
  );
};
