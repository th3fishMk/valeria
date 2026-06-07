import path from 'node:path';
import type { Uri } from 'vscode';
import * as vscode from 'vscode';

export async function createFileCommand(
    destPath: Uri,
    template: string,
    extension = '',
) {
    try {
        const targetPath: Uri | undefined = destPath ?? (await setContext());
        // if (!uri.fsPath) {
        //     targetPath = await setContext();
        // }
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            return;
        }
        if (!targetPath) {
            vscode.window.showInformationMessage('Ok then');
            return;
        } else {
            const filename = getName(destPath, template, extension);
            // biome-ignore lint/style/noNonNullAssertion: previous check ensures this returns a value
            const originPath = vscode.workspace.getWorkspaceFolder(targetPath)!;
            filename
                .then(async (name) => {
                    if (!name) {
                        throw new Error('No given name!');
                    }
                    const fullPath = vscode.Uri.joinPath(originPath.uri, name);
                    await createLocalFile(fullPath, template);
                })
                .catch((err) => {
                    if (err instanceof Error) {
                        vscode.window.showErrorMessage(err.message);
                    }
                });
        }
    } catch (err) {
        if (err instanceof Error) {
            vscode.window.showErrorMessage(err.message);
        }
    }
}

async function getName(
    targetPath: Uri,
    template: string,
    extension: string,
): Promise<string | undefined> {
    let local = vscode.workspace.asRelativePath(targetPath, false);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(targetPath);
    if (workspaceFolder && local === workspaceFolder.uri.fsPath) {
        local = '.';
    }

    if (extension === '') {
        extension = 'txt';
    }

    let hint = `${template}.${extension}`;
    if (hint === '.txt') {
        hint = 'filename.txt';
    }

    local = path.join(local, hint);
    const fileName = await vscode.window.showInputBox({
        title: 'File name (e.g., file.txt or folder/file.txt)',
        value: local,
        valueSelection: [
            local.length - hint.length,
            local.length - extension.length - 1,
        ],
        validateInput: (value: string) => {
            const invalidChars = /[<>:"|?*]/;

            if (invalidChars.test(value)) {
                return 'Filename contains invalid characters (e.g., <, >, :, ", |, ?, *)';
            }
            if (value.trim().length === 0) {
                return 'Filename cannot be empty';
            }
            // Optional: Prevent starting with a separator
            if (value.startsWith('/') || value.startsWith('\\')) {
                return 'Filename cannot start with a directory separator';
            }
            return null;
        },
    });
    // biome-ignore lint/style/noNonNullAssertion: <Regex ensures a valid string>
    const result = path.normalize(fileName!);
    return result;
}

export async function setContext(): Promise<Uri | undefined> {
    const workspaces = vscode.workspace.workspaceFolders;
    if (!workspaces || workspaces.length === 0) {
        throw new Error('Please open a folder to continue!');
    }
    if (workspaces.length > 1) {
        const selection = await vscode.window.showWorkspaceFolderPick({
            placeHolder: 'Select a workspace',
        });
        return selection?.uri;
    } else {
        return workspaces[0].uri;
    }
}

export async function createLocalFile(filePath: Uri, snippetName = '') {
    const fileDoesExist = await fileExist(filePath);
    if (fileDoesExist) {
        throw new Error('File already exist');
    }
    await vscode.workspace.fs.writeFile(filePath, new Uint8Array());

    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);

    await vscode.commands.executeCommand('editor.action.insertSnippet', {
        name: snippetName,
    });
    vscode.window.showInformationMessage('File created successfully');
}

async function fileExist(uri: Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}
