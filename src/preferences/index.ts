import { workspace } from 'vscode';
import type { prefSection } from '../types';

export const getPreference = (section: prefSection): any => {
    return workspace
        .getConfiguration('competitive-programming-helper')
        .get(section);
};

export const updatePreference = (section: prefSection, value: any) => {
    return workspace
        .getConfiguration('competitive-programming-helper')
        .update(section, value);
};
