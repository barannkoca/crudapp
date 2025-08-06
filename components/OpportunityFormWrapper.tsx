"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OpportunityFormStepper, StepConfig } from './OpportunityFormStepper';
import { IslemTuruDto } from '@/src/dto/opportunity.dto';

interface OpportunityFormWrapperProps {
  title: string;
  islemTuru: IslemTuruDto;
  steps: StepConfig[];
  children: React.ReactNode[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel?: () => void;
  backHref?: string;
}

export const OpportunityFormWrapper: React.FC<OpportunityFormWrapperProps> = ({
  title,
  islemTuru,
  steps,
  children,
  onSubmit,
  onCancel,
  backHref = '/dashboard'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({ ...formData, islem_turu: islemTuru });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              Adım {currentStep} / {totalSteps}
            </span>
          </div>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{title}</h1>
        <p className="text-sm text-gray-600">
          {steps[currentStep - 1]?.title}
        </p>
      </div>

      {/* Stepper */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <OpportunityFormStepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="overflow-visible">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {steps[currentStep - 1]?.icon}
            {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative overflow-visible">
            <AnimatePresence mode="wait" custom={currentStep}>
              <motion.div
                key={currentStep}
                custom={currentStep}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
              >
                {React.cloneElement(children[currentStep - 1] as React.ReactElement, {
                  onDataChange: handleStepData,
                  formData,
                  key: currentStep
                } as any)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Önceki
            </Button>

            <div className="text-sm text-gray-500">
              {currentStep} / {totalSteps}
            </div>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Tamamla'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Sonraki
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};