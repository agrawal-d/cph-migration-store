import path from 'path';
import fs from 'fs';
import { getPreference } from '../preferences';
import { Problem } from '../types';

export const getBinPath = (srcPath: string): string => {
    const binLocation: string = getPreference('binPath');
    return path.join(binLocation, path.basename(srcPath) + '.bin');
};

export const getProbPath = (srcPath: string): string => {
    const binLocation: string = getPreference('binPath');
    return path.join(binLocation, path.basename(srcPath) + '.prob');
};

export const getProblem = (srcPath: string): Problem => {
    const probPath = getProbPath(srcPath);
    let problem: string;
    try {
        problem = fs.readFileSync(probPath).toString();
    } catch (err) {
        throw new Error(err);
    }
    return JSON.parse(problem);
};

export const saveProblem = (srcPath: string, problem: Problem) => {
    const probPath = getProbPath(srcPath);
    try {
        fs.writeFileSync(probPath, JSON.stringify(problem));
    } catch (err) {
        throw new Error(err);
    }
};
