export interface CodeExample {
  language: string;
  label?: string;
  code: string;
}

export interface PageSection {
  type: 'heading' | 'paragraph' | 'code' | 'table' | 'callout' | 'list' | 'steps' | 'diagram';
  level?: number;
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  variant?: 'info' | 'warning' | 'success' | 'danger';
  steps?: { title: string; content: string }[];
  examples?: CodeExample[];
  caption?: string;
}

export interface PageContent {
  title: string;
  description: string;
  route: string;
  sections: PageSection[];
  codeExamples?: CodeExample[];
  tryItOut?: {
    method: string;
    endpoint: string;
    fields?: { name: string; type: string; required: boolean; description: string }[];
  };
}

export const pages: Record<string, PageContent> = {
  '/': {
    title: 'What is OpenHands?',
    description: 'OpenHands is an AI-powered software development platform that enables autonomous coding agents to write code, run tests, fix bugs, and complete complex engineering tasks.',
    route: '/',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '🏆 OpenHands achieves 77.6% on SWE-bench — the industry-leading benchmark for autonomous software engineering.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What is OpenHands?',
      },
      {
        type: 'paragraph',
        content: 'OpenHands is an AI-powered software development platform that enables autonomous coding agents to write code, run tests, fix bugs, and complete complex engineering tasks. It provides multiple deployment options to fit your workflow: from a fully hosted cloud service to a self-hosted enterprise solution.',
      },
      {
        type: 'heading',
        level: 2,
        content: '5 Ways to Use OpenHands',
      },
      {
        type: 'table',
        headers: ['Mode', 'Best For', 'Setup Required'],
        rows: [
          ['SDK', 'Building AI agent pipelines programmatically', 'pip install openhands-sdk'],
          ['CLI', 'Terminal-based agent interactions', 'Install from repo or package'],
          ['Local GUI (OSS)', 'Self-hosted open source deployment', 'Docker in 2 commands'],
          ['Cloud', 'Hosted service, no infrastructure', 'Sign in at app.all-hands.dev'],
          ['Enterprise', 'VPC/Kubernetes with SSO, RBAC', 'Kubernetes + Helm chart'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key Capabilities',
      },
      {
        type: 'list',
        items: [
          'Autonomous code writing, editing, and debugging',
          'Full bash/terminal access inside isolated sandboxes',
          'Browser control for web-based tasks',
          'Git integration (GitHub, GitLab, Bitbucket, Azure DevOps)',
          'Multi-LLM support via LiteLLM (GPT-4, Claude, Gemini, and more)',
          'Skills system for reusable agent behaviors',
          'MCP (Model Context Protocol) server integration',
          'Real-time streaming via SSE',
          'Webhook support for automation',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Community',
      },
      {
        type: 'paragraph',
        content: 'OpenHands has a vibrant open-source community with thousands of contributors. Join us on Slack, GitHub, or Discord to get help, share ideas, and contribute to the project.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Docker Quick Start',
        code: `# Pull and run OpenHands in one command
docker pull ghcr.io/all-handsmachinelearning/openhands:latest

docker run -it --rm \\
  -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik \\
  -e LOG_ALL_EVENTS=true \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -p 3000:3000 \\
  ghcr.io/all-handsmachinelearning/openhands:latest

# Then open http://localhost:3000`,
      },
      {
        language: 'python',
        label: 'SDK Quick Start',
        code: `pip install openhands-sdk

from openhands.sdk import LLM, Agent, Conversation

llm = LLM(model="gpt-4o", api_key="your-api-key")
agent = Agent(llm=llm)
conversation = Conversation(agent=agent, workspace="/tmp/my-project")

conversation.send_message("Write a Python script that sorts a list of numbers")
conversation.run()`,
      },
    ],
  },

  '/architecture': {
    title: 'Architecture Overview',
    description: 'How OpenHands is structured — from the agent layer to the runtime sandbox.',
    route: '/architecture',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'System Architecture',
      },
      {
        type: 'paragraph',
        content: 'OpenHands follows a layered architecture where an AI agent interacts with a sandboxed runtime environment through a well-defined event system. Each conversation gets its own isolated Docker sandbox.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Core Components',
      },
      {
        type: 'table',
        headers: ['Component', 'Description', 'Technology'],
        rows: [
          ['Agent', 'Reasoning loop that plans and executes tasks', 'Python / LiteLLM'],
          ['Event System', 'Typed action/observation bus', 'Python dataclasses'],
          ['Runtime Sandbox', 'Isolated execution environment', 'Docker containers'],
          ['App Server', 'REST API + WebSocket backend', 'FastAPI + Python'],
          ['Frontend', 'Single-page application', 'React + TypeScript'],
          ['Database', 'Conversation and event storage', 'SQLite / PostgreSQL'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Agent ↔ Runtime Pipeline',
      },
      {
        type: 'steps',
        steps: [
          { title: 'User Input', content: 'User sends a task message via the UI or API' },
          { title: 'Agent Planning', content: 'The LLM-backed agent analyzes the task and determines actions' },
          { title: 'Action Emission', content: 'Agent emits typed action events (CmdRunAction, FileWriteAction, BrowseInteractiveAction, etc.)' },
          { title: 'Sandbox Execution', content: 'Runtime sandbox executes actions in isolated Docker container' },
          { title: 'Observation Return', content: 'Execution results returned as typed observation events' },
          { title: 'Loop Continuation', content: 'Agent processes observations and decides next actions until task is complete' },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Event Types',
        code: `# Action types (agent → runtime)
class CmdRunAction:
    command: str
    
class FileWriteAction:
    path: str
    content: str

class BrowseInteractiveAction:
    browser_actions: str

# Observation types (runtime → agent)  
class CmdOutputObservation:
    content: str
    exit_code: int
    
class FileReadObservation:
    content: str
    path: str`,
      },
    ],
  },

  '/getting-started/cloud': {
    title: 'Quickstart — Cloud',
    description: 'Get started with OpenHands Cloud in minutes. No infrastructure required.',
    route: '/getting-started/cloud',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Prerequisites',
      },
      {
        type: 'list',
        items: [
          'A GitHub or GitLab account for OAuth',
          'A code repository to work with (optional for first try)',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Step 1: Sign In',
      },
      {
        type: 'paragraph',
        content: 'Visit app.all-hands.dev and sign in with your GitHub or GitLab account. First-time users will be prompted to accept the Terms of Service and complete a brief onboarding form.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Step 2: Connect a Repository',
      },
      {
        type: 'paragraph',
        content: 'On the home screen, click "Connect a repository" to link your GitHub or GitLab repositories. OpenHands will request the necessary permissions to read, write, and create pull requests.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Step 3: Start Your First Task',
      },
      {
        type: 'paragraph',
        content: 'Enter a task description in the conversation input. For example: "Fix the failing tests in src/utils.ts" or "Add input validation to the user registration form". OpenHands will spin up a sandbox and begin working autonomously.',
      },
      {
        type: 'callout',
        variant: 'success',
        content: '🆓 Free tier includes access using the Minimax model at no cost. Upgrade to use premium models like GPT-4o or Claude.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'API Authentication',
        code: `# Get your API key from Settings → API Keys
# Then use it in API calls:
curl -X POST https://app.all-hands.dev/api/v1/conversations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"task": "Fix the bug in utils.ts"}'`,
      },
    ],
    tryItOut: {
      method: 'POST',
      endpoint: '/api/v1/conversations',
      fields: [
        { name: 'task', type: 'string', required: true, description: 'The task for the agent to complete' },
        { name: 'repository', type: 'string', required: false, description: 'Repository URL to work with' },
        { name: 'branch', type: 'string', required: false, description: 'Branch name (default: main)' },
      ],
    },
  },

  '/getting-started/local-oss': {
    title: 'Quickstart — Local GUI (OSS)',
    description: 'Run OpenHands locally with Docker in under 2 minutes.',
    route: '/getting-started/local-oss',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: 'Prerequisites: Docker Desktop (Mac/Windows) or Docker Engine (Linux), 8GB RAM minimum',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quick Start (2 Commands)',
      },
      {
        type: 'steps',
        steps: [
          {
            title: 'Pull the image',
            content: 'docker pull ghcr.io/all-handsmachinelearning/openhands:latest',
          },
          {
            title: 'Run the container',
            content: 'docker run -it --rm -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik -e LOG_ALL_EVENTS=true -v /var/run/docker.sock:/var/run/docker.sock -v ~/.openhands:/home/openhands/.openhands -p 3000:3000 --add-host host.docker.internal:host-gateway ghcr.io/all-handsmachinelearning/openhands:latest',
          },
          {
            title: 'Open the UI',
            content: 'Visit http://localhost:3000 in your browser',
          },
          {
            title: 'Configure LLM',
            content: 'Go to Settings (gear icon) and enter your LLM API key',
          },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Docker Run Command',
        code: `docker run -it --rm \\
  -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik \\
  -e LOG_ALL_EVENTS=true \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -p 3000:3000 \\
  --add-host host.docker.internal:host-gateway \\
  ghcr.io/all-handsmachinelearning/openhands:latest`,
      },
      {
        language: 'yaml',
        label: 'Docker Compose',
        code: `version: '3'
services:
  openhands:
    image: ghcr.io/all-handsmachinelearning/openhands:latest
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.openhands:/home/openhands/.openhands
    environment:
      - SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik
      - LOG_ALL_EVENTS=true
    extra_hosts:
      - "host.docker.internal:host-gateway"`,
      },
    ],
  },

  '/getting-started/sdk': {
    title: 'Quickstart — SDK',
    description: 'Build AI agent pipelines with the OpenHands Python SDK.',
    route: '/getting-started/sdk',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Installation',
      },
      {
        type: 'paragraph',
        content: 'Install the OpenHands SDK via pip. Python 3.12+ is required.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Your First Agent',
      },
      {
        type: 'paragraph',
        content: 'The SDK provides a clean, composable API for creating AI agents that can write software. Configure an LLM, create an Agent, and run a Conversation.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Core Concepts',
      },
      {
        type: 'table',
        headers: ['Class', 'Purpose'],
        rows: [
          ['LLM', 'Provider-agnostic language model interface'],
          ['Agent', 'Reasoning-action loop'],
          ['Conversation', 'Orchestrates agent execution'],
          ['Tool', 'Defines what agents can do (terminal, file editor, etc.)'],
          ['Skill', 'Reusable prompt/behavior system'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Install',
        code: `pip install openhands-sdk openhands-tools`,
      },
      {
        language: 'python',
        label: 'Hello World',
        code: `import os
from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.terminal import TerminalTool

llm = LLM(
    model=os.getenv("LLM_MODEL", "gpt-4o"),
    api_key=os.getenv("LLM_API_KEY"),
)

agent = Agent(
    llm=llm,
    tools=[
        Tool(name=TerminalTool.name),
        Tool(name=FileEditorTool.name),
    ],
)

conversation = Conversation(agent=agent, workspace="/tmp/my-project")
conversation.send_message("Create a Python calculator with basic arithmetic operations")
conversation.run()
print("Done!")`,
      },
    ],
  },

  '/installation/local-oss/docker': {
    title: 'Docker (Recommended)',
    description: 'The easiest way to run OpenHands locally using Docker.',
    route: '/installation/local-oss/docker',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: 'Prerequisites: Docker Desktop 4.x+ (Mac/Windows) or Docker Engine 24.x+ (Linux)',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Environment Variables',
      },
      {
        type: 'table',
        headers: ['Variable', 'Required', 'Description'],
        rows: [
          ['SANDBOX_RUNTIME_CONTAINER_IMAGE', 'Yes', 'Runtime image for the sandbox container'],
          ['LOG_ALL_EVENTS', 'No', 'Enable verbose event logging'],
          ['WORKSPACE_MOUNT_PATH', 'No', 'Host path to mount as workspace'],
          ['SANDBOX_USER_ID', 'No', 'User ID for sandbox (default: current user)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Volume Mounts',
      },
      {
        type: 'list',
        items: [
          '/var/run/docker.sock — Required for spawning sandbox containers',
          '~/.openhands — Persists settings, conversations, and LLM config',
          'Optional: Mount your project directory for direct file access',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Basic Run',
        code: `docker run -it --rm \\
  -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -p 3000:3000 \\
  --add-host host.docker.internal:host-gateway \\
  ghcr.io/all-handsmachinelearning/openhands:latest`,
      },
      {
        language: 'bash',
        label: 'With Workspace Mount',
        code: `export WORKSPACE_BASE=$(pwd)

docker run -it --rm \\
  -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik \\
  -e WORKSPACE_MOUNT_PATH=$WORKSPACE_BASE \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -v $WORKSPACE_BASE:/opt/workspace_base \\
  -p 3000:3000 \\
  --add-host host.docker.internal:host-gateway \\
  ghcr.io/all-handsmachinelearning/openhands:latest`,
      },
    ],
  },

  '/api/conversations/start': {
    title: 'Start Conversation',
    description: 'Create a new conversation and start an agent task.',
    route: '/api/conversations/start',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Endpoint',
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'POST /api/v1/conversations',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Request Body',
      },
      {
        type: 'table',
        headers: ['Field', 'Type', 'Required', 'Description'],
        rows: [
          ['task', 'string', 'Yes', 'The task description for the agent'],
          ['repository', 'string', 'No', 'Repository URL to clone and work with'],
          ['branch', 'string', 'No', 'Branch name (default: main/master)'],
          ['selected_repository', 'object', 'No', 'Repository object with full details'],
          ['initial_user_msg', 'string', 'No', 'Alias for task field'],
          ['agent_settings', 'object', 'No', 'Override default agent settings'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Response',
      },
      {
        type: 'paragraph',
        content: 'Returns the created conversation object with a unique ID that can be used for subsequent API calls.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Status Codes',
      },
      {
        type: 'table',
        headers: ['Code', 'Description'],
        rows: [
          ['201', 'Conversation created successfully'],
          ['400', 'Invalid request body'],
          ['401', 'Authentication required'],
          ['429', 'Rate limit exceeded'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'cURL',
        code: `curl -X POST https://app.all-hands.dev/api/v1/conversations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Fix the failing unit tests in src/auth/login.ts",
    "repository": "https://github.com/myorg/myrepo",
    "branch": "main"
  }'`,
      },
      {
        language: 'python',
        label: 'Python',
        code: `import requests

response = requests.post(
    "https://app.all-hands.dev/api/v1/conversations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "task": "Fix the failing unit tests in src/auth/login.ts",
        "repository": "https://github.com/myorg/myrepo",
        "branch": "main",
    }
)

conversation = response.json()
print(f"Conversation ID: {conversation['id']}")`,
      },
      {
        language: 'json',
        label: 'Response',
        code: `{
  "id": "conv_01j9x2y3z4a5b6c7d8e9f0g1h",
  "status": "running",
  "created_at": "2025-05-30T10:00:00Z",
  "task": "Fix the failing unit tests in src/auth/login.ts",
  "repository": "https://github.com/myorg/myrepo",
  "branch": "main"
}`,
      },
    ],
    tryItOut: {
      method: 'POST',
      endpoint: '/api/v1/conversations',
      fields: [
        { name: 'task', type: 'string', required: true, description: 'The task for the agent to complete' },
        { name: 'repository', type: 'string', required: false, description: 'Repository URL to work with' },
        { name: 'branch', type: 'string', required: false, description: 'Branch name (default: main)' },
      ],
    },
  },

  '/api/sandboxes/create': {
    title: 'Create Sandbox',
    description: 'Create a new sandbox environment for agent execution.',
    route: '/api/sandboxes/create',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Endpoint',
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'POST /api/v1/sandboxes',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Request Body',
      },
      {
        type: 'table',
        headers: ['Field', 'Type', 'Required', 'Description'],
        rows: [
          ['image', 'string', 'No', 'Docker image for the sandbox (default: runtime image)'],
          ['workspace_dir', 'string', 'No', 'Initial working directory'],
          ['environment', 'object', 'No', 'Environment variables for the sandbox'],
          ['timeout', 'integer', 'No', 'Sandbox timeout in seconds'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'cURL',
        code: `curl -X POST https://app.all-hands.dev/api/v1/sandboxes \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "environment": {
      "NODE_ENV": "test",
      "DATABASE_URL": "sqlite:///tmp/test.db"
    }
  }'`,
      },
    ],
    tryItOut: {
      method: 'POST',
      endpoint: '/api/v1/sandboxes',
      fields: [
        { name: 'image', type: 'string', required: false, description: 'Docker image for the sandbox' },
        { name: 'timeout', type: 'integer', required: false, description: 'Timeout in seconds' },
      ],
    },
  },

  '/configuration': {
    title: 'Configuration Reference',
    description: 'Complete reference for all OpenHands configuration options.',
    route: '/configuration',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Configuration Methods',
      },
      {
        type: 'paragraph',
        content: 'OpenHands can be configured through the settings UI, environment variables, or the config.toml file. Environment variables take precedence over config file values.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key Configuration Options',
      },
      {
        type: 'table',
        headers: ['Option', 'Type', 'Default', 'Description'],
        rows: [
          ['core.workspace_base', 'string', './workspace', 'Base directory for agent workspaces'],
          ['core.debug', 'boolean', 'false', 'Enable debug logging'],
          ['llm.model', 'string', 'gpt-4o', 'Default LLM model to use'],
          ['llm.api_key', 'string', '', 'API key for the LLM provider'],
          ['llm.base_url', 'string', '', 'Custom base URL for LLM API'],
          ['agent.name', 'string', 'CodeActAgent', 'Agent class to use'],
          ['sandbox.runtime_image', 'string', 'runtime:latest', 'Docker image for sandbox'],
          ['sandbox.timeout', 'integer', '120', 'Sandbox execution timeout (seconds)'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'toml',
        label: 'config.template.toml',
        code: `[core]
workspace_base = "./workspace"
debug = false
save_screenshots = false

[llm]
model = "gpt-4o"
api_key = "your-api-key"
# base_url = "https://api.openai.com/v1"
temperature = 0.0
max_input_tokens = 128000
max_output_tokens = 4096

[agent]
name = "CodeActAgent"
memory_enabled = false
memory_max_threads = 2

[sandbox]
runtime_container_image = "docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik"
timeout = 120
user_id = 1000`,
      },
      {
        language: 'bash',
        label: 'Environment Variables',
        code: `# Core
export WORKSPACE_MOUNT_PATH=/path/to/workspace
export DEBUG=false

# LLM
export LLM_MODEL=gpt-4o
export LLM_API_KEY=your-api-key

# Sandbox
export SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-handsmachinelearning/runtime:0.21-nikolaik
export SANDBOX_TIMEOUT=120

# Server
export FRONTEND_PORT=3000
export BACKEND_HOST=0.0.0.0`,
      },
    ],
  },

  '/integrations/github': {
    title: 'GitHub Integration',
    description: 'Connect OpenHands with GitHub for seamless repository access and PR creation.',
    route: '/integrations/github',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'GitHub Integration Overview',
      },
      {
        type: 'paragraph',
        content: 'OpenHands integrates with GitHub to allow agents to clone repositories, create branches, commit code, and open pull requests automatically. The integration uses OAuth apps for secure access.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Required Permissions',
      },
      {
        type: 'table',
        headers: ['Permission', 'Scope', 'Why Needed'],
        rows: [
          ['Contents', 'read/write', 'Clone repos, read/write files'],
          ['Pull Requests', 'read/write', 'Create and update PRs'],
          ['Issues', 'read', 'Read issue context for task suggestions'],
          ['Metadata', 'read', 'Repository metadata'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Setup Steps',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Open Settings', content: 'Go to Settings → Integrations in the OpenHands UI' },
          { title: 'Click Connect GitHub', content: 'Click the Connect GitHub button' },
          { title: 'OAuth Authorization', content: 'Authorize the OpenHands GitHub App in the OAuth flow' },
          { title: 'Select Repositories', content: 'Choose which repositories to grant access to' },
          { title: 'Verify Connection', content: 'Your repositories will appear in the repo selector on the home screen' },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Search Repositories',
        code: `# List accessible repositories
curl -X GET "https://app.all-hands.dev/api/v1/git/repositories/search?query=myrepo" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      },
      {
        language: 'json',
        label: 'Response',
        code: `{
  "repositories": [
    {
      "id": "12345",
      "full_name": "myorg/myrepo",
      "html_url": "https://github.com/myorg/myrepo",
      "default_branch": "main",
      "private": false
    }
  ]
}`,
      },
    ],
  },

  '/features/conversations': {
    title: 'Conversations',
    description: 'Understanding how OpenHands conversations work — lifecycle, states, and interaction patterns.',
    route: '/features/conversations',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'What is a Conversation?',
      },
      {
        type: 'paragraph',
        content: 'A conversation is the primary unit of work in OpenHands. Each conversation represents a task given to an agent, running in its own isolated sandbox environment. Conversations persist their state and can be resumed, shared, or exported.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Conversation Tabs',
      },
      {
        type: 'table',
        headers: ['Tab', 'Description'],
        rows: [
          ['Chat', 'Main conversation view with agent messages and user input'],
          ['Changes', 'Diff viewer showing file modifications made by the agent'],
          ['Planner', 'Task planning view with high-level decomposition'],
          ['Task List', 'Checklist of subtasks and their completion status'],
          ['Terminal', 'Embedded terminal showing agent bash commands'],
          ['Browser', 'Agent-controlled browser for web-based tasks'],
          ['VSCode', 'Open workspace in VS Code via tunnel'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Conversation Lifecycle',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Created', content: 'User sends a task. Sandbox is provisioned.' },
          { title: 'Loading', content: 'Agent and runtime are initializing.' },
          { title: 'Running', content: 'Agent is actively working on the task.' },
          { title: 'Awaiting Input', content: 'Agent needs clarification from the user.' },
          { title: 'Finished', content: 'Task completed. Agent has stopped.' },
          { title: 'Error', content: 'An unrecoverable error occurred.' },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Send a Message',
        code: `# Send a follow-up message to an existing conversation
curl -X POST https://app.all-hands.dev/api/v1/conversations/CONV_ID/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Also add unit tests for the new function"}'`,
      },
    ],
    tryItOut: {
      method: 'POST',
      endpoint: '/api/v1/conversations/{id}/messages',
      fields: [
        { name: 'content', type: 'string', required: true, description: 'Message to send to the agent' },
      ],
    },
  },

  '/enterprise/architecture': {
    title: 'Enterprise Architecture',
    description: 'How OpenHands Enterprise is deployed in VPC and Kubernetes environments.',
    route: '/enterprise/architecture',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Deployment Overview',
      },
      {
        type: 'paragraph',
        content: 'OpenHands Enterprise is designed for organizations that require data sovereignty, advanced security controls, and scalability. It runs entirely within your VPC on Kubernetes.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Components',
      },
      {
        type: 'table',
        headers: ['Component', 'Description', 'Scaling'],
        rows: [
          ['App Server', 'FastAPI backend, REST + WebSocket', 'Horizontal (stateless)'],
          ['Frontend', 'React SPA, served via nginx', 'Horizontal (stateless)'],
          ['Agent Runtime', 'Docker-in-Docker or node pools', 'Per-conversation isolation'],
          ['Database', 'PostgreSQL with Alembic migrations', 'Vertical / Read replicas'],
          ['Auth', 'Keycloak SSO, GitHub/SAML/OIDC', 'High availability'],
          ['Storage', 'S3-compatible or local filesystem', 'Based on provider'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Security Model',
      },
      {
        type: 'list',
        items: [
          'Each conversation runs in an isolated Kubernetes pod or Docker container',
          'Network policies restrict inter-pod communication',
          'Secrets managed via Kubernetes Secrets or Vault integration',
          'RBAC controls access at org, team, and user levels',
          'All LLM calls made from within VPC (no data leaves your network)',
          'Audit logging for all user actions and agent executions',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'yaml',
        label: 'Helm Values (minimal)',
        code: `# values.yaml
replicaCount: 2

image:
  repository: ghcr.io/all-handsmachinelearning/openhands-enterprise
  tag: "0.21.0"

database:
  host: postgres.internal
  port: 5432
  name: openhands
  existingSecret: openhands-db-secret

auth:
  keycloakUrl: https://auth.company.com
  realm: openhands

storage:
  type: s3
  bucket: openhands-workspaces
  region: us-east-1`,
      },
    ],
  },

  '/contributing': {
    title: 'Contributing to OpenHands',
    description: 'How to contribute code, documentation, and ideas to the OpenHands project.',
    route: '/contributing',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Welcome, Contributor!',
      },
      {
        type: 'paragraph',
        content: 'OpenHands is an open-source project and welcomes contributions from everyone. Whether you\'re fixing a bug, adding a feature, improving documentation, or creating evaluation benchmarks — we appreciate your help!',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Ways to Contribute',
      },
      {
        type: 'list',
        items: [
          '🐛 Report bugs by opening GitHub issues',
          '✨ Request features via discussions',
          '📝 Improve documentation',
          '🔧 Fix bugs and submit PRs',
          '🧪 Add evaluation benchmarks',
          '🌍 Help with translations',
          '💬 Answer questions on Slack and Discord',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Development Setup',
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'See the Development Setup page for OS-specific instructions for macOS, Linux, and Windows.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Quick Dev Setup',
        code: `# Clone the repo
git clone https://github.com/All-Hands-AI/OpenHands.git
cd OpenHands

# Install dependencies
make install-python-dependencies

# Build and run
make build
make run

# Run tests
pytest ./tests/unit/test_*.py`,
      },
    ],
  },

  '/changelog': {
    title: 'Release Notes',
    description: 'What\'s new in each OpenHands release.',
    route: '/changelog',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: '0.21.0 — May 2025',
      },
      {
        type: 'list',
        items: [
          '✨ New: Skills settings page for managing agent skills',
          '✨ New: MCP (Model Context Protocol) server integration',
          '✨ New: Verification settings for output validation',
          '🐛 Fix: Improved sandbox cleanup on conversation end',
          '🐛 Fix: WebSocket reconnection stability',
          '📈 Performance: Faster conversation loading with pagination',
          '🔐 Security: Enhanced secret masking in terminal output',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: '0.20.0 — April 2025',
      },
      {
        type: 'list',
        items: [
          '✨ New: Organization management with RBAC',
          '✨ New: Shared conversation URLs (/shared/conversations/:id)',
          '✨ New: Webhook support for conversation events',
          '✨ New: Azure DevOps integration',
          '🐛 Fix: Multiple browser control improvements',
          '📈 Performance: Agent context condensation',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Upgrade Docker Image',
        code: `# Pull the latest version
docker pull ghcr.io/all-handsmachinelearning/openhands:latest

# Or pin to specific version
docker pull ghcr.io/all-handsmachinelearning/openhands:0.21.0`,
      },
    ],
  },

  // ── SDK Pages ────────────────────────────────────────────────────────────

  '/sdk': {
    title: 'What is the OpenHands SDK?',
    description: 'Build AI agents that write software. A clean, modular Python SDK with production-ready tools.',
    route: '/sdk',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '🚀 The OpenHands SDK lets you build, compose, and deploy AI software agents with just a few lines of Python.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What is the SDK?',
      },
      {
        type: 'paragraph',
        content: 'The OpenHands Software Agent SDK is a Python library for building AI agents that autonomously write, edit, and execute code. It provides a clean, modular architecture with production-ready tools for terminal access, file editing, browser control, and more — all running in isolated sandboxes.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'When to use the SDK',
      },
      {
        type: 'table',
        headers: ['Use Case', 'Recommended Approach'],
        rows: [
          ['Automate code tasks programmatically', 'SDK — full programmatic control'],
          ['Quick one-off agent tasks', 'CLI — no code required'],
          ['Visual/interactive agent sessions', 'Local GUI or Cloud'],
          ['Team-wide agent deployment', 'Enterprise or Cloud'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Core Capabilities',
      },
      {
        type: 'list',
        items: [
          'Multi-LLM support via LiteLLM (GPT-4o, Claude, Gemini, Llama, and more)',
          'Built-in tools: terminal, file editor, browser, task tracker',
          'Isolated sandbox execution (local, Docker, Apptainer, or Cloud)',
          'Async & sync conversation APIs',
          'Agent delegation — spin up parallel sub-agents',
          'Model Context Protocol (MCP) server integration',
          'Skills & Plugins for reusable agent behaviors',
          'Observability via OpenTelemetry (Laminar, MLflow, Honeycomb)',
          'Streaming, pause/resume, persistence across sessions',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quick Install',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Install',
        code: 'pip install openhands-sdk openhands-tools',
      },
      {
        language: 'python',
        label: 'Hello World',
        code: `import os
from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.terminal import TerminalTool

llm = LLM(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY"))

agent = Agent(
    llm=llm,
    tools=[Tool(name=TerminalTool.name), Tool(name=FileEditorTool.name)],
)

conversation = Conversation(agent=agent, workspace=os.getcwd())
conversation.send_message("Write 3 facts about Python into facts.txt")
conversation.run()
print("Done!")`,
      },
    ],
  },

  '/sdk/concepts': {
    title: 'Key Concepts',
    description: 'Core concepts and terminology used throughout the OpenHands SDK.',
    route: '/sdk/concepts',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Core Concepts',
      },
      {
        type: 'table',
        headers: ['Concept', 'Description'],
        rows: [
          ['Agent', 'The reasoning-action loop — decides what to do, calls tools, and observes results'],
          ['LLM', 'Provider-agnostic language model interface (wraps LiteLLM)'],
          ['Conversation', 'Orchestrates an agent session; manages state, events, and workspace'],
          ['Tool', 'A capability the agent can invoke (terminal, file editor, browser, etc.)'],
          ['Workspace', 'The execution environment — local, Docker, Apptainer, or Cloud'],
          ['Event', 'Typed message in the agent event stream (actions, observations, messages)'],
          ['Condenser', 'Compresses conversation history to manage context window limits'],
          ['Skill', 'Reusable prompt behavior injected into the agent system prompt'],
          ['Plugin', 'Bundle of skills, hooks, MCP servers, and tools packaged together'],
          ['SecurityAnalyzer', 'Validates agent actions against a configurable security policy'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'The Agent Loop',
      },
      {
        type: 'steps',
        steps: [
          { title: 'User sends a message', content: 'conversation.send_message("...") adds a MessageAction to the event stream' },
          { title: 'Agent thinks', content: 'The LLM receives the event history and system prompt, then responds with a tool call or message' },
          { title: 'Tool executes', content: 'The requested tool runs in the workspace sandbox and returns an observation' },
          { title: 'Observation recorded', content: 'The result is added to the event stream for the next LLM call' },
          { title: 'Repeat until done', content: 'The loop continues until the agent emits a FinishAction or max iterations is reached' },
        ],
      },
    ],
  },

  '/sdk/getting-started/install': {
    title: 'Installation',
    description: 'Install the OpenHands SDK and set up your environment.',
    route: '/sdk/getting-started/install',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Requirements',
      },
      {
        type: 'list',
        items: [
          'Python 3.11 or later',
          'An API key for a supported LLM provider (OpenAI, Anthropic, Google, etc.)',
          'Docker (optional, required for sandboxed remote server mode)',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Install',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Environment Variables',
      },
      {
        type: 'table',
        headers: ['Variable', 'Required', 'Description'],
        rows: [
          ['LLM_MODEL', 'Yes', 'Model name e.g. gpt-4o, claude-sonnet-4-5'],
          ['LLM_API_KEY', 'Yes', 'API key for your LLM provider'],
          ['LLM_BASE_URL', 'No', 'Custom base URL (for Azure, local Ollama, etc.)'],
          ['WORKSPACE_DIR', 'No', 'Default workspace directory for agents'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'pip',
        code: 'pip install openhands-sdk openhands-tools',
      },
      {
        language: 'bash',
        label: 'uv',
        code: 'uv add openhands-sdk openhands-tools',
      },
      {
        language: 'bash',
        label: '.env',
        code: `LLM_MODEL=gpt-4o
LLM_API_KEY=sk-...
# Optional: for remote sandbox
SANDBOX_API_KEY=...`,
      },
    ],
  },

  '/sdk/getting-started/hello-world': {
    title: 'Hello World',
    description: 'The simplest possible OpenHands agent — configure an LLM, create an agent, and complete a task.',
    route: '/sdk/getting-started/hello-world',
    sections: [
      {
        type: 'paragraph',
        content: 'This is the minimal working example. It creates an agent backed by GPT-4o, runs it in your current directory, and asks it to write a file.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What happens',
      },
      {
        type: 'steps',
        steps: [
          { title: 'LLM is configured', content: 'LLM() wraps any LiteLLM-supported model with your API key' },
          { title: 'Agent is created', content: 'Agent() gets the LLM and a tool set (terminal + file editor)' },
          { title: 'Conversation starts', content: 'Conversation() binds the agent to a workspace directory' },
          { title: 'Message is sent', content: 'send_message() queues the task for the agent' },
          { title: 'Agent runs', content: 'run() executes the agent loop until the task is complete' },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'hello_world.py',
        code: `import os
from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.terminal import TerminalTool

llm = LLM(
    model=os.getenv("LLM_MODEL", "gpt-4o"),
    api_key=os.getenv("LLM_API_KEY"),
)

agent = Agent(
    llm=llm,
    tools=[
        Tool(name=TerminalTool.name),
        Tool(name=FileEditorTool.name),
    ],
)

conversation = Conversation(agent=agent, workspace=os.getcwd())
conversation.send_message("Write 3 facts about Python into facts.txt")
conversation.run()
print("Done!")`,
      },
      {
        language: 'bash',
        label: 'Run',
        code: `export LLM_MODEL=gpt-4o
export LLM_API_KEY=sk-...
python hello_world.py`,
      },
    ],
  },

  '/sdk/getting-started/quickstart': {
    title: 'Your First Agent',
    description: 'Build a complete agent with custom tools, task tracking, and conversation inspection.',
    route: '/sdk/getting-started/quickstart',
    sections: [
      {
        type: 'paragraph',
        content: 'This quickstart walks through building a more complete agent that uses multiple tools, inspects the event stream, and handles the result.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Built-in Tools',
      },
      {
        type: 'table',
        headers: ['Tool', 'Import', 'What it does'],
        rows: [
          ['TerminalTool', 'openhands.tools.terminal', 'Run bash commands in the sandbox'],
          ['FileEditorTool', 'openhands.tools.file_editor', 'Read, write, and edit files'],
          ['TaskTrackerTool', 'openhands.tools.task_tracker', 'Track tasks as a checklist'],
          ['BrowserTool', 'openhands.tools.browser', 'Control a headless browser'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Inspecting Results',
      },
      {
        type: 'paragraph',
        content: 'After run() completes, you can inspect the conversation events to see every action and observation the agent performed.',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'first_agent.py',
        code: `import os
from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.terminal import TerminalTool
from openhands.tools.task_tracker import TaskTrackerTool

llm = LLM(model=os.getenv("LLM_MODEL", "gpt-4o"), api_key=os.getenv("LLM_API_KEY"))

agent = Agent(
    llm=llm,
    tools=[
        Tool(name=TerminalTool.name),
        Tool(name=FileEditorTool.name),
        Tool(name=TaskTrackerTool.name),
    ],
    system_prompt="You are a helpful coding assistant. Be concise and efficient.",
)

cwd = os.getcwd()
conversation = Conversation(agent=agent, workspace=cwd)

conversation.send_message(
    "1. Create a hello.py that prints Hello, OpenHands! "
    "2. Run it and show me the output."
)

conversation.run()

# Inspect what the agent did
for event in conversation.get_events():
    print(f"[{event.type}] {str(event)[:120]}")`,
      },
    ],
  },

  '/sdk/arch/agent': {
    title: 'Agent',
    description: 'The Agent class implements the core reasoning-action loop of the OpenHands SDK.',
    route: '/sdk/arch/agent',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Overview',
      },
      {
        type: 'paragraph',
        content: 'The Agent class is the central component of the SDK. It contains the reasoning-action loop: it receives events, calls the LLM to decide what to do, dispatches tool calls, and processes observations. Agents are stateless between conversations — all state lives in the Conversation object.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Constructor',
      },
      {
        type: 'table',
        headers: ['Parameter', 'Type', 'Required', 'Description'],
        rows: [
          ['llm', 'LLM', 'Yes', 'The language model powering this agent'],
          ['tools', 'list[Tool]', 'Yes', 'Tools the agent can invoke'],
          ['system_prompt', 'str', 'No', 'Override the default system prompt'],
          ['max_iterations', 'int', 'No', 'Maximum agent loop iterations (default: 100)'],
          ['condenser', 'Condenser', 'No', 'History condenser to manage context length'],
          ['security_analyzer', 'SecurityAnalyzer', 'No', 'Validates actions before execution'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key Methods',
      },
      {
        type: 'table',
        headers: ['Method', 'Description'],
        rows: [
          ['step(events)', 'Run one iteration of the agent loop'],
          ['get_settings()', 'Return serializable agent configuration'],
          ['from_settings(settings)', 'Reconstruct agent from saved configuration'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Usage',
        code: `from openhands.sdk import LLM, Agent, Tool
from openhands.tools.terminal import TerminalTool
from openhands.tools.file_editor import FileEditorTool

agent = Agent(
    llm=LLM(model="gpt-4o", api_key="sk-..."),
    tools=[
        Tool(name=TerminalTool.name),
        Tool(name=FileEditorTool.name),
    ],
    max_iterations=50,
    system_prompt="You are a Python expert. Write clean, tested code.",
)`,
      },
    ],
  },

  '/sdk/arch/llm': {
    title: 'LLM',
    description: 'Provider-agnostic language model interface powered by LiteLLM.',
    route: '/sdk/arch/llm',
    sections: [
      {
        type: 'paragraph',
        content: 'The LLM class wraps LiteLLM to provide a unified interface for all major model providers. You configure it once and the SDK handles token counting, retries, streaming, and error normalization.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Supported Providers',
      },
      {
        type: 'table',
        headers: ['Provider', 'Model prefix', 'Example model'],
        rows: [
          ['OpenAI', '(none)', 'gpt-4o, gpt-4o-mini, o1'],
          ['Anthropic', 'anthropic/', 'anthropic/claude-sonnet-4-5'],
          ['Google', 'gemini/', 'gemini/gemini-2.0-flash'],
          ['Azure OpenAI', 'azure/', 'azure/gpt-4o'],
          ['Ollama (local)', 'ollama/', 'ollama/llama3'],
          ['AWS Bedrock', 'bedrock/', 'bedrock/anthropic.claude-3-5'],
          ['Any OpenAI-compat', 'openai/', 'openai/my-model'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Constructor Parameters',
      },
      {
        type: 'table',
        headers: ['Parameter', 'Type', 'Description'],
        rows: [
          ['model', 'str', 'LiteLLM model string'],
          ['api_key', 'str', 'API key for the provider'],
          ['base_url', 'str | None', 'Custom base URL (Azure, Ollama, etc.)'],
          ['temperature', 'float', 'Sampling temperature (default: 0.0)'],
          ['max_tokens', 'int | None', 'Max output tokens'],
          ['timeout', 'float', 'Request timeout in seconds'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Multiple providers',
        code: `from openhands.sdk import LLM

# OpenAI
llm_openai = LLM(model="gpt-4o", api_key="sk-...")

# Anthropic
llm_claude = LLM(model="anthropic/claude-sonnet-4-5", api_key="sk-ant-...")

# Local Ollama
llm_local = LLM(model="ollama/llama3", base_url="http://localhost:11434")

# Azure
llm_azure = LLM(
    model="azure/gpt-4o",
    api_key="...",
    base_url="https://my-resource.openai.azure.com",
)`,
      },
    ],
  },

  '/sdk/arch/conversation': {
    title: 'Conversation',
    description: 'Orchestrates agent sessions — manages state, event stream, and workspace lifecycle.',
    route: '/sdk/arch/conversation',
    sections: [
      {
        type: 'paragraph',
        content: 'A Conversation binds an Agent to a Workspace and manages the full lifecycle of an agent session. It holds the event stream, exposes send_message() and run(), and supports pause/resume, async execution, and persistence.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Constructor Parameters',
      },
      {
        type: 'table',
        headers: ['Parameter', 'Type', 'Description'],
        rows: [
          ['agent', 'Agent', 'The agent to run'],
          ['workspace', 'str | Workspace', 'Working directory or Workspace object'],
          ['sid', 'str | None', 'Session ID for persistence/resume'],
          ['on_event', 'Callable | None', 'Callback for each new event'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key Methods',
      },
      {
        type: 'table',
        headers: ['Method', 'Description'],
        rows: [
          ['send_message(text)', 'Queue a user message for the agent'],
          ['run()', 'Execute the agent loop synchronously until done'],
          ['run_async()', 'Execute asynchronously (returns coroutine)'],
          ['pause()', 'Pause the running agent'],
          ['resume()', 'Resume a paused agent'],
          ['get_events()', 'Return all events in the conversation'],
          ['save()', 'Persist conversation state to disk'],
          ['load(sid)', 'Restore conversation from saved state'],
          ['fork()', 'Create an independent copy of this conversation'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Basic usage',
        code: `from openhands.sdk import Conversation

conv = Conversation(agent=agent, workspace="/tmp/my-project")
conv.send_message("Refactor the main.py file for readability")
conv.run()

# All events
for event in conv.get_events():
    print(event)`,
      },
      {
        language: 'python',
        label: 'Async usage',
        code: `import asyncio

async def main():
    conv = Conversation(agent=agent, workspace="/tmp/project")
    conv.send_message("Write unit tests for utils.py")
    await conv.run_async()

asyncio.run(main())`,
      },
    ],
  },

  '/sdk/arch/tool-system': {
    title: 'Tool / ToolDefinition',
    description: 'Tools define what agents can do. Built-in and custom tool framework.',
    route: '/sdk/arch/tool-system',
    sections: [
      {
        type: 'paragraph',
        content: 'Tools are the actions an agent can take. The SDK ships with production-ready built-in tools and a clean interface for building custom tools. Each tool call produces an observation that goes back into the agent event stream.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Built-in Tools',
      },
      {
        type: 'table',
        headers: ['Tool', 'Import path', 'Capability'],
        rows: [
          ['TerminalTool', 'openhands.tools.terminal', 'Execute bash commands'],
          ['FileEditorTool', 'openhands.tools.file_editor', 'Read, write, patch files'],
          ['ApplyPatchTool', 'openhands.tools.apply_patch', 'Apply unified diffs (GPT-5 optimized)'],
          ['BrowserTool', 'openhands.tools.browser', 'Headless browser control'],
          ['TaskTrackerTool', 'openhands.tools.task_tracker', 'Checklist-style task tracking'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Creating a Custom Tool',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Custom tool',
        code: `from openhands.sdk import Tool, ToolDefinition

class WeatherTool:
    name = "get_weather"

    definition = ToolDefinition(
        name="get_weather",
        description="Get current weather for a city",
        parameters={
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"},
            },
            "required": ["city"],
        },
    )

    def __call__(self, city: str) -> str:
        # Your implementation here
        return f"It is sunny in {city}, 22°C"

# Register with agent
agent = Agent(
    llm=llm,
    tools=[
        Tool(name=TerminalTool.name),
        Tool(definition=WeatherTool.definition, handler=WeatherTool()),
    ],
)`,
      },
    ],
  },

  '/sdk/arch/workspace': {
    title: 'Workspace',
    description: 'Execution environment abstraction — local, Docker, Apptainer, or Cloud.',
    route: '/sdk/arch/workspace',
    sections: [
      {
        type: 'paragraph',
        content: 'The Workspace abstracts where agent code runs. Agents write files, run commands, and browse the web inside the workspace. By swapping the workspace backend you can go from local development to Docker-isolated production without changing agent code.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Workspace Backends',
      },
      {
        type: 'table',
        headers: ['Backend', 'Use Case', 'How'],
        rows: [
          ['Local (default)', 'Development, trusted environments', 'Pass a directory path to Conversation()'],
          ['Docker', 'Isolated production sandbox', 'Use RemoteConversation with DockerSandbox'],
          ['Apptainer', 'HPC/shared computing environments', 'Use RemoteConversation with ApptainerSandbox'],
          ['API Sandbox', 'Hosted managed sandbox', 'Use RemoteConversation with ApiSandbox'],
          ['OpenHands Cloud', 'Fully managed Cloud workspace', 'Use RemoteConversation with CloudWorkspace'],
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content: '⚠️ The local workspace runs commands directly on your machine. Use a sandboxed backend for untrusted code.',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Local workspace',
        code: `# Simplest — just pass a path
conv = Conversation(agent=agent, workspace="/tmp/my-project")`,
      },
      {
        language: 'python',
        label: 'Docker sandbox',
        code: `from openhands.sdk.remote import RemoteConversation, DockerSandbox

sandbox = DockerSandbox(image="ubuntu:24.04")
conv = RemoteConversation(agent=agent, sandbox=sandbox)
conv.send_message("Install numpy and create a data analysis script")
conv.run()`,
      },
    ],
  },

  '/sdk/guides/custom-tools': {
    title: 'Custom Tools',
    description: 'Tools define what agents can do. Learn how to build custom tools for specialized needs.',
    route: '/sdk/guides/custom-tools',
    sections: [
      {
        type: 'paragraph',
        content: 'The SDK lets you define custom tools that give agents new capabilities. A tool is a callable with a JSON Schema definition that the LLM uses to decide when and how to invoke it.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Tool Anatomy',
      },
      {
        type: 'list',
        items: [
          'name — unique identifier for the tool',
          'description — tells the LLM when to use this tool',
          'parameters — JSON Schema defining expected inputs',
          'handler — Python callable that executes the tool logic',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Best Practices',
      },
      {
        type: 'list',
        items: [
          'Write clear, specific descriptions — the LLM reads these to decide when to call your tool',
          'Mark all required parameters in the JSON Schema',
          'Return structured strings the agent can parse and act on',
          'Keep tools focused — one capability per tool',
          'Handle errors gracefully and return helpful error messages',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'custom_tool.py',
        code: `import httpx
from openhands.sdk import LLM, Agent, Conversation, Tool, ToolDefinition
from openhands.tools.terminal import TerminalTool

# 1. Define the tool
class GitHubIssueTool:
    name = "get_github_issue"

    definition = ToolDefinition(
        name="get_github_issue",
        description="Fetch details of a GitHub issue by number",
        parameters={
            "type": "object",
            "properties": {
                "owner": {"type": "string", "description": "Repository owner"},
                "repo":  {"type": "string", "description": "Repository name"},
                "issue": {"type": "integer", "description": "Issue number"},
            },
            "required": ["owner", "repo", "issue"],
        },
    )

    def __call__(self, owner: str, repo: str, issue: int) -> str:
        resp = httpx.get(f"https://api.github.com/repos/{owner}/{repo}/issues/{issue}")
        data = resp.json()
        return f"#{data['number']}: {data['title']}\\n{data['body']}"

# 2. Register with agent
tool = GitHubIssueTool()
agent = Agent(
    llm=LLM(model="gpt-4o", api_key="sk-..."),
    tools=[
        Tool(name=TerminalTool.name),
        Tool(definition=tool.definition, handler=tool),
    ],
)

# 3. Use it
conv = Conversation(agent=agent, workspace="/tmp")
conv.send_message("Look at issue #42 in OpenHands/OpenHands and summarize it")
conv.run()`,
      },
    ],
  },

  '/sdk/guides/agent-delegation': {
    title: 'Sub-Agent Delegation',
    description: 'Enable parallel task execution by delegating work to multiple sub-agents.',
    route: '/sdk/guides/agent-delegation',
    sections: [
      {
        type: 'paragraph',
        content: 'Agent delegation lets a parent agent spin up independent sub-agents to run tasks in parallel. Each sub-agent gets its own LLM, tool set, and workspace. The parent collects results from all sub-agents when they complete.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'When to use delegation',
      },
      {
        type: 'list',
        items: [
          'Tasks that can be split into independent subtasks',
          'Running tests and writing code simultaneously',
          'Multi-file refactoring across separate modules',
          'Processing large datasets in parallel batches',
          'Research tasks requiring multiple concurrent searches',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Sub-agents run in isolated workspaces. Use shared filesystem mounts or explicit file passing to share results.',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'delegation.py',
        code: `from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.sdk.delegation import delegate_tasks
from openhands.tools.terminal import TerminalTool
from openhands.tools.file_editor import FileEditorTool

llm = LLM(model="gpt-4o", api_key="sk-...")

def make_agent():
    return Agent(
        llm=llm,
        tools=[Tool(name=TerminalTool.name), Tool(name=FileEditorTool.name)],
    )

# Define parallel subtasks
tasks = [
    {"agent": make_agent(), "message": "Write unit tests for auth.py", "workspace": "/tmp/proj"},
    {"agent": make_agent(), "message": "Write unit tests for db.py",   "workspace": "/tmp/proj"},
    {"agent": make_agent(), "message": "Write unit tests for api.py",  "workspace": "/tmp/proj"},
]

# Run all sub-agents in parallel and collect results
results = delegate_tasks(tasks)
for r in results:
    print(r.summary)`,
      },
    ],
  },

  '/sdk/guides/convo-persistence': {
    title: 'Persistence',
    description: 'Save and restore conversation state for multi-session workflows.',
    route: '/sdk/guides/convo-persistence',
    sections: [
      {
        type: 'paragraph',
        content: 'Conversations can be saved to disk and restored in a later session. This enables long-running multi-day workflows, resuming after crashes, and sharing agent state across processes.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What is persisted',
      },
      {
        type: 'list',
        items: [
          'Full event stream (all actions and observations)',
          'Agent configuration (LLM, tools, system prompt)',
          'Workspace metadata',
          'Session ID for lookup',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Save & restore',
        code: `from openhands.sdk import Conversation

# Session 1 — start and save
conv = Conversation(agent=agent, workspace="/tmp/project", sid="my-session-1")
conv.send_message("Start refactoring the authentication module")
conv.run()
conv.save()
print(f"Saved session: {conv.sid}")

# Session 2 — restore and continue
conv2 = Conversation.load(sid="my-session-1", agent=agent)
conv2.send_message("Now add comprehensive error handling to the auth module")
conv2.run()`,
      },
    ],
  },

  '/sdk/guides/mcp': {
    title: 'Model Context Protocol (MCP)',
    description: 'Integrate external MCP servers to dynamically extend agent tool sets.',
    route: '/sdk/guides/mcp',
    sections: [
      {
        type: 'paragraph',
        content: 'Model Context Protocol (MCP) enables agents to discover and use tools provided by external servers — databases, APIs, file systems, and more — without hardcoding them into the agent.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'How it works',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Connect to MCP server', content: 'Provide the server URL or command in MCPConfig' },
          { title: 'Tools are discovered', content: 'The SDK fetches available tools from the server at startup' },
          { title: 'Agent uses MCP tools', content: 'MCP tools appear alongside built-in tools in the agent\'s tool set' },
          { title: 'Calls are proxied', content: 'Tool invocations are forwarded to the MCP server and results returned' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Popular MCP Servers',
      },
      {
        type: 'table',
        headers: ['Server', 'Capability'],
        rows: [
          ['filesystem', 'Read/write local files via MCP protocol'],
          ['github', 'GitHub issues, PRs, and repo operations'],
          ['postgres', 'Query PostgreSQL databases'],
          ['slack', 'Read and send Slack messages'],
          ['puppeteer', 'Browser automation'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'mcp_integration.py',
        code: `from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.sdk.mcp import MCPConfig
from openhands.tools.terminal import TerminalTool

llm = LLM(model="gpt-4o", api_key="sk-...")

# Connect to a GitHub MCP server
mcp_config = MCPConfig(
    servers=[
        {"name": "github", "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"]},
    ]
)

agent = Agent(
    llm=llm,
    tools=[Tool(name=TerminalTool.name)],
    mcp_config=mcp_config,
)

conv = Conversation(agent=agent, workspace="/tmp")
conv.send_message("List all open PRs in OpenHands/OpenHands and summarize the top 3")
conv.run()`,
      },
    ],
  },

  '/sdk/guides/observability': {
    title: 'Observability & Tracing',
    description: 'Enable OpenTelemetry tracing to monitor and debug agent execution.',
    route: '/sdk/guides/observability',
    sections: [
      {
        type: 'paragraph',
        content: 'The SDK emits OpenTelemetry traces for every agent loop iteration, LLM call, and tool execution. Connect any OTLP-compatible backend to get full visibility into your agents in production.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Supported Backends',
      },
      {
        type: 'table',
        headers: ['Backend', 'Type'],
        rows: [
          ['Laminar', 'AI-native observability platform'],
          ['MLflow', 'ML experiment tracking'],
          ['Honeycomb', 'Distributed tracing'],
          ['Jaeger', 'Open source tracing'],
          ['Any OTLP endpoint', 'Standard OpenTelemetry protocol'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What is traced',
      },
      {
        type: 'list',
        items: [
          'Each agent loop iteration (spans)',
          'LLM calls — model, tokens, latency, cost',
          'Tool invocations — name, inputs, outputs, duration',
          'Errors and retries',
          'Custom hooks and events',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'observability.py',
        code: `import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.terminal import TerminalTool

# Configure OpenTelemetry
provider = TracerProvider()
exporter = OTLPSpanExporter(endpoint=os.getenv("OTLP_ENDPOINT", "http://localhost:4318/v1/traces"))
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)

# Agent runs normally — tracing is automatic
llm = LLM(model="gpt-4o", api_key=os.getenv("LLM_API_KEY"))
agent = Agent(llm=llm, tools=[Tool(name=TerminalTool.name)])
conv = Conversation(agent=agent, workspace="/tmp")
conv.send_message("Run the test suite and report any failures")
conv.run()`,
      },
    ],
  },

  '/sdk/api': {
    title: 'API Reference Overview',
    description: 'Complete API reference for all openhands.sdk modules.',
    route: '/sdk/api',
    sections: [
      {
        type: 'paragraph',
        content: 'The SDK API reference covers all public classes, methods, and types. The primary entry point is the openhands.sdk module which exports all core classes.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Modules',
      },
      {
        type: 'table',
        headers: ['Module', 'Key Exports'],
        rows: [
          ['openhands.sdk.agent', 'Agent, AgentSettings'],
          ['openhands.sdk.conversation', 'Conversation, RemoteConversation'],
          ['openhands.sdk.llm', 'LLM, LLMConfig, LLMRegistry'],
          ['openhands.sdk.tool', 'Tool, ToolDefinition, ToolCall, ToolResult'],
          ['openhands.sdk.event', 'Event, ActionEvent, ObservationEvent, MessageEvent'],
          ['openhands.sdk.workspace', 'Workspace, LocalWorkspace, RemoteWorkspace'],
          ['openhands.sdk.security', 'SecurityAnalyzer, ConfirmationPolicy'],
          ['openhands.sdk.utils', 'Utility helpers for events, tokens, formatting'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '📖 Full auto-generated API docs are available at docs.openhands.dev/sdk',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'All main imports',
        code: `# Core SDK classes
from openhands.sdk import (
    LLM,
    Agent,
    Conversation,
    Tool,
    ToolDefinition,
)

# Built-in tools
from openhands.tools.terminal import TerminalTool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.task_tracker import TaskTrackerTool
from openhands.tools.browser import BrowserTool

# Advanced
from openhands.sdk.security import SecurityAnalyzer, ConfirmationPolicy
from openhands.sdk.llm import LLMRegistry, LLMProfileStore`,
      },
    ],
  },

  '/sdk/examples/standalone': {
    title: 'Standalone SDK Examples',
    description: 'Complete runnable examples for the OpenHands SDK standalone mode.',
    route: '/sdk/examples/standalone',
    sections: [
      {
        type: 'paragraph',
        content: 'These examples demonstrate the full breadth of SDK capabilities, from basic hello world to advanced multi-agent delegation and observability. All examples run locally with a standard pip install.',
      },
      {
        type: 'callout',
        variant: 'info',
        content: '📦 Source code: github.com/OpenHands/software-agent-sdk/tree/main/examples/01_standalone_sdk',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Prerequisites',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Setup',
        code: `git clone https://github.com/OpenHands/software-agent-sdk.git
cd software-agent-sdk
pip install openhands-sdk openhands-tools

export LLM_MODEL=gpt-4o
export LLM_API_KEY=sk-...`,
      },
      {
        language: 'bash',
        label: 'Run an example',
        code: `cd examples/01_standalone_sdk
python 01_hello_world.py`,
      },
    ],
  },

  // ── All Repos Pages ───────────────────────────────────────────────────────

  '/all-repos': {
    title: 'Ecosystem Map',
    description: 'Every repository in the OpenHands platform — what each does, who owns it, and how they fit together.',
    route: '/all-repos',
    sections: [
      {
        type: 'paragraph',
        content: 'OpenHands is a platform made up of multiple focused repositories. Each repo has a clear responsibility. Together they form a complete stack — from the agent reasoning loop to the UI, automations, and internal decision records.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Repos at a Glance',
      },
      {
        type: 'table',
        headers: ['Repo', 'Language', 'Status', 'Purpose'],
        rows: [
          ['OpenHands/OpenHands', 'Python + TypeScript', 'OSS ✅', 'Main open-source app — agent loop, sandbox runtime, OSS frontend'],
          ['OpenHands/software-agent-sdk', 'Python', 'OSS ✅', 'SDK + Agent Server — the programmable agent API'],
          ['OpenHands/agent-canvas', 'TypeScript / React', 'Beta 🧪', 'Self-hostable UI frontend for Agent Server'],
          ['OpenHands/automation', 'Python / FastAPI', 'Internal 🔒', 'Scheduled and event-driven agent automation service'],
          ['OpenHands/architecture', 'Markdown', 'Internal 🔒', 'ADRs, Product Design docs, Research projects'],
          ['OpenHands/extensions', 'Markdown', 'OSS ✅', 'Public skills and plugins marketplace'],
          ['OpenHands Cloud', 'Private SaaS', 'Cloud ☁️', 'Hosted multi-tenant platform — sandboxes, billing, org management'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Dependency Hierarchy',
      },
      {
        type: 'diagram',
        caption: 'Diagram 13 — Repos organised by dependency layer',
        content: `flowchart TB
  subgraph L0["Layer 0 — Knowledge"]
    ARCH["Architecture Repo\\n(ADRs + PDs)"]
    EXT["Extensions\\n(Skills + Plugins)"]
  end
  subgraph L1["Layer 1 — Foundation"]
    SDK["software-agent-sdk\\n+ Agent Server"]
  end
  subgraph L2["Layer 2 — Application Tier"]
    OH["OpenHands (app)"]
    AC["Agent Canvas"]
    AUTO["Automation Service"]
  end
  subgraph L3["Layer 3 — Platform"]
    CLOUD["OpenHands Cloud"]
  end

  SDK --> OH
  SDK --> AC
  SDK --> AUTO
  OH --> CLOUD
  AC -. optional .-> CLOUD
  AUTO --> CLOUD
  ARCH -. informs .-> OH
  ARCH -. informs .-> SDK
  ARCH -. informs .-> AUTO
  EXT -. skills .-> AC
  EXT -. skills .-> SDK`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'Repo Positioning',
      },
      {
        type: 'diagram',
        caption: 'Diagram 12 — Repos by visibility (OSS vs internal) and layer (infra vs app)',
        content: `quadrantChart
  title Repos by Visibility and Layer
  x-axis Internal --> Open Source
  y-axis Infrastructure --> Application
  quadrant-1 OSS Application
  quadrant-2 Internal Application
  quadrant-3 Internal Infrastructure
  quadrant-4 OSS Infrastructure
  OpenHands App: [0.85, 0.85]
  Agent Canvas: [0.75, 0.90]
  Extensions: [0.90, 0.50]
  software-agent-sdk: [0.80, 0.25]
  Automation Service: [0.25, 0.65]
  Architecture Repo: [0.20, 0.30]
  OpenHands Cloud: [0.10, 0.80]`,
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'SDK (any use case)',
        code: 'pip install openhands-sdk openhands-tools',
      },
      {
        language: 'bash',
        label: 'Agent Canvas (UI)',
        code: 'npx @openhands/agent-canvas',
      },
    ],
  },

  '/all-repos/overview/openhands': {
    title: 'OpenHands (the App)',
    description: 'The main open-source repository — autonomous coding agent with sandbox runtime and OSS web UI.',
    route: '/all-repos/overview/openhands',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/All-Hands-AI/OpenHands'],
          ['Status', 'Open Source ✅'],
          ['Primary language', 'Python (backend) + TypeScript/React (frontend)'],
          ['Package', 'pip install openhands'],
          ['Benchmark', '77.6% on SWE-bench'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'The OpenHands app is the main open-source product. It runs an LLM-backed agent inside an isolated Docker sandbox, exposes a REST + WebSocket API, and ships its own React frontend. It is the reference implementation of everything the SDK enables.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key components',
      },
      {
        type: 'table',
        headers: ['Component', 'Location', 'Description'],
        rows: [
          ['Agent loop', 'openhands/core/', 'Reasoning-action loop using openhands-sdk internals'],
          ['Runtime sandbox', 'openhands/runtime/', 'Docker / Kubernetes container management'],
          ['App server', 'openhands/server/', 'FastAPI REST + WebSocket API'],
          ['OSS frontend', 'frontend/', 'React + TypeScript UI (different from Agent Canvas)'],
          ['Event system', 'openhands/events/', 'Typed action/observation bus'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Relationship to other repos',
      },
      {
        type: 'list',
        items: [
          'Uses **software-agent-sdk** for the agent, LLM, tool, and condenser abstractions',
          'The OSS frontend is separate from **Agent Canvas** (which targets the Agent Server API, not the OpenHands app API)',
          '**OpenHands Cloud** runs OpenHands at scale with multi-tenancy, billing, and org management on top',
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Docker Quickstart',
        code: `docker pull ghcr.io/all-handsmachinelearning/openhands:latest
docker run -it --rm \\
  -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest \\
  -e LOG_ALL_EVENTS=true \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -p 3000:3000 \\
  ghcr.io/all-handsmachinelearning/openhands:latest`,
      },
    ],
  },

  '/all-repos/overview/sdk': {
    title: 'software-agent-sdk',
    description: 'The programmable Python SDK and Agent Server — the foundation every other service builds on.',
    route: '/all-repos/overview/sdk',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/software-agent-sdk'],
          ['Status', 'Open Source ✅'],
          ['Primary language', 'Python'],
          ['Package', 'pip install openhands-sdk openhands-tools'],
          ['Docs', 'docs.openhands.dev/sdk'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'The SDK is a clean, modular Python library for building AI agents that autonomously write, edit, and execute code. It ships two things: the importable openhands-sdk package and the openhands-agent-server — a FastAPI REST/WebSocket API that wraps the SDK for multi-client use.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Core classes',
      },
      {
        type: 'table',
        headers: ['Class', 'Purpose'],
        rows: [
          ['Agent', 'Reasoning-action loop'],
          ['Conversation', 'Orchestrates a session — sends messages, runs the loop'],
          ['LLM', 'Provider-agnostic language model interface (LiteLLM)'],
          ['Tool / ToolDefinition', 'Action-observation tool framework'],
          ['Workspace', 'Execution environment abstraction (local, Docker, Apptainer, Cloud)'],
          ['Condenser', 'Conversation history compression system'],
          ['SecurityAnalyzer', 'Action security analysis and validation'],
          ['Skill', 'Reusable prompt system'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Also ships: Agent Server',
      },
      {
        type: 'paragraph',
        content: 'The openhands-agent-server (in openhands-agent-server/ subdirectory) is a production REST/WebSocket server. Agent Canvas and the Automation Service communicate exclusively through the Agent Server — they never import the SDK directly.',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        label: 'Hello World',
        code: `from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.terminal import TerminalTool

llm = LLM(model="gpt-4o", api_key="...")
agent = Agent(llm=llm, tools=[Tool(name=TerminalTool.name)])
conversation = Conversation(agent=agent, workspace=".")
conversation.send_message("List the files in this directory.")
conversation.run()`,
      },
    ],
  },

  '/all-repos/overview/agent-canvas': {
    title: 'Agent Canvas',
    description: 'Self-hostable React/TypeScript frontend for the OpenHands Agent Server.',
    route: '/all-repos/overview/agent-canvas',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/agent-canvas'],
          ['Status', 'Beta 🧪 (Incubator)'],
          ['Primary language', 'TypeScript / React'],
          ['npm package', '@openhands/agent-canvas'],
          ['Homepage', 'agent-server-gui.vercel.app'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'Agent Canvas is the visual interface for running, monitoring, and automating OpenHands agents. It connects to one or more Agent Servers (from the SDK repo), lets you switch between them, and provides a full UI for conversations, automations, settings, file browser, terminal, and browser sessions.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key distinction from the OSS frontend',
      },
      {
        type: 'table',
        headers: ['', 'Agent Canvas', 'OpenHands OSS frontend'],
        rows: [
          ['Targets', 'Agent Server REST API', 'OpenHands app API'],
          ['Repo', 'OpenHands/agent-canvas', 'All-Hands-AI/OpenHands (frontend/)'],
          ['Ships as', 'npm package + Docker image', 'Bundled with OpenHands app'],
          ['Multi-backend', 'Yes — connect to multiple Agent Servers', 'No'],
          ['Automations UI', 'Yes', 'No'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Run',
        code: `# No Docker (direct host access)
npx @openhands/agent-canvas

# With Docker sandbox (safer)
docker run -it --rm -p 8000:8000 \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -v ~/projects:/projects \\
  ghcr.io/openhands/agent-canvas:latest`,
      },
    ],
  },

  '/all-repos/overview/automation': {
    title: 'Automation Service',
    description: 'Scheduled and event-driven agent runs — the backend that fires agents without manual prompting.',
    route: '/all-repos/overview/automation',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/automation'],
          ['Status', 'Internal 🔒'],
          ['Primary language', 'Python / FastAPI'],
          ['ADR', 'ADR-0002 in architecture repo'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'The Automation Service is a FastAPI backend that runs agents automatically — on a cron schedule or in response to external events (Slack messages, GitHub webhooks, Datadog alerts). It dispatches runs to the Agent Server via OpenHands Cloud sandboxes.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key components',
      },
      {
        type: 'table',
        headers: ['Component', 'Description'],
        rows: [
          ['Scheduler', 'Polls DB every 60s for due cron automations (FOR UPDATE SKIP LOCKED)'],
          ['Dispatcher', 'Picks up PENDING runs, creates sandboxes, fires entrypoints'],
          ['Watchdog', 'Detects and resolves stuck runs via sandbox exit code query'],
          ['Preset generator', 'Generates SDK boilerplate tarballs for prompt + plugin presets'],
          ['Event ingestion', 'Single endpoint POST /api/automation/v1/events/{org_id}/{integration_id}'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Trigger types',
      },
      {
        type: 'list',
        items: [
          '**Cron** — standard cron schedule (e.g. 0 9 * * 1 = every Monday at 9am)',
          '**Slack** — message in a configured channel',
          '**GitHub** — PR opened, issue created, push (via SaaS proxy)',
          '**Datadog** — alert fired',
          '**Generic webhook** — any HMAC-signed HTTP POST',
        ],
      },
    ],
  },

  '/all-repos/overview/architecture': {
    title: 'Architecture Repo',
    description: 'Internal decision records, product design specs, and research projects.',
    route: '/all-repos/overview/architecture',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/architecture (private)'],
          ['Status', 'Internal 🔒'],
          ['Primary language', 'Markdown'],
          ['Tooling', 'madr-tools (bun x madr)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'The architecture repo captures technical design decisions using three document types: ADRs for accepted/rejected decisions, Product Design (PD-XXX) for implementation-ready designs, and Research (PR-XXX) for open-ended exploration.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Current ADRs',
      },
      {
        type: 'table',
        headers: ['ADR', 'Title', 'Status'],
        rows: [
          ['ADR-0000', 'Developer Workstation Setup', 'Accepted'],
          ['ADR-0001', 'Runtime API Next Steps', 'Accepted'],
          ['ADR-0002', 'Automations Service Architecture', 'Accepted'],
        ],
      },
    ],
  },

  '/all-repos/overview/cloud': {
    title: 'OpenHands Cloud (SaaS)',
    description: 'The hosted multi-tenant platform that runs OpenHands at scale.',
    route: '/all-repos/overview/cloud',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['URL', 'app.all-hands.dev'],
          ['Status', 'Hosted SaaS ☁️'],
          ['Source', 'Private'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'OpenHands Cloud is the commercial hosted offering. It adds multi-tenancy, organization management, billing, per-user API key management, and managed sandbox infrastructure on top of the open-source core. Both Agent Canvas and the Automation Service integrate with Cloud APIs for sandbox creation and credential management.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Cloud APIs used by other repos',
      },
      {
        type: 'table',
        headers: ['Caller', 'Cloud API used'],
        rows: [
          ['Automation Service', 'POST /api/v1/sandboxes — creates sandbox per run'],
          ['Automation Service', 'POST /api/service/users/{id}/orgs/{id}/api-keys — per-user key on demand'],
          ['Automation Service', 'GET /api/keys/current — validates incoming API key (20s TTL cache)'],
          ['Agent Canvas', 'Cloud workspace APIs for hosted sandbox sessions'],
        ],
      },
    ],
  },

  '/all-repos/overview/extensions': {
    title: 'Extensions / Skills Marketplace',
    description: 'Public skills and plugins that any agent, canvas, or SDK user can install.',
    route: '/all-repos/overview/extensions',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/extensions'],
          ['Status', 'Open Source ✅'],
          ['Primary language', 'Markdown (SKILL.md files)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What it does',
      },
      {
        type: 'paragraph',
        content: 'The extensions repo is a public marketplace of skills and plugins. A skill is a Markdown file that adds domain knowledge, triggers, and behaviors to an agent\'s system prompt. Agent Canvas loads public skills from this repo at startup (controlled by VITE_LOAD_PUBLIC_SKILLS).',
      },
      {
        type: 'heading',
        level: 2,
        content: 'How skills are consumed',
      },
      {
        type: 'table',
        headers: ['Consumer', 'How'],
        rows: [
          ['Agent Canvas', 'Loaded at conversation start from ~/.agents/skills/ and public extensions repo'],
          ['Agent Server', 'Reads skills from workspace .agents/skills/ directory'],
          ['OpenHands (app)', 'Reads skills from ~/.openhands/skills/ and project .agents/skills/'],
          ['Automation Service', 'Entry point scripts can load skills via SDK Plugin API'],
        ],
      },
    ],
  },

  // How They Connect pages

  '/all-repos/connections': {
    title: 'Dependency Graph',
    description: 'Which repos depend on which — the full dependency and communication map.',
    route: '/all-repos/connections',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 1 — All repos and their connections (solid = depends on, dashed = informs)',
        content: `flowchart LR
  OH["OpenHands App\\nPython + React"]
  SDK["software-agent-sdk\\n+ Agent Server"]
  AC["Agent Canvas\\nTypeScript / React"]
  EXT["Extensions\\nMarkdown skills"]
  AUTO["Automation Service\\nPython / FastAPI"]
  ARCH["Architecture Repo\\nADRs + PDs"]
  CAPI["OpenHands Cloud\\nAPIs"]
  LLM["LLM Providers\\nOpenAI / Anthropic / Gemini"]
  GH["GitHub / Slack\\n/ Datadog"]

  OH -->|pip install| SDK
  AC -->|HTTP REST + WS| SDK
  AUTO -->|HTTP REST| SDK
  AUTO -->|sandbox + keys| CAPI
  AC -.->|cloud workspace| CAPI
  SDK -->|LiteLLM| LLM
  GH -->|webhooks| AUTO
  EXT -.->|SKILL.md| SDK
  EXT -.->|SKILL.md| AC
  ARCH -.->|informs| OH
  ARCH -.->|informs| SDK`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'Dependency Direction',
      },
      {
        type: 'table',
        headers: ['Repo', 'Depends on', 'Via'],
        rows: [
          ['OpenHands (app)', 'software-agent-sdk', 'pip install openhands-sdk'],
          ['Agent Canvas', 'Agent Server (SDK repo)', 'HTTP REST + WebSocket'],
          ['Automation Service', 'Agent Server (SDK repo)', 'HTTP REST'],
          ['Automation Service', 'OpenHands Cloud', 'HTTP REST (sandbox + key APIs)'],
          ['Agent Canvas', 'OpenHands Cloud', 'HTTP REST (optional — cloud workspace)'],
          ['Extensions skills', 'Agent Server / OpenHands', 'File system (SKILL.md loaded at runtime)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What does NOT depend on what',
      },
      {
        type: 'list',
        items: [
          '**Agent Canvas** does not import openhands-sdk directly — all agent logic is in the Agent Server',
          '**Automation Service** does not import openhands-sdk directly — it creates sandboxes and starts Agent Server entrypoints',
          '**Architecture repo** has no runtime dependencies — it is documentation only',
          '**OpenHands Cloud** is not open source — other repos call its REST API but do not import it',
        ],
      },
    ],
  },

  '/all-repos/connections/data-flow': {
    title: 'End-to-End Data Flow',
    description: 'How a user request flows from UI through Agent Server to sandbox execution and back.',
    route: '/all-repos/connections/data-flow',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Manual Conversation Flow',
      },
      {
        type: 'diagram',
        caption: 'Diagram 2 — Manual conversation: Agent Canvas → Agent Server → SDK Agent → Sandbox',
        content: `sequenceDiagram
  actor U as User
  participant AC as Agent Canvas
  participant AS as Agent Server
  participant A as SDK Agent
  participant SB as Sandbox

  U->>AC: types message
  AC->>AS: POST /api/conversations
  AS-->>AC: conversation_id
  AC->>AS: WebSocket /ws/conversations/{id}
  AS->>A: MessageAction(content)
  A->>A: LLM call — plan actions
  loop agent loop
    A->>SB: CmdRunAction / FileWriteAction / BrowseAction
    SB-->>A: CmdOutputObservation / FileReadObservation
    AS-->>AC: stream ObservationEvent (WebSocket)
  end
  A->>AS: AgentFinishAction
  AS-->>AC: stream FinishEvent
  AC-->>U: renders result`,
      },
      {
        type: 'steps',
        steps: [
          { title: 'User types a message', content: 'In Agent Canvas (browser) or directly via SDK/API' },
          { title: 'Agent Canvas → Agent Server', content: 'POST /api/conversations — creates a new conversation. WebSocket connection opened for live event streaming.' },
          { title: 'Agent Server → SDK Agent', content: 'Agent receives the message as a MessageAction event. LLM is called with the full conversation history.' },
          { title: 'Agent → Tool calls', content: 'Agent emits typed action events: CmdRunAction, FileWriteAction, BrowseInteractiveAction, etc.' },
          { title: 'Agent Server → Sandbox', content: 'Actions dispatched to the isolated sandbox (Docker, Apptainer, or Cloud). Observations returned.' },
          { title: 'Sandbox → Agent Server → Canvas', content: 'Observation events streamed back over WebSocket. UI updates in real time.' },
          { title: 'Loop continues', content: 'Agent processes observations, decides next actions. Continues until task is complete or max iterations.' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Automated Run Flow (Automation Service)',
      },
      {
        type: 'diagram',
        caption: 'Diagram 3 — Automated run: Scheduler → Dispatcher → Cloud → Agent Server → SDK → Callback',
        content: `sequenceDiagram
  participant SCH as Scheduler
  participant DB as PostgreSQL
  participant DISP as Dispatcher
  participant CLOUD as OpenHands Cloud
  participant AS as Agent Server
  participant SDK as SDK in sandbox
  participant AUTO as Automation Service

  SCH->>DB: poll cron automations
  DB-->>SCH: due automations
  SCH->>DB: INSERT automation_runs PENDING
  DISP->>DB: poll PENDING runs
  DISP->>DB: UPDATE status=RUNNING timeout_at=now+max
  DISP->>CLOUD: POST /api/service/users/{id}/orgs/{id}/api-keys
  CLOUD-->>DISP: api_key
  DISP->>CLOUD: POST /api/v1/sandboxes
  CLOUD-->>DISP: sandbox_id
  DISP->>AS: upload tarball
  DISP->>AS: POST /api/bash/start_bash_command
  Note over AS,SDK: entrypoint runs inside sandbox
  SDK->>SDK: fetch LLM config + secrets
  SDK->>SDK: Conversation.run loop
  SDK->>AUTO: POST /api/automation/v1/runs/{id}/complete
  AUTO->>DB: UPDATE status=COMPLETED
  AUTO->>CLOUD: DELETE sandbox fire-and-forget`,
      },
      {
        type: 'steps',
        steps: [
          { title: 'Trigger fires', content: 'Cron tick, GitHub webhook, Slack message, or Datadog alert reaches the Automation Service.' },
          { title: 'Automation Service → Cloud', content: 'Fetches per-user API key on demand (POST /api/service/users/{id}/orgs/{id}/api-keys). Creates sandbox (POST /api/v1/sandboxes).' },
          { title: 'Automation Service → Agent Server', content: 'Starts entrypoint script via POST /api/bash/start_bash_command with OPENHANDS_API_KEY in env.' },
          { title: 'Entrypoint → SDK', content: 'The entrypoint script runs openhands-sdk: fetches LLM config + secrets + MCP config, creates a Conversation, sends the automation prompt.' },
          { title: 'Completion callback', content: 'On exit, SDK calls POST /api/automation/v1/runs/<id>/complete. Run marked COMPLETED. Sandbox deleted.' },
        ],
      },
    ],
  },

  '/all-repos/connections/openhands-sdk': {
    title: 'OpenHands ↔ SDK',
    description: 'How the main OpenHands app uses the software-agent-sdk internally.',
    route: '/all-repos/connections/openhands-sdk',
    sections: [
      {
        type: 'paragraph',
        content: 'The OpenHands app uses openhands-sdk as its agent core. The SDK provides the Agent, Conversation, LLM, Tool, and Condenser classes that the app\'s agent loop is built around.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Integration points',
      },
      {
        type: 'table',
        headers: ['OpenHands component', 'SDK class / module used'],
        rows: [
          ['Agent reasoning loop', 'openhands.sdk.Agent'],
          ['LLM calls', 'openhands.sdk.LLM (via LiteLLM)'],
          ['Tool dispatch', 'openhands.sdk.Tool, ToolDefinition'],
          ['History compression', 'openhands.sdk.Condenser'],
          ['Action security', 'openhands.sdk.SecurityAnalyzer'],
          ['Sandbox abstraction', 'openhands.sdk.Workspace'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 The OpenHands app is the reference integration for the SDK. Features built in OpenHands often graduate to the SDK as standalone classes.',
      },
    ],
  },

  '/all-repos/connections/canvas-agent-server': {
    title: 'Agent Canvas ↔ Agent Server',
    description: 'How the Agent Canvas frontend communicates with the Agent Server backend.',
    route: '/all-repos/connections/canvas-agent-server',
    sections: [
      {
        type: 'paragraph',
        content: 'Agent Canvas is a pure frontend — it has no agent logic. All agent execution happens in the Agent Server (part of the software-agent-sdk repo). Canvas communicates exclusively via HTTP REST and WebSocket.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key APIs',
      },
      {
        type: 'table',
        headers: ['Operation', 'API call'],
        rows: [
          ['Create conversation', 'POST /api/conversations'],
          ['Send message', 'POST /api/conversations/{id}/messages'],
          ['Stream events', 'WebSocket /ws/conversations/{id}'],
          ['List conversations', 'GET /api/conversations'],
          ['Get settings', 'GET /api/settings'],
          ['Update LLM config', 'PUT /api/settings'],
          ['Bash events', 'GET /api/bash/bash_events/search'],
          ['MCP servers', 'GET/PUT /api/mcp'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Multi-backend switching',
      },
      {
        type: 'paragraph',
        content: 'A single Agent Canvas instance can connect to multiple Agent Servers simultaneously — laptop, remote VM, OpenHands Cloud — and switch between them from the backend picker in the UI. Each backend has its own SESSION_API_KEY stored client-side.',
      },
    ],
  },

  '/all-repos/connections/automation-agent-server': {
    title: 'Automation ↔ Agent Server',
    description: 'How the Automation Service dispatches agent runs to the Agent Server.',
    route: '/all-repos/connections/automation-agent-server',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 4 — GitHub webhook event flow: GitHub → SaaS proxy → Automation Service → dispatch',
        content: `sequenceDiagram
  participant GH as GitHub App
  participant SAAS as OpenHands SaaS
  participant AUTO as Automation Service
  participant DB as PostgreSQL
  participant DISP as Dispatcher

  GH->>SAAS: POST webhook PR opened
  SAAS->>SAAS: resolve github_org_id to org_id
  SAAS->>SAAS: lookup integration_id for org
  SAAS->>SAAS: verify PR author is org member
  SAAS->>AUTO: POST /api/automation/v1/events/{org_id}/{integration_id}
  AUTO->>AUTO: verify HMAC shared secret
  AUTO->>DB: query automations WHERE integration_id matches
  AUTO->>AUTO: evaluate JMESPath conditions against payload
  AUTO->>DB: INSERT automation_run PENDING for each match
  Note over DISP: standard dispatch from here same as cron
  DISP->>DB: poll PENDING and dispatch`,
      },
      {
        type: 'paragraph',
        content: 'The Automation Service never runs agent logic itself. It creates a sandbox via OpenHands Cloud, uploads the automation tarball, and starts an entrypoint script on the Agent Server inside that sandbox. The entrypoint script uses the SDK to create and run a Conversation.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Dispatch sequence',
      },
      {
        type: 'table',
        headers: ['Step', 'API call', 'Target'],
        rows: [
          ['1. Validate API key', 'GET /api/keys/current', 'OpenHands Cloud'],
          ['2. Create sandbox', 'POST /api/v1/sandboxes', 'OpenHands Cloud'],
          ['3. Upload tarball', 'Agent Server file API', 'Agent Server (in sandbox)'],
          ['4. Start entrypoint', 'POST /api/bash/start_bash_command', 'Agent Server (in sandbox)'],
          ['5. Completion callback', 'POST /api/automation/v1/runs/<id>/complete', 'Automation Service'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 The OPENHANDS_API_KEY passed into the sandbox serves double duty — it lets the SDK create conversations AND authenticates the completion callback. No separate callback token is needed.',
      },
    ],
  },

  '/all-repos/connections/api-contracts': {
    title: 'API Contracts Between Repos',
    description: 'The key REST API boundaries and shared contracts across the OpenHands repo ecosystem.',
    route: '/all-repos/connections/api-contracts',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Agent Server REST API (software-agent-sdk)',
      },
      {
        type: 'table',
        headers: ['Caller', 'Key endpoints'],
        rows: [
          ['Agent Canvas', 'POST /api/conversations, GET /api/settings, PUT /api/settings, WebSocket /ws/conversations/{id}'],
          ['Automation Service', 'POST /api/bash/start_bash_command, GET /api/bash/bash_events/search'],
          ['SDK entrypoints', 'POST /api/conversations/{id}/messages (via openhands.sdk.Conversation)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'OpenHands Cloud REST API',
      },
      {
        type: 'table',
        headers: ['Caller', 'Key endpoints'],
        rows: [
          ['Automation Service', 'GET /api/keys/current — key validation (20s TTL cache)'],
          ['Automation Service', 'POST /api/v1/sandboxes — sandbox creation'],
          ['Automation Service', 'POST /api/service/users/{uid}/orgs/{oid}/api-keys — per-run key'],
          ['Agent Canvas', 'Cloud workspace APIs for hosted sessions'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Automation Service REST API',
      },
      {
        type: 'table',
        headers: ['Caller', 'Key endpoints'],
        rows: [
          ['Agent Canvas / users', 'POST /api/automation/v1 — create automation'],
          ['Agent Canvas / users', 'GET /api/automation/v1 — list automations'],
          ['SDK entrypoint (in sandbox)', 'POST /api/automation/v1/runs/<id>/complete — completion callback'],
          ['OpenHands Cloud (SaaS proxy)', 'POST /api/automation/v1/events/{org_id}/{integration_id} — event ingestion'],
        ],
      },
    ],
  },

  '/all-repos/connections/cloud': {
    title: 'Cloud ↔ All Repos',
    description: 'How OpenHands Cloud interacts with each repository in the ecosystem.',
    route: '/all-repos/connections/cloud',
    sections: [
      {
        type: 'paragraph',
        content: 'OpenHands Cloud is the hosted SaaS platform. It acts as the sandbox provider, key manager, and event proxy for the entire ecosystem. Other repos call Cloud REST APIs but never import its code.',
      },
      {
        type: 'table',
        headers: ['Repo', 'How it uses Cloud', 'Direction'],
        rows: [
          ['Automation Service', 'Sandbox lifecycle, per-user API keys, org resolution for webhooks', 'Automation → Cloud'],
          ['Agent Canvas', 'Cloud workspace sessions, org management, credential sharing', 'Canvas → Cloud'],
          ['OpenHands (app)', 'Cloud is a deployment target — SaaS runs OpenHands at scale', 'Cloud wraps OpenHands'],
          ['software-agent-sdk', 'OpenHandsCloudWorkspace class connects SDK conversations to Cloud sandboxes', 'SDK → Cloud'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Cloud acts as an event proxy for GitHub webhooks — it resolves org mappings and enriches the payload before forwarding to the Automation Service, keeping the Automation Service org-agnostic.',
      },
    ],
  },

  '/all-repos/connections/skills-load-path': {
    title: 'Skills Load Path',
    description: 'How skills travel from the extensions repo into every agent\'s system prompt.',
    route: '/all-repos/connections/skills-load-path',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 5 — Skills load path: extensions repo → GitHub → local cache → system prompt',
        content: `flowchart LR
  EXT["github.com/OpenHands/extensions\\nSKILL.md files"]
  GH["GitHub API\\nraw content"]
  FS["~/.agents/skills/\\nlocal filesystem cache"]
  OH["OpenHands App\\nloads at startup"]
  AS["Agent Server\\nloads per conversation"]
  AC["Agent Canvas\\nVITE_LOAD_PUBLIC_SKILLS"]
  PROMPT["Agent System Prompt\\nskill content appended"]

  EXT -->|HTTPS download| GH
  GH -->|cached to| FS
  FS -->|loaded by| OH
  FS -->|loaded by| AS
  GH -->|fetched by| AC
  OH --> PROMPT
  AS --> PROMPT
  AC -->|injected via Agent Server| PROMPT`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'How skills are consumed',
      },
      {
        type: 'table',
        headers: ['Consumer', 'Env var / flag', 'When loaded'],
        rows: [
          ['Agent Canvas', 'VITE_LOAD_PUBLIC_SKILLS=true', 'At conversation start, fetched from GitHub CDN'],
          ['Agent Server', 'reads .agents/skills/ in workspace', 'Each conversation init'],
          ['OpenHands (app)', 'reads ~/.openhands/skills/ and .agents/skills/', 'Agent loop startup'],
          ['Automation entrypoint', 'SDK Plugin API in entrypoint script', 'Conversation creation'],
        ],
      },
    ],
  },

  '/all-repos/connections/deployment-topology': {
    title: 'Deployment Topology',
    description: 'Where each service physically runs — from laptop to OpenHands Cloud.',
    route: '/all-repos/connections/deployment-topology',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 6 — Deployment topology: three environments where the stack can run',
        content: `flowchart TB
  subgraph Laptop["Developer Laptop (local)"]
    AC1["Agent Canvas\\nbrowser :5173"]
    AS1["Agent Server\\n:18000"]
    AUTO1["Automation Backend\\n:18001"]
    SB1["Docker Sandbox\\nor dockerless"]
    AC1 --> AS1
    AC1 --> AUTO1
    AS1 --> SB1
  end

  subgraph VM["Self-Hosted Remote VM"]
    NGINX["nginx :443\\nTLS + auth"]
    AS2["Agent Server\\n:18000"]
    AUTO2["Automation Backend\\n:18001"]
    PG["PostgreSQL"]
    NGINX --> AS2
    NGINX --> AUTO2
    AUTO2 --> PG
  end

  subgraph CloudEnv["OpenHands Cloud"]
    CLOUD["Cloud APIs\\nsandbox + key mgmt"]
    SB2["Managed Sandboxes\\n(per-run Docker)"]
    AC2["Agent Canvas\\nbrowser"]
    AC2 --> CLOUD
    CLOUD --> SB2
  end

  Browser1["Browser"] --> AC1
  Browser2["Browser"] --> NGINX
  Browser3["Browser"] --> AC2`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'Environment comparison',
      },
      {
        type: 'table',
        headers: ['Environment', 'Who runs it', 'Sandbox type', 'Best for'],
        rows: [
          ['Laptop (local)', 'Developer', 'Local Docker or dockerless', 'Development, experimentation'],
          ['Self-hosted VM', 'Team / DevOps', 'Local Docker in VM', 'Private deployment, cost control'],
          ['OpenHands Cloud', 'All-Hands AI', 'Managed per-run Docker', 'Production, multi-user, no infra ops'],
        ],
      },
    ],
  },

  // Databases pages

  '/all-repos/databases': {
    title: 'Databases Overview',
    description: 'Which services own a database and what data each stores.',
    route: '/all-repos/databases',
    sections: [
      {
        type: 'table',
        headers: ['Service', 'Database', 'Tables / key data'],
        rows: [
          ['OpenHands App', 'SQLite (dev) / PostgreSQL (prod)', 'conversations, events (action/observation payloads), workspace files'],
          ['Automation Service', 'PostgreSQL', 'automations, automation_runs, tarball_uploads, integrations (Phase 2)'],
          ['OpenHands Cloud', 'PostgreSQL (private)', 'organizations, users, api_keys, sandboxes, billing records'],
          ['Agent Server (SDK)', 'In-memory / file-backed', 'Conversation state per session — no persistent DB in base mode'],
          ['Agent Canvas', 'None (browser localStorage)', 'Backend connection URLs, session tokens — never a server DB'],
          ['Architecture Repo', 'None', 'Documentation only'],
          ['Extensions', 'None', 'Static Markdown files in git'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Only three services persist data to a real database: OpenHands App, Automation Service, and OpenHands Cloud. Agent Canvas and the extensions repo have zero server-side storage.',
      },
    ],
  },

  '/all-repos/databases/automation': {
    title: 'Automation Service DB',
    description: 'PostgreSQL schema for the Automation Service — automations, runs, state machine, and integrations.',
    route: '/all-repos/databases/automation',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 7 — Automation Service ER diagram (PostgreSQL)',
        content: `erDiagram
  AUTOMATIONS {
    uuid id PK
    uuid user_id
    uuid org_id
    string name
    bool enabled
    string tarball_path
    jsonb trigger_config
    timestamp created_at
    timestamp last_polled_at
  }
  AUTOMATION_RUNS {
    uuid id PK
    uuid automation_id FK
    string status
    timestamp started_at
    timestamp timeout_at
    uuid conversation_id
    text error_detail
  }
  TARBALL_UPLOADS {
    uuid id PK
    uuid user_id
    uuid org_id
    string storage_url
    timestamp created_at
  }
  INTEGRATIONS {
    uuid id PK
    uuid org_id
    string source_type
    uuid integration_id
    string webhook_secret
  }

  AUTOMATIONS ||--o{ AUTOMATION_RUNS : "has runs"
  AUTOMATIONS }o--o| INTEGRATIONS : "triggered by Phase 2"`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'Automation Run State Machine',
      },
      {
        type: 'diagram',
        caption: 'Diagram 8 — Run state machine: PENDING → RUNNING → COMPLETED / FAILED (watchdog recovery path shown)',
        content: `stateDiagram-v2
  [*] --> PENDING : scheduler inserts run

  PENDING --> RUNNING : dispatcher picks up\\nFOR UPDATE SKIP LOCKED

  RUNNING --> COMPLETED : completion callback\\nexit_code = 0
  RUNNING --> FAILED : completion callback\\nexit_code != 0

  RUNNING --> COMPLETED : watchdog\\nsandbox exit_code = 0\\ncallback was missed
  RUNNING --> FAILED : watchdog\\ntimeout_at has passed\\nor sandbox unreachable

  COMPLETED --> [*]
  FAILED --> [*]`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'trigger_config shapes',
      },
      {
        type: 'table',
        headers: ['Trigger type', 'Key fields in trigger_config'],
        rows: [
          ['cron', '{ "type": "cron", "schedule": "0 9 * * 1", "timezone": "UTC" }'],
          ['slack (Phase 2)', '{ "type": "slack", "integration_id": "uuid", "condition": "jmespath expr" }'],
          ['github (Phase 2)', '{ "type": "github", "integration_id": "uuid", "events": ["pull_request.opened"], "condition": "jmespath expr" }'],
          ['generic webhook', '{ "type": "webhook", "integration_id": "uuid", "condition": "jmespath expr" }'],
        ],
      },
    ],
  },

  '/all-repos/databases/openhands': {
    title: 'OpenHands App DB',
    description: 'SQLite / PostgreSQL schema for the main OpenHands application.',
    route: '/all-repos/databases/openhands',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 9 — OpenHands App ER diagram (SQLite dev / PostgreSQL prod)',
        content: `erDiagram
  CONVERSATIONS {
    string id PK
    string user_id
    string title
    string status
    timestamp created_at
    timestamp updated_at
  }
  EVENTS {
    string id PK
    string conversation_id FK
    string source
    string event_type
    jsonb payload
    timestamp timestamp
    int seq_id
  }
  FILES {
    string path PK
    string conversation_id FK
    text content
    timestamp last_modified
  }

  CONVERSATIONS ||--o{ EVENTS : "contains"
  CONVERSATIONS ||--o{ FILES : "workspace files"`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'Event types stored',
      },
      {
        type: 'table',
        headers: ['Source', 'Event type examples'],
        rows: [
          ['user', 'MessageAction, ChangeAgentStateAction'],
          ['agent', 'CmdRunAction, FileWriteAction, BrowseInteractiveAction, AgentFinishAction, AgentThinkAction'],
          ['environment', 'CmdOutputObservation, FileReadObservation, BrowserOutputObservation, AgentStateChangedObservation'],
        ],
      },
    ],
  },

  '/all-repos/databases/cloud': {
    title: 'OpenHands Cloud DB',
    description: 'High-level schema for the OpenHands Cloud SaaS platform (inferred from public API contracts).',
    route: '/all-repos/databases/cloud',
    sections: [
      {
        type: 'callout',
        variant: 'warning',
        content: '⚠️ The Cloud DB is private. This schema is inferred from the public API contracts used by Automation Service and Agent Canvas — not from source code.',
      },
      {
        type: 'diagram',
        caption: 'Diagram 10 — OpenHands Cloud ER diagram (simplified, inferred from API contracts)',
        content: `erDiagram
  ORGANIZATIONS {
    uuid id PK
    string name
    string github_org_id
    string plan
  }
  USERS {
    uuid id PK
    uuid org_id FK
    string email
    string github_id
    string role
  }
  API_KEYS {
    uuid id PK
    uuid user_id FK
    uuid org_id FK
    string key_hash
    timestamp created_at
    timestamp expires_at
  }
  SANDBOXES {
    uuid id PK
    uuid user_id FK
    uuid org_id FK
    string status
    string runtime_id
    uuid conversation_id
    timestamp timeout_at
    timestamp created_at
  }
  BILLING_RECORDS {
    uuid id PK
    uuid org_id FK
    string event_type
    int compute_minutes
    timestamp recorded_at
  }

  ORGANIZATIONS ||--o{ USERS : "has"
  USERS ||--o{ API_KEYS : "owns"
  USERS ||--o{ SANDBOXES : "runs"
  ORGANIZATIONS ||--o{ BILLING_RECORDS : "billed for"`,
      },
    ],
  },

  '/all-repos/databases/cross-service-ids': {
    title: 'Cross-Service ID Flow',
    description: 'How user_id, org_id, conversation_id, and sandbox_id originate and flow across service boundaries.',
    route: '/all-repos/databases/cross-service-ids',
    sections: [
      {
        type: 'diagram',
        caption: 'Diagram 11 — Cross-service ID flow: how critical IDs originate and propagate across all services',
        content: `flowchart LR
  CLOUD_CREATE["OpenHands Cloud\\nCREATES user_id + org_id\\nat signup"]
  AUTO_STORE["Automation Service DB\\nSTORES user_id + org_id\\nwhen automation created"]
  AUTO_FETCH["Automation Service\\nFETCHES per-run api_key\\nfor user_id + org_id"]
  SB_ENV["Sandbox ENV\\nOPENHANDS_API_KEY\\n= per-run ephemeral key"]
  SDK_CONV["SDK Agent Server\\nCREATES conversation_id\\nper Conversation.run"]
  AUTO_REC["Automation Run record\\nSTORES conversation_id\\nafter completion callback"]
  CANVAS["Agent Canvas\\nDISPLAYS conversation\\nunder user account"]

  CLOUD_CREATE -->|on automation create| AUTO_STORE
  AUTO_STORE -->|on dispatch| AUTO_FETCH
  AUTO_FETCH -->|injected into| SB_ENV
  SB_ENV -->|authorises| SDK_CONV
  SDK_CONV -->|in callback POST| AUTO_REC
  SDK_CONV -->|linked to user| CANVAS`,
      },
      {
        type: 'heading',
        level: 2,
        content: 'ID lifetime summary',
      },
      {
        type: 'table',
        headers: ['ID', 'Created by', 'Lifetime', 'Stored in'],
        rows: [
          ['user_id', 'OpenHands Cloud (at signup)', 'Permanent', 'Cloud DB, Automation DB'],
          ['org_id', 'OpenHands Cloud (org creation)', 'Permanent', 'Cloud DB, Automation DB'],
          ['api_key (per-run)', 'Cloud API on demand per dispatch', 'Single run duration', 'Automation DB (hash), Sandbox ENV'],
          ['sandbox_id', 'Cloud API on sandbox create', 'Single run duration', 'Cloud DB, Automation DB (run record)'],
          ['conversation_id', 'Agent Server per Conversation.run', 'Single conversation', 'Agent Server state, Automation run record'],
          ['automation_id', 'Automation Service on create', 'Permanent until deleted', 'Automation DB'],
          ['run_id', 'Automation Service on dispatch', 'Single run', 'Automation DB'],
        ],
      },
    ],
  },

  // Repo Reference pages

  '/all-repos/repos': {
    title: 'OpenHands/OpenHands',
    description: 'Quick reference card for the main OpenHands open-source repository.',
    route: '/all-repos/repos',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/All-Hands-AI/OpenHands'],
          ['Status', 'Open Source ✅'],
          ['Language', 'Python + TypeScript'],
          ['Install', 'pip install openhands — or Docker pull'],
          ['Docs tab', 'OpenHands'],
          ['SWE-bench', '77.6%'],
          ['Key deps', 'openhands-sdk, Docker, LiteLLM'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Contribute here when you want to…',
      },
      {
        type: 'list',
        items: [
          'Fix a bug in the agent\'s reasoning or planning behavior',
          'Improve the Docker/Kubernetes sandbox runtime',
          'Enhance the OSS web UI (React frontend in frontend/)',
          'Add or modify the OpenHands REST API',
          'Write integration tests against the full stack',
        ],
      },
    ],
  },

  '/all-repos/repos/sdk': {
    title: 'OpenHands/software-agent-sdk',
    description: 'Quick reference card for the software-agent-sdk repository.',
    route: '/all-repos/repos/sdk',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/software-agent-sdk'],
          ['Status', 'Open Source ✅'],
          ['Language', 'Python'],
          ['Install', 'pip install openhands-sdk openhands-tools'],
          ['Agent Server', 'pip install openhands-agent-server (or uvx)'],
          ['Docs tab', 'SDK'],
          ['Key exports', 'Agent, Conversation, LLM, Tool, Workspace, Condenser, Skill'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Contribute here when you want to…',
      },
      {
        type: 'list',
        items: [
          'Add a new built-in tool (terminal, file editor, browser, etc.)',
          'Extend the Agent or Conversation APIs',
          'Improve LLM provider support (new model, streaming, reasoning)',
          'Add a new sandbox workspace type',
          'Build or improve the Agent Server REST API',
        ],
      },
    ],
  },

  '/all-repos/repos/agent-canvas': {
    title: 'OpenHands/agent-canvas',
    description: 'Quick reference card for the agent-canvas repository.',
    route: '/all-repos/repos/agent-canvas',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/agent-canvas'],
          ['Status', 'Beta 🧪'],
          ['Language', 'TypeScript / React'],
          ['npm package', '@openhands/agent-canvas'],
          ['Run', 'npx @openhands/agent-canvas — or Docker'],
          ['Docs tab', 'Agent Canvas'],
          ['Key deps', 'Agent Server (from software-agent-sdk)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Contribute here when you want to…',
      },
      {
        type: 'list',
        items: [
          'Improve the conversation, chat, or event stream UI',
          'Add or fix automation creation and management views',
          'Enhance settings panels (LLM, MCP, skills, secrets)',
          'Fix backend switching or multi-server management',
          'Add i18n translations',
          'Write Playwright E2E or Vitest component tests',
        ],
      },
    ],
  },

  '/all-repos/repos/automation': {
    title: 'OpenHands/automation',
    description: 'Quick reference card for the automation service repository.',
    route: '/all-repos/repos/automation',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/automation'],
          ['Status', 'Internal 🔒'],
          ['Language', 'Python / FastAPI'],
          ['Run', 'uvicorn automation.app:app'],
          ['Docs tab', 'Architecture → ADR-0002'],
          ['Key deps', 'Agent Server, OpenHands Cloud, PostgreSQL'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Contribute here when you want to…',
      },
      {
        type: 'list',
        items: [
          'Add a new event trigger type (Slack, GitHub, Datadog, generic webhook)',
          'Improve scheduler reliability or dispatcher performance',
          'Add new preset types (beyond prompt and plugin)',
          'Fix staleness watchdog edge cases',
          'Add new storage backends (S3, Azure Blob) for tarballs',
        ],
      },
    ],
  },

  '/all-repos/repos/architecture': {
    title: 'OpenHands/architecture',
    description: 'Quick reference card for the architecture decisions repository.',
    route: '/all-repos/repos/architecture',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/architecture (private)'],
          ['Status', 'Internal 🔒'],
          ['Language', 'Markdown'],
          ['Tooling', 'bun install && bun x madr new "Title"'],
          ['Docs tab', 'Architecture'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Contribute here when you want to…',
      },
      {
        type: 'list',
        items: [
          'Record a significant technical decision that affects multiple repos (new ADR)',
          'Propose an approved implementation plan (new PD-XXX Product Design)',
          'Explore an open technical question before committing to a design (new PR-XXX Research)',
          'Document an engineering process or team workflow (docs/process/)',
        ],
      },
    ],
  },

  '/all-repos/repos/extensions': {
    title: 'OpenHands/extensions',
    description: 'Quick reference card for the public skills and plugins marketplace.',
    route: '/all-repos/repos/extensions',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['GitHub', 'github.com/OpenHands/extensions'],
          ['Status', 'Open Source ✅'],
          ['Language', 'Markdown (SKILL.md)'],
          ['Loaded by', 'Agent Canvas, Agent Server, OpenHands (app)'],
          ['Docs tab', 'SDK → Guides → Agent Skills & Context'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Contribute here when you want to…',
      },
      {
        type: 'list',
        items: [
          'Publish a new skill that adds domain knowledge to any agent',
          'Create a plugin bundle (skills + hooks + MCP servers)',
          'Add a GitHub Workflows skill for CI/CD automation',
          'Contribute code review, TODO management, or Datadog debugging skills',
        ],
      },
    ],
  },

  // Contributing pages

  '/all-repos/contributing': {
    title: 'Where to Start',
    description: 'Which repo to contribute to based on what you want to build or fix.',
    route: '/all-repos/contributing',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Decision Table',
      },
      {
        type: 'table',
        headers: ['I want to…', 'Repo', 'Docs tab'],
        rows: [
          ['Fix agent reasoning, planning, or sandbox behavior', 'OpenHands/OpenHands', 'OpenHands → Contributing'],
          ['Add a new SDK tool, workspace type, or LLM provider', 'software-agent-sdk', 'SDK → Guides'],
          ['Improve the conversation, files, or settings UI', 'agent-canvas', 'Agent Canvas → Contributing'],
          ['Add a new automation trigger type', 'automation', 'Architecture → ADR-0002'],
          ['Record a technical decision', 'architecture', 'Architecture → Decision Records'],
          ['Propose a feature design', 'architecture', 'Architecture → Product Design'],
          ['Explore a technical question', 'architecture', 'Architecture → Research'],
          ['Publish a skill or plugin', 'extensions', 'SDK → Guides → Skills'],
          ['Fix docs for a specific repo', 'That repo\'s docs branch', 'This docs-site'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'First-time contributor checklist',
      },
      {
        type: 'list',
        items: [
          'Read the target repo\'s CONTRIBUTING.md or AGENTS.md',
          'Check open issues labeled `good first issue`',
          'Run the test suite locally before opening a PR',
          'For cross-repo changes, open PRs in all affected repos and link them to each other',
          'For significant new features, open an ADR or PD in the architecture repo first',
        ],
      },
    ],
  },

  '/all-repos/contributing/openhands': {
    title: 'Contributing to OpenHands',
    description: 'How to contribute to the main OpenHands open-source repository.',
    route: '/all-repos/contributing/openhands',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Setup',
      },
      {
        type: 'list',
        items: [
          'Python 3.11+, Node.js 18+, Docker',
          'pip install -e ".[dev]" for Python deps',
          'cd frontend && npm install for the React UI',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quality gates',
      },
      {
        type: 'table',
        headers: ['Check', 'Command'],
        rows: [
          ['Python lint', 'pre-commit run --all-files'],
          ['Python tests', 'python -m pytest tests/unit/'],
          ['Frontend lint', 'cd frontend && npm run lint'],
          ['Frontend tests', 'cd frontend && npm test'],
          ['E2E tests', 'python -m pytest tests/integration/'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 The OpenHands AGENTS.md file in the repo root contains guidelines written for AI agents contributing to the repo — useful for humans too.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Dev setup',
        code: `git clone https://github.com/All-Hands-AI/OpenHands.git
cd OpenHands
pip install -e ".[dev]"
cd frontend && npm install && cd ..
make run  # starts the full stack`,
      },
    ],
  },

  '/all-repos/contributing/sdk': {
    title: 'Contributing to the SDK',
    description: 'How to contribute to the software-agent-sdk repository.',
    route: '/all-repos/contributing/sdk',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Setup',
      },
      {
        type: 'list',
        items: [
          'Python 3.11+, uv (pip install uv)',
          'uv sync — installs all deps from uv.lock',
          'uv run pytest tests/ — runs the test suite',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Repo structure',
      },
      {
        type: 'table',
        headers: ['Directory', 'Contents'],
        rows: [
          ['openhands-sdk/', 'Core SDK — Agent, Conversation, LLM, Tool, etc.'],
          ['openhands-tools/', 'Built-in tools — TerminalTool, FileEditorTool, BrowserTool, etc.'],
          ['openhands-workspace/', 'Workspace implementations — local, Docker, Apptainer, Cloud'],
          ['openhands-agent-server/', 'FastAPI Agent Server — wraps SDK for multi-client use'],
          ['examples/', '50+ code examples covering every SDK feature'],
          ['tests/', 'Unit, integration, and E2E tests'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Dev setup',
        code: `git clone https://github.com/OpenHands/software-agent-sdk.git
cd software-agent-sdk
pip install uv
uv sync
uv run pytest tests/`,
      },
    ],
  },

  '/all-repos/contributing/agent-canvas': {
    title: 'Contributing to Agent Canvas',
    description: 'How to contribute to the agent-canvas repository.',
    route: '/all-repos/contributing/agent-canvas',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Setup',
      },
      {
        type: 'list',
        items: [
          'Node.js 22.12.x or later',
          'npm install',
          'npm run dev — starts full stack (UI + Agent Server + Automation backend)',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quality gates',
      },
      {
        type: 'table',
        headers: ['Check', 'Command'],
        rows: [
          ['TypeScript', 'npm run typecheck'],
          ['ESLint + Prettier', 'npm run lint'],
          ['Unit + component tests', 'npm test'],
          ['E2E tests', 'npm run test:e2e'],
          ['Visual snapshots', 'npm run test:e2e:snapshots'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Dev setup',
        code: `git clone https://github.com/OpenHands/agent-canvas.git
cd agent-canvas
npm install
npm run dev`,
      },
    ],
  },

  '/all-repos/contributing/automation': {
    title: 'Contributing to Automation',
    description: 'How to contribute to the automation service repository.',
    route: '/all-repos/contributing/automation',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Setup',
      },
      {
        type: 'list',
        items: [
          'Python 3.11+, uv',
          'PostgreSQL (local or Docker)',
          'uv sync — installs deps',
          'uv run uvicorn automation.app:app --reload — starts the service',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key files',
      },
      {
        type: 'table',
        headers: ['File', 'What to edit for…'],
        rows: [
          ['automation/router.py', 'New automation CRUD endpoints or callback logic'],
          ['automation/preset_router.py', 'New preset types'],
          ['automation/scheduler.py', 'Changes to cron polling behavior'],
          ['automation/dispatcher.py', 'Dispatch logic, tarball handling, sandbox interaction'],
          ['automation/watchdog.py', 'Stuck run detection and resolution'],
          ['automation/models.py', 'Database schema changes'],
        ],
      },
    ],
  },

  '/all-repos/contributing/architecture': {
    title: 'Recording Architecture Decisions',
    description: 'How to contribute to the architecture repo — ADRs, PDs, and Research projects.',
    route: '/all-repos/contributing/architecture',
    sections: [
      {
        type: 'table',
        headers: ['Document type', 'When to use', 'Approval required?'],
        rows: [
          ['ADR', 'Significant decision affecting multiple repos', 'Implicit — merged = accepted'],
          ['Product Design (PD-XXX)', 'Implementation-ready feature design', 'Yes — committers from each impacted repo'],
          ['Research (PR-XXX)', 'Open-ended exploration before committing to a design', 'No'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quick commands',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'New ADR',
        code: `bun install
bun x madr new "Title of the decision"
# Edit docs/decisions/XXXX-title.md
bun x madr index`,
      },
      {
        language: 'bash',
        label: 'New Product Design',
        code: `# Use the new-design-project OpenHands skill, or:
mkdir -p docs/product/design/PD-XXX-name
cp .openhands/templates/design-template.md \\
   docs/product/design/PD-XXX-name/README.md`,
      },
    ],
  },

  '/all-repos/contributing/cross-repo': {
    title: 'Cross-Repo Pull Requests',
    description: 'How to handle changes that span multiple repositories.',
    route: '/all-repos/contributing/cross-repo',
    sections: [
      {
        type: 'paragraph',
        content: 'Some features require coordinated changes across multiple repos — for example, adding a new Agent Server API endpoint that both Agent Canvas and the Automation Service need to call.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Guidelines',
      },
      {
        type: 'list',
        items: [
          'Open a PR in each affected repo. Cross-link all PRs in each PR description.',
          'Merge in dependency order — the repo being depended on (e.g. SDK) first, then the consumers.',
          'For significant new APIs, open an ADR or PD in the architecture repo *before* opening code PRs.',
          'Coordinate reviewers — ping committers from all affected repos in a single GitHub issue.',
          'If the change touches both an internal and an OSS repo, the OSS PR can be opened without the internal context; add a private → OSS cross-link in the architecture ADR.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Common cross-repo change patterns',
      },
      {
        type: 'table',
        headers: ['Change', 'Repos affected'],
        rows: [
          ['New Agent Server API endpoint', 'software-agent-sdk (server) + agent-canvas (client) and/or automation (client)'],
          ['New SDK Tool', 'software-agent-sdk (tool impl) + OpenHands/OpenHands (if integrated)'],
          ['New automation trigger type', 'automation (backend) + agent-canvas (UI for new trigger config)'],
          ['New skill / plugin', 'extensions + any consumer (agent-canvas, SDK examples, OpenHands)'],
          ['Breaking API change', 'All repos that call the changed API — coordinate version bumps'],
        ],
      },
    ],
  },

  // Glossary

  '/all-repos/glossary': {
    title: 'Glossary of Terms',
    description: 'Shared vocabulary used across all OpenHands repositories.',
    route: '/all-repos/glossary',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Core Concepts',
      },
      {
        type: 'table',
        headers: ['Term', 'Definition'],
        rows: [
          ['Agent', 'An LLM-backed reasoning loop (openhands.sdk.Agent) that plans actions, dispatches tool calls, and processes observations in a loop until the task is complete'],
          ['Agent Server', 'The FastAPI REST/WebSocket API (in the software-agent-sdk repo) that wraps the SDK for multi-client use — the primary backend for Agent Canvas and the Automation Service'],
          ['Agent Canvas', 'The self-hostable React/TypeScript frontend (OpenHands/agent-canvas) that connects to one or more Agent Servers'],
          ['Automation Service', 'The FastAPI backend (OpenHands/automation) that runs agents on a schedule or in response to external events without manual prompting'],
          ['Conversation', 'One execution session — a user sends a prompt, the agent loop runs, results are returned. Corresponds to openhands.sdk.Conversation.'],
          ['Sandbox', 'An isolated execution environment (Docker, Apptainer, or OpenHands Cloud) where the agent runs code, edits files, and browses the web'],
          ['Workspace', 'The SDK abstraction (openhands.sdk.Workspace) over the execution environment — local directory, Docker container, Apptainer, or Cloud'],
          ['Skill', 'A Markdown SKILL.md file that adds domain knowledge, triggers, and behavior guidelines to an agent\'s system prompt at conversation start'],
          ['Plugin', 'A bundle of skills, hooks, MCP servers, agents, and commands packaged for reuse — installed via the extensions marketplace or a Git URL'],
          ['Hook', 'A lifecycle callback (openhands.sdk.hooks) that fires at conversation events (start, tool call, finish) for logging, monitoring, or custom behavior'],
          ['Condenser', 'A component (openhands.sdk.Condenser) that compresses conversation history to manage context window length and reduce token costs'],
          ['LLM', 'The provider-agnostic language model interface (openhands.sdk.LLM) backed by LiteLLM — supports OpenAI, Anthropic, Gemini, Mistral, Ollama, and more'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Tools & Protocols',
      },
      {
        type: 'table',
        headers: ['Term', 'Definition'],
        rows: [
          ['Tool / ToolDefinition', 'The SDK action-observation framework — tools define what an agent can do (run bash, edit files, browse web). ToolDefinition is the schema; Tool is the runtime binding.'],
          ['MCP', 'Model Context Protocol — an open standard for connecting agents to external tool servers. Agent Canvas and the Agent Server support MCP server configuration.'],
          ['ACP', 'Agent Communication Protocol — allows the SDK to delegate to ACP-compatible agent harnesses (Claude Code, Gemini CLI) instead of calling an LLM directly'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Automation Terms',
      },
      {
        type: 'table',
        headers: ['Term', 'Definition'],
        rows: [
          ['Tarball', 'A .tar.gz archive of an automation\'s SDK entrypoint script, uploaded to GCS/S3 and dispatched into a sandbox by the Automation Service'],
          ['Preset', 'A pre-built automation template (prompt or plugin) where users provide arguments instead of writing SDK code — the service generates the boilerplate'],
          ['Dispatcher', 'The Automation Service component that picks up PENDING runs, creates sandboxes, and fires entrypoint scripts'],
          ['Watchdog', 'The Automation Service component that detects stuck RUNNING runs and resolves them by querying the sandbox exit code'],
          ['JMESPath', 'The query language used for event trigger condition matching in the Automation Service — evaluates conditions against incoming webhook payloads'],
          ['integration_id', 'A UUID identifying a specific event source integration (GitHub, Slack, generic webhook) within an org in the Automation Service'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Architecture Repo Terms',
      },
      {
        type: 'table',
        headers: ['Term', 'Definition'],
        rows: [
          ['ADR', 'Architecture Decision Record — a Markdown file (MADR format) capturing a significant technical decision, its context, options considered, and outcome'],
          ['PD (Product Design)', 'A PD-XXX numbered document describing an implementation-ready design — includes problem statement, proposed solution, technical design, and milestone plan. Requires committer approval.'],
          ['PR (Research)', 'A PR-XXX numbered research project capturing open-ended exploration — findings, analysis, and recommendations. Can be merged without formal approval.'],
          ['MADR', 'Markdown Architectural Decision Records — the lightweight format used for ADRs, tooled by madr-tools (bun x madr new "Title")'],
        ],
      },
    ],
  },

  // ── Architecture Pages ────────────────────────────────────────────────────

  '/arch-repo': {
    title: 'What is This Repo?',
    description: 'Capturing technical design decisions at OpenHands using ADRs, Product Design documents, and Research projects.',
    route: '/arch-repo',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '> Architecture represents the significant design decisions that shape a system, where significant is measured by cost of change. — Grady Booch',
      },
      {
        type: 'paragraph',
        content: 'This repository captures technical design decisions at OpenHands. It is the canonical home for ADRs, product design specs, and research projects that inform how the platform is built.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Three Document Types',
      },
      {
        type: 'table',
        headers: ['Type', 'Naming', 'Tool', 'Purpose'],
        rows: [
          ['ADR', '0000-slug.md', 'madr-tools', 'Accepted or rejected architectural decisions'],
          ['Product Design', 'PD-XXX-slug/', 'Manual template', 'Approved, implementation-ready designs'],
          ['Research', 'PR-XXX-slug/', 'Manual template', 'Open-ended technical exploration and findings'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Folder Structure',
      },
      {
        type: 'table',
        headers: ['Folder', 'Contents'],
        rows: [
          ['docs/decisions/', 'Architecture Decision Records (ADRs) — indexed in index.md'],
          ['docs/process/', 'Engineering process documentation'],
          ['docs/diagrams/', 'Diagrams referenced from other docs'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Setup',
        code: `bun install
alias madr="bun x madr"`,
      },
      {
        language: 'bash',
        label: 'Create a new ADR',
        code: `madr new "Deprecate Frobnobble API"
# Then edit the generated file in docs/decisions/
madr index  # regenerates index.md`,
      },
    ],
  },

  '/arch-repo/document-types': {
    title: 'Three Document Types',
    description: 'ADRs, Product Design projects, and Research projects — when to use each.',
    route: '/arch-repo/document-types',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Architecture Decision Records (ADRs)',
      },
      {
        type: 'paragraph',
        content: 'ADRs record significant technical decisions — their context, the options considered, and the outcome. Once accepted they are immutable; superseded ADRs link to their replacement. Use ADRs for cross-cutting decisions that affect multiple teams or repos.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Product Design Projects (PD-XXX)',
      },
      {
        type: 'paragraph',
        content: 'PD documents describe a concrete implementation plan with problem statement, proposed solution, technical design, and milestone-based implementation plan. A merged PD PR means the approach is approved and ready to build. PDs require committer approval from each impacted repository.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Research Projects (PR-XXX)',
      },
      {
        type: 'paragraph',
        content: 'PR documents capture open-ended exploration — research questions, findings, analysis, and recommendations. They can be merged without formal approval when a research chapter is complete. A merged PR often leads to a follow-up PD.',
      },
      {
        type: 'table',
        headers: ['Dimension', 'ADR', 'Product Design (PD)', 'Research (PR)'],
        rows: [
          ['Scope', 'Technical decision', 'Feature/system design', 'Investigation'],
          ['Approval required?', 'Implicit (merged = accepted)', 'Yes — committers from each impacted repo', 'No'],
          ['Naming', '0000-slug.md', 'PD-XXX-slug/', 'PR-XXX-slug/'],
          ['Tool', 'madr new', 'new-design-project skill', 'new-research-project skill'],
          ['Typical output', 'One markdown file', 'README + optional specs/diagrams', 'README + findings'],
        ],
      },
    ],
  },

  '/arch-repo/scope': {
    title: 'Scope: Private vs OSS',
    description: 'What belongs in this repo and what belongs in the public OpenHands repositories.',
    route: '/arch-repo/scope',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: 'This repository is private and exists to support internal decision-making. It should not become a silo for context that belongs in public view.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What belongs here',
      },
      {
        type: 'list',
        items: [
          'Decisions that involve sensitive internal context (cost, vendor contracts, team headcount)',
          'Cross-repo decisions that span multiple OSS and internal repositories',
          'Research projects that explore proprietary approaches',
          'Internal process documentation',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'What belongs in OSS repos',
      },
      {
        type: 'list',
        items: [
          'Decisions that fall within the scope of an individual open-source repo (OpenHands, software-agent-sdk, etc.)',
          'These should use the standard GitHub Issues and Pull Requests workflow of that repo',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Cross-linking',
      },
      {
        type: 'paragraph',
        content: 'Because OSS decisions often overlap with internal ones, cross-link from private ADRs/PDs to the relevant public GitHub issues or PRs whenever applicable. This maintains transparency while keeping sensitive internal context in the right place.',
      },
    ],
  },

  '/arch-repo/tooling': {
    title: 'Tooling — MADR + madr-tools',
    description: 'How to use the MADR tool to create and index Architecture Decision Records.',
    route: '/arch-repo/tooling',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'MADR',
      },
      {
        type: 'paragraph',
        content: 'MADR (Markdown Architectural Decision Records) is a lightweight format for capturing decisions in plain Markdown. Each ADR lives in docs/decisions/ with a zero-padded 4-digit prefix and a kebab-case slug.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'madr-tools',
      },
      {
        type: 'paragraph',
        content: 'The `madr-tools` npm package (configured in `.madrrc.json`) provides a CLI for scaffolding new ADRs and regenerating the index.',
      },
      {
        type: 'table',
        headers: ['Command', 'What it does'],
        rows: [
          ['madr new "Title"', 'Scaffold a new ADR file with the next available number'],
          ['madr index', 'Regenerate docs/decisions/index.md from all ADR files'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Configuration',
      },
      {
        type: 'table',
        headers: ['File', 'Purpose'],
        rows: [
          ['.madrrc.json', 'Points madr at docs/decisions/ and sets the index filename'],
          ['package.json', 'Declares madr-tools as a dev dependency (run via bun x madr)'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Install & alias',
        code: `bun install
alias madr="bun x madr"`,
      },
      {
        language: 'json',
        label: '.madrrc.json',
        code: `{
  "madrDirectory": "docs/decisions",
  "indexFileName": "index.md"
}`,
      },
    ],
  },

  '/arch-repo/decisions': {
    title: 'What are ADRs?',
    description: 'Architecture Decision Records — capturing the significant decisions that shape the OpenHands system.',
    route: '/arch-repo/decisions',
    sections: [
      {
        type: 'paragraph',
        content: 'An ADR records a significant technical decision: the context that led to it, the options considered, and the outcome. ADRs are immutable once accepted — if a decision is reversed, a new ADR supersedes the old one.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Decision Log',
      },
      {
        type: 'table',
        headers: ['ADR', 'Title', 'Status', 'Date'],
        rows: [
          ['ADR-0000', 'Developer Workstation Setup', 'Accepted', '2025-12-12'],
          ['ADR-0001', 'Runtime API Next Steps', 'Accepted', '2026-01-05'],
          ['ADR-0002', 'Automations Service Architecture', 'Accepted', '2026-03-06'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'ADR Statuses',
      },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['proposed', 'Under discussion, not yet decided'],
          ['accepted', 'Decision made and in effect'],
          ['rejected', 'Considered and explicitly not chosen'],
          ['deprecated', 'No longer relevant'],
          ['superseded by ADR-XXXX', 'Replaced by a newer decision'],
        ],
      },
    ],
  },

  '/arch-repo/decisions/creating': {
    title: 'How to Create an ADR',
    description: 'Use madr-tools to scaffold a new Architecture Decision Record.',
    route: '/arch-repo/decisions/creating',
    sections: [
      {
        type: 'steps',
        steps: [
          { title: 'Install dependencies', content: 'bun install — installs madr-tools' },
          { title: 'Scaffold the ADR', content: 'madr new "Short title of the decision" — creates the next numbered file in docs/decisions/' },
          { title: 'Fill in the template', content: 'Edit the generated file: status, deciders, context, options, outcome, consequences, links' },
          { title: 'Update the index', content: 'madr index — regenerates docs/decisions/index.md' },
          { title: 'Open a PR', content: 'Branch name: decision/XXXX-slug — request review from relevant deciders' },
          { title: 'Merge = accepted', content: 'Merging the PR signals the decision is accepted. Update status from "proposed" to "accepted" before merge.' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 ADRs that are rejected should still be merged with status: rejected — knowing what was *not* chosen and why is as valuable as knowing what was.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Create & index',
        code: `madr new "Migrate from Flask to FastAPI"
# Edit docs/decisions/0003-migrate-from-flask-to-fastapi.md
madr index`,
      },
    ],
  },

  '/arch-repo/decisions/template': {
    title: 'ADR Template Reference',
    description: 'The MADR template used for all Architecture Decision Records.',
    route: '/arch-repo/decisions/template',
    sections: [
      {
        type: 'paragraph',
        content: 'Every ADR follows the MADR (Markdown Architectural Decision Records) template. The required sections are title, context & problem statement, considered options, and decision outcome. All other sections are optional.',
      },
      {
        type: 'table',
        headers: ['Section', 'Required?', 'Purpose'],
        rows: [
          ['Title', 'Yes', 'Short description of the decision made'],
          ['Status', 'Optional', 'proposed | accepted | rejected | deprecated | superseded by ADR-XXXX'],
          ['Deciders', 'Optional', 'Everyone involved in the decision'],
          ['Date', 'Optional', 'YYYY-MM-DD of last update'],
          ['Technical Story', 'Optional', 'Linked ticket or description'],
          ['Context and Problem Statement', 'Yes', '2-3 sentences describing the problem'],
          ['Decision Drivers', 'Optional', 'Forces and concerns shaping the decision'],
          ['Considered Options', 'Yes', 'All options that were on the table'],
          ['Decision Outcome', 'Yes', 'The chosen option with justification'],
          ['Positive Consequences', 'Optional', 'Benefits of the chosen option'],
          ['Negative Consequences', 'Optional', 'Trade-offs and downsides'],
          ['Pros and Cons of the Options', 'Optional', 'Detailed comparison of each option'],
          ['Links', 'Optional', 'Related ADRs, issues, or documentation'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'markdown',
        label: 'Template',
        code: `# [short title of solved problem and solution]

- Status: [proposed | accepted | rejected | deprecated | superseded by ADR-XXXX]
- Deciders: [list everyone involved]
- Date: [YYYY-MM-DD]

Technical Story: [description | ticket/issue URL]

## Context and Problem Statement

[2-3 sentences describing the problem as a question]

## Considered Options

- [option 1]
- [option 2]
- [option 3]

## Decision Outcome

Chosen option: "[option 1]", because [justification].

### Positive Consequences

- [benefit 1]

### Negative Consequences

- [trade-off 1]

## Pros and Cons of the Options

### [option 1]

- Good, because [argument a]
- Bad, because [argument b]

## Links

- [Link type] [Link to ADR]`,
      },
    ],
  },

  '/arch-repo/decisions/0000-workstation-setup': {
    title: 'ADR-0000 · Developer Workstation Setup',
    description: 'How we provision the development setup on company-issued laptops.',
    route: '/arch-repo/decisions/0000-workstation-setup',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['Status', 'Accepted'],
          ['Date', '2025-12-12'],
          ['Technical Story', 'APP-249'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Context and Problem Statement',
      },
      {
        type: 'paragraph',
        content: 'How will we provision the development setup on company-issued laptops? Historically everyone set up manually, creating friction ("do you have kubectl installed?"). With faster headcount growth and standard hardware, there is an opportunity to address this systematically.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Considered Options',
      },
      {
        type: 'list',
        items: ['Ansible', 'Nix', 'Manual / Documented', 'Homebrew Bundle + glue scripts', 'Shell scripts'],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Decision Outcome',
      },
      {
        type: 'paragraph',
        content: 'Chosen option: **Homebrew Bundle + glue scripts** — Homebrew is well-supported for developer packages on macOS and is already familiar to the team. A private `onboarding` repo holds README, scripts, and Brewfile. All scripts must be idempotent.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Options Compared',
      },
      {
        type: 'table',
        headers: ['Option', 'Pros', 'Cons'],
        rows: [
          ['Ansible', 'Flexible, idempotent, multi-platform', 'Complex, optimized for remote servers, unfamiliar'],
          ['Nix', 'Highly reproducible, flexible', 'Complex, all-encompassing, many surprises'],
          ['Homebrew Bundle', 'Simple, well-known, optimized for macOS', 'Only handles package installs'],
          ['Manual', 'Zero overhead', 'Inconsistent, breaks at unexpected times'],
        ],
      },
    ],
  },

  '/arch-repo/decisions/0001-runtime-api': {
    title: 'ADR-0001 · Runtime API Next Steps',
    description: 'Incremental improvements to Runtime API to reduce incidents and improve maintainability.',
    route: '/arch-repo/decisions/0001-runtime-api',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['Status', 'Accepted'],
          ['Deciders', 'Application Team'],
          ['Date', '2026-01-05'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Context and Problem Statement',
      },
      {
        type: 'paragraph',
        content: 'Runtime API manages agent sandboxes for SaaS and enterprise. It has been the center of numerous production incidents (INC-51, INC-52, INC-57, INC-61) and is considered high-risk with an unclear future direction.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Decision Drivers',
      },
      {
        type: 'list',
        items: ['Testability', 'Observability', 'Fitting our ecosystem', 'Cost / Roadmap time'],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Considered Options',
      },
      {
        type: 'table',
        headers: ['Option', 'Notes'],
        rows: [
          ['Status Quo', 'Default — led to continued incidents'],
          ['Incremental improvements', '✅ Chosen — high-value quality-of-life improvements within normal work flow'],
          ['Major re-architecture — Roll into OSS', 'Not feasible on current roadmap'],
          ['Major re-architecture — Kubernetes Operator', 'Likely future direction but too soon'],
          ['Replace with vendor solution', 'Not considered seriously yet'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Decision Outcome',
      },
      {
        type: 'paragraph',
        content: '**Incremental improvements.** Major re-architecture is not feasible with V1 so recent. Instead, a series of targeted improvements are identified that fit naturally into the existing work flow.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Approved Improvements',
      },
      {
        type: 'table',
        headers: ['Area', 'Improvement'],
        rows: [
          ['Project setup', 'Streamline local running ✅ · Introduce UV ✅'],
          ['API', 'APP-286: Migrate from Flask to FastAPI'],
          ['Testing', 'Track coverage ✅ · Unit test folder structure · Improve testability · Add more tests'],
          ['Documentation', 'Document service contracts and behaviors'],
          ['Troubleshooting', 'Monitor conversation start steps · Better runtime status reporting · OpenTelemetry'],
        ],
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service': {
    title: 'ADR-0002 · Automations Service Architecture',
    description: 'First-class automation service for scheduled and event-driven agent runs in OpenHands Cloud.',
    route: '/arch-repo/decisions/0002-automations-service',
    sections: [
      {
        type: 'table',
        headers: ['Field', 'Value'],
        rows: [
          ['Status', 'Accepted'],
          ['Proposer', 'Xingyao Wang'],
          ['Date', '2026-03-06'],
          ['Last Updated', '2026-04-09'],
          ['Technical Story', 'RFC #13275'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Problem',
      },
      {
        type: 'paragraph',
        content: 'Users want scheduled and event-driven automations in OpenHands Cloud — "Every Friday at 9am, summarize open PRs" or "When a PR is labeled review-this, run code review." Today this requires external orchestration (GitHub Actions, cron jobs). We need a first-class automation service integrated into the SaaS platform.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Decision Drivers',
      },
      {
        type: 'list',
        items: [
          '**Operational simplicity** — minimize new infrastructure; the team already operates PostgreSQL, not Redis/Kafka/NATS',
          '**Transactional safety** — automation creation and event processing must be ACID with the rest of application state',
          '**SDK alignment** — automation scripts should use the same openhands.sdk API as GitHub Actions workflows',
          '**Extensibility** — the same execution path must work for prompts, plugins, and custom scripts',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Phases',
      },
      {
        type: 'table',
        headers: ['Phase', 'Title', 'Status'],
        rows: [
          ['Phase 1', 'Cron-Triggered Automations', 'Shipped ✅'],
          ['Phase 1.5', 'Preset-Based Automations (prompt & plugin presets)', 'Shipped ✅'],
          ['Phase 2', 'Event-Driven Triggers (GitHub, generic webhooks)', 'Designed'],
        ],
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service/context': {
    title: 'ADR-0002 · Context & Problem',
    description: 'Why the Automations Service was built and what problem it solves.',
    route: '/arch-repo/decisions/0002-automations-service/context',
    sections: [
      {
        type: 'paragraph',
        content: 'Users want scheduled and event-driven automations in OpenHands Cloud — "Every Friday at 9am, summarize open PRs" or "When a PR is labeled review-this, run code review." Today this requires external orchestration (GitHub Actions, cron jobs) calling the SDK or API manually.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Decision Drivers',
      },
      {
        type: 'table',
        headers: ['Driver', 'Details'],
        rows: [
          ['Operational simplicity', 'Team already operates PostgreSQL — no Redis/Kafka/NATS'],
          ['Transactional safety', 'ACID consistency between automations and application state'],
          ['SDK alignment', 'Scripts use openhands.sdk — same as GitHub Actions and standalone workflows'],
          ['Extensibility', 'Same execution path for prompts, plugins, and custom scripts'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Core Architecture',
      },
      {
        type: 'paragraph',
        content: 'All services run in-process in a FastAPI app. No separate broker. The automation_runs table + a polling dispatcher acts as the event queue. PostgreSQL FOR UPDATE SKIP LOCKED provides multi-worker safety.',
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service/phase-1-cron': {
    title: 'ADR-0002 · Phase 1: Cron Triggers',
    description: 'How cron-triggered automations work end-to-end.',
    route: '/arch-repo/decisions/0002-automations-service/phase-1-cron',
    sections: [
      {
        type: 'paragraph',
        content: 'Phase 1 delivers cron-scheduled automations. An automation is created via API, stored in PostgreSQL, polled every 60 seconds by the scheduler, and dispatched to an OpenHands sandbox.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'End-to-End Flow',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Create automation', content: 'POST /api/automation/v1 — validates API key, stores user_id/org_id, trigger config, and tarball path in DB. Key is never stored.' },
          { title: 'Scheduler (every 60s)', content: 'Polls DB for enabled cron automations where next fire time ≤ now. Uses FOR UPDATE SKIP LOCKED for multi-worker safety. Inserts an automation_run row (status=PENDING).' },
          { title: 'Dispatcher (every 10s)', content: 'Picks up PENDING runs, marks as RUNNING, fires asyncio background task.' },
          { title: 'Sandbox execution', content: 'Fetches per-user API key on demand, creates sandbox on SaaS, resolves tarball (internal GCS or external HTTPS), starts entrypoint via agent-server /api/bash/start_bash_command. Returns immediately — does not wait for completion.' },
          { title: 'Completion callback', content: 'When entrypoint exits, SDK sends POST /api/automation/v1/runs/<id>/complete. Run is marked COMPLETED or FAILED. Sandbox is deleted (fire-and-forget) unless keep_alive=true.' },
          { title: 'Staleness watchdog (every 60s)', content: 'Scans for RUNNING entries where timeout_at < now. Queries sandbox exit code to determine actual outcome before marking FAILED.' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 The API key that was passed into the sandbox doubles as the completion callback auth credential — no separate token needed.',
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service/phase-1-5-presets': {
    title: 'ADR-0002 · Phase 1.5: Preset Automations',
    description: 'Prompt and plugin presets — pre-built templates where users provide arguments instead of writing SDK scripts.',
    route: '/arch-repo/decisions/0002-automations-service/phase-1-5-presets',
    sections: [
      {
        type: 'paragraph',
        content: 'Presets allow users to create automations without writing SDK code. The service generates the SDK boilerplate, packages it into a tarball, and runs it through the same dispatch pipeline as Phase 1.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Preset Types',
      },
      {
        type: 'table',
        headers: ['Preset', 'Endpoint', 'What user provides', 'What service generates'],
        rows: [
          ['Prompt', 'POST /api/automation/v1/preset/prompt', 'name, prompt text, trigger', 'main.py (SDK boilerplate), prompt.txt, setup.sh — packaged into a tarball'],
          ['Plugin', 'POST /api/automation/v1/preset/plugin', 'name, plugins (PluginSource[]), prompt, trigger', 'main.py (loads plugins + runs conversation), plugins_config.json, prompt.txt, setup.sh'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Generated Tarball Contents',
      },
      {
        type: 'table',
        headers: ['File', 'Purpose'],
        rows: [
          ['main.py', 'SDK boilerplate — fetches LLM config, secrets, MCP config; creates Conversation; executes prompt'],
          ['prompt.txt', 'User\'s prompt text'],
          ['plugins_config.json', '(Plugin preset only) — serialized PluginSource list'],
          ['setup.sh', 'SDK installation script'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Presets are the primary public-facing API. Custom SDK script uploads are supported but not prominently exposed while the infrastructure is being validated.',
      },
    ],
    codeExamples: [
      {
        language: 'json',
        label: 'Plugin preset request',
        code: `{
  "name": "PR Review Bot",
  "plugins": [
    {"source": "github:OpenHands/pr-review-plugin", "ref": "v1.0.0"}
  ],
  "prompt": "Review all Python files for code quality",
  "trigger": {"type": "cron", "schedule": "0 9 * * 1"}
}`,
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service/phase-2-events': {
    title: 'ADR-0002 · Phase 2: Event-Driven Triggers',
    description: 'GitHub webhooks and generic event triggers for automations.',
    route: '/arch-repo/decisions/0002-automations-service/phase-2-events',
    sections: [
      {
        type: 'paragraph',
        content: 'Phase 2 adds event-driven triggers. The SaaS server acts as an event proxy for GitHub App webhooks — it enriches the payload and forwards to the automation service. Generic webhooks go directly to the automation service.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'GitHub Webhook Flow',
      },
      {
        type: 'steps',
        steps: [
          { title: 'GitHub App → SaaS', content: 'GitHub sends webhook to SaaS server, which already handles GitHub events for the resolver bot.' },
          { title: 'SaaS preprocesses', content: 'Resolves GitHub org ID → OpenHands org_id (mapping only on SaaS side), looks up integration_id, checks access control (e.g. PR author is org member), injects metadata.' },
          { title: 'SaaS forwards to automation service', content: 'POST /api/automation/v1/events/{org_id}/{integration_id} with enriched payload.' },
          { title: 'Automation service matches', content: 'Queries DB for event-triggered automations in the org. Evaluates each automation\'s JMESPath conditions against the payload. For each match, inserts automation_run (PENDING).' },
          { title: 'Dispatcher', content: 'Same as Phase 1 — picks up PENDING run, dispatches to sandbox with event payload as AUTOMATION_EVENT_PAYLOAD env var.' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Trigger Condition Format (JMESPath)',
      },
      {
        type: 'paragraph',
        content: 'Event trigger conditions use JMESPath — a declarative query language for JSON. Simple key-value conditions handle common patterns; filters handle complex nested matching. All conditions and filters must pass for the automation to trigger.',
      },
    ],
    codeExamples: [
      {
        language: 'json',
        label: 'Event trigger config',
        code: `{
  "type": "event",
  "integration_id": "550e8400-e29b-41d4-a716-446655440000",
  "conditions": {
    "event_type": "pull_request",
    "action": ["opened", "synchronize", "ready_for_review"],
    "author_is_org_member": true
  },
  "filters": [
    "pull_request.base.ref == 'main'",
    "contains(pull_request.labels[].name, 'review-this')"
  ]
}`,
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service/design-decisions': {
    title: 'ADR-0002 · 5 Key Design Decisions',
    description: 'The core architectural choices made in the Automations Service design.',
    route: '/arch-repo/decisions/0002-automations-service/design-decisions',
    sections: [
      {
        type: 'table',
        headers: ['Decision', 'Choice', 'Why'],
        rows: [
          ['Scheduler location', 'In-process background task', 'No K8s CronJobs — spinning up a pod per trigger is wasteful. FOR UPDATE SKIP LOCKED provides multi-worker safety.'],
          ['Event queue', 'Postgres automation_runs table + polling', 'No external broker (Redis/Kafka/NATS). If outgrown, only the ingestion/queue layer swaps out — dispatch and storage logic stay the same.'],
          ['Run completion detection', 'Callback (push) not polling', 'SDK\'s OpenHandsCloudWorkspace sends POST …/runs/<id>/complete on exit. No per-run status polling needed. Staleness watchdog covers missed callbacks.'],
          ['Event ingestion endpoint', 'Single /events/{org_id}/{integration_id}', 'Unified endpoint for all sources. Custom webhooks send directly; SaaS proxies GitHub. integration_id identifies the source without relying on payload body.'],
          ['GitHub access control', 'SaaS server — not automation service', 'SaaS already has GitHub API credentials and org membership caches. Automation service stays clean and org-agnostic.'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Internal Tarball URL Scheme',
      },
      {
        type: 'table',
        headers: ['Scheme', 'How resolved'],
        rows: [
          ['oh-internal://uploads/{uuid}', 'Downloaded from GCS/S3 using TarballUpload record, then uploaded to sandbox via agent-server file API'],
          ['https://', 'Passed into sandbox; downloaded inside it via curl with size and timeout limits — avoids pulling untrusted files on the automation service'],
        ],
      },
    ],
  },

  '/arch-repo/decisions/0002-automations-service/implementation': {
    title: 'ADR-0002 · Reference Implementation',
    description: 'Key source files in the OpenHands/automation repo.',
    route: '/arch-repo/decisions/0002-automations-service/implementation',
    sections: [
      {
        type: 'paragraph',
        content: 'The automation service lives at github.com/OpenHands/automation. The implementation maps directly to the phases and design decisions described in this ADR.',
      },
      {
        type: 'table',
        headers: ['Component', 'Source file', 'Description'],
        rows: [
          ['FastAPI app & lifespan', 'automation/app.py', 'App startup, background task orchestration, route registration'],
          ['API routes (CRUD + callback)', 'automation/router.py', 'Automation CRUD, dispatch, run completion callback'],
          ['Preset routes', 'automation/preset_router.py', 'Prompt and plugin preset automation creation'],
          ['Upload routes', 'automation/uploads.py', 'Tarball upload with streaming to GCS/S3'],
          ['DB models', 'automation/models.py', 'Automation, AutomationRun, TarballUpload'],
          ['Pydantic schemas', 'automation/schemas.py', 'Request/response schemas, CronTrigger validation'],
          ['Scheduler', 'automation/scheduler.py', 'Cron polling with FOR UPDATE SKIP LOCKED'],
          ['Dispatcher', 'automation/dispatcher.py', 'PENDING → RUNNING, fire-and-forget sandbox dispatch'],
          ['Sandbox execution', 'automation/execution.py', 'Create sandbox → upload tarball → start entrypoint'],
          ['Watchdog', 'automation/watchdog.py', 'Stale run detection with sandbox verification'],
          ['Auth', 'automation/auth.py', 'API key validation with 20s in-memory TTL cache'],
          ['Preset SDK scripts', 'automation/presets/', 'SDK boilerplate that runs inside sandboxes'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Repo',
        code: 'git clone https://github.com/OpenHands/automation',
      },
    ],
  },

  '/arch-repo/product-design': {
    title: 'What are Product Design Projects?',
    description: 'PD-XXX documents — implementation-ready designs that require committer approval before merging.',
    route: '/arch-repo/product-design',
    sections: [
      {
        type: 'paragraph',
        content: 'Product Design projects (PD-XXX) are structured documents that describe a concrete feature or system change ready for implementation. A merged PD PR signals that the approach is approved — not necessarily that implementation has started.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'When to create a PD',
      },
      {
        type: 'list',
        items: [
          'Significant new features or subsystems that need cross-team alignment',
          'Changes that span multiple repositories and require committer sign-off',
          'Work that follows a research project (PR-XXX) and is ready to specify concretely',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Naming convention',
      },
      {
        type: 'table',
        headers: ['Part', 'Format', 'Example'],
        rows: [
          ['Prefix', 'PD-{number}', 'PD-005'],
          ['Name', '{descriptive-name} (lowercase, hyphens)', 'macos-remote-workspace'],
          ['Full path', 'docs/product/design/PD-XXX-name/README.md', 'docs/product/design/PD-005-macos-remote-workspace/README.md'],
        ],
      },
    ],
  },

  '/arch-repo/product-design/workflow': {
    title: 'PD Workflow',
    description: 'How to take a Product Design project from creation to approved merge.',
    route: '/arch-repo/product-design/workflow',
    sections: [
      {
        type: 'steps',
        steps: [
          { title: 'Check existing numbers', content: 'ls docs/product/design/ — use the next available PD-XXX number.' },
          { title: 'Create directory and copy template', content: 'mkdir -p docs/product/design/PD-XXX-name && cp .openhands/templates/design-template.md docs/product/design/PD-XXX-name/README.md' },
          { title: 'Fill in the template', content: 'Title, Problem Statement, Proposed Solution, User Interface / New Concepts (optional), Technical Design, Implementation Plan (milestone-based).' },
          { title: 'Identify reviewers', content: 'List required reviewers at the top — include committers from each impacted repository.' },
          { title: 'Create branch and commit', content: 'git checkout -b design/PD-XXX-name && git add . && git commit -m "Start PD-XXX: Title\\n\\n..."' },
          { title: 'Open a PR and request reviews', content: 'The design can be updated based on feedback. Merge only after approval from all required reviewers.' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 PD PRs should be more polished than research PRs. The implementation plan should be detailed enough for contributors to execute independently.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Create a new PD',
        code: `ls docs/product/design/   # find next number
mkdir -p docs/product/design/PD-005-macos-remote-workspace
cp .openhands/templates/design-template.md \\
   docs/product/design/PD-005-macos-remote-workspace/README.md
# Edit README.md — fill in all sections
git checkout -b design/PD-005-macos-remote-workspace
git add docs/product/design/PD-005-macos-remote-workspace/
git commit -m "Start PD-005: macOS Remote Workspace Extension"
git push -u origin design/PD-005-macos-remote-workspace`,
      },
    ],
  },

  '/arch-repo/product-design/review-requirements': {
    title: 'Review Requirements',
    description: 'Who must approve a Product Design PR before it can be merged.',
    route: '/arch-repo/product-design/review-requirements',
    sections: [
      {
        type: 'paragraph',
        content: 'Product Design PRs require approval from committers in each repository that will be impacted by the change. This ensures all stakeholders have agreed to the approach before implementation begins.',
      },
      {
        type: 'table',
        headers: ['Requirement', 'Details'],
        rows: [
          ['Committer approval', 'One approval from a committer in each impacted repository'],
          ['Technical review', 'The approach and implementation plan must be sound'],
          ['Consensus', 'Design is agreed upon before merging — no dissenting blockers'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Merging a design PR means the approach is approved, not that implementation is guaranteed to start immediately.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Reviewer section format',
      },
    ],
    codeExamples: [
      {
        language: 'markdown',
        label: 'Reviewers section at top of README',
        code: `## Reviewers

- [ ] @username1 (OpenHands committer)
- [ ] @username2 (software-agent-sdk committer)
- [ ] @username3 (automation committer)`,
      },
    ],
  },

  '/arch-repo/product-design/template': {
    title: 'Design Template Reference',
    description: 'The standard template for PD-XXX Product Design documents.',
    route: '/arch-repo/product-design/template',
    sections: [
      {
        type: 'table',
        headers: ['Section', 'Required?', 'Purpose'],
        rows: [
          ['1.1 Problem Statement', 'Yes', 'Factual, succinct description of the problem and its impact'],
          ['1.2 Proposed Solution', 'Yes', 'How the beneficiary experiences the benefit; then the technical choices'],
          ['2. User Interface / New Concepts', 'Optional', 'UX walkthrough or new system concepts; omit if not needed'],
          ['3. Other Context', 'Optional', 'Background on new technology/techniques the implementor needs'],
          ['4. Technical Design', 'Yes', 'Numbered subsections (4.1, 4.1.1…) with code examples, diagrams'],
          ['5. Implementation Plan', 'Yes', 'Milestone-based plan (M1, M2…) with file paths and acceptance criteria'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Organize milestones iteratively — foundational elements first, then expand to be more robust, functional, flexible, and scalable in later milestones.',
      },
    ],
  },

  '/arch-repo/product-design/creating': {
    title: 'How to Create a New Design Project',
    description: 'Use the new-design-project skill or follow the steps manually.',
    route: '/arch-repo/product-design/creating',
    sections: [
      {
        type: 'paragraph',
        content: 'The fastest way to start a new PD is via the new-design-project OpenHands skill, which automates all the scaffolding steps. You can also follow the steps manually.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Using the OpenHands skill',
      },
      {
        type: 'paragraph',
        content: 'Trigger the skill with "create design project" or "new PD-XXX". It will check for the next available number, create the directory, copy the template, and prompt you to fill in the details.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Manual steps',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Find next number', content: 'ls docs/product/design/ — pick the next PD-XXX' },
          { title: 'Create directory', content: 'mkdir -p docs/product/design/PD-XXX-{name}' },
          { title: 'Copy template', content: 'cp .openhands/templates/design-template.md docs/product/design/PD-XXX-{name}/README.md' },
          { title: 'Fill in template', content: 'Add reviewers section, Problem Statement, Proposed Solution, Technical Design, Implementation Plan' },
          { title: 'Create branch & commit', content: 'git checkout -b design/PD-XXX-{name}' },
          { title: 'Open PR for review', content: 'Request reviews from all listed committer reviewers' },
        ],
      },
    ],
  },

  '/arch-repo/research': {
    title: 'What are Research Projects?',
    description: 'PR-XXX documents — open-ended technical exploration with findings and recommendations.',
    route: '/arch-repo/research',
    sections: [
      {
        type: 'paragraph',
        content: 'Research projects (PR-XXX) capture open-ended technical exploration. They document research questions, methodology, findings, and recommendations. A completed PR often leads to a follow-up Product Design (PD) or implementation PR.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Key differences from PD',
      },
      {
        type: 'table',
        headers: ['Aspect', 'Research (PR)', 'Product Design (PD)'],
        rows: [
          ['Approval required?', 'No — optional reviewers', 'Yes — committer approval required'],
          ['Maturity', 'Exploratory — questions may be open', 'Concrete — implementation-ready'],
          ['Outcome', 'Findings + recommendations', 'Approved design + implementation plan'],
          ['Often leads to', 'A PD or implementation PR', 'Implementation'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Naming convention',
      },
      {
        type: 'table',
        headers: ['Part', 'Format', 'Example'],
        rows: [
          ['Prefix', 'PR-{number}', 'PR-003'],
          ['Name', '{descriptive-name} (lowercase, hyphens)', 'macos-account-pooling'],
          ['Full path', 'docs/product/research/PR-XXX-name/README.md', 'docs/product/research/PR-003-macos-account-pooling/README.md'],
        ],
      },
    ],
  },

  '/arch-repo/research/workflow': {
    title: 'Research (PR) Workflow',
    description: 'How to create, develop, and close a research project.',
    route: '/arch-repo/research/workflow',
    sections: [
      {
        type: 'steps',
        steps: [
          { title: 'Find next number', content: 'ls docs/product/research/ — pick the next PR-XXX' },
          { title: 'Create directory and copy template', content: 'mkdir -p docs/product/research/PR-XXX-name && cp .openhands/templates/research-template.md docs/product/research/PR-XXX-name/README.md' },
          { title: 'Fill in the template', content: 'Title, Problem Statement, Research Questions, Scope, Methodology' },
          { title: 'Create branch and commit', content: 'git checkout -b research/PR-XXX-name && git commit -m "Start PR-XXX: Title"' },
          { title: 'Open a PR — update as research progresses', content: 'The PR can be updated as research progresses. Merge when the research "chapter" is complete.' },
          { title: 'Link to follow-up work', content: 'After merging, update the README with links to any follow-up PD or implementation PRs.' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Research PRs can be merged without formal approval. Merging signals completion of a research phase — not approval of a design.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Create a research project',
        code: `ls docs/product/research/   # find next number
mkdir -p docs/product/research/PR-003-macos-account-pooling
cp .openhands/templates/research-template.md \\
   docs/product/research/PR-003-macos-account-pooling/README.md
# Edit README.md
git checkout -b research/PR-003-macos-account-pooling
git add docs/product/research/PR-003-macos-account-pooling/
git commit -m "Start PR-003: macOS Account Pooling"
git push -u origin research/PR-003-macos-account-pooling`,
      },
    ],
  },

  '/arch-repo/research/template': {
    title: 'Research Template Reference',
    description: 'The standard template for PR-XXX Research documents.',
    route: '/arch-repo/research/template',
    sections: [
      {
        type: 'table',
        headers: ['Section', 'Required?', 'Purpose'],
        rows: [
          ['Status', 'Yes', 'In Progress / Complete / Continued in [link]'],
          ['Problem Statement', 'Yes', 'What gap in understanding or capability are we addressing?'],
          ['Research Questions', 'Yes', 'Specific questions this research aims to answer'],
          ['Scope — In/Out of Scope', 'Yes', 'What this research covers and explicitly does not cover'],
          ['Methodology', 'Yes', 'Literature review / prototype / user interviews / competitive analysis'],
          ['Findings', 'Yes', 'Document findings as research progresses — use subsections per finding with evidence'],
          ['Analysis', 'Yes', 'Patterns, insights from findings'],
          ['Recommendations', 'Yes', 'Primary recommendation + alternatives considered'],
          ['Next Steps', 'Yes', 'Action items following the research'],
          ['References', 'Optional', 'Related ADRs, issues, external docs, prototypes'],
          ['Reviewers', 'Optional', 'Anyone who reviewed or contributed'],
        ],
      },
    ],
  },

  '/arch-repo/research/creating': {
    title: 'How to Create a New Research Project',
    description: 'Use the new-research-project OpenHands skill or follow the steps manually.',
    route: '/arch-repo/research/creating',
    sections: [
      {
        type: 'paragraph',
        content: 'The fastest way to start a new research project is via the new-research-project OpenHands skill — trigger it with "create research project" or "new PR-XXX". It handles scaffolding automatically.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Manual steps',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Find next number', content: 'ls docs/product/research/' },
          { title: 'Create directory', content: 'mkdir -p docs/product/research/PR-XXX-{name}' },
          { title: 'Copy template', content: 'cp .openhands/templates/research-template.md docs/product/research/PR-XXX-{name}/README.md' },
          { title: 'Fill in the template', content: 'Title (PR-XXX: descriptive), Problem Statement, Research Questions, Scope, Methodology' },
          { title: 'Create branch & commit', content: 'git checkout -b research/PR-XXX-{name} && git commit -m "Start PR-XXX: Title"' },
          { title: 'Open a PR', content: 'Update as research progresses; merge when the research chapter is complete' },
        ],
      },
    ],
  },

  '/arch-repo/process': {
    title: 'Engineering Processes',
    description: 'Engineering process documentation — how the team works.',
    route: '/arch-repo/process',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '📂 The docs/process/ directory is the home for engineering process documentation. This section will grow as processes are documented.',
      },
      {
        type: 'paragraph',
        content: 'Engineering process docs capture the how of the team\'s work — workflows, standards, runbooks, and operating procedures that are not ADRs or design/research projects.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What belongs in docs/process/',
      },
      {
        type: 'list',
        items: [
          'On-call and incident response processes',
          'Release and deployment workflows',
          'Code review guidelines',
          'On-boarding and off-boarding checklists',
          'Security and compliance procedures',
          'Any team working agreement not captured in ADRs',
        ],
      },
    ],
  },

  '/arch-repo/diagrams': {
    title: 'Diagrams',
    description: 'Architecture diagrams referenced from ADRs, Product Design, and Research documents.',
    route: '/arch-repo/diagrams',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '📂 The docs/diagrams/ directory holds diagrams that are referenced from other documents in this repo.',
      },
      {
        type: 'paragraph',
        content: 'Diagrams live in docs/diagrams/ and are referenced by relative path from ADRs, PD documents, and research documents. Keeping diagrams in a shared folder prevents duplication when the same diagram applies to multiple documents.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Recommended formats',
      },
      {
        type: 'table',
        headers: ['Format', 'Use case'],
        rows: [
          ['Mermaid (in-file)', 'Simple flowcharts and sequence diagrams — renders in GitHub and the docs site'],
          ['.png / .svg', 'Complex diagrams from Figma, Excalidraw, or draw.io — commit the source file alongside the export'],
          ['.drawio', 'Editable draw.io source — commit alongside the exported .png'],
        ],
      },
    ],
  },

  // ── Agent Canvas Pages ────────────────────────────────────────────────────

  '/agent-canvas': {
    title: 'What is Agent Canvas?',
    description: 'A self-hostable AI coding platform. Prompt agents manually, run them on a schedule, or trigger them from Slack, GitHub, or Datadog.',
    route: '/agent-canvas',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '🧪 Agent Canvas is currently in **Beta**. It is part of the OpenHands incubator program.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'What is Agent Canvas?',
      },
      {
        type: 'paragraph',
        content: 'Agent Canvas is a self-hostable AI coding platform built on the OpenHands Agent Server. It gives you a visual interface to run, monitor, and automate coding agents — whether they\'re running on your laptop, a dedicated VM, or in the cloud.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Three Ways to Use Agents',
      },
      {
        type: 'table',
        headers: ['Mode', 'Description'],
        rows: [
          ['⌨️ Manual', 'Prompt agents directly in the chat interface'],
          ['🕐 Scheduled', 'Run agents on a cron schedule (e.g. nightly dependency updates)'],
          ['⚡ Event-triggered', 'Trigger agents from Slack messages, GitHub webhooks, or Datadog alerts'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Run Agents Anywhere',
      },
      {
        type: 'list',
        items: [
          '🧑‍💻 On your laptop (with or without Docker sandbox)',
          '🖥️ On a remote virtual machine (DigitalOcean, AWS, GCP, Mac Mini)',
          '☁️ In OpenHands hosted cloud',
          '🏢 Inside your company\'s infrastructure',
        ],
      },
      {
        type: 'paragraph',
        content: 'The same Agent Canvas frontend can connect to multiple backends and switch between them from the UI — so you can see all your agents in one place.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Works with Any Model',
      },
      {
        type: 'table',
        headers: ['Category', 'Examples'],
        rows: [
          ['Agent Harnesses', 'Claude Code, Codex CLI, OpenHands Agent Server'],
          ['LLM Providers', 'Anthropic, OpenAI, Google Gemini, Mistral, Minimax, Kimi'],
          ['Local Models', 'Ollama (llama3, mistral, etc.)'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'npx (quickest)',
        code: `npm install -g @openhands/agent-canvas
agent-canvas`,
      },
      {
        language: 'bash',
        label: 'Docker (sandboxed)',
        code: `docker pull ghcr.io/openhands/agent-canvas:latest

export PROJECTS_PATH=~/projects

docker run -it --rm \\
  -p 8000:8000 \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -v \${PROJECTS_PATH}:/projects \\
  ghcr.io/openhands/agent-canvas:latest`,
      },
    ],
  },

  '/agent-canvas/architecture': {
    title: 'Architecture Overview',
    description: 'System boundaries, runtime services, and how Agent Canvas fits together.',
    route: '/agent-canvas/architecture',
    sections: [
      {
        type: 'paragraph',
        content: 'Agent Canvas is a React and TypeScript frontend for the OpenHands Agent Server. It does not execute agent actions directly — it translates UI interactions into Agent Server API calls and renders the results.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'System Boundaries',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Agent Canvas is responsible for',
      },
      {
        type: 'list',
        items: [
          'Rendering conversation, terminal, browser, files, settings, and automation UI',
          'Managing frontend state for conversations, backend selection, settings, profiles, and local metadata',
          'Translating UI actions into OpenHands Agent Server API calls',
          'Packaging the UI as a standalone app and as library entrypoints for host applications',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Agent Canvas is NOT responsible for',
      },
      {
        type: 'list',
        items: [
          'Executing agent actions directly',
          'Providing sandbox or workspace isolation',
          'Hosting LLM provider credentials outside the configured backend',
          'Running scheduled or event-triggered automations without an automation backend',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Runtime Services',
      },
      {
        type: 'table',
        headers: ['Service', 'Required?', 'Role'],
        rows: [
          ['OpenHands Agent Server', 'Yes', 'Primary backend — runs agents, manages conversations'],
          ['Ingress proxy (127.0.0.1:8000)', 'Yes (auto-started)', 'Routes frontend, Agent Server, and automation traffic to one origin'],
          ['Automation Server', 'Optional', 'Handles scheduled and event-triggered agent runs'],
          ['OpenHands Cloud APIs', 'Optional', 'Hosted sandbox and organization workflows'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Multi-Backend Architecture',
      },
      {
        type: 'paragraph',
        content: 'A single Agent Canvas frontend can connect to multiple Agent Server instances simultaneously — your laptop, a team VM, and OpenHands Cloud — and switch between them from the backend switcher in the UI.',
      },
    ],
  },

  '/agent-canvas/runtime-modes': {
    title: 'Runtime Modes',
    description: 'All dev and production run modes for Agent Canvas.',
    route: '/agent-canvas/runtime-modes',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Development Modes',
      },
      {
        type: 'table',
        headers: ['Command', 'What it does'],
        rows: [
          ['npm run dev', 'Full stack: UI + Agent Server + Automation backend + ingress proxy (recommended)'],
          ['npm run dev:docker', 'UI with Agent Server running inside a Docker sandbox (safer for laptops)'],
          ['npm run dev:minimal', 'UI + Agent Server only, no automation backend'],
          ['npm run dev:static', 'UI pointing at a separately managed backend on 127.0.0.1:8000'],
          ['npm run dev:automation', 'Full stack including automation backend'],
          ['npm run dev:mock', 'Frontend only, using MSW mocks (for UI development and tests)'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Production / Distribution',
      },
      {
        type: 'table',
        headers: ['Command', 'What it does'],
        rows: [
          ['npm run build', 'Build the standalone application'],
          ['npm run build:lib', 'Build library entrypoints for embedding Agent Canvas components'],
          ['npx @openhands/agent-canvas', 'Run via npx — no install required (no sandbox)'],
          ['docker run ghcr.io/openhands/agent-canvas', 'Run in Docker with sandbox isolation'],
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content: '⚠️ Modes without Docker give the agent full access to the host filesystem. Use Docker sandbox mode for shared machines.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Dev (recommended)',
        code: 'npm run dev',
      },
      {
        language: 'bash',
        label: 'Dev with Docker sandbox',
        code: 'npm run dev:docker',
      },
    ],
  },

  '/agent-canvas/getting-started/npx': {
    title: 'Quickstart — npx',
    description: 'Run Agent Canvas locally in seconds with no Docker required.',
    route: '/agent-canvas/getting-started/npx',
    sections: [
      {
        type: 'callout',
        variant: 'warning',
        content: '⚠️ This mode runs the agent server directly on your machine — the agent has full access to your filesystem. Use Docker mode for a safer setup.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Prerequisites',
      },
      {
        type: 'list',
        items: [
          'Node.js 22.12.x or later',
          '`uv` — install from astral.sh/uv',
          'An API key for a supported LLM provider',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Install and Run',
      },
      {
        type: 'paragraph',
        content: 'After startup, open http://localhost:8000 in your browser. The onboarding flow will walk you through connecting an LLM and starting your first conversation.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Global install',
        code: `npm install -g @openhands/agent-canvas
agent-canvas`,
      },
      {
        language: 'bash',
        label: 'Without install (npx)',
        code: 'npx @openhands/agent-canvas',
      },
    ],
  },

  '/agent-canvas/getting-started/docker': {
    title: 'Quickstart — Docker',
    description: 'Run Agent Canvas with a Docker sandbox for isolated, safer agent execution.',
    route: '/agent-canvas/getting-started/docker',
    sections: [
      {
        type: 'paragraph',
        content: 'The Docker mode runs the Agent Server inside a container. The agent can only access files under your configured PROJECTS_PATH — your host filesystem is otherwise protected.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Prerequisites',
      },
      {
        type: 'list',
        items: [
          'Docker Desktop (macOS/Windows) or Docker Engine (Linux)',
          'An API key for a supported LLM provider',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Run',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Configuration',
      },
      {
        type: 'table',
        headers: ['Volume', 'Purpose'],
        rows: [
          ['~/.openhands:/home/openhands/.openhands', 'Persists conversation history, settings, and secrets across restarts'],
          ['${PROJECTS_PATH}:/projects', 'The directory of projects the agent can access'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Docker run',
        code: `docker pull ghcr.io/openhands/agent-canvas:latest

export PROJECTS_PATH=~/projects

docker run -it --rm \\
  -p 8000:8000 \\
  -v ~/.openhands:/home/openhands/.openhands \\
  -v \${PROJECTS_PATH}:/projects \\
  ghcr.io/openhands/agent-canvas:latest`,
      },
    ],
  },

  '/agent-canvas/getting-started/from-source': {
    title: 'Quickstart — From Source',
    description: 'Clone and run Agent Canvas from the GitHub repository.',
    route: '/agent-canvas/getting-started/from-source',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Prerequisites',
      },
      {
        type: 'list',
        items: [
          'Node.js 22.12.x or later',
          '`npm`',
          '`uv` — for running the agent server via uvx',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Clone and Start',
      },
      {
        type: 'paragraph',
        content: 'This starts the full stack: UI (port 3001), Agent Server (port 18000), Automation backend (port 18001), and an ingress proxy on port 8000. Open http://localhost:8000 to access the UI.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Setup',
        code: `git clone https://github.com/OpenHands/agent-canvas.git
cd agent-canvas
npm install
npm run dev`,
      },
    ],
  },

  '/agent-canvas/getting-started/first-backend': {
    title: 'Connecting Your First Backend',
    description: 'Add and configure an Agent Server backend from the Agent Canvas UI.',
    route: '/agent-canvas/getting-started/first-backend',
    sections: [
      {
        type: 'paragraph',
        content: 'Agent Canvas supports multiple concurrent backends. Each backend is an OpenHands Agent Server running somewhere — your laptop, a remote VM, or OpenHands Cloud.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'From the UI',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Open the Backend panel', content: 'Click the backend selector in the top navigation bar' },
          { title: 'Click Add Backend', content: 'Enter the Agent Server URL (e.g. http://localhost:18000)' },
          { title: 'Set the API key', content: 'If your Agent Server requires a SESSION_API_KEY, enter it here' },
          { title: 'Save and switch', content: 'Select the new backend — the UI will immediately start using it' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Backend Types',
      },
      {
        type: 'table',
        headers: ['Backend', 'URL pattern', 'Notes'],
        rows: [
          ['Local (npm run dev)', 'http://localhost:8000', 'Auto-configured when using dev scripts'],
          ['Remote VM', 'http://your-vm-ip:8000', 'Requires firewall rules + SESSION_API_KEY'],
          ['OpenHands Cloud', 'app.all-hands.dev', 'Sign in with your account'],
        ],
      },
    ],
  },

  '/agent-canvas/automations': {
    title: 'What are Automations?',
    description: 'Scheduled and event-triggered agent runs — run agents without manual prompting.',
    route: '/agent-canvas/automations',
    sections: [
      {
        type: 'paragraph',
        content: 'Automations let you configure agents to run automatically — either on a schedule or in response to external events like a Slack message, a GitHub push, or a Datadog alert. They are powered by the Automation Server, which runs alongside the Agent Server.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Automation Types',
      },
      {
        type: 'table',
        headers: ['Type', 'Trigger', 'Example use case'],
        rows: [
          ['Scheduled', 'Cron expression', 'Run dependency updates every Monday at 9am'],
          ['Slack trigger', 'Message in a Slack channel', 'Agent responds to @openhands mentions'],
          ['GitHub trigger', 'PR opened / issue created', 'Auto-review every new pull request'],
          ['Datadog trigger', 'Alert fired', 'Agent investigates anomalous metrics'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Requirements',
      },
      {
        type: 'list',
        items: [
          'An Automation Server must be running (included in `npm run dev` and `npm run dev:automation`)',
          'Webhooks from external services must be routable to the Automation Server',
          'For production: deploy behind nginx with TLS (see Self-Hosting guide)',
        ],
      },
    ],
  },

  '/agent-canvas/automations/create': {
    title: 'Creating an Automation',
    description: 'Step-by-step guide to creating your first automation in Agent Canvas.',
    route: '/agent-canvas/automations/create',
    sections: [
      {
        type: 'steps',
        steps: [
          { title: 'Open Automations', content: 'Click "Automations" in the left sidebar' },
          { title: 'Click Create Automation', content: 'Opens the automation creation modal' },
          { title: 'Choose a trigger type', content: 'Select: Schedule, Slack, GitHub, or Datadog' },
          { title: 'Write the agent instructions', content: 'Describe what the agent should do when triggered — this becomes the conversation prompt' },
          { title: 'Select workspace', content: 'Choose which project directory the agent will work in' },
          { title: 'Save and enable', content: 'Toggle the automation to active — it will start running on its trigger schedule' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Write clear, specific instructions. The automation prompt is sent to the agent exactly as written — treat it like a well-crafted user message.',
      },
    ],
  },

  '/agent-canvas/automations/triggers': {
    title: 'Event Triggers',
    description: 'Trigger agents automatically from Slack, GitHub, or Datadog.',
    route: '/agent-canvas/automations/triggers',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Slack Trigger',
      },
      {
        type: 'paragraph',
        content: 'Configure a Slack webhook to fire the automation when a message is posted to a specific channel or when a keyword is mentioned.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'GitHub Trigger',
      },
      {
        type: 'paragraph',
        content: 'Set up a GitHub webhook pointing at your Automation Server. The agent can be triggered on pull_request, issues, push, or release events.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Datadog Trigger',
      },
      {
        type: 'paragraph',
        content: 'Configure a Datadog webhook monitor to POST to the automation endpoint when a metric alert fires. The agent receives the alert payload and investigates.',
      },
      {
        type: 'table',
        headers: ['Trigger', 'Webhook URL pattern', 'Payload format'],
        rows: [
          ['Slack', '/api/automation/slack', 'Slack Events API JSON'],
          ['GitHub', '/api/automation/github', 'GitHub webhook JSON'],
          ['Datadog', '/api/automation/datadog', 'Datadog monitor webhook JSON'],
        ],
      },
    ],
  },

  '/agent-canvas/self-hosting': {
    title: 'Self-Hosting Overview',
    description: 'Run Agent Canvas on a virtual machine so you can reach it from anywhere.',
    route: '/agent-canvas/self-hosting',
    sections: [
      {
        type: 'callout',
        variant: 'danger',
        content: '🔒 Agent Canvas drives an agent that can read and write the filesystem, execute shell commands, and reach the network. Lock down the VM before exposing it to the internet.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Deployment Model',
      },
      {
        type: 'paragraph',
        content: 'The recommended self-hosted setup runs all services on a single VM, fronted by nginx with TLS and HTTP Basic Auth. All backend services bind to 127.0.0.1 — nginx is the only internet-facing entry point.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Setup Steps',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Provision a machine', content: 'Any Linux VM: DigitalOcean, AWS EC2, GCP, Hetzner, or dedicated hardware like a Mac Mini. Ubuntu 24.04 LTS recommended.' },
          { title: 'Secure the machine', content: 'Lock down inbound traffic at the firewall. Only allow SSH from your IP. Block everything else.' },
          { title: 'Run the server', content: 'Clone the repo, npm install, npm run dev. All services bind to 127.0.0.1.' },
          { title: 'Add a domain (optional)', content: 'Point a domain at the VM, set up nginx + TLS + Basic Auth for access without SSH tunneling.' },
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Layered Security',
      },
      {
        type: 'table',
        headers: ['Layer', 'What it does'],
        rows: [
          ['Cloud/network firewall', 'Blocks all inbound except SSH from your IP by default'],
          ['SESSION_API_KEY on Agent Server', 'Every /api/* call must carry the matching X-Session-API-Key header — auto-generated on first run'],
          ['nginx HTTP Basic Auth (optional)', 'Username + password before any request reaches the app'],
        ],
      },
    ],
  },

  '/agent-canvas/self-hosting/nginx-tls': {
    title: '4 · Domain, nginx & TLS',
    description: 'Put nginx, Let\'s Encrypt TLS, and HTTP Basic Auth in front of Agent Canvas.',
    route: '/agent-canvas/self-hosting/nginx-tls',
    sections: [
      {
        type: 'paragraph',
        content: 'If you want to reach the UI from a browser without an SSH tunnel, point a domain at the VM and front it with nginx + TLS + HTTP Basic Auth.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Steps',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Point a domain', content: 'Create an A record pointing to the VM\'s public IPv4 (e.g. canvas.example.com)' },
          { title: 'Open ports 80 and 443', content: 'Port 80 must be world-open for Let\'s Encrypt HTTP-01 challenges. Port 443 should be restricted to your IP if possible.' },
          { title: 'Install nginx + certbot', content: 'apt-get install -y nginx certbot python3-certbot-nginx apache2-utils acl' },
          { title: 'Create Basic Auth user', content: 'htpasswd -c /root/.openhands/.htpasswd <username>' },
          { title: 'Add nginx config', content: 'Proxy all traffic to 127.0.0.1:8000 with auth_basic and WebSocket headers' },
          { title: 'Issue certificate', content: 'certbot --nginx -d canvas.example.com — auto-renews via systemd timer' },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'nginx',
        label: 'nginx site config',
        code: `server {
    listen 80;
    server_name canvas.example.com;

    location /.well-known/acme-challenge/ {
        auth_basic off;
        root /var/www/html;
    }

    location / {
        auth_basic "Restricted";
        auth_basic_user_file /root/.openhands/.htpasswd;

        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
    }
}`,
      },
      {
        language: 'bash',
        label: 'Issue cert',
        code: `certbot --nginx -d canvas.example.com \\
    --non-interactive --agree-tos \\
    --email you@example.com \\
    --redirect`,
      },
    ],
  },

  '/agent-canvas/embedding': {
    title: 'Embedding Agent Canvas',
    description: 'Use @openhands/agent-canvas as a component library in your own React app.',
    route: '/agent-canvas/embedding',
    sections: [
      {
        type: 'paragraph',
        content: 'Agent Canvas ships as an npm library with 7 embeddable subpath exports. You can embed individual UI panels — conversation view, file browser, terminal, settings, sidebar — directly into your own React application.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Available Exports',
      },
      {
        type: 'table',
        headers: ['Subpath', 'What it provides'],
        rows: [
          ['@openhands/agent-canvas/conversation', 'Full agent conversation UI with chat, event stream, and task tracking'],
          ['@openhands/agent-canvas/browser', 'Browser tab component showing live agent browser sessions'],
          ['@openhands/agent-canvas/files', 'File explorer and editor for the agent\'s workspace'],
          ['@openhands/agent-canvas/settings', 'LLM, agent, MCP, and secrets settings panels'],
          ['@openhands/agent-canvas/sidebar', 'Conversation list sidebar'],
          ['@openhands/agent-canvas/terminal', 'Terminal output tab'],
          ['@openhands/agent-canvas/i18n', 'Internationalization resources and generated bundles'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Build',
      },
      {
        type: 'paragraph',
        content: 'The library build is generated with `npm run build:lib`. TypeScript declarations are included.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Install',
        code: 'npm install @openhands/agent-canvas',
      },
      {
        language: 'tsx',
        label: 'Embed conversation',
        code: `import { ConversationPanel } from '@openhands/agent-canvas/conversation';

export function MyApp() {
  return (
    <ConversationPanel
      backendUrl="http://localhost:18000"
      sessionApiKey={process.env.SESSION_API_KEY}
    />
  );
}`,
      },
    ],
  },

  '/agent-canvas/configuration': {
    title: 'Environment Variables',
    description: 'All VITE_* and OH_* environment variables for configuring Agent Canvas.',
    route: '/agent-canvas/configuration',
    sections: [
      {
        type: 'paragraph',
        content: 'Copy .env.sample to .env and customize for your environment. Variables prefixed with VITE_ are compiled into the frontend bundle. Variables prefixed with OH_ control the dev launcher scripts.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Frontend Variables (VITE_*)',
      },
      {
        type: 'table',
        headers: ['Variable', 'Default', 'Description'],
        rows: [
          ['VITE_BACKEND_HOST', '127.0.0.1:8000', 'Host:port for the Vite dev proxy'],
          ['VITE_BACKEND_BASE_URL', 'http://127.0.0.1:8000', 'Base URL for browser-side direct requests'],
          ['VITE_SESSION_API_KEY', '(unset)', 'Must match SESSION_API_KEY / OH_SESSION_API_KEYS_0 on the backend'],
          ['VITE_WORKING_DIR', '(auto)', 'Base dir for per-conversation working directories'],
          ['VITE_FRONTEND_PORT', '3001', 'Port the Vite dev server listens on'],
          ['VITE_WORKER_URLS', '(unset)', 'Comma-separated worker URLs for the Browser tab'],
          ['VITE_ENABLE_BROWSER_TOOLS', 'true', 'Set to false to omit BrowserToolSet from new conversations'],
          ['VITE_LOAD_PUBLIC_SKILLS', 'true', 'Load public skills from github.com/OpenHands/extensions'],
          ['VITE_MOCK_API', 'false', 'Enable MSW mock API (for development and testing)'],
          ['VITE_USE_TLS', 'false', 'Use HTTPS/WSS for proxied backend connections'],
          ['VITE_INSECURE_SKIP_VERIFY', 'false', 'Skip TLS certificate verification'],
          ['VITE_APP_ENV', '(unset)', 'Set to "production" or "staging" only in real deployments'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Dev Launcher Variables (OH_*)',
      },
      {
        type: 'table',
        headers: ['Variable', 'Default', 'Description'],
        rows: [
          ['OH_CANVAS_SAFE_BACKEND_PORT', '18000', 'Port the Agent Server listens on'],
          ['OH_CANVAS_SAFE_VSCODE_PORT', '18001', 'Port forwarded to the embedded VS Code'],
          ['OH_CANVAS_SAFE_STATE_DIR', '~/.openhands/agent-canvas', 'Where conversations and bash events are stored'],
          ['OH_AGENT_SERVER_LOCAL_PATH', '(unset)', 'Absolute path to a local software-agent-sdk checkout'],
          ['OH_AGENT_SERVER_GIT_REF', '(unset)', 'Git commit SHA or branch to use for the Agent Server'],
          ['OH_AGENT_SERVER_VERSION', '(unset)', 'Specific PyPI version of the Agent Server'],
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: '.env',
        code: `# Copy .env.sample and customize
cp .env.sample .env

# Minimal setup for local dev
VITE_BACKEND_HOST="127.0.0.1:8000"
VITE_BACKEND_BASE_URL="http://127.0.0.1:8000"
VITE_FRONTEND_PORT="3001"`,
      },
    ],
  },

  '/agent-canvas/configuration/run-modes': {
    title: 'Run Mode Reference',
    description: 'All npm run scripts and what each one starts.',
    route: '/agent-canvas/configuration/run-modes',
    sections: [
      {
        type: 'table',
        headers: ['Script', 'Services started', 'Use case'],
        rows: [
          ['npm run dev', 'UI + Agent Server + Automation backend + ingress proxy', 'Default full-stack local development'],
          ['npm run dev:docker', 'UI + Docker-sandboxed Agent Server', 'Safer laptop development (agent isolated in Docker)'],
          ['npm run dev:minimal', 'UI + Agent Server only', 'Development without automation features'],
          ['npm run dev:static', 'UI only (points at external backend)', 'UI development against a separately managed backend'],
          ['npm run dev:automation', 'Full stack with automation backend', 'Testing automation triggers locally'],
          ['npm run dev:mock', 'UI only with MSW mocks', 'UI-only development, no backend needed'],
          ['npm run build', 'n/a', 'Production standalone app build'],
          ['npm run build:lib', 'n/a', 'Library build for embedding'],
          ['npm run test', 'n/a', 'Unit and component tests (Vitest)'],
          ['npm run test:e2e', 'n/a', 'End-to-end tests (Playwright)'],
          ['npm run test:e2e:snapshots', 'n/a', 'Visual snapshot tests'],
        ],
      },
    ],
  },

  '/agent-canvas/integrations/defenseclaw': {
    title: 'DefenseClaw Security Governance',
    description: 'Integrate DefenseClaw to scan skills, inspect LLM traffic, and audit agent actions.',
    route: '/agent-canvas/integrations/defenseclaw',
    sections: [
      {
        type: 'paragraph',
        content: 'DefenseClaw is a security governance layer for agentic AI runtimes. It scans skills and MCP servers, inspects LLM traffic at runtime, and produces durable audit evidence. The integration requires no code changes to Agent Canvas.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Integration Points',
      },
      {
        type: 'table',
        headers: ['Goal', 'Mechanism', 'Config change?'],
        rows: [
          ['Agent writes secure code by default', 'CodeGuard skill in .agents/skills/', 'Drop-in file — no'],
          ['Inspect all LLM prompts and responses', 'Guardrail proxy at localhost:4000 — set base_url', 'Yes — set LLM base_url'],
          ['Vet skills before loading', 'defenseclaw skill scan in CI/workflow', 'No'],
          ['Scan agent-generated code', 'defenseclaw codeguard scan <workspace>', 'No'],
          ['Audit trail and alerting', 'DefenseClaw TUI, OTLP, Splunk, webhooks', 'DefenseClaw config only'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quick Setup',
      },
      {
        type: 'steps',
        steps: [
          { title: 'Install DefenseClaw', content: 'curl -LsSf https://raw.githubusercontent.com/cisco-ai-defense/defenseclaw/main/scripts/install.sh | bash' },
          { title: 'Enable the guardrail proxy', content: 'defenseclaw init --enable-guardrail' },
          { title: 'Start the gateway sidecar', content: 'defenseclaw-gateway start' },
          { title: 'Point LLM base URL at the proxy', content: 'In Agent Canvas Settings → LLM → Base URL: http://localhost:4000' },
          { title: 'Load the CodeGuard skill', content: 'Copy skills/codeguard/SKILL.md into ~/.agents/skills/codeguard/SKILL.md' },
        ],
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Install DefenseClaw',
        code: `curl -LsSf https://raw.githubusercontent.com/cisco-ai-defense/defenseclaw/main/scripts/install.sh | bash
defenseclaw init --enable-guardrail
defenseclaw-gateway start`,
      },
      {
        language: 'bash',
        label: 'Load CodeGuard skill',
        code: `mkdir -p ~/.agents/skills/codeguard
curl -fsSL https://raw.githubusercontent.com/cisco-ai-defense/defenseclaw/main/skills/codeguard/SKILL.md \\
  -o ~/.agents/skills/codeguard/SKILL.md`,
      },
    ],
  },

  '/agent-canvas/contributing/dev-guide': {
    title: 'Development Guide',
    description: 'Set up a local Agent Canvas development environment from source.',
    route: '/agent-canvas/contributing/dev-guide',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Prerequisites',
      },
      {
        type: 'list',
        items: [
          'Node.js 22.12.x or later',
          'npm',
          'uv — python package manager used for the Agent Server (uvx)',
          'Docker (optional — required for dev:docker mode)',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Clone and Install',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Quality Gates',
      },
      {
        type: 'table',
        headers: ['Check', 'Command'],
        rows: [
          ['TypeScript', 'npm run typecheck'],
          ['ESLint + Prettier', 'npm run lint'],
          ['Unit tests (Vitest)', 'npm test'],
          ['E2E tests (Playwright)', 'npm run test:e2e'],
          ['Visual snapshots', 'npm run test:e2e:snapshots'],
          ['App build', 'npm run build'],
          ['Library build', 'npm run build:lib'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: '💡 Run npm run lint before pushing — CI will fail on typecheck, ESLint, or Prettier violations.',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        label: 'Setup',
        code: `git clone https://github.com/OpenHands/agent-canvas.git
cd agent-canvas
npm install
npm run dev`,
      },
      {
        language: 'bash',
        label: 'Test',
        code: `npm run lint     # typecheck + eslint + prettier
npm test         # vitest unit + component tests
npm run test:e2e # playwright E2E`,
      },
    ],
  },

  '/agent-canvas/contributing/architecture': {
    title: 'Code Architecture',
    description: 'Key source directories and their responsibilities in the Agent Canvas codebase.',
    route: '/agent-canvas/contributing/architecture',
    sections: [
      {
        type: 'heading',
        level: 2,
        content: 'Source Tree',
      },
      {
        type: 'table',
        headers: ['Directory', 'Responsibility'],
        rows: [
          ['src/api/', 'Service adapters for Agent Server, cloud APIs, settings, git, skills, automations, and backend registry'],
          ['src/components/', 'Route and feature UI — conversation, chat, browser, files, settings, backend, automation, onboarding'],
          ['src/routes/', 'React Router route components (one file per page/view)'],
          ['src/hooks/', 'Reusable React Query, state, and feature hooks'],
          ['src/stores/', 'Zustand state stores for conversation and UI state'],
          ['src/i18n/', 'Translation resources and generated bundles'],
          ['src/mocks/', 'MSW (Mock Service Worker) handlers for development and tests'],
          ['src/types/', 'Shared TypeScript type definitions'],
          ['bin/', 'CLI entry point (agent-canvas binary)'],
          ['scripts/', 'Dev stack launchers and build helpers'],
          ['__tests__/', 'Unit and component tests (mirrors src/ structure)'],
          ['tests/e2e/', 'Playwright end-to-end test suites'],
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Route Components',
      },
      {
        type: 'paragraph',
        content: 'Each view in the app corresponds to a route component in src/routes/. The main routes are: conversation (agent chat), automations-list, automation-detail, settings (llm, agent, mcp, secrets, condenser, verification, skills), and home.',
      },
    ],
  },

  '/agent-canvas/changelog': {
    title: 'Agent Canvas Changelog',
    description: 'Release history and notable changes for @openhands/agent-canvas.',
    route: '/agent-canvas/changelog',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '📋 Full release notes: github.com/OpenHands/agent-canvas/releases',
      },
      {
        type: 'heading',
        level: 2,
        content: 'v1.0.0-alpha.2 — 2025-05-11',
      },
      {
        type: 'list',
        items: [
          'Initial npm package release of @openhands/agent-canvas',
          'CLI entry point (npx @openhands/agent-canvas) to run full stack locally',
          'Library build mode with component barrel exports',
          'Subpath exports: /browser, /conversation, /files, /settings, /sidebar, /terminal, /i18n',
          'TypeScript type declarations',
          'GitHub Actions workflow for automated npm publishing (OIDC trusted publishing)',
        ],
      },
      {
        type: 'heading',
        level: 2,
        content: 'Versioning Policy',
      },
      {
        type: 'table',
        headers: ['Version bump', 'When'],
        rows: [
          ['MAJOR (x.0.0)', 'Breaking API or embedding interface changes'],
          ['MINOR (0.x.0)', 'New features, new exports, backwards-compatible'],
          ['PATCH (0.0.x)', 'Bug fixes, security patches, dependency updates'],
        ],
      },
    ],
  },

  '/sdk/changelog': {
    title: 'SDK Changelog',
    description: 'Release history and breaking changes for the OpenHands SDK.',
    route: '/sdk/changelog',
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '📋 For the full release history see github.com/OpenHands/software-agent-sdk/releases',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Latest Release',
      },
      {
        type: 'paragraph',
        content: 'Check the GitHub releases page for the most up-to-date changelog. The SDK follows semantic versioning — breaking changes only occur in major versions.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Versioning Policy',
      },
      {
        type: 'table',
        headers: ['Version bump', 'When'],
        rows: [
          ['MAJOR (x.0.0)', 'Breaking API changes'],
          ['MINOR (0.x.0)', 'New features, backwards-compatible'],
          ['PATCH (0.0.x)', 'Bug fixes, documentation updates'],
        ],
      },
    ],
  },
};

// Generate stub pages for routes not explicitly defined
export function getPage(route: string): PageContent {
  if (pages[route]) return pages[route];

  // Generate a stub page
  const title = route
    .split('/')
    .pop()!
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) || 'Documentation';

  return {
    title,
    description: `Documentation for ${title}`,
    route,
    sections: [
      {
        type: 'callout',
        variant: 'info',
        content: '📖 This page is part of the OpenHands documentation. Full content coming soon.',
      },
      {
        type: 'heading',
        level: 2,
        content: title,
      },
      {
        type: 'paragraph',
        content: `This section covers ${title.toLowerCase()} in OpenHands. Navigate using the left sidebar to explore related topics.`,
      },
    ],
  };
}
