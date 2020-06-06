import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Problem, RunResult, WebviewToVSEvent, TestCase } from '../../types';
import { getBlankResult } from '../../runs/judge';
declare const acquireVsCodeApi: () => {
    postMessage: (message: WebviewToVSEvent) => void;
};
const vscodeApi = acquireVsCodeApi();

let savedProblem: Problem | void;
const reloadIcon = '&#x21BA; ';
const deleteIcon = '&#x2A2F; ';

function Result(props: {
    result: RunResult;
    num: number;
    rerun: (num: number) => void;
    remove: (num: number) => void;
}) {
    const { result, num, rerun, remove } = props;
    const [input, useInput] = useState<string>(props.result.testcase.input);
    const [output, useOutput] = useState<string>(props.result.testcase.output);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        useInput(event.target.value);
    };

    const handleOutput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        useOutput(event.target.value);
    };

    return (
        <div className="case">
            <div>
                Testcase ${num}
                <span className={result.pass ? 'result-pass' : 'result-fail'}>
                    ${result.pass ? 'Passed' : 'Failed'}
                </span>
                <span className="exec-time">{result.time}ms</span>
                <span className="right time">
                    <button
                        className="btn btn-green"
                        onClick={() => {
                            rerun(num);
                        }}
                    >
                        {reloadIcon}
                    </button>
                    <button
                        className="btn btn-red"
                        onClick={() => {
                            remove(num);
                        }}
                    >
                        {deleteIcon}
                    </button>
                </span>
            </div>
            Input:
            <textarea
                className="selectable input-textarea"
                onChange={handleInput}
            >
                ${input}
            </textarea>
            Expected Output:
            <textarea
                className="selectable expected-textarea"
                onChange={handleOutput}
            >
                {output}
            </textarea>
            Received Output:
            <textarea className="selectable received-textarea" disabled>
                {result.stdout}
            </textarea>
        </div>
    );
}

function App() {
    const [problem, useProblem] = useState<Problem | void>(undefined);
    const [results, useResults] = useState<RunResult[]>([getBlankResult()]);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const data = event.data;
            switch (data.command) {
                case 'single-run-result': {
                    const newResults = results.map((result) => {
                        if (result.testcase.id === data.result.testcase.id) {
                            return data.result;
                        }
                        return result;
                    });
                    useResults(newResults);
                    break;
                }
                case 'run-all-result': {
                    useResults(data.results);
                }
            }
        });
    }, [problem]);

    if (!problem) {
        return <p>No active problem.</p>;
    }

    const deriveTestCases = (results: RunResult[]): TestCase[] => {
        return results.map((result) => result.testcase);
    };

    const rerun = (num: number) => {
        vscodeApi.postMessage({
            command: 'run-single-and-save',
            problem,
            testCases: deriveTestCases(results),
            index: num,
        });
    };

    const remove = (num: number) => {
        let newResults = results.filter((_value, index) => index !== num);
        if (newResults.length === 0) {
            newResults = [getBlankResult()];
        }
        vscodeApi.postMessage({
            command: 'save',
            problem,
            testCases: deriveTestCases(newResults),
        });
        useResults(newResults);
    };

    let cases;
    let num = 1;
    if (results) {
        results.forEach((item: RunResult) => {
            cases.push(
                <Result
                    result={item}
                    num={num}
                    rerun={rerun}
                    remove={remove}
                />,
            );
        });
    }

    return (
        <div className="ui">
            <div className="results"></div>
            <div className="actions"></div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));
