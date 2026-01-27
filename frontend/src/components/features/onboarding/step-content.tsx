import { StepOption } from "./step-option";

export interface Option {
  id: string;
  label: string;
  description?: string;
}

interface StepContentProps {
  options: Option[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

export function StepContent({
  options,
  selectedOptionId,
  onSelectOption,
}: StepContentProps) {
  return (
    <div data-testid="step-content" className="flex flex-col gap-3 w-full">
      {options.map((option) => (
        <StepOption
          key={option.id}
          id={option.id}
          label={option.label}
          description={option.description}
          selected={selectedOptionId === option.id}
          onClick={() => onSelectOption(option.id)}
        />
      ))}
    </div>
  );
}
