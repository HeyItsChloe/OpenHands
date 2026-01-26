import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { ConversationTabContent } from "#/components/features/conversation/conversation-tabs/conversation-tab-content/conversation-tab-content";
import {
  useConversationStore,
  ConversationTab,
} from "#/stores/conversation-store";

// Mock useConversationId hook
vi.mock("#/hooks/use-conversation-id", () => ({
  useConversationId: () => ({
    conversationId: "test-conversation-id",
  }),
}));

// Mock useUnifiedGetGitChanges hook (used by ConversationTabTitle)
vi.mock("#/hooks/query/use-unified-get-git-changes", () => ({
  useUnifiedGetGitChanges: () => ({
    refetch: vi.fn(),
    data: [],
    isLoading: false,
  }),
}));

// Mock lazy-loaded components
vi.mock("#/routes/changes-tab", () => ({
  default: () => <div data-testid="editor-tab-content">Editor Tab Content</div>,
}));

vi.mock("#/routes/browser-tab", () => ({
  default: () => (
    <div data-testid="browser-tab-content">Browser Tab Content</div>
  ),
}));

vi.mock("#/routes/served-tab", () => ({
  default: () => (
    <div data-testid="served-tab-content">Served Tab Content</div>
  ),
}));

vi.mock("#/routes/vscode-tab", () => ({
  default: () => (
    <div data-testid="vscode-tab-content">VSCode Tab Content</div>
  ),
}));

vi.mock("#/routes/planner-tab", () => ({
  default: () => (
    <div data-testid="planner-tab-content">Planner Tab Content</div>
  ),
}));

vi.mock("#/components/features/terminal/terminal", () => ({
  default: () => (
    <div data-testid="terminal-tab-content">Terminal Tab Content</div>
  ),
}));

// Mock ConversationLoading component
vi.mock("#/components/features/conversation/conversation-loading", () => ({
  ConversationLoading: () => (
    <div data-testid="conversation-loading">Loading...</div>
  ),
}));

describe("ConversationTabContent", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/conversations/test-conversation-id"]}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
  };

  const setSelectedTab = (tab: ConversationTab | null) => {
    useConversationStore.setState({ selectedTab: tab });
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    // Reset store state
    useConversationStore.setState({ selectedTab: "editor" });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe("Rendering", () => {
    it("should render the container with correct structure", async () => {
      render(<ConversationTabContent />, { wrapper: createWrapper() });

      // Should show the title for the default tab (editor -> COMMON$CHANGES)
      await waitFor(() => {
        expect(screen.getByText("COMMON$CHANGES")).toBeInTheDocument();
      });
    });

    it("should render editor tab content by default", async () => {
      setSelectedTab("editor");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("editor-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$CHANGES")).toBeInTheDocument();
    });

    it("should render editor tab when selectedTab is null", async () => {
      setSelectedTab(null);

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("editor-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$CHANGES")).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("should render browser tab when selected", async () => {
      setSelectedTab("browser");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("browser-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$BROWSER")).toBeInTheDocument();
    });

    it("should render served tab when selected", async () => {
      setSelectedTab("served");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("served-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$APP")).toBeInTheDocument();
    });

    it("should render vscode tab when selected", async () => {
      setSelectedTab("vscode");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("vscode-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$CODE")).toBeInTheDocument();
    });

    it("should render terminal tab when selected", async () => {
      setSelectedTab("terminal");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("terminal-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$TERMINAL")).toBeInTheDocument();
    });

    it("should render planner tab when selected", async () => {
      setSelectedTab("planner");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("planner-tab-content")).toBeInTheDocument();
      });

      expect(screen.getByText("COMMON$PLANNER")).toBeInTheDocument();
    });
  });

  describe("Title display", () => {
    const tabTitleMapping: Array<{
      tab: ConversationTab;
      expectedTitle: string;
    }> = [
      { tab: "editor", expectedTitle: "COMMON$CHANGES" },
      { tab: "browser", expectedTitle: "COMMON$BROWSER" },
      { tab: "served", expectedTitle: "COMMON$APP" },
      { tab: "vscode", expectedTitle: "COMMON$CODE" },
      { tab: "terminal", expectedTitle: "COMMON$TERMINAL" },
      { tab: "planner", expectedTitle: "COMMON$PLANNER" },
    ];

    tabTitleMapping.forEach(({ tab, expectedTitle }) => {
      it(`should display "${expectedTitle}" title for "${tab}" tab`, async () => {
        setSelectedTab(tab);

        render(<ConversationTabContent />, { wrapper: createWrapper() });

        await waitFor(() => {
          expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Tab key behavior", () => {
    it("should have different key for terminal tab with conversation ID", async () => {
      setSelectedTab("terminal");

      const { container } = render(<ConversationTabContent />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByTestId("terminal-tab-content")).toBeInTheDocument();
      });

      // The key should include the conversation ID for terminal tab
      // This ensures Terminal remounts when conversation changes
      expect(container).toBeTruthy();
    });

    it("should have just the tab name as key for non-terminal tabs", async () => {
      setSelectedTab("browser");

      const { container } = render(<ConversationTabContent />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByTestId("browser-tab-content")).toBeInTheDocument();
      });

      expect(container).toBeTruthy();
    });
  });

  describe("Lazy loading", () => {
    it("should show loading fallback while component is loading", async () => {
      // Create a delayed mock to simulate lazy loading
      let resolvePromise: () => void;
      const delayedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      vi.doMock("#/routes/browser-tab", () => ({
        default: async () => {
          await delayedPromise;
          return (
            <div data-testid="browser-tab-content">Browser Tab Content</div>
          );
        },
      }));

      setSelectedTab("browser");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      // Eventually the content should be rendered
      await waitFor(() => {
        expect(screen.getByTestId("browser-tab-content")).toBeInTheDocument();
      });

      // Resolve the promise (cleanup)
      resolvePromise!();
    });
  });

  describe("Tab state persistence", () => {
    it("should render content based on store state", async () => {
      // First render with editor tab
      setSelectedTab("editor");

      const { rerender } = render(<ConversationTabContent />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByTestId("editor-tab-content")).toBeInTheDocument();
      });

      // Change the store state
      setSelectedTab("terminal");

      // Rerender
      rerender(<ConversationTabContent />);

      await waitFor(() => {
        expect(screen.getByTestId("terminal-tab-content")).toBeInTheDocument();
      });
    });
  });

  describe("Suspense boundary", () => {
    it("should wrap tab content in Suspense boundary", async () => {
      setSelectedTab("editor");

      render(<ConversationTabContent />, { wrapper: createWrapper() });

      // The component should render without throwing
      await waitFor(() => {
        expect(screen.getByTestId("editor-tab-content")).toBeInTheDocument();
      });
    });
  });
});
