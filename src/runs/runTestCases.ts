import * as vscode from 'vscode';
import { isValidLanguage, getLanguage } from '../utils';
import config from '../config';
import { startWebVeiwIfNotActive, setBaseWebViewHTML } from '../webview';
import { Problem, Language } from '../types';
import { getProblem } from '../parser';
import { compileFile } from './compiler';

/**
 * Execution for the run testcases command. Runs all testcases for the active
 * editor. If the active editor does not have any saved testaces, presents an
 * option to the user to either download them from a codeforces URL or manually
 * create an empty testcases file and show it in the results section.
 */
export default async (context: vscode.ExtensionContext) => {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage('You must open a file first');
        return;
    }
    const srcPath = editor.document.fileName;
    if (!isValidLanguage(srcPath)) {
        vscode.window.showErrorMessage(
            `Unsupported file extension. Only these types are valid: ${config.supportedExtensions}`,
        );
    }
    const problem = getProblem(srcPath);

    if (!problem) {
        console.log('No problem saved.');
        // TODO Show options to create new problem
        return;
    }

    const language: Language = getLanguage(srcPath);
    const didCompile = await compileFile(srcPath);

    if (!didCompile) {
        console.log('Could not compile', srcPath);
        return;
    }

    startWebVeiwIfNotActive();
    setBaseWebViewHTML(context, problem);
};
