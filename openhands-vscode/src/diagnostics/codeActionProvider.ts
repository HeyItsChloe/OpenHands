import * as vscode from 'vscode';

export class OpenHandsCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Create "Fix with OpenHands" action for each diagnostic
    for (const diagnostic of context.diagnostics) {
      const action = this.createFixAction(document, diagnostic);
      actions.push(action);
    }

    return actions;
  }

  private createFixAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      `Fix with OpenHands: ${this.truncateMessage(diagnostic.message)}`,
      vscode.CodeActionKind.QuickFix
    );

    action.command = {
      command: 'openhands.fixDiagnostic',
      title: 'Fix with OpenHands',
      arguments: [document.uri, diagnostic]
    };

    action.diagnostics = [diagnostic];
    action.isPreferred = false;

    return action;
  }

  private truncateMessage(message: string, maxLength: number = 50): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }
}

export class DiagnosticsService {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  buildFixPrompt(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): { message: string; context: { path: string; content: string; selection: { startLine: number; endLine: number; text: string }; language: string } } {
    const range = diagnostic.range;
    
    // Get surrounding context (5 lines before and after the error)
    const startLine = Math.max(0, range.start.line - 5);
    const endLine = Math.min(document.lineCount - 1, range.end.line + 5);
    
    const contextRange = new vscode.Range(
      new vscode.Position(startLine, 0),
      new vscode.Position(endLine, document.lineAt(endLine).text.length)
    );
    
    const contextText = document.getText(contextRange);
    const errorLine = range.start.line + 1;

    // Build the prompt
    const message = this.formatFixPrompt(diagnostic, errorLine);

    return {
      message,
      context: {
        path: document.uri.fsPath,
        content: document.getText(),
        selection: {
          startLine: startLine + 1,
          endLine: endLine + 1,
          text: contextText
        },
        language: document.languageId
      }
    };
  }

  private formatFixPrompt(diagnostic: vscode.Diagnostic, errorLine: number): string {
    const severity = this.getSeverityString(diagnostic.severity);
    const source = diagnostic.source ? ` [${diagnostic.source}]` : '';
    const code = diagnostic.code 
      ? ` (${typeof diagnostic.code === 'object' ? diagnostic.code.value : diagnostic.code})`
      : '';

    return `Please fix this ${severity}${source}${code} on line ${errorLine}:

**Error:** ${diagnostic.message}

Analyze the code context and provide a fix. Explain what's wrong and show the corrected code.`;
  }

  private getSeverityString(severity: vscode.DiagnosticSeverity | undefined): string {
    switch (severity) {
      case vscode.DiagnosticSeverity.Error:
        return 'error';
      case vscode.DiagnosticSeverity.Warning:
        return 'warning';
      case vscode.DiagnosticSeverity.Information:
        return 'info';
      case vscode.DiagnosticSeverity.Hint:
        return 'hint';
      default:
        return 'issue';
    }
  }

  getDiagnosticsForDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
    return vscode.languages.getDiagnostics(document.uri);
  }

  getDiagnosticsAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Diagnostic[] {
    const diagnostics = this.getDiagnosticsForDocument(document);
    return diagnostics.filter(d => d.range.contains(position));
  }
}
