import React from "react";

import { cn } from "@heroui/react";
import { useTranslation } from "react-i18next";
import StepHeader from "#/components/features/onboarding/step-header";
import {
  StepContent,
  Option,
} from "#/components/features/onboarding/step-content";

export interface FormStep {
  id: string;
  title: string;
  subtitle?: string;
  options: Option[];
}

const steps = [
  {
    id: "step1",
    title: "What best describes you?",
    subtitle: "Select the option that best fits you",
    options: [
      {
        id: "option1",
        label: "Individual developer / hobbyist",
        description: "",
      },
      {
        id: "option2",
        label: "Startup team (2–20)",
        description: "",
      },
      {
        id: "option3",
        label: "Growing company (20–200)",
        description: "",
      },
      {
        id: "option4",
        label: "Enterprise / Large org (200+)",
        description: "",
      },
    ],
  },
  {
    id: "step2",
    title: "Where do you want to deploy OpenHands?",
    subtitle: "Select the option that best fits you",
    options: [
      {
        id: "option1",
        label: "Cloud (hosted by us)",
        description: "",
      },
      {
        id: "option2",
        label: "Local Environment",
        description: "",
      },
      {
        id: "option3",
        label: "Private Cloud (Self-hosted)",
        description: "",
      },
      {
        id: "option4",
        label: "Not sure yet",
        description: "",
      },
    ],
  },
  {
    id: "step3",
    title: "How many teammates will use OpenHands?",
    subtitle: "Select the option that best fits you",
    options: [
      {
        id: "option1",
        label: "Just me",
        description: "",
      },
      {
        id: "option2",
        label: "2–10",
        description: "",
      },
      {
        id: "option3",
        label: "11-50",
        description: "",
      },
      {
        id: "option4",
        label: "50+",
        description: "",
      },
    ],
  },
];

interface ProgressiveFormProps {
  onComplete: (selections: Record<string, string>) => void;
}

export function ProgressiveForm({ onComplete }: ProgressiveFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [selections, setSelections] = React.useState<Record<string, string>>(
    {},
  );

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const currentSelection = selections[currentStep.id] || null;

  const { t } = useTranslation();

  const handleSelectOption = (optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [currentStep.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(selections);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div data-testid="progressive-form" className="w-[700px] mx-auto p-6">
      <StepHeader
        title={currentStep.title}
        subtitle={currentStep.subtitle}
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
      />
      <StepContent
        options={currentStep.options}
        selectedOptionId={currentSelection}
        onSelectOption={handleSelectOption}
      />
      <div
        data-testid="step-actions"
        className="flex justify-start items-center mt-8"
      >
        <button
          type="button"
          onClick={handleNext}
          disabled={!currentSelection}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            !currentSelection
              ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
              : "bg-white text-black hover:bg-white/90 active:bg-white/80",
          )}
        >
          {t("TOS$CONTINUE")}
        </button>
      </div>
    </div>
  );
}
