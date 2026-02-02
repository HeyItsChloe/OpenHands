# OpenHands VS Code Extension

AI-powered coding assistant that brings OpenHands capabilities directly into VS Code.

## Features

### 💬 Chat Panel
- Chat with OpenHands AI directly in the sidebar
- Get help with code explanations, debugging, and suggestions
- Streaming responses for real-time feedback

### 🔧 Quick Fixes
- "Fix with OpenHands" action appears on all diagnostics (errors, warnings)
- Click to send the error context to OpenHands for automatic fix suggestions

### 📁 File Operations
- OpenHands can read and write files in your workspace
- Preview changes before applying them
- Supports diff view for reviewing modifications

### 🎯 Context Menu Actions
- **Explain Code**: Select code and get a detailed explanation
- **Improve Code**: Get suggestions for better code quality

## Getting Started

### Prerequisites
- VS Code 1.85.0 or higher
- An OpenHands server running (local or cloud)
- OpenHands API key

### Installation

1. Install the extension from the VS Code Marketplace (or install from VSIX)
2. Set your API key: `Cmd/Ctrl+Shift+P` → "OpenHands: Set API Key"
3. (Optional) Configure server URL: `Cmd/Ctrl+Shift+P` → "OpenHands: Set Server URL"

### Usage

#### Chat
1. Click the OpenHands icon in the Activity Bar
2. Type your message and press Enter or click Send
3. View streaming responses in real-time

#### Fix Errors
1. Hover over an error in your code
2. Click "Quick Fix..." or press `Cmd/Ctrl+.`
3. Select "Fix with OpenHands"
4. Review the suggested fix in the chat panel

#### Explain/Improve Code
1. Select code in the editor
2. Right-click and choose "OpenHands: Explain Selected Code" or "OpenHands: Improve Selected Code"

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `openhands.serverUrl` | OpenHands server URL | `http://localhost:3000` |
| `openhands.autoApplyFixes` | Auto-apply fixes without confirmation | `false` |

## Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Ctrl+Shift+O` / `Cmd+Shift+O` | Open Chat Panel |

## Development

### Building from Source

```bash
cd openhands-vscode
npm install
npm run compile
```

### Running in Development

1. Open the `openhands-vscode` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. The extension will be available in the new VS Code window

### Packaging

```bash
npm run package
```

This creates a `.vsix` file that can be installed manually.

## Architecture

```
src/
├── extension.ts        # Main entry point
├── auth/               # API key storage and authentication
├── api/                # OpenHands API client
├── chat/               # Chat panel webview
├── files/              # File read/write operations
└── diagnostics/        # Quick fix code actions
```

## Contributing

Contributions are welcome! Please see the main [OpenHands Contributing Guide](../CONTRIBUTING.md).

## License

MIT - See [LICENSE](../LICENSE) for details.
