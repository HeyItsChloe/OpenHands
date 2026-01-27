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
    <div data-testid="step-header" className="flex flex-col gap-2 mb-6">
      <h2 className="text-2xl font-semibold text-content">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
      <div className="flex w-full gap-1 mt-2">
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
