import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DangerZone } from "#/components/features/settings/user-settings/danger-zone";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DangerZone", () => {
  it("should render the danger zone section with correct content", () => {
    const mockOnDeleteAccountClick = vi.fn();
    render(<DangerZone onDeleteAccountClick={mockOnDeleteAccountClick} />);

    expect(screen.getByText("SETTINGS$DANGER_ZONE")).toBeInTheDocument();
    // SETTINGS$DELETE_ACCOUNT appears twice (title and button), so we use getAllByText
    expect(screen.getAllByText("SETTINGS$DELETE_ACCOUNT")).toHaveLength(2);
    expect(
      screen.getByText("SETTINGS$DELETE_ACCOUNT_DESCRIPTION"),
    ).toBeInTheDocument();
  });

  it("should render delete account button", () => {
    const mockOnDeleteAccountClick = vi.fn();
    render(<DangerZone onDeleteAccountClick={mockOnDeleteAccountClick} />);

    expect(
      screen.getByTestId("delete-account-button"),
    ).toBeInTheDocument();
  });

  it("should call onDeleteAccountClick when delete button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnDeleteAccountClick = vi.fn();
    render(<DangerZone onDeleteAccountClick={mockOnDeleteAccountClick} />);

    await user.click(screen.getByTestId("delete-account-button"));

    expect(mockOnDeleteAccountClick).toHaveBeenCalledTimes(1);
  });

  it("should have the correct test id", () => {
    const mockOnDeleteAccountClick = vi.fn();
    render(<DangerZone onDeleteAccountClick={mockOnDeleteAccountClick} />);

    expect(screen.getByTestId("danger-zone")).toBeInTheDocument();
  });
});
