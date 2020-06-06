/** Valid name for a VS Code preference section for the extension */
export type prefSection = 'binPath' | 'defaultLanguage' | 'runTimeOut';

export type Language = {
    name: 'python' | 'c' | 'cpp' | 'rust';
    extension: 'c' | 'c++' | 'rs' | 'py';
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

export type RunResult = {
    index: number | null;
    testcase: TestCase;
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    time: number;
    timeOut: boolean;
    pass: boolean;
};

export type WebviewMessageCommon = {
    problem: Problem;
    testCases: TestCase[];
};

export type RunSingleCommand = {
    command: 'run-single-and-save';
    index: number;
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
