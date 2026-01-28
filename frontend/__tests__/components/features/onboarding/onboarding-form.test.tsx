import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test-utils";
import OnboardingForm from "#/routes/onboarding-form";
import { onComplete } from "#/utils/onboarding-utils";

vi.mock("#/utils/onboarding-utils", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("#/utils/onboarding-utils")>();
  return {
    ...original,
    onComplete: vi.fn(original.onComplete),
  };
});

const mockedOnComplete = vi.mocked(onComplete);

describe("OnboardingForm", () => {
  beforeEach(() => {
    mockedOnComplete.mockClear();
  });

  it("should render with the correct test id", () => {
    renderWithProviders(<OnboardingForm />);

    expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
  });

  it("should render the first step initially", () => {
    renderWithProviders(<OnboardingForm />);

    expect(screen.getByTestId("step-header")).toBeInTheDocument();
    expect(screen.getByTestId("step-content")).toBeInTheDocument();
    expect(screen.getByTestId("step-actions")).toBeInTheDocument();
  });

  it("should display step progress indicator with 3 bars", () => {
    renderWithProviders(<OnboardingForm />);

    const stepHeader = screen.getByTestId("step-header");
    const progressBars = stepHeader.querySelectorAll(".rounded-full");
    expect(progressBars).toHaveLength(3);
  });

  it("should have the Next button disabled when no option is selected", () => {
    renderWithProviders(<OnboardingForm />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("should enable the Next button when an option is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingForm />);

    await user.click(screen.getByTestId("step-option-option1"));

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it("should advance to the next step when Next is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingForm />);

    // On step 1, first progress bar should be filled (bg-white)
    const stepHeader = screen.getByTestId("step-header");
    let progressBars = stepHeader.querySelectorAll(".bg-white");
    expect(progressBars).toHaveLength(1);

    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // On step 2, first two progress bars should be filled
    progressBars = stepHeader.querySelectorAll(".bg-white");
    expect(progressBars).toHaveLength(2);
  });

  it("should disable Next button again on new step until option is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingForm />);

    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("should call onComplete with selections when finishing the last step", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingForm />);

    // Step 1
    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 2
    await user.click(screen.getByTestId("step-option-option2"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 3
    await user.click(screen.getByTestId("step-option-option3"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(mockedOnComplete).toHaveBeenCalledTimes(1);
    expect(mockedOnComplete).toHaveBeenCalledWith({
      step1: "option1",
      step2: "option2",
      step3: "option3",
    });
  });

  it("should render 4 options on step 1", () => {
    renderWithProviders(<OnboardingForm />);

    const options = screen
      .getAllByRole("button")
      .filter((btn) =>
        btn.getAttribute("data-testid")?.startsWith("step-option-"),
      );
    expect(options).toHaveLength(4);
  });

  it("should preserve selections when navigating through steps", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingForm />);

    // Select option1 on step 1
    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Select option2 on step 2
    await user.click(screen.getByTestId("step-option-option2"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Select option1 on step 3
    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Verify all selections were preserved
    expect(mockedOnComplete).toHaveBeenCalledWith({
      step1: "option1",
      step2: "option2",
      step3: "option1",
    });
  });

  it("should show all progress bars filled on the last step", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingForm />);

    // Navigate to step 3
    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    await user.click(screen.getByTestId("step-option-option1"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // On step 3, all three progress bars should be filled
    const stepHeader = screen.getByTestId("step-header");
    const progressBars = stepHeader.querySelectorAll(".bg-white");
    expect(progressBars).toHaveLength(3);
  });
});
