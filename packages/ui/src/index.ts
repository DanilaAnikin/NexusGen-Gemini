/**
 * @nexusgen/ui
 * Shared UI components for NexusGen AI platform
 */

// Utilities
export * from './utils';

// Components
export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';

export { Input, Textarea, inputVariants, textareaVariants } from './components/input';
export type { InputProps, TextareaProps } from './components/input';

// Hooks
export {
  useDebounce,
  useLocalStorage,
  useMediaQuery,
  useOnClickOutside,
  usePrevious,
  useToggle,
  useCopyToClipboard,
  useKeyPress,
  useIntersectionObserver,
  useWindowSize,
  useIsMounted,
} from './hooks';

// Version
export const UI_VERSION = '0.1.0';
