import http from 'http';
import config from '../config';
import EventEmitter from 'events';
import { Problem } from '../types';
import { saveProblem } from '../parser';
import * as vscode from 'vscode';
import path from 'path';
import { writeFileSync } from 'fs';
import { startWebVeiwIfNotActive, setBaseWebViewHTML } from '../webview';
import { randomId } from '../utils';

// @ts-ignore
let eventsManager: EventEmitter;

export const setupCompanionServer = () => {
    try {
        const server = http.createServer((req, res) => {
            let rawProblem = '';
            req.on('readable', function () {
                console.log('Companion server got data');
                const tmp = req.read();
                if (tmp && tmp != null && tmp.length > 0) {
                    rawProblem += tmp;
                }
            });
            req.on('close', function () {
                const problem: Problem = JSON.parse(rawProblem);
                handleNewProblem(problem);
                console.log('Companion server closed connection.');
            });
            res.write('OK');
            res.end();
        });
        server.listen(config.port);
        console.log('Companion server listening on port', config.port);
        return server;
    } catch (e) {
        console.error('Companion server error :', e);
    }
};

const handleNewProblem = async (problem: Problem) => {
    const folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (folder === undefined) {
        vscode.window.showInformationMessage('Please open a folder first.');
        return;
    }
    const ext = 'cpp'; // TODO get from preferences or picker.
    let problemFileName = `${problem.name.replace(/\W+/g, '_')}.${ext}`;
    const srcPath = path.join(folder, problemFileName);

    // Add fields absent in competitive companion.
    problem.srcPath = srcPath;
    problem.tests = problem.tests.map((testcase) => ({
        ...testcase,
        id: randomId(),
    }));

    writeFileSync(srcPath, '');
    saveProblem(srcPath, problem);
    const doc = await vscode.workspace.openTextDocument(srcPath);
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
    startWebVeiwIfNotActive();
    setBaseWebViewHTML(global.context, problem);
};

export const setupEventListeners = () => {
    // if (eventsManager !== undefined) {
    //     throw Error('Event listener already exists.');
    // }
    // // @ts-ignore
    // class EventsManager extends EventEmitter {}
    // // @ts-ignore
    // const cphEvents: EventEmitter = new EventsManager();
    // cphEvents.on('new-problem', function (rawProblem: Problem) {
    //     console.log("Received event 'new-event'", rawProblem);
    //     rawProblem.tests = rawProblem.tests.map((testcase) => ({
    //         ...testcase,
    //         id: randomId(),
    //     }));
    //     handleNewProblem(rawProblem);
    // });
    // eventsManager = cphEvents;
    // console.log('Event listeners setup');
};
