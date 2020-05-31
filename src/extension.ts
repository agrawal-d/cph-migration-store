import * as vscode from 'vscode';
import { setupEventListeners, setupCompanionServer } from './companion';
import runTestCases from './runs/runTestCases';
import { setBaseWebViewHTML, initializeWebView } from './webview';

const registerCommands = (context: vscode.ExtensionContext) => {
    console.log('Registering commands');
    const disposable = vscode.commands.registerCommand(
        'cph.runTestCases',
        runTestCases,
    );
    context.subscriptions.push(disposable);
};

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('cph: activate() execution started');

    registerCommands(context);
    setupEventListeners();
    setupCompanionServer();
    initializeWebView();
    setBaseWebViewHTML(context);

    return;
}
