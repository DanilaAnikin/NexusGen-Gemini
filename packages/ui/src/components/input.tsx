/**
 * @nexusgen/ui - Input Component
 * A flexible input component with multiple variants and states
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';

import { cn } from '../utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400',
  {
    variants: {
      variant: {
        default:
          'border-neutral-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 dark:border-neutral-700',
        error:
          'border-error-500 focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:border-error-500 text-error-600 dark:text-error-400',
        success:
          'border-success-500 focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:border-success-500',
        ghost:
          'border-transparent hover:border-neutral-300 focus-visible:border-neutral-300 dark:hover:border-neutral-700 dark:focus-visible:border-neutral-700',
      },
      inputSize: {
        default: 'h-10 px-3 py-2',
        sm: 'h-8 px-2 py-1 text-xs',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Left addon/icon */
  leftAddon?: React.ReactNode;
  /** Right addon/icon */
  rightAddon?: React.ReactNode;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Label for the input */
  label?: string;
  /** Show clear button when input has value */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Input component with labels, validation states, and addons
 *
 * @example
 * ```tsx
 * <Input placeholder="Enter email" />
 * <Input label="Email" type="email" error="Invalid email" />
 * <Input leftAddon={<SearchIcon />} placeholder="Search..." />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      variant,
      inputSize,
      type = 'text',
      leftAddon,
      rightAddon,
      error,
      success,
      helperText,
      label,
      clearable,
      onClear,
      disabled,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id ?? React.useId();

    // Determine the variant based on error/success state
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    // Determine if we should show the password toggle
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;

    // Determine if we should show the clear button
    const showClear = clearable && value && !disabled;

    // Compute right addon based on state
    const computedRightAddon = React.useMemo(() => {
      if (isPasswordType) {
        return (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        );
      }

      if (showClear) {
        return (
          <button
            type="button"
            onClick={onClear}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        );
      }

      if (error) {
        return <AlertCircle className="h-4 w-4 text-error-500" />;
      }

      if (success) {
        return <CheckCircle2 className="h-4 w-4 text-success-500" />;
      }

      return rightAddon;
    }, [isPasswordType, showPassword, showClear, error, success, rightAddon, onClear]);

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center text-neutral-500">
              {leftAddon}
            </div>
          )}

          <input
            type={inputType}
            id={inputId}
            className={cn(
              inputVariants({ variant: computedVariant, inputSize }),
              leftAddon && 'pl-10',
              computedRightAddon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            value={value}
            {...props}
          />

          {computedRightAddon && (
            <div className="absolute right-3 flex items-center">
              {computedRightAddon}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <p
            className={cn(
              'text-xs',
              error && 'text-error-500',
              success && 'text-success-500',
              !error && !success && 'text-neutral-500'
            )}
          >
            {error ?? success ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============ Textarea Component ============

const textareaVariants = cva(
  'flex w-full rounded-md border bg-transparent text-sm transition-colors placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:placeholder:text-neutral-400',
  {
    variants: {
      variant: {
        default:
          'border-neutral-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 dark:border-neutral-700',
        error:
          'border-error-500 focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:border-error-500 text-error-600 dark:text-error-400',
        success:
          'border-success-500 focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:border-success-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Helper text below the textarea */
  helperText?: string;
  /** Label for the textarea */
  label?: string;
  /** Container class name */
  containerClassName?: string;
  /** Enable auto-resize based on content */
  autoResize?: boolean;
}

/**
 * Textarea component for multi-line text input
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      variant,
      error,
      success,
      helperText,
      label,
      autoResize,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? React.useId();
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      props.onChange?.(e);
    };

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ variant: computedVariant }),
            'min-h-[80px] px-3 py-2',
            className
          )}
          ref={ref}
          onChange={autoResize ? handleAutoResize : props.onChange}
          {...props}
        />

        {(error || success || helperText) && (
          <p
            className={cn(
              'text-xs',
              error && 'text-error-500',
              success && 'text-success-500',
              !error && !success && 'text-neutral-500'
            )}
          >
            {error ?? success ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants, textareaVariants };
export default Input;
