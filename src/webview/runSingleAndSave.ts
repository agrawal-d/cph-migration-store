import { Problem, RunResult } from '../types';
import { getLanguage } from '../utils';
import { getBinSaveLocation, compileFile } from '../runs/compiler';
import { saveProblem } from '../parser';
import { runTestCase } from '../runs/executions';
import { isResultCorrect } from '../runs/judge';
import { extensionToWebWiewMessage } from '.';

export const runSingleAndSave = async (problem: Problem, id: number) => {
    console.log('Run and save started', problem, id);

    const srcPath = problem.srcPath;
    const language = getLanguage(srcPath);
    const binPath = getBinSaveLocation(srcPath);
    const idx = problem.tests.findIndex((value) => value.id === id);
    const testCase = problem.tests[idx];

    if (!testCase) {
        console.error('Invalid id', id, problem);
        return;
    }

    saveProblem(srcPath, problem);
    await compileFile(srcPath);

    if (!compileFile) {
        console.error('Failed to compile', problem, id);
        return;
    }

    const run = await runTestCase(language, binPath, testCase.input);
    const didError =
        (run.code !== null && run.code !== 0) ||
        run.signal !== null ||
        run.stderr !== '';
    const result: RunResult = {
        ...run,
        pass: didError ? false : isResultCorrect(testCase, run.stdout),
        id,
    };

    console.log('Testcase judging complete. Result:', result);
    await extensionToWebWiewMessage({
        command: 'run-single-result',
        result,
    });
};
