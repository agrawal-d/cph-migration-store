import { RunResult, Language } from '../types';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import config from '../config';
import { getPreference } from '../preferences';
const runningBinaries: ChildProcessWithoutNullStreams[] = [];

/**
 * The response of a single testcase run
 *
 * @param binPath path to the executable binary
 * @param input string to be piped into the stdin of the spawned process
 */
export const runTestCase = (
    language: Language,
    binPath: string,
    input: string,
): Promise<RunResult> => {
    const result: RunResult = {
        stdout: '',
        stderr: '',
        code: null,
        signal: null,
        time: 0,
        timeOut: false,
    };
    const spawnOpts = { timeout: config.timeout };
    let process: ChildProcessWithoutNullStreams;

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

    const killer = setTimeout(() => {
        result.timeOut = true;
        process.kill();
    }, getPreference('runTimeOut'));

    const begin = Date.now();
    const ret: Promise<RunResult> = new Promise((resolve) => {
        runningBinaries.push(process);
        process.stdin.write(input);
        process.stdin.end();
        process.stderr.on('data', (data) => (result.stderr += data));
        process.stdout.on('data', (data) => (result.stdout += data));
        process.on('exit', (code, signal) => {
            const end = Date.now();
            clearTimeout(killer);
            result.code = code;
            result.signal = signal;
            result.time = end - begin;
            runningBinaries.pop();
        });
        resolve(result);
    });

    return ret;
};

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

export const killRunning = () => {
    runningBinaries.forEach((process) => process.kill());
};
