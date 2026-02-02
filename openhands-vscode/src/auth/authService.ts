import * as vscode from 'vscode';

const API_KEY_SECRET = 'openhands-api-key';
const SESSION_TOKEN_SECRET = 'openhands-session-token';
const SERVER_URL_KEY = 'openhands.serverUrl';

export type AuthMethod = 'bearer' | 'cookie';

export class AuthService {
  private context: vscode.ExtensionContext;
  private _onDidChangeAuth = new vscode.EventEmitter<void>();
  readonly onDidChangeAuth = this._onDidChangeAuth.event;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async getApiKey(): Promise<string | undefined> {
    return this.context.secrets.get(API_KEY_SECRET);
  }

  async getSessionToken(): Promise<string | undefined> {
    return this.context.secrets.get(SESSION_TOKEN_SECRET);
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.context.secrets.store(API_KEY_SECRET, apiKey);
    this._onDidChangeAuth.fire();
  }

  async setSessionToken(token: string): Promise<void> {
    await this.context.secrets.store(SESSION_TOKEN_SECRET, token);
    this._onDidChangeAuth.fire();
  }

  async clearApiKey(): Promise<void> {
    await this.context.secrets.delete(API_KEY_SECRET);
    await this.context.secrets.delete(SESSION_TOKEN_SECRET);
    this._onDidChangeAuth.fire();
  }

  async isAuthenticated(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    const sessionToken = await this.getSessionToken();
    return (!!apiKey && apiKey.length > 0) || (!!sessionToken && sessionToken.length > 0);
  }

  getServerUrl(): string {
    const config = vscode.workspace.getConfiguration('openhands');
    return config.get<string>('serverUrl') || 'http://localhost:3000';
  }

  isCloudServer(): boolean {
    const url = this.getServerUrl();
    return url.includes('app.all-hands.dev') || url.includes('openhands.dev');
  }

  async setServerUrl(url: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('openhands');
    await config.update('serverUrl', url, vscode.ConfigurationTarget.Global);
    this._onDidChangeAuth.fire();
  }

  async promptForApiKey(): Promise<boolean> {
    const isCloud = this.isCloudServer();
    
    if (isCloud) {
      return this.promptForSessionToken();
    }

    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenHands API Key',
      password: true,
      placeHolder: 'sk-...',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'API key cannot be empty';
        }
        return null;
      }
    });

    if (apiKey) {
      await this.setApiKey(apiKey.trim());
      vscode.window.showInformationMessage('OpenHands API key saved successfully!');
      return true;
    }
    return false;
  }

  async promptForSessionToken(): Promise<boolean> {
    const instructions = await vscode.window.showInformationMessage(
      'To authenticate with OpenHands Cloud:\n' +
      '1. Go to app.all-hands.dev and log in\n' +
      '2. Open DevTools (Cmd+Option+I)\n' +
      '3. Go to Application > Cookies\n' +
      '4. Copy the "token" cookie value',
      'I have the token',
      'Cancel'
    );

    if (instructions !== 'I have the token') {
      return false;
    }

    const token = await vscode.window.showInputBox({
      prompt: 'Paste your session token from the browser cookie',
      password: true,
      placeHolder: 'eyJ...',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Token cannot be empty';
        }
        return null;
      }
    });

    if (token) {
      await this.setSessionToken(token.trim());
      vscode.window.showInformationMessage('OpenHands session token saved successfully!');
      return true;
    }
    return false;
  }

  async promptForServerUrl(): Promise<boolean> {
    const currentUrl = this.getServerUrl();
    const serverUrl = await vscode.window.showInputBox({
      prompt: 'Enter your OpenHands server URL',
      value: currentUrl,
      placeHolder: 'http://localhost:3000 or https://app.all-hands.dev',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Server URL cannot be empty';
        }
        try {
          new URL(value);
          return null;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    });

    if (serverUrl) {
      await this.setServerUrl(serverUrl.trim());
      vscode.window.showInformationMessage(`OpenHands server URL set to: ${serverUrl}`);
      return true;
    }
    return false;
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (await this.isAuthenticated()) {
      return true;
    }

    const action = await vscode.window.showWarningMessage(
      'OpenHands authentication not configured. Would you like to set it now?',
      'Configure Auth',
      'Cancel'
    );

    if (action === 'Configure Auth') {
      return this.promptForApiKey();
    }
    return false;
  }

  getAuthHeaders(): Record<string, string> {
    return {};
  }

  async getAuthHeadersAsync(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    
    // Try API key first (works for both cloud and self-hosted)
    const apiKey = await this.getApiKey();
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      return headers;
    }
    
    // Fall back to session token for cloud
    if (this.isCloudServer()) {
      const sessionToken = await this.getSessionToken();
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
    }
    
    return headers;
  }
}
