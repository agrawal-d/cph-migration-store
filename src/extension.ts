import * as vscode from 'vscode';
import { setupEventListeners, setupCompanionServer } from './companion';
import runTestCases from './runs/runTestCases';
import {
    editorChanged,
    editorClosed,
    checkLaunchWebview,
} from './webview/editorChange';

declare global {
    module NodeJS {
        interface Global {
            context: vscode.ExtensionContext;
        }
    }
}

const registerCommands = (context: vscode.ExtensionContext) => {
    console.log('Registering commands');
    const disposable = vscode.commands.registerCommand(
        'cph.runTestCases',
        (context) => {
            runTestCases(context);
        },
    );
    context.subscriptions.push(disposable);
};

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('cph: activate() execution started');

    global.context = context;

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        1000,
    );
    statusBarItem.text = ' ▶  Run Testcases';
    statusBarItem.show();
    statusBarItem.command = 'cph.runTestCases';

    registerCommands(context);
    setupEventListeners();
    setupCompanionServer();
    checkLaunchWebview(context);

    vscode.window.onDidChangeActiveTextEditor((e) => {
        editorChanged(e, context);
    });

    vscode.workspace.onDidCloseTextDocument((e) => {
        editorClosed(e, context);
    });

    return;
}
