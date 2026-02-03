import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import { clearLoginData } from "#/utils/local-storage";

export const useDeleteAccount = () => {
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // TODO: Implement API call to delete user account
      // await openHands.delete("/api/user", { withCredentials: true });
    },
    onSuccess: async () => {
      // Clear all cached queries
      queryClient.removeQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["settings"] });
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["secrets"] });
      queryClient.removeQueries({ queryKey: ["api-keys"] });
      queryClient.removeQueries({ queryKey: ["conversations"] });

      // Clear login data from local storage
      clearLoginData();

      // Reset analytics
      posthog.reset();

      // Redirect to home page after account deletion
      window.location.href = "/";
    },
  });
};
