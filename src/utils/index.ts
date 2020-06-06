import path from 'path';
import config from '../config';
import { Url } from 'url';
import { Language } from '../types';
import * as vscode from 'vscode';
import { getCppArgsPref } from '../preferences';

let oc = vscode.window.createOutputChannel('competitive');

/**
 * Get language based on file extension
 */
export const getLanguage = (srcPath: string): Language => {
    const extension = path.extname(srcPath).split('.').pop();
    let langName: string | void = undefined;
    for (const [lang, ext] of Object.entries(config.extensions)) {
        if (ext === extension) {
            langName = lang;
        }
    }
    if (langName === undefined) {
        throw new Error('Invalid extension');
    }

    switch (langName) {
        case 'cpp': {
            return {
                name: 'cpp',
                args: [...getCppArgsPref()],
                compiler: 'g++',
                skipCompile: false,
            };
        }

        case 'default': {
            // TODO
        }
    }
    throw new Error('Invalid State');
};

export const isValidLanguage = (srcPath: string): boolean => {
    return config.supportedExtensions.includes(
        path.extname(srcPath).split('.')[1],
    );
};

export const isCodeforcesUrl = (url: Url): boolean => {
    return url.hostname === 'codeforces.com';
};

export const ocAppend = (string: string) => {
    oc.append(string);
};

export const ocWrite = (string: string) => {
    oc.clear();
    oc.append(string);
};

export const ocShow = () => {
    oc.show();
};

export const ocHide = () => {
    oc.hide();
};

export const randomId = () => Math.floor(Date.now() + Math.random() * 100);
