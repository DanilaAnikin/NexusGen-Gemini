'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ============ Schema & Types ============

const wizardSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  prompt: z
    .string()
    .min(10, 'Please provide more detail about your app (at least 10 characters)')
    .max(10000, 'Prompt must be less than 10,000 characters'),
});

type WizardFormData = z.infer<typeof wizardSchema>;

interface UploadedFile {
  key: string;
  name: string;
  size: number;
  type: string;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  error?: string;
}

interface ProjectCreateResponse {
  success: boolean;
  projectId?: string;
  error?: string;
}

// ============ Constants ============

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

// ============ Animation Variants ============

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

// ============ Helper Functions ============

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

// ============ Step Components ============

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <motion.div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm transition-all duration-300',
              currentStep >= stepNum
                ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-gray-800 border border-gray-700 text-gray-500'
            )}
            initial={false}
            animate={{
              scale: currentStep === stepNum ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {currentStep > stepNum ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              stepNum
            )}
          </motion.div>
          {stepNum < totalSteps && (
            <div
              className={cn(
                'w-16 h-0.5 mx-2 transition-all duration-500',
                currentStep > stepNum
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
                  : 'bg-gray-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============ Main Component ============

export function CreationWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, formState, watch, trigger } = form;
  const { errors, isValid } = formState;

  // Navigation helpers
  const goToStep = useCallback((newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  }, [step]);

  const goNext = useCallback(async () => {
    if (step === 2) {
      // Validate form fields before proceeding to review
      const isStepValid = await trigger(['name', 'prompt']);
      if (!isStepValid) return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }, [step, trigger]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const fileArray = Array.from(files);

    // Validate file count
    if (uploadedFiles.length + fileArray.length > MAX_FILES) {
      setUploadError(`Maximum ${MAX_FILES} files allowed`);
      setIsUploading(false);
      return;
    }

    try {
      for (const file of fileArray) {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          setUploadError(`File type not allowed: ${file.name}. Allowed types: images and PDFs`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          setUploadError(`File too large: ${file.name}. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
          continue;
        }

        // Get presigned URL from API
        const presignedResponse = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get upload URL');
        }

        const { uploadUrl, key }: PresignedUrlResponse = await presignedResponse.json();

        // Upload directly to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        setUploadedFiles((prev) => [
          ...prev,
          {
            key,
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles.length]);

  // Remove file handler
  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Form submission handler
  const onSubmit = useCallback(async (data: WizardFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          assetKeys: uploadedFiles.map((f) => f.key),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result: ProjectCreateResponse = await response.json();

      if (result.success && result.projectId) {
        router.push(`/projects/${result.projectId}`);
      } else {
        throw new Error(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitError(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [uploadedFiles, router]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Check if can proceed to next step
  const canProceed = step === 1 || (step === 2 && !errors.name && !errors.prompt && watch('name') && watch('prompt'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Step indicator */}
        <StepIndicator currentStep={step} totalSteps={3} />

        {/* Wizard card */}
        <motion.div
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: File Upload */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={direction}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Upload Assets</h2>
                    <p className="text-gray-400">
                      Upload design files, images, or references (optional)
                    </p>
                  </div>

                  {/* Dropzone */}
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                      'hover:border-cyan-500/50 hover:bg-cyan-500/5',
                      isUploading ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700'
                    )}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
                          <p className="text-cyan-400">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                          <p className="text-gray-400 mb-1">
                            Drop files here or click to upload
                          </p>
                          <p className="text-gray-500 text-sm">
                            Images and PDFs up to {formatFileSize(MAX_FILE_SIZE)}
                          </p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Upload error */}
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{uploadError}</p>
                    </motion.div>
                  )}

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-gray-400 text-sm mb-2">
                        {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                      </p>
                      {uploadedFiles.map((file, i) => (
                        <motion.div
                          key={`${file.key}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-cyan-500/10 rounded flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-gray-300 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} - {getFileExtension(file.name).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Prompt Input */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={direction}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Describe Your Vision</h2>
                    <p className="text-gray-400">Tell us what you want to build</p>
                  </div>

                  <div className="space-y-5">
                    {/* Project Name */}
                    <div>
                      <label
                        htmlFor="project-name"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Project Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="project-name"
                        {...register('name')}
                        className={cn(
                          'w-full bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all',
                          errors.name ? 'border-red-500' : 'border-gray-700 focus:border-cyan-500'
                        )}
                        placeholder="My Awesome App"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="project-description"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Description <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="project-description"
                        {...register('description')}
                        className={cn(
                          'w-full bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all',
                          errors.description ? 'border-red-500' : 'border-gray-700 focus:border-cyan-500'
                        )}
                        placeholder="A brief description of your project"
                      />
                      {errors.description && (
                        <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Prompt */}
                    <div>
                      <label
                        htmlFor="project-prompt"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Your Prompt <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="project-prompt"
                        {...register('prompt')}
                        rows={6}
                        className={cn(
                          'w-full bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none',
                          'font-mono text-sm leading-relaxed',
                          errors.prompt ? 'border-red-500' : 'border-gray-700 focus:border-cyan-500'
                        )}
                        placeholder="Build me a modern e-commerce dashboard with product management, order tracking, analytics charts, and a dark mode UI. Include user authentication and integrate with Stripe for payments..."
                      />
                      {errors.prompt && (
                        <p className="text-red-400 text-sm mt-1">{errors.prompt.message}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {watch('prompt')?.length || 0} / 10,000 characters
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={direction}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Review & Launch</h2>
                    <p className="text-gray-400">Ready to bring your vision to life?</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-xl p-6 space-y-4">
                    {/* Project Name */}
                    <div>
                      <span className="text-gray-500 text-sm block mb-1">Project Name</span>
                      <p className="text-white font-medium">
                        {watch('name') || <span className="text-gray-500 italic">Not specified</span>}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="text-gray-500 text-sm block mb-1">Description</span>
                      <p className="text-gray-300">
                        {watch('description') || <span className="text-gray-500 italic">No description</span>}
                      </p>
                    </div>

                    {/* Prompt Preview */}
                    <div>
                      <span className="text-gray-500 text-sm block mb-1">Prompt Preview</span>
                      <p className="text-gray-300 font-mono text-sm line-clamp-4 bg-gray-900/50 rounded-lg p-3">
                        {watch('prompt') || <span className="text-gray-500 italic">No prompt</span>}
                      </p>
                    </div>

                    {/* Attached Files */}
                    <div>
                      <span className="text-gray-500 text-sm block mb-1">Attached Files</span>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <p className="text-gray-300">
                          {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} attached
                        </p>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {uploadedFiles.map((file, i) => (
                            <span
                              key={`review-${file.key}-${i}`}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                            >
                              <FileText className="w-3 h-3" />
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{submitError}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {/* Back button */}
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                  step === 1
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {/* Next/Submit button */}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === 2 && !canProceed}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                    'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
                    'hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
                  )}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={cn(
                    'flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all',
                    'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
                    'hover:from-green-400 hover:to-emerald-400 hover:shadow-lg hover:shadow-green-500/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate App
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Step labels */}
        <div className="flex justify-between mt-4 px-4 text-xs text-gray-500">
          <span className={cn(step === 1 && 'text-cyan-400')}>Upload</span>
          <span className={cn(step === 2 && 'text-cyan-400')}>Describe</span>
          <span className={cn(step === 3 && 'text-cyan-400')}>Review</span>
        </div>
      </div>
    </div>
  );
}

export default CreationWizard;
