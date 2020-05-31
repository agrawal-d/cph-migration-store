import { isResultCorrect } from '../judge';

describe('saved problem parser', () => {
    test('single line valid result', () => {
        const result = '\n\n  12345 hello  \n';
        const testCase = { input: 'something', output: '\n12345 hello' };
        expect(isResultCorrect(testCase, result)).toBeTruthy();
    });

    test('single line invalid result', () => {
        const result = '  12345 hello  ';
        const testCase = { input: 'something', output: 'something else' };
        expect(isResultCorrect(testCase, result)).toBeFalsy();
    });

    test('multi line valid result', () => {
        const result = 'abc def\nghi jkl \n mno pqr\n\n';
        const testCase = {
            input: 'something',
            output: 'abc def\n ghi jkl\nmno pqr',
        };
        expect(isResultCorrect(testCase, result)).toBeTruthy();
    });

    test('multi line invalid result', () => {
        const result = 'abc def\nghi jkl \n mno pqr\n\n';
        const testCase = {
            input: 'something',
            output: 'abc def\nhello',
        };
        expect(isResultCorrect(testCase, result)).toBeFalsy();
    });
});
