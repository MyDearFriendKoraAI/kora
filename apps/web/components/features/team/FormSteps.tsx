'use client';

import { ReactNode } from 'react';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface FormStepsProps {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
  className?: string;
}

export function FormSteps({ steps, currentStep, children, className = '' }: FormStepsProps) {
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                ${index + 1 < currentStep
                  ? 'bg-blue-600 border-blue-600 text-white' // Completed
                  : index + 1 === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white' // Current
                  : 'bg-white border-gray-300 text-gray-400' // Future
                }
              `}>
                {index + 1 < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step label */}
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-4
                  ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile step indicator */}
        <div className="mt-4 sm:hidden text-center">
          <p className="text-sm font-medium text-blue-600">
            {steps.find(step => step.id === currentStep)?.title}
          </p>
          <p className="text-xs text-gray-500">
            Passo {currentStep} di {steps.length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {children}
      </div>
    </div>
  );
}

// Navigation buttons component
interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  canProceed?: boolean;
  className?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLoading = false,
  canProceed = true,
  className = '',
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className={`flex items-center justify-between pt-6 border-t border-gray-200 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading}
        className={`
          px-4 py-2 text-sm font-medium rounded-md transition-colors
          ${isFirstStep
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        ← Indietro
      </button>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          {currentStep} di {totalSteps}
        </span>
      </div>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isLoading}
          className={`
            px-6 py-2 text-sm font-medium rounded-md transition-colors
            ${canProceed && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creazione...
            </div>
          ) : (
            'Crea Squadra'
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${canProceed && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Avanti →
        </button>
      )}
    </div>
  );
}