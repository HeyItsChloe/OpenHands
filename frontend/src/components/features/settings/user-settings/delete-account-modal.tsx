import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { BrandButton } from "#/components/features/settings/brand-button";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: DeleteAccountModalProps) {
  const { t } = useTranslation();
  const [emailConfirmation, setEmailConfirmation] = useState("");

  const isEmailMatch = userEmail.length > 0 && emailConfirmation === userEmail;

  const handleClose = () => {
    setEmailConfirmation("");
    onClose();
  };

  const handleConfirm = () => {
    if (isEmailMatch) {
      setEmailConfirmation("");
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClose={handleClose}>
      <div
        className="bg-base-secondary p-6 rounded-xl flex flex-col gap-4 border border-tertiary"
        style={{ width: "500px" }}
        data-testid="delete-account-modal"
      >
        <h3 className="text-xl font-bold">
          {t(I18nKey.SETTINGS$DELETE_ACCOUNT)}
        </h3>
        <p className="text-sm text-[#A3A3A3]">
          {t(I18nKey.SETTINGS$DELETE_ACCOUNT_CONFIRMATION)}
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="email-confirmation">
            {t(I18nKey.SETTINGS$USER_EMAIL)}
          </label>
          <input
            id="email-confirmation"
            type="email"
            value={emailConfirmation}
            onChange={(e) => setEmailConfirmation(e.target.value)}
            className="text-base text-white p-2 rounded-sm border border-tertiary"
            style={{ backgroundColor: "#2D2F36" }}
            data-testid="delete-account-email-input"
          />
        </div>
        <div className="w-full flex gap-2 mt-2">
          <BrandButton
            type="button"
            variant="danger"
            className="grow"
            onClick={handleConfirm}
            isDisabled={!isEmailMatch}
            testId="confirm-delete-account-button"
          >
            {t(I18nKey.SETTINGS$DELETE_ACCOUNT)}
          </BrandButton>
          <BrandButton
            type="button"
            variant="secondary"
            className="grow"
            onClick={handleClose}
            testId="cancel-delete-account-button"
          >
            {t(I18nKey.BUTTON$CANCEL)}
          </BrandButton>
        </div>
      </div>
    </ModalBackdrop>
  );
}
