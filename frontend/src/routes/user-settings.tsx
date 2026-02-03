import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "#/hooks/query/use-settings";
import { openHands } from "#/api/open-hands-axios";
import { displaySuccessToast } from "#/utils/custom-toast-handlers";
import { useEmailVerification } from "#/hooks/use-email-verification";
import { useConfig } from "#/hooks/query/use-config";
import { useDeleteAccount } from "#/hooks/mutation/use-delete-account";
import { EmailInputSection } from "#/components/features/settings/user-settings/email-input-section";
import { VerificationAlert } from "#/components/features/settings/user-settings/verification-alert";
import { DeleteAccountModal } from "#/components/features/settings/user-settings/delete-account-modal";
import { DangerZone } from "#/components/features/settings/user-settings/danger-zone";

// Email validation regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
  const { mutate: deleteAccount } = useDeleteAccount();

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
    deleteAccount();
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
