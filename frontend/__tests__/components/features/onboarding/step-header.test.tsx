import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StepHeader from "#/components/features/onboarding/step-header";

describe("StepHeader", () => {
  const defaultProps = {
    title: "Test Title",
    currentStep: 1,
    totalSteps: 3,
  };

  it("should render with the correct test id", () => {
    render(<StepHeader {...defaultProps} />);

    expect(screen.getByTestId("step-header")).toBeInTheDocument();
  });

  it("should display the title", () => {
    render(<StepHeader {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should display the subtitle when provided", () => {
    render(<StepHeader {...defaultProps} subtitle="Test Subtitle" />);

    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  it("should not display subtitle when not provided", () => {
    render(<StepHeader {...defaultProps} />);

    const stepHeader = screen.getByTestId("step-header");
    const subtitleElement = stepHeader.querySelector(".text-neutral-400");
    expect(subtitleElement).not.toBeInTheDocument();
  });

  it("should render correct number of progress bars based on totalSteps", () => {
    render(<StepHeader {...defaultProps} totalSteps={5} />);

    const stepHeader = screen.getByTestId("step-header");
    const progressBars = stepHeader.querySelectorAll(".rounded-full");
    expect(progressBars).toHaveLength(5);
  });

  it("should fill progress bars up to currentStep", () => {
    render(<StepHeader {...defaultProps} currentStep={2} totalSteps={4} />);

    const stepHeader = screen.getByTestId("step-header");
    const filledBars = stepHeader.querySelectorAll(".bg-white");
    const unfilledBars = stepHeader.querySelectorAll(".bg-neutral-600");

    expect(filledBars).toHaveLength(2);
    expect(unfilledBars).toHaveLength(2);
  });

  it("should show all bars filled when on last step", () => {
    render(<StepHeader {...defaultProps} currentStep={3} totalSteps={3} />);

    const stepHeader = screen.getByTestId("step-header");
    const filledBars = stepHeader.querySelectorAll(".bg-white");
    const unfilledBars = stepHeader.querySelectorAll(".bg-neutral-600");

    expect(filledBars).toHaveLength(3);
    expect(unfilledBars).toHaveLength(0);
  });

  it("should show no bars filled when currentStep is 0", () => {
    render(<StepHeader {...defaultProps} currentStep={0} totalSteps={3} />);

    const stepHeader = screen.getByTestId("step-header");
    const filledBars = stepHeader.querySelectorAll(".bg-white");
    const unfilledBars = stepHeader.querySelectorAll(".bg-neutral-600");

    expect(filledBars).toHaveLength(0);
    expect(unfilledBars).toHaveLength(3);
  });

  it("should handle single step progress", () => {
    render(<StepHeader {...defaultProps} currentStep={1} totalSteps={1} />);

    const stepHeader = screen.getByTestId("step-header");
    const progressBars = stepHeader.querySelectorAll(".rounded-full");
    const filledBars = stepHeader.querySelectorAll(".bg-white");

    expect(progressBars).toHaveLength(1);
    expect(filledBars).toHaveLength(1);
  });
});
