import { cn } from "@heroui/react";
import { Typography } from "#/ui/typography";

interface StepOptionProps {
  id: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function StepOption({ id, label, selected, onClick }: StepOptionProps) {
  return (
    <div
      data-testid={`step-option-${id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "h-10 w-full rounded-md border py-2 px-4 transition-colors text-white",
        selected
          ? "border-white bg-[#3a3a3a]"
          : "border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#3a3a3a]",
      )}
    >
      <Typography.Text className="text-sm font-medium text-content">
        {label}
      </Typography.Text>
    </div>
  );
}
