import { workspace } from 'vscode';
import type { prefSection } from '../types';

const getPreference = (section: prefSection): any => {
    const ret = workspace
        .getConfiguration('competitive-programming-helper')
        .get(section);

    console.log('Read preference for ', section, ret);
    return ret;
};

export const updatePreference = (section: prefSection, value: any) => {
    return workspace
        .getConfiguration('competitive-programming-helper')
        .update(section, value);
};

export const getSaveLocationPref = (): string => getPreference('saveLocation');

export const getTimeOutPref = (): number => getPreference('runTimeOut') || 3000;

export const getCppArgsPref = (): string[] => getPreference('argsCpp') || [];
