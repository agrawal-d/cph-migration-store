import * as vscode from 'vscode';
import { WebviewToVSEvent, Problem, VSToWebViewMessage } from '../types';
import { killRunning } from '../runs/executions';
import path from 'path';
import { runSingleAndSave } from './runSingleAndSave';

let resultsPanel: vscode.WebviewPanel | undefined;
let problemName = '';
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
        clearProblemName();
    });
};

/**
 * Setup and handle events from WebView to Extension
 */
const setupListnersWebViewToExtension = (): void => {
    if (resultsPanel === undefined) {
        console.warn(
            "Failed to set up message listeners for web view because it's undefined",
        );
        return;
    }
    // Events from WebView to Extension
    resultsPanel.webview.onDidReceiveMessage(
        async (message: WebviewToVSEvent) => {
            switch (message.command) {
                case 'run-all-and-save': {
                    break;
                }
                case 'run-single-and-save': {
                    const problem = message.problem;
                    const id = message.id;
                    runSingleAndSave(problem, id);
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
        },
    );
};

/**
 * Create and show an empty webview if one is not already open.
 */
export const startWebVeiwIfNotActive = (): void => {
    if (resultsPanel === undefined) {
        initializeWebView();
        createLayout();
        setupListnersWebViewToExtension();
    } else {
        console.log('Webivew exists - skipping creation');
    }
};

export const getExtensionResource = (
    context: vscode.ExtensionContext,
    ...args: string[]
): vscode.Uri => {
    if (resultsPanel === undefined) {
        console.error('Webview us undefined');
        throw new Error('Webview is undefined');
    }

    return resultsPanel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, ...args)),
    );
};

export const setBaseWebViewHTML = (
    context: vscode.ExtensionContext,
    problem: Problem,
): void => {
    problemName = problem.name;
    if (resultsPanel === undefined) {
        console.error('Webview us undefined');
        throw new Error('Webview is undefined');
    }
    const appScript = getExtensionResource(
        context,
        'dist',
        'frontend.module.js',
    );
    const appCss = getExtensionResource(context, 'dist', 'app.css');
    const html = `
<!DOCTYPE html lang="EN">
<html>
<head>
<link rel="stylesheet" href="${appCss}">
<meta charset="UTF-8" />
</head>
<body>
<div id="problem">
${JSON.stringify(problem)}
</div>
<div id="app">Loading...</div>
<script src="${appScript}"></script>
</body>
</html>
`;
    resultsPanel.webview.html = html;
};

/**
 *
 * Posts a message to the webview if present.
 *
 * @param message The message to be posted
 */
export const extensionToWebWiewMessage = async (
    message: VSToWebViewMessage,
) => {
    if (!resultsPanel) {
        console.error(
            'Trying to post message to non existent webview',
            message,
        );
        return;
    }
    await resultsPanel.webview.postMessage(message);
};

export const closeWebVeiw = () => {
    if (resultsPanel) {
        resultsPanel.dispose();
    }
};

export const getWebViewProblemName = () => problemName;

export const clearProblemName = () => {
    problemName = '';
};
