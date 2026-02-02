import * as vscode from 'vscode';

const API_KEY_SECRET = 'openhands-api-key';
const SERVER_URL_KEY = 'openhands.serverUrl';

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

  async setApiKey(apiKey: string): Promise<void> {
    await this.context.secrets.store(API_KEY_SECRET, apiKey);
    this._onDidChangeAuth.fire();
  }

  async clearApiKey(): Promise<void> {
    await this.context.secrets.delete(API_KEY_SECRET);
    this._onDidChangeAuth.fire();
  }

  async isAuthenticated(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return !!apiKey && apiKey.length > 0;
  }

  getServerUrl(): string {
    const config = vscode.workspace.getConfiguration('openhands');
    return config.get<string>('serverUrl') || 'http://localhost:3000';
  }

  async setServerUrl(url: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('openhands');
    await config.update('serverUrl', url, vscode.ConfigurationTarget.Global);
    this._onDidChangeAuth.fire();
  }

  async promptForApiKey(): Promise<boolean> {
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

  async promptForServerUrl(): Promise<boolean> {
    const currentUrl = this.getServerUrl();
    const serverUrl = await vscode.window.showInputBox({
      prompt: 'Enter your OpenHands server URL',
      value: currentUrl,
      placeHolder: 'http://localhost:3000',
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
      'OpenHands API key not configured. Would you like to set it now?',
      'Set API Key',
      'Cancel'
    );

    if (action === 'Set API Key') {
      return this.promptForApiKey();
    }
    return false;
  }

  getAuthHeaders(): Record<string, string> {
    return {};
  }

  async getAuthHeadersAsync(): Promise<Record<string, string>> {
    const apiKey = await this.getApiKey();
    if (apiKey) {
      return {
        'Authorization': `Bearer ${apiKey}`
      };
    }
    return {};
  }
}
