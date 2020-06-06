import { getLanguage, ocHide, ocAppend, ocShow } from '../utils';
import { Language } from '../types';
import { spawn } from 'child_process';
import * as vscode from 'vscode';
import path from 'path';
import { getSaveLocationPref } from '../preferences';

/**
 *  Get the location to save the generated binary in. If save location is
 *  available in preferences, returns that, otherwise returns the director of
 *  active file.
 *
 *  @param srcPath location of the source code
 */
export const getBinSaveLocation = (srcPath: string): string => {
    const savePreference = getSaveLocationPref();
    const srcFileName = path.basename(srcPath);
    const binFileName = `${srcFileName}.bin`;
    if (savePreference && savePreference !== '') {
        return path.join(savePreference, binFileName);
    }
    return `${srcPath}.bin`;
};

/**
 * Gets the complete lsit of required arguments to be passed to the compiler.
 * Loads additional args from preferences if available.
 *
 * @param language The Language object for the source code
 * @param srcPath location of the source code
 */
const getFlags = (language: Language, srcPath: string): string[] => {
    switch (language.name) {
        case 'cpp': {
            return [
                srcPath,
                '-o',
                getBinSaveLocation(srcPath),
                ...language.args,
            ];
        }
        default: {
            throw new Error('Invalid state');
        }
    }
};

/**
 * Compile a source file, storing the output binary in a location based on user
 * preferences. If `skipCompile` is true for a language, skips the compilation
 * and resolves true. If there is no preference, stores in the current
 * directory. Resolves true if it succeeds, false otherwise.
 *
 * @param srcPath location of the source code
 */
export const compileFile = (srcPath: string): Promise<boolean> => {
    ocHide();
    const language: Language = getLanguage(srcPath);
    const flags: string[] = getFlags(language, srcPath);
    const result = new Promise<boolean>((resolve) => {
        if (language.skipCompile) {
            return Promise.resolve(true);
        }

        const compiler = spawn(language.compiler, flags);
        let error = '';

        compiler.stderr.on('data', (data) => {
            error += data;
        });

        compiler.on('exit', (exitcode) => {
            if (exitcode === 1 || error !== '') {
                ocAppend('Errors while compiling:\n' + error);
                ocShow();
                resolve(false);
            }

            resolve(true);
        });
    });
    return result;
};
