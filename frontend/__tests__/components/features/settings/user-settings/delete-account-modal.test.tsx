import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteAccountModal } from "#/components/features/settings/user-settings/delete-account-modal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DeleteAccountModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    userEmail: "test@example.com",
  };

  it("should not render when isOpen is false", () => {
    render(<DeleteAccountModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByTestId("delete-account-modal"),
    ).not.toBeInTheDocument();
  });

  it("should render modal when isOpen is true", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    expect(screen.getByTestId("delete-account-modal")).toBeInTheDocument();
  });

  it("should render modal title", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    // SETTINGS$DELETE_ACCOUNT appears twice (title and button), check by role
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("SETTINGS$DELETE_ACCOUNT");
  });

  it("should render confirmation message", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    expect(
      screen.getByText("SETTINGS$DELETE_ACCOUNT_CONFIRMATION"),
    ).toBeInTheDocument();
  });

  it("should render email input initially empty", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    const input = screen.getByTestId("delete-account-email-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("should render email label", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    expect(screen.getByText("SETTINGS$USER_EMAIL")).toBeInTheDocument();
  });

  it("should disable delete button by default when input is empty", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    const confirmButton = screen.getByTestId("confirm-delete-account-button");
    expect(confirmButton).toBeDisabled();
  });

  it("should keep delete button disabled when input does not match user email", async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal {...defaultProps} />);

    const input = screen.getByTestId("delete-account-email-input");
    await user.type(input, "wrong@email.com");

    const confirmButton = screen.getByTestId("confirm-delete-account-button");
    expect(confirmButton).toBeDisabled();
  });

  it("should enable delete button when input matches user email exactly", async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal {...defaultProps} />);

    const input = screen.getByTestId("delete-account-email-input");
    expect(input).toHaveValue("");

    await user.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");

    const confirmButton = screen.getByTestId("confirm-delete-account-button");
    expect(confirmButton).not.toBeDisabled();
  });

  it("should call onConfirm when delete button is clicked and email matches", async () => {
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();
    render(<DeleteAccountModal {...defaultProps} onConfirm={mockOnConfirm} />);

    const input = screen.getByTestId("delete-account-email-input");
    await user.type(input, "test@example.com");

    await user.click(screen.getByTestId("confirm-delete-account-button"));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<DeleteAccountModal {...defaultProps} onClose={mockOnClose} />);

    await user.click(screen.getByTestId("cancel-delete-account-button"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should clear email input when modal is closed via cancel", async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<DeleteAccountModal {...defaultProps} onClose={mockOnClose} />);

    const input = screen.getByTestId("delete-account-email-input");
    await user.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");

    await user.click(screen.getByTestId("cancel-delete-account-button"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should disable delete button when userEmail prop is empty", () => {
    render(<DeleteAccountModal {...defaultProps} userEmail="" />);

    const confirmButton = screen.getByTestId("confirm-delete-account-button");
    expect(confirmButton).toBeDisabled();
  });

  it("should keep delete button disabled even if both input and userEmail are empty", async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal {...defaultProps} userEmail="" />);

    const input = screen.getByTestId("delete-account-email-input");
    await user.clear(input);

    const confirmButton = screen.getByTestId("confirm-delete-account-button");
    expect(confirmButton).toBeDisabled();
  });

  it("should render cancel button with correct text", () => {
    render(<DeleteAccountModal {...defaultProps} />);

    expect(
      screen.getByTestId("cancel-delete-account-button"),
    ).toBeInTheDocument();
    expect(screen.getByText("BUTTON$CANCEL")).toBeInTheDocument();
  });
});
