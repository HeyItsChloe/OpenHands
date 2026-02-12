import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { displayErrorToast } from "#/utils/custom-toast-handlers";

type SubmitOnboardingArgs = {
  selections: Record<string, string>;
};

export const useSubmitOnboarding = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ selections }: SubmitOnboardingArgs) =>
      // TODO: persist user responses
      selections,
    onSuccess: () => {
      // Delete onboarding cookie
      document.cookie =
        "is_new_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      navigate("/");
    },
    onError: (error) => {
      displayErrorToast(error.message);
    },
  });
};
