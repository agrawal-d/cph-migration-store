/** Valid name for a VS Code preference section for the extension */
export type prefSection = 'binPath' | 'defaultLanguage' | 'runTimeOut';

export interface TestCase {
    input: string;
    output: string;
}

export interface Problem {
    name: string;
    url: string;
    interactive: boolean;
    memoryLimit: number;
    timeLimit: number;
    group: string;
    tests: TestCase[];
}
