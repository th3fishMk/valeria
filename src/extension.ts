import { log } from 'node:console';
import path from 'node:path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const createFile = vscode.commands.registerCommand(
        'valeria.createFile',
        async (uri: Uri) => {
            try {
                let targetPath: Uri | undefined = uri ?? (await setContext());
                if (!uri.fsPath) {
                    targetPath = await setContext();
                }
                if (!targetPath) {
                    log('Process canceled by user');
                    vscode.window.showInformationMessage('Ok then');
                    return;
                } else {
                    const filename = getName();
                    filename
                        .then((name) => {
                            if (!name) {
                                throw new Error('No given name!');
                            }
                            const fullPath = Uri.parse(
                                path.join(targetPath.fsPath, name),
                            );
                            log(fullPath.fsPath);
                            createLocalFile(fullPath);
                        })
                        .catch((err) => {
                            if (err instanceof Error) {
                                log(err.message);
                            }
                        });
                }
            } catch (err) {
                if (err instanceof Error) {
                    vscode.window.showErrorMessage(err.message);
                    log(err.message);
                }
            }
        },
    );
    context.subscriptions.push(createFile);
}

async function getName(): Promise<string | undefined> {
    const fileName = await vscode.window.showInputBox({
        title: 'File name (e.g., file.txt or folder/file.txt)',
        validateInput: (value: string) => {
            // REMOVED: / and \ from the invalid list so they can be used as separators
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

    return fileName;
}

export function deactivate() {
    log('Extension de-activated :(');
}
export async function setContext(): Promise<Uri | undefined> {
    log('Entering selection mode');
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

function createLocalFile(path: Uri) {
    const _ = fileExist(path).then((exist) => {
        if (!exist) {
            vscode.workspace.fs.writeFile(path, new Uint8Array());
        }
    });
}

async function fileExist(uri: Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}
