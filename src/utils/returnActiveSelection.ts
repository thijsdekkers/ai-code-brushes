import * as vscode from 'vscode';

export const returnActiveSelection = (selection: vscode.Selection, editor: vscode.TextEditor) => {
	if (!selection || selection.isEmpty) {
		return;
	}

	const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
	return editor.document.getText(selectionRange);
};