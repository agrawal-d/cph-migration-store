import { Problem } from '../types';
import { runSingleAndSave } from './runSingleAndSave';
import { extensionToWebWiewMessage } from '.';
import { compileFile, getBinSaveLocation } from '../runs/compiler';
import { deleteBinary } from '../runs/executions';
import { getLanguage } from '../utils';

/**
 * Run every testcase in a problem one by one. Waits for the first to complete
 * before running next. `runSingleAndSave` takes care of saving.
 **/
export default async (problem: Problem) => {
    console.log('Run all started', problem);
    await compileFile(problem.srcPath);
    for (let testCase of problem.tests) {
        extensionToWebWiewMessage({
            command: 'running',
            id: testCase.id,
            problem: problem,
        });
        await runSingleAndSave(problem, testCase.id, true);
    }
    console.log('Run all finished');
    deleteBinary(
        getLanguage(problem.srcPath),
        getBinSaveLocation(problem.srcPath),
    );
};
