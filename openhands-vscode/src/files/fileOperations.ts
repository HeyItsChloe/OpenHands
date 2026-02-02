import * as vscode from 'vscode';
import * as path from 'path';
import { FileContext } from '../api';

export class FileOperationsService {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  private log(message: string): void {
    this.outputChannel.appendLine(`[FileOps] ${message}`);
  }

  async readFile(filePath: string): Promise<string> {
    const uri = this.resolveUri(filePath);
    this.log(`Reading file: ${uri.fsPath}`);
    
    const content = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(content).toString('utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const uri = this.resolveUri(filePath);
    this.log(`Writing file: ${uri.fsPath}`);
    
    const buffer = Buffer.from(content, 'utf-8');
    await vscode.workspace.fs.writeFile(uri, buffer);
  }

  async writeFileWithConfirmation(filePath: string, content: string): Promise<boolean> {
    const uri = this.resolveUri(filePath);
    
    // Check if file exists
    let existingContent: string | null = null;
    try {
      existingContent = await this.readFile(filePath);
    } catch {
      // File doesn't exist, that's fine
    }

    if (existingContent !== null) {
      // Show diff
      const confirmed = await this.showDiffAndConfirm(uri, existingContent, content);
      if (!confirmed) {
        this.log(`User cancelled file write: ${filePath}`);
        return false;
      }
    }

    await this.writeFile(filePath, content);
    return true;
  }

  private async showDiffAndConfirm(
    uri: vscode.Uri,
    oldContent: string,
    newContent: string
  ): Promise<boolean> {
    // Create a temporary file for the new content
    const tempUri = uri.with({ scheme: 'untitled', path: uri.path + '.new' });
    
    // Show diff view
    const title = `${path.basename(uri.fsPath)} (OpenHands Changes)`;
    
    // For now, just show a confirmation dialog
    // In a full implementation, we'd show a proper diff editor
    const action = await vscode.window.showInformationMessage(
      `OpenHands wants to modify: ${path.basename(uri.fsPath)}`,
      { modal: true },
      'Apply Changes',
      'View Diff',
      'Cancel'
    );

    if (action === 'Apply Changes') {
      return true;
    } else if (action === 'View Diff') {
      // Open a diff view
      await this.openDiffView(uri, oldContent, newContent);
      
      // Ask again after viewing diff
      const confirmAction = await vscode.window.showInformationMessage(
        'Apply these changes?',
        'Apply',
        'Cancel'
      );
      return confirmAction === 'Apply';
    }

    return false;
  }

  private async openDiffView(
    originalUri: vscode.Uri,
    oldContent: string,
    newContent: string
  ): Promise<void> {
    // Create virtual documents for diff view
    const oldUri = vscode.Uri.parse(`openhands-diff:${originalUri.path}?version=old`);
    const newUri = vscode.Uri.parse(`openhands-diff:${originalUri.path}?version=new`);

    // Store content for the text document provider (would need to implement this)
    // For POC, just show the new content in a new editor
    const doc = await vscode.workspace.openTextDocument({
      content: newContent,
      language: this.detectLanguage(originalUri.fsPath)
    });
    
    await vscode.window.showTextDocument(doc, {
      preview: true,
      viewColumn: vscode.ViewColumn.Beside
    });
  }

  async createFile(filePath: string, content: string): Promise<void> {
    const uri = this.resolveUri(filePath);
    this.log(`Creating file: ${uri.fsPath}`);
    
    // Create parent directories if needed
    const dirUri = vscode.Uri.file(path.dirname(uri.fsPath));
    try {
      await vscode.workspace.fs.createDirectory(dirUri);
    } catch {
      // Directory might already exist
    }

    await this.writeFile(filePath, content);
  }

  async deleteFile(filePath: string): Promise<void> {
    const uri = this.resolveUri(filePath);
    this.log(`Deleting file: ${uri.fsPath}`);
    
    await vscode.workspace.fs.delete(uri);
  }

  async fileExists(filePath: string): Promise<boolean> {
    const uri = this.resolveUri(filePath);
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }

  getCurrentFileContext(): FileContext | null {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    const document = editor.document;
    const selection = editor.selection;

    const context: FileContext = {
      path: document.uri.fsPath,
      content: document.getText(),
      language: document.languageId
    };

    if (!selection.isEmpty) {
      context.selection = {
        startLine: selection.start.line + 1,
        endLine: selection.end.line + 1,
        text: document.getText(selection)
      };
    }

    return context;
  }

  async getFileContextForUri(uri: vscode.Uri): Promise<FileContext | null> {
    try {
      const content = await this.readFile(uri.fsPath);
      return {
        path: uri.fsPath,
        content,
        language: this.detectLanguage(uri.fsPath)
      };
    } catch {
      return null;
    }
  }

  getWorkspaceRoot(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      return folders[0].uri.fsPath;
    }
    return null;
  }

  private resolveUri(filePath: string): vscode.Uri {
    if (path.isAbsolute(filePath)) {
      return vscode.Uri.file(filePath);
    }

    const workspaceRoot = this.getWorkspaceRoot();
    if (workspaceRoot) {
      return vscode.Uri.file(path.join(workspaceRoot, filePath));
    }

    return vscode.Uri.file(filePath);
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescriptreact',
      '.js': 'javascript',
      '.jsx': 'javascriptreact',
      '.py': 'python',
      '.rs': 'rust',
      '.go': 'go',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'c',
      '.hpp': 'cpp',
      '.cs': 'csharp',
      '.rb': 'ruby',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'shellscript',
      '.bash': 'shellscript',
    };

    return languageMap[ext] || 'plaintext';
  }
}
