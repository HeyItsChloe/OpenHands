import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VerificationAlert } from "#/components/features/settings/user-settings/verification-alert";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("VerificationAlert", () => {
  it("should render the verification alert with correct content", () => {
    render(<VerificationAlert />);

    expect(
      screen.getByText("SETTINGS$EMAIL_VERIFICATION_REQUIRED"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("SETTINGS$EMAIL_VERIFICATION_RESTRICTION_MESSAGE"),
    ).toBeInTheDocument();
  });

  it("should have alert role for accessibility", () => {
    render(<VerificationAlert />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
