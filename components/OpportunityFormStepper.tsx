"use client"

import React from 'react';
import { Check } from 'lucide-react';

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface OpportunityFormStepperProps {
  steps: StepConfig[];
  currentStep: number;
  completedSteps: number[];
}

export const OpportunityFormStepper: React.FC<OpportunityFormStepperProps> = ({
  steps,
  currentStep,
  completedSteps
}) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber);
          const isAccessible = stepNumber <= currentStep || isCompleted;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300
                    ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isAccessible
                      ? 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 max-w-20">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 -mt-8">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completedSteps.includes(stepNumber + 1) || currentStep > stepNumber
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};