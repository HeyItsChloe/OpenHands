export interface NavItem {
  id: string;
  title: string;
  route: string;
  children?: NavItem[];
  badge?: string;
  isNew?: boolean;
}

export interface TopTab {
  id: string;
  title: string;
  slug: string;
  icon?: string;
}

export interface Repo {
  id: string;
  title: string;
  defaultTab: string;
}

// ── Level 1: Repos ──────────────────────────────────────────────────────────
export const repos: Repo[] = [
  { id: 'all-repos',    title: 'All Repos',    defaultTab: 'ar-overview' },
  { id: 'openhands', title: 'OpenHands', defaultTab: 'introduction' },
  { id: 'deploy',    title: 'Deploy',    defaultTab: 'deploy-overview' },
  { id: 'sdk',           title: 'SDK',          defaultTab: 'sdk-introduction' },
  { id: 'agent-canvas',  title: 'Agent Canvas',  defaultTab: 'ac-introduction' },
  { id: 'architecture',  title: 'Architecture',  defaultTab: 'arch-introduction' },
];

// ── Level 2: Sub-tabs per repo ───────────────────────────────────────────────
export const tabsByRepo: Record<string, TopTab[]> = {
  'all-repos': [
    { id: 'ar-overview',      title: 'Overview',         slug: '/all-repos' },
    { id: 'ar-how-connected', title: 'How They Connect', slug: '/all-repos/connections' },
    { id: 'ar-databases',     title: 'Databases',        slug: '/all-repos/databases' },
    { id: 'ar-repo-ref',      title: 'Repo Reference',   slug: '/all-repos/repos' },
    { id: 'ar-contributing',  title: 'Contributing',     slug: '/all-repos/contributing' },
    { id: 'ar-glossary',      title: 'Glossary',         slug: '/all-repos/glossary' },
  ],
  openhands: [
    { id: 'introduction',    title: 'Introduction',    slug: '/' },
    { id: 'getting-started', title: 'Getting Started', slug: '/getting-started' },
    { id: 'installation',    title: 'Installation',    slug: '/installation' },
    { id: 'products',        title: 'Products',        slug: '/products' },
    { id: 'features',        title: 'Features',        slug: '/features' },
    { id: 'api',             title: 'API Reference',   slug: '/api' },
    { id: 'configuration',   title: 'Configuration',   slug: '/configuration' },
    { id: 'integrations',    title: 'Integrations',    slug: '/integrations' },
    { id: 'enterprise',      title: 'Enterprise',      slug: '/enterprise' },
    { id: 'contributing',    title: 'Contributing',    slug: '/contributing' },
    { id: 'changelog',       title: 'Changelog',       slug: '/changelog' },
  ],
  deploy: [
    { id: 'deploy-overview',     title: 'Overview',       slug: '/deploy' },
    { id: 'deploy-architecture', title: 'Architecture',   slug: '/deploy/architecture' },
    { id: 'deploy-components',   title: 'Components',     slug: '/deploy/components' },
    { id: 'environments',        title: 'Environments',   slug: '/deploy/environments' },
    { id: 'release-and-deploy',  title: 'Release & Deploy', slug: '/deploy/release' },
    { id: 'secrets-and-ops',     title: 'Secrets & Ops',  slug: '/deploy/secrets' },
    { id: 'deploy-testing',      title: 'Testing',        slug: '/deploy/testing' },
    { id: 'cicd-reference',      title: 'CI/CD Reference', slug: '/deploy/cicd' },
    { id: 'deploy-dev-guide',    title: 'Dev Guide',      slug: '/deploy/dev-guide' },
  ],
  sdk: [
    { id: 'sdk-introduction',    title: 'Introduction',   slug: '/sdk' },
    { id: 'sdk-getting-started', title: 'Getting Started', slug: '/sdk/getting-started' },
    { id: 'sdk-architecture',    title: 'Architecture',   slug: '/sdk/arch' },
    { id: 'sdk-guides',          title: 'Guides',         slug: '/sdk/guides' },
    { id: 'sdk-api-reference',   title: 'API Reference',  slug: '/sdk/api' },
    { id: 'sdk-examples',        title: 'Examples',       slug: '/sdk/examples' },
    { id: 'sdk-changelog',       title: 'Changelog',      slug: '/sdk/changelog' },
  ],
  'agent-canvas': [
    { id: 'ac-introduction',  title: 'Introduction',     slug: '/agent-canvas' },
    { id: 'ac-getting-started', title: 'Getting Started', slug: '/agent-canvas/getting-started' },
    { id: 'ac-features',      title: 'Features',         slug: '/agent-canvas/features' },
    { id: 'ac-automations',   title: 'Automations',      slug: '/agent-canvas/automations' },
    { id: 'ac-self-hosting',  title: 'Self-Hosting',     slug: '/agent-canvas/self-hosting' },
    { id: 'ac-embedding',     title: 'Embedding',        slug: '/agent-canvas/embedding' },
    { id: 'ac-configuration', title: 'Configuration',    slug: '/agent-canvas/configuration' },
    { id: 'ac-integrations',  title: 'Integrations',     slug: '/agent-canvas/integrations' },
    { id: 'ac-contributing',  title: 'Contributing',     slug: '/agent-canvas/contributing' },
    { id: 'ac-changelog',     title: 'Changelog',        slug: '/agent-canvas/changelog' },
  ],
  architecture: [
    { id: 'arch-introduction', title: 'Introduction',       slug: '/arch-repo' },
    { id: 'arch-decisions',    title: 'Decision Records',   slug: '/arch-repo/decisions' },
    { id: 'arch-design',       title: 'Product Design (PD)', slug: '/arch-repo/product-design' },
    { id: 'arch-research',     title: 'Research (PR)',       slug: '/arch-repo/research' },
    { id: 'arch-process',      title: 'Process',             slug: '/arch-repo/process' },
    { id: 'arch-diagrams',     title: 'Diagrams',            slug: '/arch-repo/diagrams' },
  ],
};

// Flat list of all tabs (used for lookups)
export const topTabs: TopTab[] = Object.values(tabsByRepo).flat();

