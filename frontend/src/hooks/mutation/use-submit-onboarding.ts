import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import AuthService from "#/api/auth-service/auth-service.api";
import { displayErrorToast } from "#/utils/custom-toast-handlers";

type SubmitOnboardingArgs = {
  selections: Record<string, string>;
};

export const useSubmitOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  return useMutation({
    mutationFn: async ({ selections }: SubmitOnboardingArgs) => {
      const redirectUrl = searchParams.get("redirect_url") || "/";
      // Mark onboarding as complete in the backend
      const response = await AuthService.completeOnboarding(redirectUrl);
      // TODO: persist user responses
      return { selections, redirect_url: response.redirect_url };
    },
    onSuccess: (data) => {
      // Invalidate settings to refetch needs_onboarding
      queryClient.invalidateQueries({ queryKey: ["settings"] });

      const finalRedirectUrl = data.redirect_url;
      // Check if the redirect URL is an external URL (starts with http or https)
      if (
        finalRedirectUrl.startsWith("http://") ||
        finalRedirectUrl.startsWith("https://")
      ) {
        // For external URLs, redirect using window.location
        window.location.href = finalRedirectUrl;
      } else {
        // For internal routes, use navigate
        navigate(finalRedirectUrl);
      }
    },
    onError: (error) => {
      displayErrorToast(error.message);
    },
  });
};
