import path from 'path';
import config from '../config';
import { Url } from 'url';

/**
 * Get language based on file extension
 */
export const getLanguage = (srcPath: string): string => {
    const extension = path.extname(srcPath);
    for (const [lang, ext] of Object.entries(config.extensions))
        if (ext === extension) return lang;

    throw new Error('Invalid extension');
};

export const isValidLanguage = (srcPath: string): boolean => {
    return config.supportedExtensions.includes(path.extname(srcPath));
};

export const isCodeforcesUrl = (url: Url): boolean => {
    return url.hostname === 'codeforces.com';
};