export const navigationByTab: Record<string, NavItem[]> = {
  introduction: [
    {
      id: 'what-is-openhands',
      title: 'What is OpenHands?',
      route: '/',
    },
    {
      id: 'architecture',
      title: 'Architecture Overview',
      route: '/architecture',
    },
    {
      id: 'how-it-works',
      title: 'How Agents Work',
      route: '/how-it-works',
    },
    {
      id: 'comparison',
      title: 'Comparison Table',
      route: '/comparison',
    },
    {
      id: 'faq',
      title: 'FAQ',
      route: '/faq',
    },
  ],

  'getting-started': [
    {
      id: 'gs-cloud',
      title: 'Quickstart — Cloud',
      route: '/getting-started/cloud',
    },
    {
      id: 'gs-local-oss',
      title: 'Quickstart — Local GUI (OSS)',
      route: '/getting-started/local-oss',
    },
    {
      id: 'gs-local-saas',
      title: 'Quickstart — Local GUI (SaaS)',
      route: '/getting-started/local-saas',
    },
    {
      id: 'gs-cli',
      title: 'Quickstart — CLI',
      route: '/getting-started/cli',
    },
    {
      id: 'gs-sdk',
      title: 'Quickstart — SDK',
      route: '/getting-started/sdk',
    },
    {
      id: 'onboarding',
      title: 'Onboarding Flow',
      route: '/getting-started/onboarding',
    },
  ],

  installation: [
    {
      id: 'install-local-oss',
      title: 'Local GUI — OSS',
      route: '/installation/local-oss',
      children: [
        { id: 'docker', title: 'Docker (Recommended)', route: '/installation/local-oss/docker' },
        { id: 'docker-compose', title: 'Docker Compose', route: '/installation/local-oss/docker-compose' },
        { id: 'macos', title: 'macOS from Source', route: '/installation/local-oss/macos' },
        { id: 'linux', title: 'Linux from Source', route: '/installation/local-oss/linux' },
        { id: 'windows', title: 'Windows (WSL2)', route: '/installation/local-oss/windows' },
        { id: 'devcontainer', title: 'Dev Container', route: '/installation/local-oss/devcontainer' },
        { id: 'docker-dev', title: 'Docker Dev Environment', route: '/installation/local-oss/docker-dev' },
        { id: 'no-sudo', title: 'No-sudo (Conda/Mamba)', route: '/installation/local-oss/no-sudo' },
      ],
    },
    {
      id: 'install-local-saas',
      title: 'Local GUI — SaaS Mode',
      route: '/installation/local-saas',
      children: [
        { id: 'saas-overview', title: 'Overview', route: '/installation/local-saas' },
        { id: 'saas-prereqs', title: 'Prerequisites', route: '/installation/local-saas/prerequisites' },
        { id: 'saas-run', title: 'Build & Run', route: '/installation/local-saas/run' },
        { id: 'saas-llm', title: 'LLM Configuration', route: '/installation/local-saas/llm-config' },
        { id: 'saas-headless', title: 'Headless / CLI Config', route: '/installation/local-saas/headless-config' },
      ],
    },
    {
      id: 'install-cloud',
      title: 'OpenHands Cloud',
      route: '/installation/cloud',
      children: [
        { id: 'cloud-access', title: 'Accessing Cloud', route: '/installation/cloud' },
        { id: 'cloud-repo', title: 'Connecting a Repository', route: '/installation/cloud/connect-repo' },
        { id: 'cloud-org', title: 'Organization Setup', route: '/installation/cloud/organization' },
        { id: 'cloud-billing', title: 'Billing & Plans', route: '/installation/cloud/billing' },
      ],
    },
    {
      id: 'install-enterprise',
      title: 'Enterprise Self-Hosted',
      route: '/installation/enterprise',
      children: [
        { id: 'ent-overview', title: 'Overview', route: '/installation/enterprise' },
        { id: 'ent-k8s', title: 'Kubernetes Setup', route: '/installation/enterprise/kubernetes' },
        { id: 'ent-db', title: 'Database & Storage', route: '/installation/enterprise/database' },
        { id: 'ent-auth', title: 'Authentication', route: '/installation/enterprise/auth' },
        { id: 'ent-maint', title: 'Maintenance Tasks', route: '/installation/enterprise/maintenance' },
        { id: 'ent-license', title: 'License', route: '/installation/enterprise/license' },
      ],
    },
    {
      id: 'install-sdk',
      title: 'SDK',
      route: '/installation/sdk',
    },
    {
      id: 'install-cli',
      title: 'CLI',
      route: '/installation/cli',
    },
  ],

  products: [
    { id: 'prod-sdk', title: 'SDK Overview', route: '/products/sdk' },
    { id: 'prod-cli', title: 'CLI Overview', route: '/products/cli' },
    { id: 'prod-local-gui', title: 'Local GUI Overview', route: '/products/local-gui' },
    { id: 'prod-cloud', title: 'Cloud Overview', route: '/products/cloud' },
    { id: 'prod-enterprise', title: 'Enterprise Overview', route: '/products/enterprise' },
  ],

  features: [
    {
      id: 'feat-core',
      title: 'Core Agent Features',
      route: '/features',
      children: [
        { id: 'feat-conversations', title: 'Conversations', route: '/features/conversations' },
        { id: 'feat-agent-state', title: 'Agent State Machine', route: '/features/agent-state' },
        { id: 'feat-planner', title: 'Task Planning', route: '/features/planner' },
        { id: 'feat-sandbox', title: 'Sandbox Execution', route: '/features/sandbox' },
        { id: 'feat-file-editing', title: 'File Editing', route: '/features/file-editing' },
        { id: 'feat-terminal', title: 'Terminal', route: '/features/terminal' },
        { id: 'feat-browser', title: 'Browser Control', route: '/features/browser' },
        { id: 'feat-vscode', title: 'VSCode Integration', route: '/features/vscode' },
        { id: 'feat-sharing', title: 'Shared Conversations', route: '/features/sharing' },
        { id: 'feat-recent', title: 'Recent Conversations', route: '/features/recent-conversations' },
      ],
    },
    {
      id: 'feat-settings',
      title: 'Settings & Configuration',
      route: '/features/settings',
      children: [
        { id: 'feat-llm', title: 'LLM Settings', route: '/features/settings/llm' },
        { id: 'feat-agent-settings', title: 'Agent Settings', route: '/features/settings/agent' },
        { id: 'feat-condenser', title: 'Condenser Settings', route: '/features/settings/condenser' },
        { id: 'feat-verification', title: 'Verification Settings', route: '/features/settings/verification' },
        { id: 'feat-mcp-settings', title: 'MCP Settings', route: '/features/settings/mcp' },
        { id: 'feat-skills-settings', title: 'Skills Settings', route: '/features/settings/skills' },
        { id: 'feat-secrets', title: 'Secrets Management', route: '/features/settings/secrets' },
        { id: 'feat-api-keys', title: 'API Keys', route: '/features/settings/api-keys' },
        { id: 'feat-user-settings', title: 'User Settings', route: '/features/settings/user' },
      ],
    },
    {
      id: 'feat-org',
      title: 'Org & Cloud Features',
      route: '/features/org',
      children: [
        { id: 'feat-org-mgmt', title: 'Organization Management', route: '/features/org' },
        { id: 'feat-org-defaults', title: 'Org Defaults', route: '/features/org-defaults' },
        { id: 'feat-billing', title: 'Billing', route: '/features/billing' },
      ],
    },
    {
      id: 'feat-dev',
      title: 'Developer/Integration',
      route: '/features/dev',
      children: [
        { id: 'feat-skills', title: 'Skills System', route: '/features/skills' },
        { id: 'feat-webhooks', title: 'Webhooks', route: '/features/webhooks' },
        { id: 'feat-mcp', title: 'MCP Protocol', route: '/features/mcp' },
        { id: 'feat-pending', title: 'Pending Messages', route: '/features/pending-messages' },
        { id: 'feat-analytics', title: 'Analytics', route: '/features/analytics' },
      ],
    },
  ],

  api: [
    {
      id: 'api-overview',
      title: 'Overview',
      route: '/api',
      children: [
        { id: 'api-intro', title: 'API Overview', route: '/api' },
        { id: 'api-auth', title: 'Authentication', route: '/api/auth' },
      ],
    },
    {
      id: 'api-conversations',
      title: 'Conversations',
      route: '/api/conversations',
      children: [
        { id: 'api-conv-list', title: 'List Conversations', route: '/api/conversations/list' },
        { id: 'api-conv-count', title: 'Count Conversations', route: '/api/conversations/count' },
        { id: 'api-conv-start', title: 'Start Conversation', route: '/api/conversations/start' },
        { id: 'api-conv-update', title: 'Update Conversation', route: '/api/conversations/update' },
        { id: 'api-conv-delete', title: 'Delete Conversation', route: '/api/conversations/delete' },
        { id: 'api-conv-send', title: 'Send Message', route: '/api/conversations/send-message' },
        { id: 'api-conv-stream', title: 'Stream Start', route: '/api/conversations/stream' },
        { id: 'api-conv-export', title: 'Export Conversation', route: '/api/conversations/export' },
        { id: 'api-conv-file', title: 'Read File', route: '/api/conversations/file' },
        { id: 'api-conv-skills', title: 'Get Skills', route: '/api/conversations/skills' },
        { id: 'api-conv-hooks', title: 'Get Hooks', route: '/api/conversations/hooks' },
        { id: 'api-conv-profile', title: 'Switch Profile', route: '/api/conversations/profile' },
        { id: 'api-conv-tasks', title: 'Start Tasks', route: '/api/conversations/start-tasks' },
      ],
    },
    {
      id: 'api-events',
      title: 'Events',
      route: '/api/events',
      children: [
        { id: 'api-events-list', title: 'List Events', route: '/api/events/list' },
        { id: 'api-events-count', title: 'Count Events', route: '/api/events/count' },
        { id: 'api-events-search', title: 'Search Events', route: '/api/events/search' },
      ],
    },
    {
      id: 'api-sandboxes',
      title: 'Sandboxes',
      route: '/api/sandboxes',
      children: [
        { id: 'api-sb-list', title: 'List Sandboxes', route: '/api/sandboxes/list' },
        { id: 'api-sb-create', title: 'Create Sandbox', route: '/api/sandboxes/create' },
        { id: 'api-sb-pause', title: 'Pause Sandbox', route: '/api/sandboxes/pause' },
        { id: 'api-sb-resume', title: 'Resume Sandbox', route: '/api/sandboxes/resume' },
        { id: 'api-sb-delete', title: 'Delete Sandbox', route: '/api/sandboxes/delete' },
        { id: 'api-sb-secrets', title: 'Sandbox Secrets', route: '/api/sandboxes/secrets' },
      ],
    },
    {
      id: 'api-settings',
      title: 'Settings',
      route: '/api/settings',
      children: [
        { id: 'api-settings-get', title: 'Get Settings', route: '/api/settings/get' },
        { id: 'api-settings-update', title: 'Update Settings', route: '/api/settings/update' },
        { id: 'api-settings-agent', title: 'Agent Schema', route: '/api/settings/agent-schema' },
        { id: 'api-settings-conv', title: 'Conversation Schema', route: '/api/settings/conversation-schema' },
        { id: 'api-settings-profiles', title: 'List Profiles', route: '/api/settings/profiles' },
        { id: 'api-settings-profile', title: 'Get Profile', route: '/api/settings/profile-detail' },
        { id: 'api-settings-profile-create', title: 'Create Profile', route: '/api/settings/profile-create' },
        { id: 'api-settings-profile-delete', title: 'Delete Profile', route: '/api/settings/profile-delete' },
        { id: 'api-settings-profile-activate', title: 'Activate Profile', route: '/api/settings/profile-activate' },
        { id: 'api-settings-profile-rename', title: 'Rename Profile', route: '/api/settings/profile-rename' },
      ],
    },
    {
      id: 'api-secrets',
      title: 'Secrets',
      route: '/api/secrets',
      children: [
        { id: 'api-secrets-list', title: 'List Secrets', route: '/api/secrets/list' },
        { id: 'api-secrets-create', title: 'Create Secret', route: '/api/secrets/create' },
        { id: 'api-secrets-update', title: 'Update Secret', route: '/api/secrets/update' },
        { id: 'api-secrets-delete', title: 'Delete Secret', route: '/api/secrets/delete' },
      ],
    },
    {
      id: 'api-git',
      title: 'Git',
      route: '/api/git',
      children: [
        { id: 'api-git-installs', title: 'Search Installations', route: '/api/git/installations' },
        { id: 'api-git-repos', title: 'Search Repositories', route: '/api/git/repositories' },
        { id: 'api-git-branches', title: 'Search Branches', route: '/api/git/branches' },
        { id: 'api-git-tasks', title: 'Suggested Tasks', route: '/api/git/tasks' },
      ],
    },
    {
      id: 'api-webhooks',
      title: 'Webhooks',
      route: '/api/webhooks',
      children: [
        { id: 'api-wh-convs', title: 'Webhook for Conversations', route: '/api/webhooks/conversations' },
        { id: 'api-wh-events', title: 'Webhook for Events', route: '/api/webhooks/events' },
        { id: 'api-wh-secrets', title: 'Webhook Secrets', route: '/api/webhooks/secrets' },
      ],
    },
    {
      id: 'api-users',
      title: 'Users',
      route: '/api/users',
      children: [
        { id: 'api-users-me', title: 'Get Current User', route: '/api/users/me' },
        { id: 'api-users-git', title: 'Get Git Info', route: '/api/users/git-info' },
        { id: 'api-users-skills', title: 'Get Skills', route: '/api/users/skills' },
      ],
    },
    {
      id: 'api-config',
      title: 'Config & Status',
      route: '/api/config',
      children: [
        { id: 'api-config-web', title: 'Web Client Config', route: '/api/config' },
        { id: 'api-health', title: 'Health / Readiness', route: '/api/health' },
      ],
    },
    {
      id: 'api-mcp',
      title: 'MCP',
      route: '/api/mcp',
      children: [
        { id: 'api-mcp-overview', title: 'MCP Overview', route: '/api/mcp' },
        { id: 'api-mcp-tools', title: 'MCP Tools', route: '/api/mcp/tools' },
      ],
    },
    {
      id: 'api-enterprise',
      title: 'Enterprise APIs',
      route: '/api/enterprise',
      badge: 'Enterprise',
      children: [
        { id: 'api-ent-auth', title: 'Auth', route: '/api/enterprise/auth' },
        { id: 'api-ent-orgs', title: 'Org Management', route: '/api/enterprise/orgs' },
        { id: 'api-ent-members', title: 'Org Members', route: '/api/enterprise/org-members' },
        { id: 'api-ent-invites', title: 'Org Invitations', route: '/api/enterprise/invitations' },
        { id: 'api-ent-profiles', title: 'Org Profiles', route: '/api/enterprise/org-profiles' },
        { id: 'api-ent-keys', title: 'API Keys', route: '/api/enterprise/api-keys' },
        { id: 'api-ent-billing', title: 'Billing', route: '/api/enterprise/billing' },
        { id: 'api-ent-analytics', title: 'Analytics Events', route: '/api/enterprise/analytics' },
        { id: 'api-ent-git', title: 'GitHub/Bitbucket Proxy', route: '/api/enterprise/git-proxy' },
        { id: 'api-ent-oauth', title: 'OAuth Device', route: '/api/enterprise/oauth-device' },
      ],
    },
  ],

  configuration: [
    { id: 'config-all', title: 'All Config Options', route: '/configuration' },
    { id: 'config-env', title: 'Environment Variables', route: '/configuration/env-vars' },
    { id: 'config-llm', title: 'LLM Configuration', route: '/configuration/llm' },
    { id: 'config-agent', title: 'Agent Configuration', route: '/configuration/agent' },
    { id: 'config-condenser', title: 'Condenser Configuration', route: '/configuration/condenser' },
    { id: 'config-sandbox', title: 'Sandbox Configuration', route: '/configuration/sandbox' },
    { id: 'config-docker', title: 'Docker Image Reference', route: '/configuration/docker-images' },
  ],

  integrations: [
    { id: 'int-github', title: 'GitHub', route: '/integrations/github' },
    { id: 'int-gitlab', title: 'GitLab', route: '/integrations/gitlab' },
    { id: 'int-bitbucket', title: 'Bitbucket Cloud', route: '/integrations/bitbucket' },
    { id: 'int-bitbucket-dc', title: 'Bitbucket Data Center', route: '/integrations/bitbucket-dc' },
    { id: 'int-azure', title: 'Azure DevOps', route: '/integrations/azure-devops' },
    { id: 'int-forgejo', title: 'Forgejo', route: '/integrations/forgejo' },
    { id: 'int-jira', title: 'Jira', route: '/integrations/jira' },
    { id: 'int-slack', title: 'Slack', route: '/integrations/slack' },
    { id: 'int-linear', title: 'Linear', route: '/integrations/linear' },
    { id: 'int-mcp', title: 'MCP Servers', route: '/integrations/mcp' },
  ],

  enterprise: [
    { id: 'ent-arch', title: 'Architecture', route: '/enterprise/architecture' },
    { id: 'ent-install', title: 'Installation', route: '/enterprise/installation' },
    { id: 'ent-auth', title: 'Authentication & SSO', route: '/enterprise/auth' },
    { id: 'ent-rbac', title: 'RBAC & Permissions', route: '/enterprise/rbac' },
    { id: 'ent-org', title: 'Org Administration', route: '/enterprise/org' },
    { id: 'ent-db', title: 'Database Setup', route: '/enterprise/database' },
    { id: 'ent-storage', title: 'Storage', route: '/enterprise/storage' },
    { id: 'ent-models', title: 'Verified Models', route: '/enterprise/verified-models' },
    { id: 'ent-maint', title: 'Maintenance', route: '/enterprise/maintenance' },
    { id: 'ent-license', title: 'License', route: '/enterprise/license' },
  ],

  contributing: [
    { id: 'contrib-overview', title: 'Overview', route: '/contributing' },
    { id: 'contrib-dev-setup', title: 'Development Setup', route: '/contributing/dev-setup' },
    { id: 'contrib-frontend', title: 'Frontend (React)', route: '/contributing/frontend' },
    { id: 'contrib-backend', title: 'Backend (Python)', route: '/contributing/backend' },
    { id: 'contrib-app-server', title: 'App Server', route: '/contributing/app-server' },
    { id: 'contrib-testing', title: 'Testing', route: '/contributing/testing' },
    { id: 'contrib-pr', title: 'PR Process', route: '/contributing/pr-process' },
    { id: 'contrib-eval', title: 'Evaluation & Benchmarks', route: '/contributing/evaluation' },
    { id: 'contrib-docs', title: 'Documentation Style', route: '/contributing/docs-style' },
    { id: 'contrib-maintainers', title: 'Becoming a Maintainer', route: '/contributing/maintainers' },
  ],

  changelog: [
    { id: 'changelog-notes', title: 'Release Notes', route: '/changelog' },
    { id: 'changelog-migration', title: 'Migration Guides', route: '/changelog/migration' },
  ],

  // ── Deploy Repo ────────────────────────────────────────────────────────────

  'deploy-overview': [
    { id: 'deploy-what',       title: 'What Is This Repo?',          route: '/deploy' },
    { id: 'deploy-structure',  title: 'Repository Structure',         route: '/deploy/structure' },
    { id: 'deploy-license',    title: 'License (Polyform Free Trial)', route: '/deploy/license' },
    { id: 'deploy-versioning', title: 'Versioning & Release Cadence', route: '/deploy/versioning' },
    { id: 'deploy-envs-glance',title: 'Environments at a Glance',     route: '/deploy/environments-glance' },
  ],

  'deploy-architecture': [
    {
      id: 'darch-system',
      title: 'System Architecture',
      route: '/deploy/architecture',
      children: [
        { id: 'darch-diagram',  title: 'High-Level Diagram',        route: '/deploy/architecture/diagram' },
        { id: 'darch-gcp',      title: 'GCP / Kubernetes Overview', route: '/deploy/architecture/gcp-k8s' },
        { id: 'darch-network',  title: 'Networking & Ingress',      route: '/deploy/architecture/networking' },
      ],
    },
    {
      id: 'darch-deploy-model',
      title: 'Deployment Model',
      route: '/deploy/architecture/deployment-model',
      children: [
        { id: 'darch-flow',   title: 'Feature → Staging → Production Flow', route: '/deploy/architecture/release-flow' },
        { id: 'darch-helm',   title: 'Helm Chart Strategy',                  route: '/deploy/architecture/helm-strategy' },
        { id: 'darch-images', title: 'Image Tagging Convention',             route: '/deploy/architecture/image-tags' },
      ],
    },
    {
      id: 'darch-conv-mgr',
      title: 'Clustered Conversation Manager',
      route: '/deploy/architecture/conversation-manager',
      children: [
        { id: 'darch-redis',      title: 'How Redis Is Used',       route: '/deploy/architecture/conversation-manager/redis' },
        { id: 'darch-agent-loop', title: 'Agent Loop vs. Worker Node', route: '/deploy/architecture/conversation-manager/agent-loop' },
        { id: 'darch-failover',   title: 'Failover Behavior',       route: '/deploy/architecture/conversation-manager/failover' },
      ],
    },
  ],

  'deploy-components': [
    {
      id: 'dc-openhands',
      title: 'OpenHands App',
      route: '/deploy/components/openhands',
      children: [
        { id: 'dc-oh-overview',       title: 'Overview',                      route: '/deploy/components/openhands' },
        { id: 'dc-oh-main',           title: 'Main Deployment',               route: '/deploy/components/openhands/main-deployment' },
        { id: 'dc-oh-github-events',  title: 'GitHub Events Deployment',      route: '/deploy/components/openhands/github-events' },
        { id: 'dc-oh-helm',           title: 'Helm Chart Reference',          route: '/deploy/components/openhands/helm' },
        { id: 'dc-oh-hpa',            title: 'HPA / Scaling',                 route: '/deploy/components/openhands/hpa' },
        { id: 'dc-oh-waitlist',       title: 'User Waitlist ConfigMap',        route: '/deploy/components/openhands/waitlist' },
        { id: 'dc-oh-webhooks',       title: 'GITHUB_WEBHOOKS_ENABLED Flag',  route: '/deploy/components/openhands/webhooks-flag' },
      ],
    },
    {
      id: 'dc-data-platform',
      title: 'Data Platform',
      route: '/deploy/components/data-platform',
      children: [
        { id: 'dc-dp-overview', title: 'Overview',                  route: '/deploy/components/data-platform' },
        { id: 'dc-dp-routes',   title: 'FastAPI Routes',            route: '/deploy/components/data-platform/routes' },
        { id: 'dc-dp-auth',     title: 'Auth & IP Allowlisting',    route: '/deploy/components/data-platform/auth' },
        { id: 'dc-dp-hubspot',  title: 'HubSpot Sync Cronjob',      route: '/deploy/components/data-platform/hubspot-sync' },
        { id: 'dc-dp-helm',     title: 'Helm Chart Reference',      route: '/deploy/components/data-platform/helm' },
        { id: 'dc-dp-db',       title: 'Database Session Patterns', route: '/deploy/components/data-platform/database' },
      ],
    },
    {
      id: 'dc-automation',
      title: 'Automation Service',
      route: '/deploy/components/automation',
      children: [
        { id: 'dc-auto-overview', title: 'Overview',                    route: '/deploy/components/automation' },
        { id: 'dc-auto-source',   title: 'Source Repository Reference', route: '/deploy/components/automation/source-repo' },
        { id: 'dc-auto-helm',     title: 'Helm Chart Reference',        route: '/deploy/components/automation/helm' },
        { id: 'dc-auto-images',   title: 'Docker Image Tags',           route: '/deploy/components/automation/image-tags' },
      ],
    },
    {
      id: 'dc-image-loader',
      title: 'Image Loader',
      route: '/deploy/components/image-loader',
      children: [
        { id: 'dc-il-overview',  title: 'Overview',              route: '/deploy/components/image-loader' },
        { id: 'dc-il-daemonset', title: 'DaemonSet',             route: '/deploy/components/image-loader/daemonset' },
        { id: 'dc-il-overprov',  title: 'Node Overprovisioner',  route: '/deploy/components/image-loader/overprovisioner' },
        { id: 'dc-il-priority',  title: 'Priority Class',        route: '/deploy/components/image-loader/priority-class' },
        { id: 'dc-il-helm',      title: 'Helm Chart Reference',  route: '/deploy/components/image-loader/helm' },
      ],
    },
    {
      id: 'dc-error-page',
      title: 'Error Page',
      route: '/deploy/components/error-page',
      children: [
        { id: 'dc-ep-overview', title: 'Overview',             route: '/deploy/components/error-page' },
        { id: 'dc-ep-helm',     title: 'Helm Chart Reference', route: '/deploy/components/error-page/helm' },
      ],
    },
    {
      id: 'dc-keycloak',
      title: 'Keycloak',
      route: '/deploy/components/keycloak',
      children: [
        { id: 'dc-kc-overview', title: 'Overview',             route: '/deploy/components/keycloak' },
        { id: 'dc-kc-envs',     title: 'Environment Configs',  route: '/deploy/components/keycloak/envs' },
      ],
    },
    {
      id: 'dc-grafana',
      title: 'Grafana',
      route: '/deploy/components/grafana',
      children: [
        { id: 'dc-gf-overview', title: 'Overview',            route: '/deploy/components/grafana' },
        { id: 'dc-gf-envs',     title: 'Environment Configs', route: '/deploy/components/grafana/envs' },
      ],
    },
    {
      id: 'dc-runtime-api',
      title: 'Runtime API',
      route: '/deploy/components/runtime-api',
      children: [
        { id: 'dc-ra-overview', title: 'Overview',                     route: '/deploy/components/runtime-api' },
        { id: 'dc-ra-warm',     title: 'Warm Runtimes Configuration',  route: '/deploy/components/runtime-api/warm-runtimes' },
      ],
    },
  ],

  environments: [
    { id: 'env-overview', title: 'Environments Overview', route: '/deploy/environments' },
    {
      id: 'env-feature',
      title: 'Feature Environments',
      route: '/deploy/environments/feature',
      children: [
        { id: 'env-feat-what',      title: 'What They Are',              route: '/deploy/environments/feature' },
        { id: 'env-feat-trigger',   title: 'How They Are Created',       route: '/deploy/environments/feature/trigger' },
        { id: 'env-feat-namespace', title: 'Namespace Naming Convention', route: '/deploy/environments/feature/namespace' },
        { id: 'env-feat-access',    title: 'Accessing a Feature Env',    route: '/deploy/environments/feature/access' },
      ],
    },
    {
      id: 'env-staging',
      title: 'Staging',
      route: '/deploy/environments/staging',
      children: [
        { id: 'env-stg-deploy', title: 'How to Deploy to Staging', route: '/deploy/environments/staging/deploy' },
        { id: 'env-stg-diff',   title: 'Difference from Feature',  route: '/deploy/environments/staging/vs-feature' },
        { id: 'env-stg-urls',   title: 'URLs',                     route: '/deploy/environments/staging/urls' },
      ],
    },
    {
      id: 'env-production',
      title: 'Production',
      route: '/deploy/environments/production',
      children: [
        { id: 'env-prod-tags',    title: 'How Tags Trigger Production', route: '/deploy/environments/production/tag-trigger' },
        { id: 'env-prod-release', title: 'Release Branch Strategy',     route: '/deploy/environments/production/release-branch' },
        { id: 'env-prod-urls',    title: 'URLs',                        route: '/deploy/environments/production/urls' },
      ],
    },
    {
      id: 'env-evaluation',
      title: 'Evaluation Environment',
      route: '/deploy/environments/evaluation',
      children: [
        { id: 'env-eval-overview', title: 'Overview & Purpose', route: '/deploy/environments/evaluation' },
      ],
    },
  ],

  'release-and-deploy': [
    {
      id: 'rd-overview',
      title: 'Deployment Overview',
      route: '/deploy/release',
      children: [
        { id: 'rd-flow',          title: 'Release Flow',              route: '/deploy/release/flow' },
        { id: 'rd-shas',          title: 'SHA & Version Variables',   route: '/deploy/release/sha-versions' },
        { id: 'rd-commit-update', title: 'Updating a Commit Reference', route: '/deploy/release/update-commit' },
      ],
    },
    {
      id: 'rd-openhands',
      title: 'Deploying the OpenHands App',
      route: '/deploy/release/openhands',
      children: [
        { id: 'rd-oh-feature',  title: 'Feature Deployment',     route: '/deploy/release/openhands/feature' },
        { id: 'rd-oh-staging',  title: 'Staging Deployment',     route: '/deploy/release/openhands/staging' },
        { id: 'rd-oh-prod',     title: 'Production Deployment',  route: '/deploy/release/openhands/production' },
      ],
    },
    { id: 'rd-data-platform', title: 'Deploying the Data Platform',     route: '/deploy/release/data-platform' },
    { id: 'rd-automation',    title: 'Deploying the Automation Service', route: '/deploy/release/automation' },
    { id: 'rd-error-page',    title: 'Deploying the Error Page',         route: '/deploy/release/error-page' },
    { id: 'rd-grafana',       title: 'Deploying Grafana',                route: '/deploy/release/grafana' },
    { id: 'rd-eval-runtime',  title: 'Deploying the Eval Runtime',       route: '/deploy/release/eval-runtime' },
    {
      id: 'rd-helm',
      title: 'Helm Usage',
      route: '/deploy/release/helm',
      children: [
        { id: 'rd-helm-install',  title: 'Install vs. Upgrade',          route: '/deploy/release/helm/install-upgrade' },
        { id: 'rd-helm-values',   title: 'Passing Environment Values',   route: '/deploy/release/helm/env-values' },
        { id: 'rd-helm-version',  title: 'Chart Version Pinning',        route: '/deploy/release/helm/chart-version' },
      ],
    },
  ],

  'secrets-and-ops': [
    {
      id: 'so-overview',
      title: 'Secrets Management Overview',
      route: '/deploy/secrets',
      children: [
        { id: 'so-sops',  title: 'SOPS Encryption',                    route: '/deploy/secrets/sops' },
        { id: 'so-kms',   title: 'GCP KMS Key Reference',              route: '/deploy/secrets/kms' },
        { id: 'so-rule',  title: 'Never Edit Encrypted Files Manually', route: '/deploy/secrets/edit-rule' },
      ],
    },
    {
      id: 'so-encrypt',
      title: 'Encrypting & Decrypting',
      route: '/deploy/secrets/encrypt-decrypt',
      children: [
        { id: 'so-decrypt',     title: 'scripts/decrypt.sh',            route: '/deploy/secrets/decrypt' },
        { id: 'so-encrypt-sh',  title: 'scripts/encrypt.sh',            route: '/deploy/secrets/encrypt' },
        { id: 'so-safe-apply',  title: 'scripts/safe-apply-secrets.sh', route: '/deploy/secrets/safe-apply' },
      ],
    },
    {
      id: 'so-by-component',
      title: 'Secrets by Component',
      route: '/deploy/secrets/by-component',
      children: [
        { id: 'so-oh-secrets', title: 'OpenHands App Secrets',   route: '/deploy/secrets/by-component/openhands' },
        { id: 'so-dp-secrets', title: 'Data Platform Secrets',   route: '/deploy/secrets/by-component/data-platform' },
        { id: 'so-kc-secrets', title: 'Keycloak Secrets',        route: '/deploy/secrets/by-component/keycloak' },
      ],
    },
    { id: 'so-add-rotate',  title: 'Adding / Rotating a Secret',        route: '/deploy/secrets/add-rotate' },
    { id: 'so-ip-allowlist',title: 'IP Allowlisting (Data Platform)',    route: '/deploy/secrets/ip-allowlist' },
    {
      id: 'so-helm-values',
      title: 'Helm Values Configuration',
      route: '/deploy/secrets/helm-values',
      children: [
        { id: 'so-hv-per-env',  title: 'values.yaml Per Environment',    route: '/deploy/secrets/helm-values/per-env' },
        { id: 'so-hv-env-vars', title: 'Environment Variables Reference', route: '/deploy/secrets/helm-values/env-vars' },
        { id: 'so-hv-waitlist', title: 'User Waitlist Option',            route: '/deploy/secrets/helm-values/waitlist' },
      ],
    },
    {
      id: 'so-local',
      title: 'Local Secrets',
      route: '/deploy/secrets/local',
      children: [
        { id: 'so-local-decrypt',  title: 'local/decrypt_env.sh',    route: '/deploy/secrets/local/decrypt-env' },
        { id: 'so-local-convert',  title: 'local/convert_to_env.py', route: '/deploy/secrets/local/convert-to-env' },
      ],
    },
  ],

  'deploy-testing': [
    { id: 'dt-overview', title: 'Testing Overview', route: '/deploy/testing' },
    {
      id: 'dt-e2e',
      title: 'E2E Tests',
      route: '/deploy/testing/e2e',
      children: [
        { id: 'dt-e2e-overview', title: 'Overview & Tech Stack',       route: '/deploy/testing/e2e' },
        { id: 'dt-e2e-prereqs',  title: 'Prerequisites & Installation', route: '/deploy/testing/e2e/prereqs' },
        { id: 'dt-e2e-config',   title: 'Configuration',               route: '/deploy/testing/e2e/config' },
        { id: 'dt-e2e-auth',     title: 'Authentication Methods',      route: '/deploy/testing/e2e/auth' },
        { id: 'dt-e2e-run',      title: 'Running Tests',               route: '/deploy/testing/e2e/run' },
        { id: 'dt-e2e-envs',     title: 'Environments',                route: '/deploy/testing/e2e/environments' },
        { id: 'dt-e2e-pom',      title: 'Page Object Models',          route: '/deploy/testing/e2e/page-objects' },
        { id: 'dt-e2e-tags',     title: 'Test Tags',                   route: '/deploy/testing/e2e/tags' },
        { id: 'dt-e2e-ci',       title: 'CI/CD Integration',           route: '/deploy/testing/e2e/ci' },
      ],
    },
    {
      id: 'dt-automation',
      title: 'Automation Integration Tests',
      route: '/deploy/testing/automation',
      children: [
        { id: 'dt-auto-overview',  title: 'Overview',                         route: '/deploy/testing/automation' },
        { id: 'dt-auto-prereqs',   title: 'Prerequisites',                    route: '/deploy/testing/automation/prereqs' },
        { id: 'dt-auto-run',       title: 'Running (Sequential vs. Parallel)', route: '/deploy/testing/automation/run' },
        { id: 'dt-auto-crud',      title: 'test_automation_api.py',           route: '/deploy/testing/automation/crud' },
        { id: 'dt-auto-upload',    title: 'test_upload_api.py',               route: '/deploy/testing/automation/upload' },
        { id: 'dt-auto-dispatch',  title: 'test_e2e_dispatch.py',             route: '/deploy/testing/automation/dispatch' },
        { id: 'dt-auto-timeout',   title: 'test_e2e_timeout.py',              route: '/deploy/testing/automation/timeout' },
        { id: 'dt-auto-preset',    title: 'test_preset_prompt_api.py',        route: '/deploy/testing/automation/preset-prompt' },
      ],
    },
    {
      id: 'dt-data-platform',
      title: 'Data Platform Unit Tests',
      route: '/deploy/testing/data-platform',
      children: [
        { id: 'dt-dp-run',     title: 'Running the Tests',       route: '/deploy/testing/data-platform/run' },
        { id: 'dt-dp-modules', title: 'Test Modules Reference',  route: '/deploy/testing/data-platform/modules' },
      ],
    },
    {
      id: 'dt-hubspot',
      title: 'HubSpot Sync Unit Tests',
      route: '/deploy/testing/hubspot-sync',
      children: [
        { id: 'dt-hs-run', title: 'Running the Tests', route: '/deploy/testing/hubspot-sync/run' },
      ],
    },
    {
      id: 'dt-conv-mgr',
      title: 'Clustered Conversation Manager Tests',
      route: '/deploy/testing/conversation-manager',
      children: [
        { id: 'dt-cm-setup',   title: 'Test Environment Setup', route: '/deploy/testing/conversation-manager/setup' },
        { id: 'dt-cm-terms',   title: 'Terminology',            route: '/deploy/testing/conversation-manager/terminology' },
        { id: 'dt-cm-cases',   title: 'All 14 Test Cases',      route: '/deploy/testing/conversation-manager/cases' },
        { id: 'dt-cm-trouble', title: 'Troubleshooting',        route: '/deploy/testing/conversation-manager/troubleshooting' },
      ],
    },
  ],

  'cicd-reference': [
    { id: 'cicd-overview',    title: 'Workflows Overview',                       route: '/deploy/cicd' },
    { id: 'cicd-deploy',      title: 'deploy.yaml — Main Deploy',                route: '/deploy/cicd/deploy' },
    { id: 'cicd-k8s',         title: '_k8s_deploy.yaml — Reusable K8s Deploy',   route: '/deploy/cicd/k8s-deploy' },
    { id: 'cicd-docker',      title: '_docker_push.yaml — Docker Build & Push',  route: '/deploy/cicd/docker-push' },
    { id: 'cicd-e2e',         title: '_e2e.yaml — Reusable E2E Tests',           route: '/deploy/cicd/e2e' },
    { id: 'cicd-data-api',    title: 'deploy-data-api.yaml',                     route: '/deploy/cicd/deploy-data-api' },
    { id: 'cicd-automation',  title: 'deploy-automation.yaml',                   route: '/deploy/cicd/deploy-automation' },
    { id: 'cicd-error-page',  title: 'deploy-error-page.yaml',                   route: '/deploy/cicd/deploy-error-page' },
    { id: 'cicd-grafana',     title: 'deploy-grafana.yaml',                      route: '/deploy/cicd/deploy-grafana' },
    { id: 'cicd-eval',        title: 'deploy-eval-runtime.yaml',                 route: '/deploy/cicd/deploy-eval-runtime' },
    { id: 'cicd-auto-tests',  title: 'automation-integration-tests.yaml',        route: '/deploy/cicd/automation-integration-tests' },
    { id: 'cicd-run-e2e',     title: 'run_e2e_tests.yaml',                       route: '/deploy/cicd/run-e2e-tests' },
    { id: 'cicd-chart-check', title: 'chart-version-check.yaml',                 route: '/deploy/cicd/chart-version-check' },
    { id: 'cicd-commit-check',title: 'latest-commit-check.yaml',                 route: '/deploy/cicd/latest-commit-check' },
    { id: 'cicd-preview-pr',  title: 'create-openhands-preview-pr.yaml',         route: '/deploy/cicd/preview-pr' },
    { id: 'cicd-stale',       title: 'close-stale-ohpr.yml',                     route: '/deploy/cicd/close-stale' },
    { id: 'cicd-lint',        title: 'lint.yml — Python Linting',                route: '/deploy/cicd/lint' },
    { id: 'cicd-unit',        title: 'py-unit-tests.yml — Python Unit Tests',    route: '/deploy/cicd/unit-tests' },
  ],

  'deploy-dev-guide': [
    {
      id: 'ddg-setup',
      title: 'Dev Setup',
      route: '/deploy/dev-guide',
      children: [
        { id: 'ddg-prereqs', title: 'Prerequisites',                          route: '/deploy/dev-guide/prereqs' },
        { id: 'ddg-clone',   title: 'Cloning (deploy + OpenHands sibling)',   route: '/deploy/dev-guide/clone' },
        { id: 'ddg-install', title: 'poetry install',                         route: '/deploy/dev-guide/install' },
        { id: 'ddg-build',   title: 'make build',                             route: '/deploy/dev-guide/build' },
      ],
    },
    {
      id: 'ddg-run',
      title: 'Running Locally',
      route: '/deploy/dev-guide/run',
      children: [
        { id: 'ddg-run-all',     title: 'make run (backend + frontend)',       route: '/deploy/dev-guide/run/all' },
        { id: 'ddg-run-backend', title: 'make start-backend',                  route: '/deploy/dev-guide/run/backend' },
        { id: 'ddg-run-config',  title: 'Backend Config & VS Code Launch',    route: '/deploy/dev-guide/run/config' },
        { id: 'ddg-run-creds',   title: 'LiteLLM / GitHub App Credentials',   route: '/deploy/dev-guide/run/credentials' },
      ],
    },
    {
      id: 'ddg-lint',
      title: 'Code Style & Linting',
      route: '/deploy/dev-guide/lint',
      children: [
        { id: 'ddg-lint-precommit', title: 'Pre-commit (ruff, mypy)', route: '/deploy/dev-guide/lint/pre-commit' },
        { id: 'ddg-lint-run',       title: 'Running pre-commit',      route: '/deploy/dev-guide/lint/run' },
        { id: 'ddg-lint-fix',       title: 'Fixing Lint Errors',      route: '/deploy/dev-guide/lint/fix' },
      ],
    },
    { id: 'ddg-branches',       title: 'Branch Naming (< 20 chars)',               route: '/deploy/dev-guide/branch-naming' },
    {
      id: 'ddg-db',
      title: 'Database Patterns',
      route: '/deploy/dev-guide/database',
      children: [
        { id: 'ddg-db-session',      title: 'session_maker vs. a_session_maker', route: '/deploy/dev-guide/database/session-makers' },
        { id: 'ddg-db-async',        title: 'call_sync_from_async Pattern',      route: '/deploy/dev-guide/database/async-pattern' },
        { id: 'ddg-db-antipatterns', title: 'Anti-patterns to Avoid',            route: '/deploy/dev-guide/database/antipatterns' },
      ],
    },
    { id: 'ddg-update-commit', title: 'Updating the OpenHands Commit (3 locations)', route: '/deploy/dev-guide/update-commit' },
    {
      id: 'ddg-pr',
      title: 'PR Process',
      route: '/deploy/dev-guide/pr-process',
      children: [
        { id: 'ddg-pr-secrets-rule', title: 'Secrets Rule (never modify secrets/)', route: '/deploy/dev-guide/pr-process/secrets-rule' },
        { id: 'ddg-pr-chart-check',  title: 'Chart Version Check',                  route: '/deploy/dev-guide/pr-process/chart-check' },
      ],
    },
  ],

  // ── SDK ────────────────────────────────────────────────────────────────────

  'sdk-introduction': [
    { id: 'sdk-what-is',     title: 'What is the SDK?',         route: '/sdk' },
    { id: 'sdk-concepts',    title: 'Key Concepts',             route: '/sdk/concepts' },
    { id: 'sdk-arch-overview', title: 'Architecture Overview',  route: '/sdk/architecture' },
    { id: 'sdk-how-it-works',  title: 'How the Agent Loop Works', route: '/sdk/how-it-works' },
    { id: 'sdk-comparison',  title: 'SDK vs. OpenHands App',   route: '/sdk/comparison' },
    { id: 'sdk-faq',         title: 'FAQ',                      route: '/sdk/faq' },
  ],

  'sdk-getting-started': [
    { id: 'sdk-gs-install',   title: 'Installation',            route: '/sdk/getting-started/install' },
    { id: 'sdk-gs-hello',     title: 'Hello World',             route: '/sdk/getting-started/hello-world' },
    { id: 'sdk-gs-quickstart', title: 'Your First Agent',       route: '/sdk/getting-started/quickstart' },
    { id: 'sdk-gs-remote',    title: 'Remote Server Quickstart', route: '/sdk/getting-started/remote-server' },
  ],

  'sdk-architecture': [
    { id: 'sdk-arch-agent',     title: 'Agent',               route: '/sdk/arch/agent' },
    { id: 'sdk-arch-convo',     title: 'Conversation',        route: '/sdk/arch/conversation' },
    { id: 'sdk-arch-llm',       title: 'LLM',                 route: '/sdk/arch/llm' },
    { id: 'sdk-arch-tool',      title: 'Tool / ToolDefinition', route: '/sdk/arch/tool-system' },
    { id: 'sdk-arch-workspace', title: 'Workspace',           route: '/sdk/arch/workspace' },
    { id: 'sdk-arch-events',    title: 'Events',              route: '/sdk/arch/events' },
    { id: 'sdk-arch-condenser', title: 'Condenser',           route: '/sdk/arch/condenser' },
    { id: 'sdk-arch-security',  title: 'Security Analyzer',   route: '/sdk/arch/security' },
    { id: 'sdk-arch-skill',     title: 'Skill',               route: '/sdk/arch/skill' },
  ],

  'sdk-guides': [
    {
      id: 'sdk-guide-agent',
      title: 'Agent',
      route: '/sdk/guides/agent',
      children: [
        { id: 'sdk-guide-custom-agent',   title: 'Creating Custom Agents',     route: '/sdk/guides/agent-custom' },
        { id: 'sdk-guide-file-agent',     title: 'File-Based Agents',          route: '/sdk/guides/agent-file-based' },
        { id: 'sdk-guide-acp',            title: 'ACP Agent',                  route: '/sdk/guides/agent-acp' },
        { id: 'sdk-guide-delegation',     title: 'Sub-Agent Delegation',       route: '/sdk/guides/agent-delegation' },
        { id: 'sdk-guide-tom',            title: 'Theory of Mind (TOM) Agent', route: '/sdk/guides/agent-tom-agent' },
        { id: 'sdk-guide-stuck',          title: 'Stuck Detector',             route: '/sdk/guides/agent-stuck-detector' },
        { id: 'sdk-guide-interactive',    title: 'Interactive Terminal',       route: '/sdk/guides/agent-interactive-terminal' },
        { id: 'sdk-guide-agent-settings', title: 'Agent Settings',            route: '/sdk/guides/agent-settings' },
        { id: 'sdk-guide-skill',          title: 'Agent Skills & Context',     route: '/sdk/guides/skill' },
        { id: 'sdk-guide-browser-use',    title: 'Browser Use',               route: '/sdk/guides/agent-browser-use' },
      ],
    },
    {
      id: 'sdk-guide-convo',
      title: 'Conversation',
      route: '/sdk/guides/conversation',
      children: [
        { id: 'sdk-guide-async',        title: 'Async Conversations',        route: '/sdk/guides/convo-async' },
        { id: 'sdk-guide-pause',        title: 'Pause and Resume',           route: '/sdk/guides/convo-pause-and-resume' },
        { id: 'sdk-guide-persistence',  title: 'Persistence',                route: '/sdk/guides/convo-persistence' },
        { id: 'sdk-guide-send-running', title: 'Send Message While Running', route: '/sdk/guides/convo-send-message-while-running' },
        { id: 'sdk-guide-ask',          title: 'Ask Agent Questions',        route: '/sdk/guides/convo-ask-agent' },
        { id: 'sdk-guide-fork',         title: 'Fork a Conversation',        route: '/sdk/guides/convo-fork' },
        { id: 'sdk-guide-visualizer',   title: 'Custom Visualizer',          route: '/sdk/guides/convo-custom-visualizer' },
      ],
    },
    {
      id: 'sdk-guide-llm',
      title: 'LLM',
      route: '/sdk/guides/llm',
      children: [
        { id: 'sdk-guide-llm-registry',    title: 'LLM Registry',             route: '/sdk/guides/llm-registry' },
        { id: 'sdk-guide-llm-fallback',    title: 'LLM Fallback Strategy',    route: '/sdk/guides/llm-fallback' },
        { id: 'sdk-guide-llm-profile',     title: 'LLM Profile Store',        route: '/sdk/guides/llm-profile-store' },
        { id: 'sdk-guide-llm-streaming',   title: 'LLM Streaming',            route: '/sdk/guides/llm-streaming' },
        { id: 'sdk-guide-llm-subs',        title: 'LLM Subscriptions',        route: '/sdk/guides/llm-subscriptions' },
        { id: 'sdk-guide-llm-routing',     title: 'Model Routing',            route: '/sdk/guides/llm-routing' },
        { id: 'sdk-guide-image-input',     title: 'Image Input',              route: '/sdk/guides/llm-image-input' },
        { id: 'sdk-guide-reasoning',       title: 'Reasoning',                route: '/sdk/guides/llm-reasoning' },
        { id: 'sdk-guide-error-handling',  title: 'Exception Handling',       route: '/sdk/guides/llm-error-handling' },
        { id: 'sdk-guide-gpt5-preset',     title: 'GPT-5 Preset (ApplyPatchTool)', route: '/sdk/guides/llm-gpt5-preset' },
      ],
    },
    {
      id: 'sdk-guide-tools-mcp',
      title: 'Tools & MCP',
      route: '/sdk/guides/tools',
      children: [
        { id: 'sdk-guide-custom-tools',  title: 'Custom Tools',            route: '/sdk/guides/custom-tools' },
        { id: 'sdk-guide-mcp',           title: 'Model Context Protocol',  route: '/sdk/guides/mcp' },
        { id: 'sdk-guide-parallel',      title: 'Parallel Tool Execution', route: '/sdk/guides/parallel-tool-execution' },
        { id: 'sdk-guide-task-tool-set', title: 'Task Tool Set',           route: '/sdk/guides/task-tool-set' },
      ],
    },
    {
      id: 'sdk-guide-security',
      title: 'Security',
      route: '/sdk/guides/security',
      children: [
        { id: 'sdk-guide-sec-action',  title: 'Security & Action Confirmation', route: '/sdk/guides/security' },
        { id: 'sdk-guide-secrets',     title: 'Secret Registry',                route: '/sdk/guides/secrets' },
      ],
    },
    {
      id: 'sdk-guide-advanced',
      title: 'Advanced',
      route: '/sdk/guides/advanced',
      children: [
        { id: 'sdk-guide-condenser',     title: 'Context Condenser',       route: '/sdk/guides/context-condenser' },
        { id: 'sdk-guide-metrics',       title: 'Metrics Tracking',        route: '/sdk/guides/metrics' },
        { id: 'sdk-guide-observability', title: 'Observability & Tracing', route: '/sdk/guides/observability' },
        { id: 'sdk-guide-hooks',         title: 'Hooks',                   route: '/sdk/guides/hooks' },
        { id: 'sdk-guide-plugins',       title: 'Plugins',                 route: '/sdk/guides/plugins' },
        { id: 'sdk-guide-critic',        title: 'Critic (Experimental)',   route: '/sdk/guides/critic' },
        { id: 'sdk-guide-iterative',     title: 'Iterative Refinement',    route: '/sdk/guides/iterative-refinement' },
        { id: 'sdk-guide-browser-rec',   title: 'Browser Session Recording', route: '/sdk/guides/browser-session-recording' },
      ],
    },
    {
      id: 'sdk-guide-server',
      title: 'Remote Agent Server',
      route: '/sdk/guides/agent-server',
      children: [
        { id: 'sdk-guide-srv-overview',  title: 'Overview',                       route: '/sdk/guides/agent-server/overview' },
        { id: 'sdk-guide-srv-local',     title: 'Local Agent Server',             route: '/sdk/guides/agent-server/local-server' },
        { id: 'sdk-guide-srv-docker',    title: 'Docker Sandbox',                 route: '/sdk/guides/agent-server/docker-sandbox' },
        { id: 'sdk-guide-srv-apptainer', title: 'Apptainer Sandbox',             route: '/sdk/guides/agent-server/apptainer-sandbox' },
        { id: 'sdk-guide-srv-api',       title: 'API-based Sandbox',              route: '/sdk/guides/agent-server/api-sandbox' },
        { id: 'sdk-guide-srv-cloud',     title: 'OpenHands Cloud Workspace',      route: '/sdk/guides/agent-server/cloud-workspace' },
        { id: 'sdk-guide-srv-tools',     title: 'Custom Tools with Remote Server', route: '/sdk/guides/agent-server/custom-tools' },
      ],
    },
    {
      id: 'sdk-guide-gh-workflows',
      title: 'GitHub Workflows',
      route: '/sdk/guides/github-workflows',
      children: [
        { id: 'sdk-guide-gh-pr-review',  title: 'PR Review',       route: '/sdk/guides/github-workflows/pr-review' },
        { id: 'sdk-guide-gh-assign',     title: 'Assign Reviews',  route: '/sdk/guides/github-workflows/assign-reviews' },
        { id: 'sdk-guide-gh-todo',       title: 'TODO Management', route: '/sdk/guides/github-workflows/todo-management' },
      ],
    },
  ],

  'sdk-api-reference': [
    { id: 'sdk-api-overview',      title: 'Overview',                  route: '/sdk/api' },
    { id: 'sdk-api-agent',         title: 'openhands.sdk.agent',       route: '/sdk/api/agent' },
    { id: 'sdk-api-conversation',  title: 'openhands.sdk.conversation', route: '/sdk/api/conversation' },
    { id: 'sdk-api-event',         title: 'openhands.sdk.event',       route: '/sdk/api/event' },
    { id: 'sdk-api-llm',           title: 'openhands.sdk.llm',         route: '/sdk/api/llm' },
    { id: 'sdk-api-security',      title: 'openhands.sdk.security',    route: '/sdk/api/security' },
    { id: 'sdk-api-tool',          title: 'openhands.sdk.tool',        route: '/sdk/api/tool' },
    { id: 'sdk-api-utils',         title: 'openhands.sdk.utils',       route: '/sdk/api/utils' },
    { id: 'sdk-api-workspace',     title: 'openhands.sdk.workspace',   route: '/sdk/api/workspace' },
  ],

  'sdk-examples': [
    {
      id: 'sdk-ex-standalone',
      title: 'Standalone SDK',
      route: '/sdk/examples/standalone',
      children: [
        { id: 'sdk-ex-hello',          title: 'Hello World',                    route: '/sdk/examples/standalone/hello-world' },
        { id: 'sdk-ex-custom-tools',   title: 'Custom Tools',                   route: '/sdk/examples/standalone/custom-tools' },
        { id: 'sdk-ex-skill',          title: 'Activate Skill',                 route: '/sdk/examples/standalone/activate-skill' },
        { id: 'sdk-ex-confirmation',   title: 'Confirmation Mode',              route: '/sdk/examples/standalone/confirmation-mode' },
        { id: 'sdk-ex-llm-registry',   title: 'LLM Registry',                  route: '/sdk/examples/standalone/llm-registry' },
        { id: 'sdk-ex-interactive',    title: 'Interactive Terminal + Reasoning', route: '/sdk/examples/standalone/interactive-terminal' },
        { id: 'sdk-ex-mcp',            title: 'MCP Integration',               route: '/sdk/examples/standalone/mcp-integration' },
        { id: 'sdk-ex-mcp-oauth',      title: 'MCP with OAuth',                route: '/sdk/examples/standalone/mcp-oauth' },
        { id: 'sdk-ex-pause',          title: 'Pause & Resume',                route: '/sdk/examples/standalone/pause' },
        { id: 'sdk-ex-persistence',    title: 'Persistence',                   route: '/sdk/examples/standalone/persistence' },
        { id: 'sdk-ex-async',          title: 'Async',                         route: '/sdk/examples/standalone/async' },
        { id: 'sdk-ex-secrets',        title: 'Custom Secrets',                route: '/sdk/examples/standalone/secrets' },
        { id: 'sdk-ex-metrics',        title: 'LLM Metrics',                   route: '/sdk/examples/standalone/metrics' },
        { id: 'sdk-ex-condenser',      title: 'Context Condenser',             route: '/sdk/examples/standalone/context-condenser' },
        { id: 'sdk-ex-browser',        title: 'Browser Use',                   route: '/sdk/examples/standalone/browser-use' },
        { id: 'sdk-ex-security-llm',   title: 'LLM Security Analyzer',        route: '/sdk/examples/standalone/security-analyzer' },
        { id: 'sdk-ex-image',          title: 'Image Input',                   route: '/sdk/examples/standalone/image-input' },
        { id: 'sdk-ex-send-while',     title: 'Send Message While Processing', route: '/sdk/examples/standalone/send-while-running' },
        { id: 'sdk-ex-routing',        title: 'Model Routing',                 route: '/sdk/examples/standalone/model-routing' },
        { id: 'sdk-ex-stuck',          title: 'Stuck Detector',               route: '/sdk/examples/standalone/stuck-detector' },
        { id: 'sdk-ex-thinking',       title: 'Anthropic Thinking',           route: '/sdk/examples/standalone/anthropic-thinking' },
        { id: 'sdk-ex-reasoning',      title: 'Responses Reasoning',          route: '/sdk/examples/standalone/responses-reasoning' },
        { id: 'sdk-ex-planning',       title: 'Planning Agent Workflow',      route: '/sdk/examples/standalone/planning-agent' },
        { id: 'sdk-ex-delegation',     title: 'Agent Delegation',             route: '/sdk/examples/standalone/agent-delegation' },
        { id: 'sdk-ex-visualizer',     title: 'Custom Visualizer',            route: '/sdk/examples/standalone/custom-visualizer' },
        { id: 'sdk-ex-observability',  title: 'Observability (Laminar)',      route: '/sdk/examples/standalone/observability' },
        { id: 'sdk-ex-ask-agent',      title: 'Ask Agent',                    route: '/sdk/examples/standalone/ask-agent' },
        { id: 'sdk-ex-streaming',      title: 'LLM Streaming',               route: '/sdk/examples/standalone/llm-streaming' },
        { id: 'sdk-ex-tom',            title: 'TOM Agent',                    route: '/sdk/examples/standalone/tom-agent' },
        { id: 'sdk-ex-iterative',      title: 'Iterative Refinement',         route: '/sdk/examples/standalone/iterative-refinement' },
        { id: 'sdk-ex-hooks',          title: 'Hooks',                        route: '/sdk/examples/standalone/hooks' },
        { id: 'sdk-ex-critic',         title: 'Critic',                       route: '/sdk/examples/standalone/critic' },
        { id: 'sdk-ex-subscription',   title: 'Subscription Login',           route: '/sdk/examples/standalone/subscription-login' },
        { id: 'sdk-ex-profile-store',  title: 'LLM Profile Store',            route: '/sdk/examples/standalone/llm-profile-store' },
        { id: 'sdk-ex-browser-rec',    title: 'Browser Session Recording',    route: '/sdk/examples/standalone/browser-recording' },
        { id: 'sdk-ex-fallback',       title: 'LLM Fallback',                route: '/sdk/examples/standalone/llm-fallback' },
        { id: 'sdk-ex-acp',            title: 'ACP Agent',                    route: '/sdk/examples/standalone/acp-agent' },
        { id: 'sdk-ex-task-tool',      title: 'Task Tool Set',                route: '/sdk/examples/standalone/task-tool-set' },
        { id: 'sdk-ex-file-agents',    title: 'File-Based Sub-agents',       route: '/sdk/examples/standalone/file-based-subagents' },
        { id: 'sdk-ex-parallel',       title: 'Parallel Tool Execution',     route: '/sdk/examples/standalone/parallel-tool-execution' },
        { id: 'sdk-ex-agent-settings', title: 'Agent Settings',              route: '/sdk/examples/standalone/agent-settings' },
        { id: 'sdk-ex-fork',           title: 'Conversation Fork',           route: '/sdk/examples/standalone/conversation-fork' },
      ],
    },
    {
      id: 'sdk-ex-remote',
      title: 'Remote Agent Server',
      route: '/sdk/examples/remote',
      children: [
        { id: 'sdk-ex-local-server',   title: 'Local Agent Server',         route: '/sdk/examples/remote/local-server' },
        { id: 'sdk-ex-docker-server',  title: 'Docker Sandboxed Server',    route: '/sdk/examples/remote/docker-server' },
        { id: 'sdk-ex-browser-docker', title: 'Browser Use + Docker',       route: '/sdk/examples/remote/browser-docker' },
        { id: 'sdk-ex-api-server',     title: 'API Sandboxed Server',       route: '/sdk/examples/remote/api-server' },
        { id: 'sdk-ex-vscode-docker',  title: 'VSCode + Docker',            route: '/sdk/examples/remote/vscode-docker' },
        { id: 'sdk-ex-custom-tool-r',  title: 'Custom Tool',               route: '/sdk/examples/remote/custom-tool' },
        { id: 'sdk-ex-cloud-workspace',title: 'Cloud Workspace',            route: '/sdk/examples/remote/cloud-workspace' },
        { id: 'sdk-ex-apptainer',      title: 'Apptainer Server',           route: '/sdk/examples/remote/apptainer-server' },
        { id: 'sdk-ex-acp-remote',     title: 'ACP + Remote Runtime',       route: '/sdk/examples/remote/acp-remote' },
        { id: 'sdk-ex-cloud-creds',    title: 'Cloud Credentials',          route: '/sdk/examples/remote/cloud-credentials' },
        { id: 'sdk-ex-fork-remote',    title: 'Conversation Fork',          route: '/sdk/examples/remote/conversation-fork' },
        { id: 'sdk-ex-settings-api',   title: 'Settings & Secrets API',     route: '/sdk/examples/remote/settings-secrets-api' },
      ],
    },
    {
      id: 'sdk-ex-gh-workflows',
      title: 'GitHub Workflows',
      route: '/sdk/examples/github-workflows',
      children: [
        { id: 'sdk-ex-basic-action',  title: 'Basic Action',      route: '/sdk/examples/github-workflows/basic-action' },
        { id: 'sdk-ex-pr-review',     title: 'PR Review',         route: '/sdk/examples/github-workflows/pr-review' },
        { id: 'sdk-ex-todo-mgmt',     title: 'TODO Management',   route: '/sdk/examples/github-workflows/todo-management' },
        { id: 'sdk-ex-datadog',       title: 'Datadog Debugging', route: '/sdk/examples/github-workflows/datadog-debugging' },
        { id: 'sdk-ex-posthog',       title: 'PostHog Debugging', route: '/sdk/examples/github-workflows/posthog-debugging' },
      ],
    },
    {
      id: 'sdk-ex-llm-tools',
      title: 'LLM-Specific Tools',
      route: '/sdk/examples/llm-tools',
      children: [
        { id: 'sdk-ex-gpt5-patch', title: 'GPT-5 ApplyPatch Preset', route: '/sdk/examples/llm-tools/gpt5-apply-patch' },
        { id: 'sdk-ex-gemini',     title: 'Gemini File Tools',        route: '/sdk/examples/llm-tools/gemini-file-tools' },
      ],
    },
    {
      id: 'sdk-ex-skills-plugins',
      title: 'Skills & Plugins',
      route: '/sdk/examples/skills-plugins',
      children: [
        { id: 'sdk-ex-load-skills',  title: 'Loading Agent Skills',     route: '/sdk/examples/skills-plugins/loading-skills' },
        { id: 'sdk-ex-load-plugins', title: 'Loading Plugins',          route: '/sdk/examples/skills-plugins/loading-plugins' },
        { id: 'sdk-ex-manage-skills',title: 'Managing Installed Skills', route: '/sdk/examples/skills-plugins/managing-skills' },
      ],
    },
  ],

  'sdk-changelog': [
    { id: 'sdk-changelog', title: 'Changelog', route: '/sdk/changelog' },
  ],

  // ── Agent Canvas ──────────────────────────────────────────────────────────

  'ac-introduction': [
    { id: 'ac-what-is',      title: 'What is Agent Canvas?',       route: '/agent-canvas' },
    { id: 'ac-architecture', title: 'Architecture Overview',       route: '/agent-canvas/architecture' },
    { id: 'ac-how-it-works', title: 'How It Works',                route: '/agent-canvas/how-it-works' },
    { id: 'ac-runtime-modes',title: 'Runtime Modes',               route: '/agent-canvas/runtime-modes' },
    { id: 'ac-faq',          title: 'FAQ',                         route: '/agent-canvas/faq' },
  ],

  'ac-getting-started': [
    { id: 'ac-gs-npx',       title: 'Quickstart — npx',           route: '/agent-canvas/getting-started/npx' },
    { id: 'ac-gs-docker',    title: 'Quickstart — Docker',        route: '/agent-canvas/getting-started/docker' },
    { id: 'ac-gs-source',    title: 'Quickstart — From Source',   route: '/agent-canvas/getting-started/from-source' },
    { id: 'ac-gs-ui',        title: 'Accessing the UI',           route: '/agent-canvas/getting-started/accessing-the-ui' },
    { id: 'ac-gs-backend',   title: 'Connecting Your First Backend', route: '/agent-canvas/getting-started/first-backend' },
    { id: 'ac-gs-onboarding',title: 'Onboarding Flow',            route: '/agent-canvas/getting-started/onboarding' },
  ],

  'ac-features': [
    {
      id: 'ac-feat-home',
      title: 'Home & Workspace',
      route: '/agent-canvas/features/home',
      children: [
        { id: 'ac-feat-repo',       title: 'Repository Selection',  route: '/agent-canvas/features/home/repository-selection' },
        { id: 'ac-feat-workspace',  title: 'Workspace Selection',   route: '/agent-canvas/features/home/workspace-selection' },
        { id: 'ac-feat-new-convo',  title: 'New Conversation',      route: '/agent-canvas/features/home/new-conversation' },
      ],
    },
    {
      id: 'ac-feat-conversations',
      title: 'Conversations',
      route: '/agent-canvas/features/conversations',
      children: [
        { id: 'ac-feat-start-convo',   title: 'Starting a Conversation', route: '/agent-canvas/features/conversations/starting' },
        { id: 'ac-feat-chat',          title: 'Chat Interface',          route: '/agent-canvas/features/conversations/chat' },
        { id: 'ac-feat-event-stream',  title: 'Agent Event Stream',      route: '/agent-canvas/features/conversations/event-stream' },
        { id: 'ac-feat-task-tracking', title: 'Task Tracking',           route: '/agent-canvas/features/conversations/task-tracking' },
        { id: 'ac-feat-convo-panel',   title: 'Conversation Panel',      route: '/agent-canvas/features/conversations/panel' },
        { id: 'ac-feat-shared',        title: 'Shared Conversations',    route: '/agent-canvas/features/conversations/shared' },
        { id: 'ac-feat-metrics',       title: 'Metrics',                 route: '/agent-canvas/features/conversations/metrics' },
      ],
    },
    {
      id: 'ac-feat-tabs',
      title: 'Conversation Tabs',
      route: '/agent-canvas/features/tabs',
      children: [
        { id: 'ac-feat-tab-browser',  title: 'Browser Tab',       route: '/agent-canvas/features/tabs/browser' },
        { id: 'ac-feat-tab-files',    title: 'Files Tab',         route: '/agent-canvas/features/tabs/files' },
        { id: 'ac-feat-tab-terminal', title: 'Terminal Tab',      route: '/agent-canvas/features/tabs/terminal' },
        { id: 'ac-feat-tab-changes',  title: 'Changes (Diff) Tab', route: '/agent-canvas/features/tabs/changes' },
        { id: 'ac-feat-tab-vscode',   title: 'VSCode Tab',        route: '/agent-canvas/features/tabs/vscode' },
        { id: 'ac-feat-tab-planner',  title: 'Planner / Task List Tab', route: '/agent-canvas/features/tabs/planner' },
      ],
    },
    {
      id: 'ac-feat-backends',
      title: 'Backends',
      route: '/agent-canvas/features/backends',
      children: [
        { id: 'ac-feat-add-backend',    title: 'Adding a Backend',        route: '/agent-canvas/features/backends/add' },
        { id: 'ac-feat-switch-backend', title: 'Switching Backends',      route: '/agent-canvas/features/backends/switch' },
        { id: 'ac-feat-backend-health', title: 'Backend Health',          route: '/agent-canvas/features/backends/health' },
      ],
    },
    {
      id: 'ac-feat-settings',
      title: 'Settings',
      route: '/agent-canvas/features/settings',
      children: [
        { id: 'ac-feat-llm',          title: 'LLM Settings & Profiles',   route: '/agent-canvas/features/settings/llm' },
        { id: 'ac-feat-agent',        title: 'Agent Settings',            route: '/agent-canvas/features/settings/agent' },
        { id: 'ac-feat-condenser',    title: 'Condenser Settings',        route: '/agent-canvas/features/settings/condenser' },
        { id: 'ac-feat-verification', title: 'Verification Settings',     route: '/agent-canvas/features/settings/verification' },
        { id: 'ac-feat-mcp',          title: 'MCP Settings',              route: '/agent-canvas/features/settings/mcp' },
        { id: 'ac-feat-skills-set',   title: 'Skills & Plugins Settings', route: '/agent-canvas/features/settings/skills' },
        { id: 'ac-feat-secrets',      title: 'Secrets Management',        route: '/agent-canvas/features/settings/secrets' },
        { id: 'ac-feat-app-settings', title: 'App Settings',              route: '/agent-canvas/features/settings/app' },
      ],
    },
    {
      id: 'ac-feat-skills',
      title: 'Skills & Plugins',
      route: '/agent-canvas/features/skills',
      children: [
        { id: 'ac-feat-skills-overview', title: 'Skills Overview',    route: '/agent-canvas/features/skills/overview' },
        { id: 'ac-feat-skills-install',  title: 'Installing Skills',  route: '/agent-canvas/features/skills/installing' },
        { id: 'ac-feat-extensions-hub',  title: 'Extensions Hub',     route: '/agent-canvas/features/skills/extensions-hub' },
      ],
    },
    {
      id: 'ac-feat-mcp',
      title: 'MCP',
      route: '/agent-canvas/features/mcp',
      children: [
        { id: 'ac-feat-mcp-overview', title: 'MCP Overview',        route: '/agent-canvas/features/mcp/overview' },
        { id: 'ac-feat-mcp-servers',  title: 'Adding MCP Servers',  route: '/agent-canvas/features/mcp/servers' },
      ],
    },
  ],

  'ac-automations': [
    { id: 'ac-auto-what',    title: 'What are Automations?',    route: '/agent-canvas/automations' },
    { id: 'ac-auto-create',  title: 'Creating an Automation',  route: '/agent-canvas/automations/create' },
    { id: 'ac-auto-schedule',title: 'Schedules (Cron)',        route: '/agent-canvas/automations/schedules' },
    { id: 'ac-auto-triggers',title: 'Event Triggers',          route: '/agent-canvas/automations/triggers' },
    { id: 'ac-auto-detail',  title: 'Automation Detail View',  route: '/agent-canvas/automations/detail' },
    { id: 'ac-auto-logs',    title: 'Run Logs',                route: '/agent-canvas/automations/run-logs' },
    { id: 'ac-auto-backend', title: 'Automation Backend Setup', route: '/agent-canvas/automations/backend-setup' },
  ],

  'ac-self-hosting': [
    { id: 'ac-sh-overview', title: 'Overview & Security Model',    route: '/agent-canvas/self-hosting' },
    { id: 'ac-sh-provision', title: '1 · Provision a Machine',     route: '/agent-canvas/self-hosting/provision' },
    { id: 'ac-sh-secure',   title: '2 · Secure the Machine',       route: '/agent-canvas/self-hosting/secure' },
    { id: 'ac-sh-run',      title: '3 · Run the Server',           route: '/agent-canvas/self-hosting/run-server' },
    { id: 'ac-sh-nginx',    title: '4 · Domain, nginx & TLS',      route: '/agent-canvas/self-hosting/nginx-tls' },
    { id: 'ac-sh-defense',  title: 'Defense in Depth',             route: '/agent-canvas/self-hosting/defense-in-depth' },
    { id: 'ac-sh-systemd',  title: 'Running as a Systemd Service', route: '/agent-canvas/self-hosting/systemd' },
    { id: 'ac-sh-env',      title: 'Environment Variables Reference', route: '/agent-canvas/self-hosting/env-vars' },
  ],

  'ac-embedding': [
    { id: 'ac-emb-overview',      title: 'Overview',                              route: '/agent-canvas/embedding' },
    { id: 'ac-emb-install',       title: 'Installation',                          route: '/agent-canvas/embedding/install' },
    { id: 'ac-emb-conversation',  title: '@openhands/agent-canvas/conversation',  route: '/agent-canvas/embedding/conversation' },
    { id: 'ac-emb-browser',       title: '@openhands/agent-canvas/browser',       route: '/agent-canvas/embedding/browser' },
    { id: 'ac-emb-files',         title: '@openhands/agent-canvas/files',         route: '/agent-canvas/embedding/files' },
    { id: 'ac-emb-settings',      title: '@openhands/agent-canvas/settings',      route: '/agent-canvas/embedding/settings' },
    { id: 'ac-emb-sidebar',       title: '@openhands/agent-canvas/sidebar',       route: '/agent-canvas/embedding/sidebar' },
    { id: 'ac-emb-terminal',      title: '@openhands/agent-canvas/terminal',      route: '/agent-canvas/embedding/terminal' },
    { id: 'ac-emb-i18n',          title: '@openhands/agent-canvas/i18n',          route: '/agent-canvas/embedding/i18n' },
    { id: 'ac-emb-react-app',     title: 'Embedding in a React App',              route: '/agent-canvas/embedding/react-app' },
  ],

  'ac-configuration': [
    { id: 'ac-cfg-overview',   title: 'Environment Variables Overview', route: '/agent-canvas/configuration' },
    { id: 'ac-cfg-vite',       title: 'Frontend (VITE_*) Variables',   route: '/agent-canvas/configuration/vite-vars' },
    { id: 'ac-cfg-server',     title: 'Agent Server Variables',        route: '/agent-canvas/configuration/agent-server-vars' },
    { id: 'ac-cfg-run-modes',  title: 'Run Mode Reference',            route: '/agent-canvas/configuration/run-modes' },
    { id: 'ac-cfg-docker',     title: 'Docker Configuration',          route: '/agent-canvas/configuration/docker' },
  ],

  'ac-integrations': [
    { id: 'ac-int-defenseclaw', title: 'DefenseClaw Security Governance', route: '/agent-canvas/integrations/defenseclaw' },
    { id: 'ac-int-slack',       title: 'Slack Trigger',                   route: '/agent-canvas/integrations/slack' },
    { id: 'ac-int-github',      title: 'GitHub Trigger',                  route: '/agent-canvas/integrations/github' },
    { id: 'ac-int-datadog',     title: 'Datadog Trigger',                 route: '/agent-canvas/integrations/datadog' },
    { id: 'ac-int-cloud',       title: 'OpenHands Cloud',                 route: '/agent-canvas/integrations/cloud' },
  ],

  'ac-contributing': [
    {
      id: 'ac-con-dev',
      title: 'Development Guide',
      route: '/agent-canvas/contributing/dev-guide',
      children: [
        { id: 'ac-con-prereqs',    title: 'Prerequisites',            route: '/agent-canvas/contributing/dev-guide/prereqs' },
        { id: 'ac-con-setup',      title: 'Local Setup (from source)', route: '/agent-canvas/contributing/dev-guide/setup' },
        { id: 'ac-con-dev-modes',  title: 'Dev Modes',               route: '/agent-canvas/contributing/dev-guide/dev-modes' },
        { id: 'ac-con-testing',    title: 'Testing (Unit, E2E, Snapshot)', route: '/agent-canvas/contributing/dev-guide/testing' },
        { id: 'ac-con-lint',       title: 'Linting & Formatting',    route: '/agent-canvas/contributing/dev-guide/linting' },
        { id: 'ac-con-i18n',       title: 'i18n Translations',       route: '/agent-canvas/contributing/dev-guide/i18n' },
      ],
    },
    {
      id: 'ac-con-arch',
      title: 'Code Architecture',
      route: '/agent-canvas/contributing/architecture',
      children: [
        { id: 'ac-con-api',        title: 'src/api/ — Service Adapters',   route: '/agent-canvas/contributing/architecture/api' },
        { id: 'ac-con-components', title: 'src/components/ — UI Components', route: '/agent-canvas/contributing/architecture/components' },
        { id: 'ac-con-routes',     title: 'src/routes/ — Route Components', route: '/agent-canvas/contributing/architecture/routes' },
        { id: 'ac-con-hooks',      title: 'src/hooks/ — React Hooks',      route: '/agent-canvas/contributing/architecture/hooks' },
        { id: 'ac-con-stores',     title: 'src/stores/ — Zustand Stores',  route: '/agent-canvas/contributing/architecture/stores' },
        { id: 'ac-con-mocks',      title: 'src/mocks/ — MSW Handlers',    route: '/agent-canvas/contributing/architecture/mocks' },
      ],
    },
    {
      id: 'ac-con-cicd',
      title: 'CI/CD Workflows',
      route: '/agent-canvas/contributing/cicd',
      children: [
        { id: 'ac-con-ci',        title: 'ci.yml (Typecheck, Lint, Tests, Build)', route: '/agent-canvas/contributing/cicd/ci' },
        { id: 'ac-con-docker-wf', title: 'docker.yml (Docker Build & Push)',       route: '/agent-canvas/contributing/cicd/docker' },
        { id: 'ac-con-npm-pub',   title: 'npm-publish.yml (npm Release)',          route: '/agent-canvas/contributing/cicd/npm-publish' },
        { id: 'ac-con-release',   title: 'create-release.yml',                    route: '/agent-canvas/contributing/cicd/create-release' },
        { id: 'ac-con-snapshot',  title: 'snapshot-tests.yml',                    route: '/agent-canvas/contributing/cicd/snapshot-tests' },
        { id: 'ac-con-mock-llm',  title: 'mock-llm-e2e.yml',                      route: '/agent-canvas/contributing/cicd/mock-llm-e2e' },
        { id: 'ac-con-sdk-sync',  title: 'sdk-version-sync.yml',                  route: '/agent-canvas/contributing/cicd/sdk-version-sync' },
      ],
    },
    { id: 'ac-con-release-process', title: 'Release Process', route: '/agent-canvas/contributing/release-process' },
  ],

  'ac-changelog': [
    { id: 'ac-changelog', title: 'Changelog', route: '/agent-canvas/changelog' },
  ],

  // ── Architecture ──────────────────────────────────────────────────────────

  'arch-introduction': [
    { id: 'arch-what-is',       title: 'What is This Repo?',          route: '/arch-repo' },
    { id: 'arch-doc-types',     title: 'Three Document Types',         route: '/arch-repo/document-types' },
    { id: 'arch-scope',         title: 'Scope: Private vs OSS',        route: '/arch-repo/scope' },
    { id: 'arch-tooling',       title: 'Tooling (MADR + madr-tools)', route: '/arch-repo/tooling' },
  ],

  'arch-decisions': [
    { id: 'arch-adr-what',      title: 'What are ADRs?',              route: '/arch-repo/decisions' },
    { id: 'arch-adr-creating',  title: 'How to Create an ADR',        route: '/arch-repo/decisions/creating' },
    { id: 'arch-adr-template',  title: 'ADR Template Reference',      route: '/arch-repo/decisions/template' },
    { id: 'arch-adr-0000',      title: 'ADR-0000 · Developer Workstation Setup', route: '/arch-repo/decisions/0000-workstation-setup' },
    { id: 'arch-adr-0001',      title: 'ADR-0001 · Runtime API Next Steps',      route: '/arch-repo/decisions/0001-runtime-api' },
    {
      id: 'arch-adr-0002',
      title: 'ADR-0002 · Automations Service',
      route: '/arch-repo/decisions/0002-automations-service',
      children: [
        { id: 'arch-adr-0002-context',   title: 'Context & Problem',          route: '/arch-repo/decisions/0002-automations-service/context' },
        { id: 'arch-adr-0002-phase1',    title: 'Phase 1: Cron Triggers',     route: '/arch-repo/decisions/0002-automations-service/phase-1-cron' },
        { id: 'arch-adr-0002-phase1-5',  title: 'Phase 1.5: Preset Automations', route: '/arch-repo/decisions/0002-automations-service/phase-1-5-presets' },
        { id: 'arch-adr-0002-phase2',    title: 'Phase 2: Event-Driven Triggers', route: '/arch-repo/decisions/0002-automations-service/phase-2-events' },
        { id: 'arch-adr-0002-decisions', title: '5 Key Design Decisions',     route: '/arch-repo/decisions/0002-automations-service/design-decisions' },
        { id: 'arch-adr-0002-impl',      title: 'Reference Implementation',   route: '/arch-repo/decisions/0002-automations-service/implementation' },
      ],
    },
  ],

  'arch-design': [
    { id: 'arch-pd-what',      title: 'What are Product Design Projects?', route: '/arch-repo/product-design' },
    { id: 'arch-pd-workflow',  title: 'PD Workflow',                       route: '/arch-repo/product-design/workflow' },
    { id: 'arch-pd-review',    title: 'Review Requirements',               route: '/arch-repo/product-design/review-requirements' },
    { id: 'arch-pd-template',  title: 'Design Template Reference',         route: '/arch-repo/product-design/template' },
    { id: 'arch-pd-creating',  title: 'How to Create a New Design Project', route: '/arch-repo/product-design/creating' },
  ],

  'arch-research': [
    { id: 'arch-pr-what',      title: 'What are Research Projects?',       route: '/arch-repo/research' },
    { id: 'arch-pr-workflow',  title: 'PR Workflow',                       route: '/arch-repo/research/workflow' },
    { id: 'arch-pr-template',  title: 'Research Template Reference',       route: '/arch-repo/research/template' },
    { id: 'arch-pr-creating',  title: 'How to Create a New Research Project', route: '/arch-repo/research/creating' },
  ],

  'arch-process': [
    { id: 'arch-process-overview', title: 'Engineering Processes Overview', route: '/arch-repo/process' },
  ],

  'arch-diagrams': [
    { id: 'arch-diagrams-overview', title: 'Diagrams Overview', route: '/arch-repo/diagrams' },
  ],

  // ── All Repos ─────────────────────────────────────────────────────────────

  'ar-overview': [
    { id: 'ar-ecosystem-map',   title: 'Ecosystem Map',                   route: '/all-repos' },
    { id: 'ar-ov-openhands',    title: 'OpenHands (the App)',             route: '/all-repos/overview/openhands' },
    { id: 'ar-ov-sdk',          title: 'software-agent-sdk',              route: '/all-repos/overview/sdk' },
    { id: 'ar-ov-canvas',       title: 'Agent Canvas',                    route: '/all-repos/overview/agent-canvas' },
    { id: 'ar-ov-automation',   title: 'Automation Service',              route: '/all-repos/overview/automation' },
    { id: 'ar-ov-architecture', title: 'Architecture Repo',               route: '/all-repos/overview/architecture' },
    { id: 'ar-ov-cloud',        title: 'OpenHands Cloud (SaaS)',          route: '/all-repos/overview/cloud' },
    { id: 'ar-ov-extensions',   title: 'Extensions / Skills Marketplace', route: '/all-repos/overview/extensions' },
  ],

  'ar-how-connected': [
    { id: 'ar-dep-graph',     title: 'Dependency Graph',            route: '/all-repos/connections' },
    { id: 'ar-data-flow',     title: 'End-to-End Data Flow',        route: '/all-repos/connections/data-flow' },
    { id: 'ar-oh-sdk',        title: 'OpenHands ↔ SDK',             route: '/all-repos/connections/openhands-sdk' },
    { id: 'ar-canvas-server', title: 'Agent Canvas ↔ Agent Server', route: '/all-repos/connections/canvas-agent-server' },
    { id: 'ar-auto-server',   title: 'Automation ↔ Agent Server',   route: '/all-repos/connections/automation-agent-server' },
    { id: 'ar-api-contracts', title: 'API Contracts Between Repos', route: '/all-repos/connections/api-contracts' },
    { id: 'ar-cloud-all',     title: 'Cloud ↔ All Repos',           route: '/all-repos/connections/cloud' },
    { id: 'ar-skills-path',   title: 'Skills Load Path',            route: '/all-repos/connections/skills-load-path' },
    { id: 'ar-deploy-topo',   title: 'Deployment Topology',         route: '/all-repos/connections/deployment-topology' },
  ],

  'ar-databases': [
    { id: 'ar-db-overview',   title: 'Databases Overview',          route: '/all-repos/databases' },
    { id: 'ar-db-auto',       title: 'Automation Service DB',       route: '/all-repos/databases/automation' },
    { id: 'ar-db-oh',         title: 'OpenHands App DB',            route: '/all-repos/databases/openhands' },
    { id: 'ar-db-cloud',      title: 'OpenHands Cloud DB',          route: '/all-repos/databases/cloud' },
    { id: 'ar-db-ids',        title: 'Cross-Service ID Flow',       route: '/all-repos/databases/cross-service-ids' },
  ],

  'ar-repo-ref': [
    { id: 'ar-ref-openhands',  title: 'OpenHands/OpenHands',          route: '/all-repos/repos' },
    { id: 'ar-ref-sdk',        title: 'OpenHands/software-agent-sdk', route: '/all-repos/repos/sdk' },
    { id: 'ar-ref-canvas',     title: 'OpenHands/agent-canvas',       route: '/all-repos/repos/agent-canvas' },
    { id: 'ar-ref-automation', title: 'OpenHands/automation',         route: '/all-repos/repos/automation' },
    { id: 'ar-ref-arch',       title: 'OpenHands/architecture',       route: '/all-repos/repos/architecture' },
    { id: 'ar-ref-extensions', title: 'OpenHands/extensions',         route: '/all-repos/repos/extensions' },
  ],

  'ar-contributing': [
    { id: 'ar-con-start',      title: 'Where to Start',                   route: '/all-repos/contributing' },
    { id: 'ar-con-openhands',  title: 'Contributing to OpenHands',        route: '/all-repos/contributing/openhands' },
    { id: 'ar-con-sdk',        title: 'Contributing to the SDK',          route: '/all-repos/contributing/sdk' },
    { id: 'ar-con-canvas',     title: 'Contributing to Agent Canvas',     route: '/all-repos/contributing/agent-canvas' },
    { id: 'ar-con-automation', title: 'Contributing to Automation',       route: '/all-repos/contributing/automation' },
    { id: 'ar-con-arch',       title: 'Recording Architecture Decisions', route: '/all-repos/contributing/architecture' },
    { id: 'ar-con-cross',      title: 'Cross-Repo Pull Requests',         route: '/all-repos/contributing/cross-repo' },
  ],

  'ar-glossary': [
    { id: 'ar-glossary-page', title: 'Glossary of Terms', route: '/all-repos/glossary' },
  ],
};
