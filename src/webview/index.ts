import * as vscode from 'vscode';
import { WebviewToVSEvent } from '../types';
import { killRunning } from '../runs/executions';
import path from 'path';

let resultsPanel: vscode.WebviewPanel | undefined;

/**
 * Creates a 2x1 grid 0.75+0.25
 */
const createLayout = (): Thenable<void> => {
    return vscode.commands.executeCommand('vscode.setEditorLayout', {
        orientation: 0,
        groups: [
            { groups: [{}], size: 0.75 },
            { groups: [{}], size: 0.25 },
        ],
    });
};

export const initializeWebView = (): void => {
    console.log('Initializing webview');
    resultsPanel = vscode.window.createWebviewPanel(
        'evalResults',
        'Judge Results',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        },
    );

    resultsPanel.onDidDispose(() => {
        resultsPanel = undefined;
    });
};

const setupMessageListeners = (): void => {
    if (resultsPanel === undefined) {
        console.warn(
            "Failed to set up message listeners for web view because it's undefined",
        );
        return;
    }
    // Events from WebView to Extension
    resultsPanel.webview.onDidReceiveMessage((message: WebviewToVSEvent) => {
        switch (message.command) {
            case 'run-all-and-save': {
                break;
            }
            case 'run-single-and-save': {
                break;
            }
            case 'kill-running': {
                killRunning();
                break;
            }
            default: {
                console.log('Unknown event received from webview');
            }
        }
    });
};

export const startWebVeiw = (): void => {
    if (resultsPanel !== undefined) {
        initializeWebView();
        createLayout();
        setupMessageListeners();
    } else {
        console.log('Webivew exists - skipping creation');
    }
};

export const setBaseWebViewHTML = (context: vscode.ExtensionContext): void => {
    if (resultsPanel === undefined) {
        throw new Error('Webview is undefined');
        console.error('Webview us undefined');
    }
    const appScript = resultsPanel.webview.asWebviewUri(
        vscode.Uri.file(
            path.join(context.extensionPath, 'dist', 'frontend.module.js'),
        ),
    );
    console.log(appScript);
    const html = `<!DOCTYPE html lang="EN">
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body>
  <div id="app"></div>
  <script src="${appScript}"></script>
</body>

</html>
`;
    resultsPanel.webview.html = html;
};
