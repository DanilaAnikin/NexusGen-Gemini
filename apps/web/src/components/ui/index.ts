/**
 * UI Components
 *
 * This barrel file exports all reusable UI components.
 * Components should be atomic, accessible, and follow the design system.
 */

// Shadcn UI Components
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Input, type InputProps } from "./input";
export { Textarea, type TextareaProps } from "./textarea";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export { Progress } from "./progress";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Re-export from shared UI package when available
// export * from "@nexusgen/ui";
