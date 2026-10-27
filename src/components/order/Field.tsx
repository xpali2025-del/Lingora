'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  valid: (value: string) => boolean;
  onValue: (value: string) => void;
  forceError?: boolean;
  multiline?: boolean;
};

/** Visible label, validation on blur, and the error clears as soon as the value is valid. */
export function Field({
  label,
  hint,
  error,
  value,
  valid,
  onValue,
  forceError = false,
  multiline = false,
  ...input
}: FieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const showError = (touched || forceError) && !valid(value) && Boolean(error);
  const describedBy = [hint ? `${id}-hint` : '', showError ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');
  const shared = {
    id,
    value,
    'aria-invalid': showError || undefined,
    'aria-describedby': describedBy || undefined,
    onBlur: () => setTouched(true),
  };

  return (
    <div className={`form-field${showError ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          {...shared}
          rows={3}
          maxLength={500}
          onChange={(event) => onValue(event.target.value)}
        />
      ) : (
        <input
          {...input}
          {...shared}
          onChange={(event) => onValue(event.target.value)}
        />
      )}
      {hint && (
        <small id={`${id}-hint`} className="form-hint">
          {hint}
        </small>
      )}
      {showError && (
        <small id={`${id}-error`} className="form-error">
          {error}
        </small>
      )}
    </div>
  );
}
