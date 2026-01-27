import { cn } from "@heroui/react";

interface StepOptionProps {
  id: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function StepOption({
  id,
  label,
  selected,
  onClick,
}: StepOptionProps) {
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
        "w-full py-8 px-5 rounded-[12px] border-2 cursor-pointer transition-all duration-200",
        "hover:border-white",
        "focus:outline-none focus:ring-2 focus:ring-white/50",
        selected ? "border-white" : "border-neutral-600",
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-content">{label}</span>
      </div>
    </div>
  );
}
