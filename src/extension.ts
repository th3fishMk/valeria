import { log } from 'node:console';
import type { Uri } from 'vscode';
import * as vscode from 'vscode';
import { createFileCommand } from './fileCreator';

export function activate(context: vscode.ExtensionContext) {
    log('Activating extension');
    const createFile = vscode.commands.registerCommand(
        'valeria.createFile',
        async (uri: Uri) => {
            createFileCommand(uri, '');
        },
    );
    context.subscriptions.push(createFile);

    // const cppTemplates = ['main', 'class', 'struct', 'enum', 'template'];

    // cppTemplates.forEach((t) => {
    //     const command = vscode.commands.registerCommand(
    //         `valeria.createFile.${t}`,
    //         async (uri: Uri) => {
    //             await createFileCommand(uri, t);
    //         },
    //     );
    //     context.subscriptions.push(command);
    // });

    const csharpTemplates = [
        'class',
        'interface',
        'enum',
        'struct',
        'abstract-class',
        'partial-class',
        'record',
        'unity-class',
        'unity-monoBehaviour',
        'unity-scriptable-object',
        'unity-monoBehaviour-full',
        'unity-singleton',
        'unity-stateMachineBehaviour',
        'unity-editorWindow',
        'unity-customEditor',
        'legacy-class',
        'legacy-interface',
        'legacy-enum',
    ];

    csharpTemplates.forEach((name) => {
        const command = vscode.commands.registerCommand(
            `valeria.create.csharp.${name}`,
            async (uri: vscode.Uri) => {
                await createFileCommand(uri, name, 'cs');
            },
        );
        context.subscriptions.push(command);
    });
}
