import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmailInputSection } from "#/components/features/settings/user-settings/email-input-section";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("EmailInputSection", () => {
  const defaultProps = {
    email: "test@example.com",
    onEmailChange: vi.fn(),
    onSaveEmail: vi.fn(),
    onResendVerification: vi.fn(),
    isSaving: false,
    isResendingVerification: false,
    isEmailChanged: false,
    emailVerified: true,
    isEmailValid: true,
    children: null,
  };

  it("should render email input with correct value", () => {
    render(<EmailInputSection {...defaultProps} />);

    const input = screen.getByTestId("email-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test@example.com");
  });

  it("should render email label", () => {
    render(<EmailInputSection {...defaultProps} />);

    expect(screen.getByText("SETTINGS$USER_EMAIL")).toBeInTheDocument();
  });

  it("should call onEmailChange when input value changes", async () => {
    const user = userEvent.setup();
    const mockOnEmailChange = vi.fn();
    render(
      <EmailInputSection {...defaultProps} onEmailChange={mockOnEmailChange} />,
    );

    const input = screen.getByTestId("email-input");
    await user.type(input, "a");

    expect(mockOnEmailChange).toHaveBeenCalled();
  });

  it("should disable save button when email is not changed", () => {
    render(<EmailInputSection {...defaultProps} isEmailChanged={false} />);

    const saveButton = screen.getByTestId("save-email-button");
    expect(saveButton).toBeDisabled();
  });

  it("should enable save button when email is changed and valid", () => {
    render(
      <EmailInputSection
        {...defaultProps}
        isEmailChanged={true}
        isEmailValid={true}
      />,
    );

    const saveButton = screen.getByTestId("save-email-button");
    expect(saveButton).not.toBeDisabled();
  });

  it("should disable save button when email is invalid", () => {
    render(
      <EmailInputSection
        {...defaultProps}
        isEmailChanged={true}
        isEmailValid={false}
      />,
    );

    const saveButton = screen.getByTestId("save-email-button");
    expect(saveButton).toBeDisabled();
  });

  it("should disable save button when saving", () => {
    render(
      <EmailInputSection
        {...defaultProps}
        isEmailChanged={true}
        isSaving={true}
      />,
    );

    const saveButton = screen.getByTestId("save-email-button");
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent("SETTINGS$SAVING");
  });

  it("should call onSaveEmail when save button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnSaveEmail = vi.fn();
    render(
      <EmailInputSection
        {...defaultProps}
        isEmailChanged={true}
        onSaveEmail={mockOnSaveEmail}
      />,
    );

    await user.click(screen.getByTestId("save-email-button"));

    expect(mockOnSaveEmail).toHaveBeenCalledTimes(1);
  });

  it("should show resend verification button when email is not verified", () => {
    render(<EmailInputSection {...defaultProps} emailVerified={false} />);

    expect(
      screen.getByTestId("resend-verification-button"),
    ).toBeInTheDocument();
  });

  it("should not show resend verification button when email is verified", () => {
    render(<EmailInputSection {...defaultProps} emailVerified={true} />);

    expect(
      screen.queryByTestId("resend-verification-button"),
    ).not.toBeInTheDocument();
  });

  it("should call onResendVerification when resend button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnResendVerification = vi.fn();
    render(
      <EmailInputSection
        {...defaultProps}
        emailVerified={false}
        onResendVerification={mockOnResendVerification}
      />,
    );

    await user.click(screen.getByTestId("resend-verification-button"));

    expect(mockOnResendVerification).toHaveBeenCalledTimes(1);
  });

  it("should disable resend button when resending verification", () => {
    render(
      <EmailInputSection
        {...defaultProps}
        emailVerified={false}
        isResendingVerification={true}
      />,
    );

    const resendButton = screen.getByTestId("resend-verification-button");
    expect(resendButton).toBeDisabled();
    expect(resendButton).toHaveTextContent("SETTINGS$SENDING");
  });

  it("should show validation error when email is changed and invalid", () => {
    render(
      <EmailInputSection
        {...defaultProps}
        isEmailChanged={true}
        isEmailValid={false}
      />,
    );

    expect(
      screen.getByTestId("email-validation-error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("SETTINGS$INVALID_EMAIL_FORMAT"),
    ).toBeInTheDocument();
  });

  it("should not show validation error when email is valid", () => {
    render(
      <EmailInputSection
        {...defaultProps}
        isEmailChanged={true}
        isEmailValid={true}
      />,
    );

    expect(
      screen.queryByTestId("email-validation-error"),
    ).not.toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <EmailInputSection {...defaultProps}>
        <div data-testid="child-element">Child content</div>
      </EmailInputSection>,
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });
});
