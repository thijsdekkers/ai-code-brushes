import * as vscode from 'vscode';

export const returnCommands = (context: vscode.ExtensionContext) => {
	return context.extension.packageJSON.contributes.commands.map((command: any) => command.command);
};