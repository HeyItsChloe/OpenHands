import React from "react";

import { useTranslation } from "react-i18next";
import StepHeader from "#/components/features/onboarding/step-header";
import { StepContent } from "#/components/features/onboarding/step-content";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";
import OpenHandsLogoWhite from "#/assets/branding/openhands-logo-white.svg?react";

interface StepOption {
  id: string;
  labelKey?: I18nKey;
  label?: string;
}

interface FormStep {
  id: string;
  titleKey: I18nKey;
  subtitleKey?: I18nKey;
  options: StepOption[];
}

const steps: FormStep[] = [
  {
    id: "step1",
    titleKey: I18nKey.ONBOARDING$STEP1_TITLE,
    subtitleKey: I18nKey.ONBOARDING$STEP1_SUBTITLE,
    options: [
      {
        id: "option1",
        labelKey: I18nKey.ONBOARDING$STEP1_OPTION1,
      },
      {
        id: "option2",
        labelKey: I18nKey.ONBOARDING$STEP1_OPTION2,
      },
      {
        id: "option3",
        labelKey: I18nKey.ONBOARDING$STEP1_OPTION3,
      },
      {
        id: "option4",
        labelKey: I18nKey.ONBOARDING$STEP1_OPTION4,
      },
    ],
  },
  {
    id: "step2",
    titleKey: I18nKey.ONBOARDING$STEP2_TITLE,
    subtitleKey: I18nKey.ONBOARDING$STEP1_SUBTITLE,
    options: [
      {
        id: "option1",
        labelKey: I18nKey.ONBOARDING$STEP2_OPTION1,
      },
      {
        id: "option2",
        labelKey: I18nKey.ONBOARDING$STEP2_OPTION2,
      },
      {
        id: "option3",
        labelKey: I18nKey.ONBOARDING$STEP2_OPTION3,
      },
      {
        id: "option4",
        labelKey: I18nKey.ONBOARDING$STEP2_OPTION4,
      },
    ],
  },
  {
    id: "step3",
    titleKey: I18nKey.ONBOARDING$STEP3_TITLE,
    subtitleKey: I18nKey.ONBOARDING$STEP1_SUBTITLE,
    options: [
      {
        id: "option1",
        labelKey: I18nKey.ONBOARDING$STEP3_OPTION1,
      },
      {
        id: "option2",
        label: "2–10",
      },
      {
        id: "option3",
        label: "11–50",
      },
      {
        id: "option4",
        label: "50+",
      },
    ],
  },
];

interface OnboardingFormProps {
  onComplete: (selections: Record<string, string>) => void;
}

function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { t } = useTranslation();

  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [selections, setSelections] = React.useState<Record<string, string>>(
    {},
  );

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const currentSelection = selections[currentStep.id] || null;

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

  const translatedOptions = currentStep.options.map((option) => ({
    id: option.id,
    label: option.labelKey ? t(option.labelKey) : option.label!,
  }));

  return (
    <div data-testid="onboarding-form" className="w-[700px] mx-auto p-6">
      <div className="flex justify-center mb-[130px]">
        <OpenHandsLogoWhite width={80} height={80} />
      </div>
      <StepHeader
        title={t(currentStep.titleKey)}
        subtitle={
          currentStep.subtitleKey ? t(currentStep.subtitleKey) : undefined
        }
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
      />
      <StepContent
        options={translatedOptions}
        selectedOptionId={currentSelection}
        onSelectOption={handleSelectOption}
      />
      <div
        data-testid="step-actions"
        className="flex justify-start items-center"
      >
        <BrandButton
          type="button"
          variant="primary"
          onClick={handleNext}
          isDisabled={!currentSelection}
          className="px-6 py-2.5 bg-white text-black hover:bg-white/90"
        >
          {t(I18nKey.ONBOARDING$NEXT_BUTTON)}
        </BrandButton>
      </div>
    </div>
  );
}

export default OnboardingForm;
