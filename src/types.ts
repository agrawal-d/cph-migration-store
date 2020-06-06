import * as vscode from 'vscode';

declare module NodeJS {
    interface Global {
        context: vscode.ExtensionContext;
    }
}

/** Valid name for a VS Code preference section for the extension */
export type prefSection =
    | 'saveLocation'
    | 'defaultLanguage'
    | 'runTimeOut'
    | 'argsC'
    | 'argsCpp'
    | 'argsRust'
    | 'argsPython';

export type Language = {
    name: 'python' | 'c' | 'cpp' | 'rust';
    compiler: string;
    args: string[];
    skipCompile: boolean;
};

export type TestCase = {
    input: string;
    output: string;
    id: number;
};

export type Problem = {
    name: string;
    url: string;
    interactive: boolean;
    memoryLimit: number;
    timeLimit: number;
    group: string;
    tests: TestCase[];
    srcPath: string;
};

export type Case = {
    id: number;
    result: RunResult | null;
    testcase: TestCase;
};

export type Run = {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    time: number;
    timeOut: boolean;
};

export type RunResult = {
    pass: boolean | null;
    id: number;
} & Run;

export type WebviewMessageCommon = {
    problem: Problem;
};

export type RunSingleCommand = {
    command: 'run-single-and-save';
    id: number;
} & WebviewMessageCommon;

export type RunAllCommand = {
    command: 'run-all-and-save';
} & WebviewMessageCommon;

export type KillRunningCommand = {
    command: 'kill-running';
} & WebviewMessageCommon;

export type SaveCommand = {
    command: 'save';
} & WebviewMessageCommon;

export type WebviewToVSEvent =
    | RunAllCommand
    | RunSingleCommand
    | KillRunningCommand
    | SaveCommand;

export type ResultCommand = {
    command: 'run-single-result';
    result: RunResult;
};

export type VSToWebViewMessage = ResultCommand;
