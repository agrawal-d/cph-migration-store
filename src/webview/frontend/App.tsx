import React, { useState, useEffect, createRef } from 'react';
import ReactDOM from 'react-dom';
import {
    Problem,
    RunResult,
    WebviewToVSEvent,
    TestCase,
    Case,
    VSToWebViewMessage,
    ResultCommand,
    RunningCommand,
} from '../../types';
import CaseView from './CaseView';
declare const acquireVsCodeApi: () => {
    postMessage: (message: WebviewToVSEvent) => void;
};
const vscodeApi = acquireVsCodeApi();
let savedProblem: Problem | void;

const getProblemFromDOM = (): Problem => {
    const element = document.getElementById('problem') as HTMLElement;
    return JSON.parse(element.innerText);
};

const getCasesFromProblem = (problem: Problem): Case[] => {
    return problem.tests.map((testCase) => ({
        id: testCase.id,
        result: null,
        testcase: testCase,
    }));
};

function App() {
    const [problem, useProblem] = useState<Problem>(getProblemFromDOM());
    const [cases, useCases] = useState<Case[]>(getCasesFromProblem(problem));
    const [focusLast, useFocusLast] = useState<boolean>(false);
    const [forceRunning, useForceRunning] = useState<number | false>(false);

    savedProblem = problem;

    useEffect(() => {
        savedProblem = problem;
    }, [problem]);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const data: VSToWebViewMessage = event.data;
            console.log('Got event in web view', event);
            switch (data.command) {
                case 'run-single-result': {
                    handleRunSingleResult(data);
                    break;
                }
                case 'running': {
                    handleRunning(data);
                    break;
                }
            }
        });
    }, [problem.name]);

    const handleRunSingleResult = (data: ResultCommand) => {
        const idx = problem.tests.findIndex(
            (testCase) => testCase.id === data.result.id,
        );
        if (idx === -1) {
            console.error('Invalid single result', problem, data);
            return;
        }
        const newCases = cases.slice();
        newCases[idx].result = data.result;
        useCases(newCases);
        console.log('Cases updated', newCases);
    };

    const handleRunning = (data: RunningCommand) => {
        console.log('Set force running to ', data.id);
        useForceRunning(data.id);
    };

    const rerun = (id: number, input: string, output: string) => {
        const idx = problem.tests.findIndex((testCase) => testCase.id === id);

        if (idx === -1) {
            console.log('No id in problem tests', problem, id);
            return;
        }

        problem.tests[idx].input = input;
        problem.tests[idx].output = output;

        vscodeApi.postMessage({
            command: 'run-single-and-save',
            problem,
            id,
        });
    };

    const remove = (id: number) => {
        const testCases = problem.tests.filter((value) => value.id !== id);
        const newCases = cases.filter((value) => value.id !== id);
        useProblem({
            ...problem,
            tests: testCases,
        });

        useCases(newCases);
        save();
    };

    const newCase = () => {
        const id = Date.now();
        const testCase: TestCase = {
            id,
            input: '',
            output: '',
        };
        useCases([
            ...cases,
            {
                id,
                result: null,
                testcase: testCase,
            },
        ]);
        useFocusLast(true);
        useProblem({
            ...problem,
            tests: [...problem.tests, testCase],
        });
        save();
    };

    const save = () => {
        vscodeApi.postMessage({
            command: 'save',
            problem,
        });
    };

    const stop = () => {
        vscodeApi.postMessage({
            command: 'kill-running',
            problem,
        });
    };

    const runAll = () => {
        vscodeApi.postMessage({
            command: 'run-all-and-save',
            problem,
        });
    };

    const debounceFocusLast = () => {
        setTimeout(() => {
            useFocusLast(false);
        }, 100);
    };

    const debounceForceRunning = () => {
        setTimeout(() => {
            useForceRunning(false);
        }, 100);
    };

    const getRunningProp = (value: Case) => {
        if (forceRunning === value.id) {
            console.log('Forcing Running');
            debounceForceRunning();
            return forceRunning === value.id;
        }
        return false;
    };

    const updateProblem = (id: number, input: string, output: string) => {
        console.log('Problem updated');
        const idx = problem.tests.findIndex((testCase) => testCase.id === id);
        if (idx != -1) {
            const tests = problem.tests.slice(0);
            tests[idx].input = input;
            tests[idx].output = output;
            useProblem({
                ...problem,
                tests,
            });
        }
    };

    const views: JSX.Element[] = [];
    cases.forEach((value, index) => {
        if (focusLast && index === cases.length - 1) {
            views.push(
                <CaseView
                    num={index + 1}
                    case={value}
                    rerun={rerun}
                    key={value.id.toString()}
                    remove={remove}
                    doFocus={true}
                    forceRunning={getRunningProp(value)}
                    updateProblem={updateProblem}
                ></CaseView>,
            );
            debounceFocusLast();
        } else {
            views.push(
                <CaseView
                    num={index + 1}
                    case={value}
                    rerun={rerun}
                    key={value.id.toString()}
                    remove={remove}
                    forceRunning={getRunningProp(value)}
                    updateProblem={updateProblem}
                ></CaseView>,
            );
        }
    });

    return (
        <div className="ui">
            <div className="meta">
                <h1 className="problem-name">{problem.name}</h1>
            </div>
            <div className="results">{views}</div>
            <div className="actions">
                <button className="btn btn-orange" onClick={runAll}>
                    ▶️ Run All
                </button>
                <button className="btn" onClick={newCase}>
                    ➕ New
                </button>
                <button className="btn btn-red" onClick={stop}>
                    🛑 Stop
                </button>
                <button className="btn btn-green" onClick={save}>
                    💾 Save
                </button>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));
