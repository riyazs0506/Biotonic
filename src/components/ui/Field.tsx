import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import styles from './Field.module.css';

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, required, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={[styles.field, error && styles.invalid, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className={styles.optional}> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type Shared = { label: string; hint?: ReactNode; error?: string; className?: string };

export function TextField({
  label,
  hint,
  error,
  className,
  required,
  ...input
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <input
        id={id}
        className={styles.control}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  className,
  required,
  ...input
}: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <textarea
        id={id}
        className={`${styles.control} ${styles.textarea}`}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  required,
  children,
  ...input
}: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div className={styles.selectWrap}>
        <select
          id={id}
          className={`${styles.control} ${styles.select}`}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...input}
        >
          {children}
        </select>
      </div>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  error,
  className,
  ...input
}: {
  label: ReactNode;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div
      className={[styles.checkField, error && styles.invalid, className].filter(Boolean).join(' ')}
    >
      <div className={styles.checkRow}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...input}
        />
        <label htmlFor={id} className={styles.checkLabel}>
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
