import React from "react";
import { useTranslation } from "react-i18next";

interface EmailInputSectionProps {
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
}

export function EmailInputSection({
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
}: EmailInputSectionProps) {
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
