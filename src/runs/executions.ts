import { RunResult, Language, TestCase, Run } from '../types';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import config from '../config';
import { getLanguage } from '../utils';
import path from 'path';
import { getTimeOutPref } from '../preferences';
import { isResultCorrect } from './judge';
const runningBinaries: ChildProcessWithoutNullStreams[] = [];

/**
 * Run a single testcase, and return the raw results, without judging.
 *
 * @param binPath path to the executable binary
 * @param input string to be piped into the stdin of the spawned process
 */
export const runTestCase = (
    language: Language,
    binPath: string,
    input: string,
): Promise<Run> => {
    console.log('Running testcase', language, binPath, input);
    const result: Run = {
        stdout: '',
        stderr: '',
        code: null,
        signal: null,
        time: 0,
        timeOut: false,
    };
    const spawnOpts = { timeout: config.timeout };
    let process: ChildProcessWithoutNullStreams;

    const killer = setTimeout(() => {
        result.timeOut = true;
        process.kill();
    }, getTimeOutPref());

    switch (language.name) {
        case 'python': {
            process = spawn(
                language.compiler, // 'python3' or 'python' TBD
                [binPath, ...language.args],
                spawnOpts,
            );
            break;
        }
        default: {
            process = spawn(binPath, spawnOpts);
        }
    }

    const begin = Date.now();
    const ret: Promise<Run> = new Promise((resolve) => {
        runningBinaries.push(process);
        process.stdout.on('data', (data) => (result.stdout += data));
        process.on('exit', (code, signal) => {
            const end = Date.now();
            clearTimeout(killer);
            result.code = code;
            result.signal = signal;
            result.time = end - begin;
            runningBinaries.pop();
        });

        process.stdin.write(input);
        process.stdin.end();
        process.stderr.on('data', (data) => (result.stderr += data));

        resolve(result);
    });

    return ret;
};

/** Remove the generated binary from the file system, if present */
export const deleteBinary = (language: Language, binPath: string) => {
    if (language.skipCompile) {
        console.log(
            "Skipping deletion of binary as it's not a compiled language.",
        );
        return;
    }
    console.log('Deleting binary', binPath);
    spawn('rm', [binPath]);
    spawn('del', [binPath]);
};

/** Kill all running binaries. Usually, only one should be running at a time. */
export const killRunning = () => {
    runningBinaries.forEach((process) => process.kill());
};
