import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import TextareaAutosize from 'react-autosize-textarea';
import {
    Problem,
    RunResult,
    WebviewToVSEvent,
    TestCase,
    Case,
    VSToWebViewMessage,
    ResultCommand,
} from '../../types';
import { getBlankCase } from '../../runs/judge';
declare const acquireVsCodeApi: () => {
    postMessage: (message: WebviewToVSEvent) => void;
};
const vscodeApi = acquireVsCodeApi();

let savedProblem: Problem | void;
const reloadIcon = '↺';
const deleteIcon = '⨯';

function CaseView(props: {
    num: number;
    case: Case;
    rerun: (id: number, input: string, output: string) => void;
    remove: (num: number) => void;
}) {
    const { id, result, testcase } = props.case;

    const [input, useInput] = useState<string>(props.case.testcase.input);
    const [output, useOutput] = useState<string>(props.case.testcase.output);
    const [running, useRuning] = useState<boolean>(false);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        useInput(event.target.value);
    };

    const handleOutputChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        useOutput(event.target.value);
    };

    const rerun = () => {
        useRuning(true);
        props.rerun(id, input, output);
    };

    useEffect(() => {
        console.log('Result changed.');
        useRuning(false);
    }, [props.case.result]);

    const resultText = running
        ? '...'
        : result
        ? result.stdout.trim() || ' '
        : 'Run to show output';

    const passFailText = result ? (result.pass ? 'passed' : 'failed') : '';
    const caseClassName = 'case ' + (running ? 'running' : passFailText);

    return (
        <div className={caseClassName}>
            <div className="case-metadata">
                <div className="left">
                    <div className="case-number left">Testcase {props.num}</div>
                    {result && (
                        <div className="result-data left">
                            <span
                                className={
                                    result.pass ? 'result-pass' : 'result-fail'
                                }
                            >
                                {result.pass ? 'Passed' : 'Failed'}
                            </span>
                            <span className="exec-time">{result.time}ms</span>
                        </div>
                    )}
                    <div className="clearfix"></div>
                </div>
                <div className="right time">
                    <button
                        className="btn btn-green"
                        title="Run Again"
                        onClick={rerun}
                        disabled={running}
                    >
                        {reloadIcon}
                    </button>
                    <button
                        className="btn btn-red"
                        title="Delete Testcase"
                        onClick={() => {
                            props.remove(id);
                        }}
                    >
                        {deleteIcon}
                    </button>
                </div>
                <div className="clearfix"></div>
            </div>
            Input:
            <TextareaAutosize
                className="selectable input-textarea"
                onChange={handleInputChange}
                value={input}
            />
            Expected Output:
            <TextareaAutosize
                className="selectable expected-textarea"
                onChange={handleOutputChange}
                value={output}
            />
            Received Output:
            <TextareaAutosize
                className="selectable received-textarea"
                value={resultText}
                readOnly
            />
        </div>
    );
}

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

    savedProblem = problem;

    useEffect(() => {
        savedProblem = problem;
        window.addEventListener('message', (event) => {
            const data: VSToWebViewMessage = event.data;
            console.log('Got event in web view', event);
            switch (data.command) {
                case 'run-single-result': {
                    handleRunSingleResult(data);
                    break;
                }
            }
        });
    }, [problem]);

    const handleRunSingleResult = (data: ResultCommand) => {
        const idx = problem.tests.findIndex(
            (testCase) => testCase.id === data.result.id,
        );
        if (idx === -1) {
            console.error('Invalid single result', problem, data);
            return;
        }
        const cases = getCasesFromProblem(problem);
        cases[idx].result = data.result;
        useCases(cases);
        console.log('Cases updated', cases);
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

    const remove = (_id: number) => {
        // let newResults = cases.filter((_value, index) => index !== num);
        // if (newResults.length === 0) {
        //     newResults = [getBlankCase(problem)];
        // }
        // vscodeApi.postMessage({
        //     command: 'save',
        //     problem,
        //     testCases: deriveTestCases(newResults),
        // });
        // useCases(newResults);
    };

    if (!problem) {
        return <p>No active problem.</p>;
    }
    const views: JSX.Element[] = [];
    cases.forEach((value, index) => {
        views.push(
            <CaseView
                num={index + 1}
                case={value}
                rerun={rerun}
                remove={remove}
            ></CaseView>,
        );
    });
    return (
        <div className="ui">
            <div className="meta">
                <h1 className="problem-name">{problem.name}</h1>
            </div>
            <div className="results">{views}</div>
            <div className="actions"></div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));
