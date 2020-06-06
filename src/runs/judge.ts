import { TestCase, RunResult } from '../types';
import { EOL } from 'os';

/**
 * Judge whether the testcase stdout is correct
 *
 * @param testCase a single testcase
 * @param stdout stdout of a testcase run
 */
export const isResultCorrect = (
    testCase: TestCase,
    stdout: string,
): boolean => {
    const expectedLines = testCase.output.trim().split('\n');
    const resultLines = stdout.trim().split(EOL);

    if (expectedLines.length !== resultLines.length) {
        return false;
    }

    const len = expectedLines.length;

    for (let i = 0; i < len; i++) {
        if (expectedLines[i].trim() !== resultLines[i].trim()) {
            return false;
        }
    }

    return true;
};

export const getBlankResult = (): RunResult => {
    return {
        testcase: {
            input: '',
            output: '',
            id: Date.now(),
        },
        stderr: '',
        stdout: '',
        code: null,
        signal: null,
        pass: true,
        time: 0,
        timeOut: false,
        index: null,
    };
};
