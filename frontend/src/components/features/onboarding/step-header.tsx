import { Typography } from "#/ui/typography";

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
}

function StepHeader({
  title,
  subtitle,
  currentStep,
  totalSteps,
}: StepHeaderProps) {
  return (
    <div data-testid="step-header" className="flex flex-col gap-[32px]">
      <Typography.Text className="text-[39px] font-semibold text-content">
        {title}
      </Typography.Text>
      {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
      <div className="flex w-full gap-[12px]">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-colors ${
              index < currentStep ? "bg-white" : "bg-neutral-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default StepHeader;
