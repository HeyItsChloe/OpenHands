import { Tooltip, TooltipProps } from "@heroui/react";
import React, { ReactNode } from "react";
import { NavLink } from "react-router";
import { cn } from "#/utils/utils";

export interface TooltipButtonProps {
  children: ReactNode;
  tooltip: string | ReactNode;
  onClick?: () => void;
  href?: string;
  navLinkTo?: string;
  ariaLabel: string;
  testId?: string;
  className?: React.HTMLAttributes<HTMLButtonElement>["className"];
  tooltipClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
  disabled?: boolean;
  placement?: TooltipProps["placement"];
  showArrow?: boolean;
}

export function TooltipButton({
  children,
  tooltip,
  onClick,
  href,
  navLinkTo,
  ariaLabel,
  testId,
  className,
  tooltipClassName,
  disabled = false,
  placement = "right",
  showArrow = false,
}: TooltipButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !disabled) {
      onClick();
      e.preventDefault();
    }
  };

  const buttonContent = (
    <span
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={handleClick}
      className={cn(
        "hover:opacity-80",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </span>
  );

  let content;

  if (navLinkTo && !disabled) {
    content = (
      <NavLink
        to={navLinkTo}
        onClick={handleClick}
        className={({ isActive }) =>
          cn(
            "hover:opacity-80",
            isActive ? "text-white" : "text-[#9099AC]",
            className,
          )
        }
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {children}
      </NavLink>
    );
  } else if (navLinkTo && disabled) {
    // If disabled and has navLinkTo, render a button that looks like a NavLink but doesn't navigate
    content = (
      <span
        aria-label={ariaLabel}
        data-testid={testId}
        className={cn(
          "text-[#9099AC]",
          "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {children}
      </span>
    );
  } else if (href && !disabled) {
    content = (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn("hover:opacity-80", className)}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {children}
      </a>
    );
  } else if (href && disabled) {
    // If disabled and has href, render a button that looks like a link but doesn't navigate
    content = (
      <span
        aria-label={ariaLabel}
        data-testid={testId}
        className={cn("opacity-50 cursor-not-allowed", className)}
      >
        {children}
      </span>
    );
  } else {
    content = buttonContent;
  }

  return (
    <Tooltip
      content={tooltip}
      closeDelay={100}
      placement={placement}
      className={tooltipClassName}
      showArrow={showArrow}
    >
      {content}
    </Tooltip>
  );
}
