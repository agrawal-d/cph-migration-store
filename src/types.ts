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
};

export type Problem = {
    name: string;
    url: string;
    interactive: boolean;
    memoryLimit: number;
    timeLimit: number;
    group: string;
    tests: TestCase[];
};

export type RunResult = {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    time: number;
    timeOut: boolean;
};

export type WebviewToVSEvent = {
    command: 'run-all-and-save' | 'run-single-and-save' | 'kill-running';
    problem: Problem;
    srcPath: string;
};
