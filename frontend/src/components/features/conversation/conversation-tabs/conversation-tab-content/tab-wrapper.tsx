import { ReactNode } from "react";
import { cn } from "#/utils/utils";

interface TabWrapperProps {
  // isActive: /boolean;
  children: ReactNode;
}

export function TabWrapper({ children }: TabWrapperProps) {
  return <div className={cn("absolute inset-0")}>{children}</div>;
}
