import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "#/hooks/query/use-settings";
import { openHands } from "#/api/open-hands-axios";
import { displaySuccessToast } from "#/utils/custom-toast-handlers";
import { useEmailVerification } from "#/hooks/use-email-verification";
import { I18nKey } from "#/i18n/declaration";
import { BrandButton } from "#/components/features/settings/brand-button";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { useConfig } from "#/hooks/query/use-config";

// Email validation regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function EmailInputSection({
  email,
  onEmailChange,
  onSaveEmail,
  onResendVerification,
  isSaving,
  isResendingVerification,
  isEmailChanged,
  emailVerified,
  isEmailValid,
  children,
}: {
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEmail: () => void;
  onResendVerification: () => void;
  isSaving: boolean;
  isResendingVerification: boolean;
  isEmailChanged: boolean;
  emailVerified?: boolean;
  isEmailValid: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm">{t("SETTINGS$USER_EMAIL")}</label>
        <div className="flex items-center gap-3">
          <input
            type="email"
            value={email}
            onChange={onEmailChange}
            className={`text-base text-white p-2 bg-base-tertiary rounded-sm border ${
              isEmailChanged && !isEmailValid
                ? "border-red-500"
                : "border-tertiary"
            } flex-grow`}
            placeholder={t("SETTINGS$USER_EMAIL_LOADING")}
            data-testid="email-input"
          />
        </div>

        {isEmailChanged && !isEmailValid && (
          <div
            className="text-red-500 text-sm mt-1"
            data-testid="email-validation-error"
          >
            {t("SETTINGS$INVALID_EMAIL_FORMAT")}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={onSaveEmail}
            disabled={!isEmailChanged || isSaving || !isEmailValid}
            className="px-4 py-2 rounded-sm bg-primary text-white hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:text-[#0D0F11]"
            data-testid="save-email-button"
          >
            {isSaving ? t("SETTINGS$SAVING") : t("SETTINGS$SAVE")}
          </button>

          {emailVerified === false && (
            <button
              type="button"
              onClick={onResendVerification}
              disabled={isResendingVerification}
              className="px-4 py-2 rounded-sm bg-primary text-white hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed disabled:text-[#0D0F11]"
              data-testid="resend-verification-button"
            >
              {isResendingVerification
                ? t("SETTINGS$SENDING")
                : t("SETTINGS$RESEND_VERIFICATION")}
            </button>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

function VerificationAlert() {
  const { t } = useTranslation();
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm mt-4"
      role="alert"
    >
      <p className="font-bold">{t("SETTINGS$EMAIL_VERIFICATION_REQUIRED")}</p>
      <p className="text-sm">
        {t("SETTINGS$EMAIL_VERIFICATION_RESTRICTION_MESSAGE")}
      </p>
    </div>
  );
}

// These components have been replaced with toast notifications

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
}

function DeleteAccountModal({
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
            placeholder={userEmail}
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

function DangerZone({
  onDeleteAccountClick,
}: {
  onDeleteAccountClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="mt-8 border border-red-600 rounded-lg p-4"
      data-testid="danger-zone"
    >
      <h3 className="text-lg font-semibold text-red-500 mb-4">
        {t(I18nKey.SETTINGS$DANGER_ZONE)}
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {t(I18nKey.SETTINGS$DELETE_ACCOUNT)}
          </span>
          <span className="text-sm text-[#A3A3A3]">
            {t(I18nKey.SETTINGS$DELETE_ACCOUNT_DESCRIPTION)}
          </span>
        </div>
        <BrandButton
          type="button"
          variant="danger"
          onClick={onDeleteAccountClick}
          testId="delete-account-button"
        >
          {t(I18nKey.SETTINGS$DELETE_ACCOUNT)}
        </BrandButton>
      </div>
    </div>
  );
}

function UserSettingsScreen() {
  const { t } = useTranslation();
  const { data: config } = useConfig();
  const { data: settings, isLoading, refetch } = useSettings();
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<number | null>(null);
  const prevVerificationStatusRef = useRef<boolean | undefined>(undefined);
  const { resendEmailVerification, isResendingVerification } =
    useEmailVerification();

  const showDangerZone =
    config?.APP_MODE === "saas" && config?.FEATURE_FLAGS?.ENABLE_DELETE_ACCOUNT;

  useEffect(() => {
    if (settings?.email) {
      setEmail(settings.email);
      setOriginalEmail(settings.email);
      setIsEmailValid(EMAIL_REGEX.test(settings.email));
    }
  }, [settings?.email]);

  useEffect(() => {
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (
      prevVerificationStatusRef.current === false &&
      settings?.email_verified === true
    ) {
      // Display toast notification instead of setting state
      displaySuccessToast(t("SETTINGS$EMAIL_VERIFIED_SUCCESSFULLY"));
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }, 2000);
    }

    prevVerificationStatusRef.current = settings?.email_verified;

    if (settings?.email_verified === false) {
      pollingIntervalRef.current = window.setInterval(() => {
        refetch();
      }, 5000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [settings?.email_verified, refetch, queryClient, t]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(EMAIL_REGEX.test(newEmail));
  };

  const handleSaveEmail = async () => {
    if (email === originalEmail || !isEmailValid) return;
    try {
      setIsSaving(true);
      await openHands.post("/api/email", { email }, { withCredentials: true });
      setOriginalEmail(email);
      // Display toast notification instead of setting state
      displaySuccessToast(t("SETTINGS$EMAIL_SAVED_SUCCESSFULLY"));
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(t("SETTINGS$FAILED_TO_SAVE_EMAIL"), error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendVerification = () => {
    resendEmailVerification({});
  };

  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAccountConfirm = () => {
    // TODO: Implement account deletion API call
    setIsDeleteModalOpen(false);
  };

  const handleDeleteAccountCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const isEmailChanged = email !== originalEmail;

  return (
    <div data-testid="user-settings-screen" className="flex flex-col h-full">
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="animate-pulse h-8 w-64 bg-tertiary rounded-sm" />
        ) : (
          <EmailInputSection
            email={email}
            onEmailChange={handleEmailChange}
            onSaveEmail={handleSaveEmail}
            onResendVerification={handleResendVerification}
            isSaving={isSaving}
            isResendingVerification={isResendingVerification}
            isEmailChanged={isEmailChanged}
            emailVerified={settings?.email_verified}
            isEmailValid={isEmailValid}
          >
            {settings?.email_verified === false && <VerificationAlert />}
          </EmailInputSection>
        )}
      </div>

      {showDangerZone && (
        <>
          <DangerZone onDeleteAccountClick={handleDeleteAccountClick} />

          <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={handleDeleteAccountCancel}
            onConfirm={handleDeleteAccountConfirm}
            userEmail={originalEmail}
          />
        </>
      )}
    </div>
  );
}

export default UserSettingsScreen;
