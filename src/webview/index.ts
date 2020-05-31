import * as vscode from 'vscode';
import { WebviewToVSEvent } from '../types';
import { killRunning } from '../runs/executions';
import { readFileSync } from 'fs';

let resultsWebView: vscode.WebviewPanel | undefined;

/**
 * Creates a 2x1 grid 0.75+0.25
 */
function createLayout() {
    vscode.commands.executeCommand('vscode.setEditorLayout', {
        orientation: 0,
        groups: [
            { groups: [{}], size: 0.75 },
            { groups: [{}], size: 0.25 },
        ],
    });
}

const initializeWebView = () => {
    console.log('Initializing webview');
    resultsWebView = vscode.window.createWebviewPanel(
        'evalResults',
        'Judge Results',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        },
    );

    resultsWebView.onDidDispose(() => {
        resultsWebView = undefined;
    });
};

const setupMessageListeners = () => {
    if (resultsWebView === undefined) {
        console.warn(
            "Failed to set up message listeners for web view because it's undefined",
        );
        return;
    }
    // Events from WebView to Extension
    resultsWebView.webview.onDidReceiveMessage((message: WebviewToVSEvent) => {
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

export const startWebVeiw = () => {
    if (resultsWebView !== undefined) {
        initializeWebView();
        createLayout();
        setupMessageListeners();
    } else {
        console.log('Webivew exists - skipping creation');
    }
};
export const baseWebviewHTML = () => {
    const rawHTML = readFileSync('./frontend/index.html');
};
