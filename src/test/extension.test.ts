import * as assert from 'assert';
import * as vscode from 'vscode';
import { setContext } from '../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('resolve path', () => {
        assert.strictEqual(undefined, setContext());
    });
});
