import * as vscode from 'vscode';
import { AuthService } from './auth';
import { OpenHandsClient } from './api';
import { ChatViewProvider } from './chat';
import { FileOperationsService } from './files';
import { OpenHandsCodeActionProvider, DiagnosticsService } from './diagnostics';

let outputChannel: vscode.OutputChannel;
let authService: AuthService;
let client: OpenHandsClient;
let fileOps: FileOperationsService;
let diagnosticsService: DiagnosticsService;
let chatViewProvider: ChatViewProvider;

export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  outputChannel = vscode.window.createOutputChannel('OpenHands');
  outputChannel.appendLine('OpenHands extension activating...');

  // Initialize services
  authService = new AuthService(context);
  client = new OpenHandsClient(authService, outputChannel);
  fileOps = new FileOperationsService(outputChannel);
  diagnosticsService = new DiagnosticsService(outputChannel);

  // Initialize chat view provider
  chatViewProvider = new ChatViewProvider(
    context.extensionUri,
    client,
    authService,
    fileOps,
    outputChannel
  );

  // Register chat view
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatViewProvider.viewType,
      chatViewProvider
    )
  );

  // Register auth commands
  context.subscriptions.push(
    vscode.commands.registerCommand('openhands.setApiKey', async () => {
      await authService.promptForApiKey();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openhands.setServerUrl', async () => {
      await authService.promptForServerUrl();
    })
  );

  // Register chat commands
  context.subscriptions.push(
    vscode.commands.registerCommand('openhands.openChat', async () => {
      await vscode.commands.executeCommand('openhands.chat.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openhands.clearChat', () => {
      chatViewProvider.clearChat();
    })
  );

  // Register code action provider for quick fixes
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file' },
      new OpenHandsCodeActionProvider(),
      {
        providedCodeActionKinds: OpenHandsCodeActionProvider.providedCodeActionKinds
      }
    )
  );

  // Register fix diagnostic command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'openhands.fixDiagnostic',
      async (uri: vscode.Uri, diagnostic: vscode.Diagnostic) => {
        await handleFixDiagnostic(uri, diagnostic);
      }
    )
  );

  // Register context menu commands
  context.subscriptions.push(
    vscode.commands.registerCommand('openhands.explainCode', async () => {
      await handleExplainCode();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openhands.improveCode', async () => {
      await handleImproveCode();
    })
  );

  // Show status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(hubot) OpenHands';
  statusBarItem.tooltip = 'OpenHands AI Assistant';
  statusBarItem.command = 'openhands.openChat';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Update status bar based on auth state
  authService.onDidChangeAuth(async () => {
    const isAuth = await authService.isAuthenticated();
    statusBarItem.text = isAuth ? '$(hubot) OpenHands' : '$(hubot) OpenHands (Not configured)';
  });

  outputChannel.appendLine('OpenHands extension activated!');
}

async function handleFixDiagnostic(uri: vscode.Uri, diagnostic: vscode.Diagnostic) {
  outputChannel.appendLine(`Fixing diagnostic: ${diagnostic.message}`);

  // Ensure authenticated
  if (!await authService.ensureAuthenticated()) {
    return;
  }

  // Get the document
  const document = await vscode.workspace.openTextDocument(uri);
  
  // Build the fix prompt
  const { message, context } = diagnosticsService.buildFixPrompt(document, diagnostic);

  // Send to chat
  await chatViewProvider.sendMessageWithContext(message, context);
}

async function handleExplainCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('Please select some code to explain');
    return;
  }

  const context = fileOps.getCurrentFileContext();
  if (!context) {
    return;
  }

  const message = 'Please explain what this code does, step by step:';
  await chatViewProvider.sendMessageWithContext(message, context);
}

async function handleImproveCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('Please select some code to improve');
    return;
  }

  const context = fileOps.getCurrentFileContext();
  if (!context) {
    return;
  }

  const message = 'Please review this code and suggest improvements for better readability, performance, or best practices:';
  await chatViewProvider.sendMessageWithContext(message, context);
}

export function deactivate() {
  outputChannel?.appendLine('OpenHands extension deactivating...');
  outputChannel?.dispose();
}
