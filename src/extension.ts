import * as vscode from 'vscode';

import { returnCommands } from './utils/returnCommands';
import { replacePlaceholders } from './utils/replacePlaceholders';
import { returnActiveSelection } from './utils/returnActiveSelection';
import { removeMarkdownCodeBlock } from './utils/removeMarkdownCodeBlock';

import ProviderGemini from './providers/gemini';
import ProviderOpenRouter from './providers/openrouter';

const PACKAGE_NAME = 'ai-code-brushes';

const runPrompt = async (prompt: string, selectedProviderName: string, selectedModelName: string, apiKeyGemini: string, apiKeyOpenRouter: string): Promise<string | undefined> => {
  let provider = null;

	switch (selectedProviderName) {
		case 'gemini':
			provider = new ProviderGemini(apiKeyGemini, !selectedModelName || selectedModelName === '' ? 'gemini-1.5-flash' : selectedModelName);
			break;
		case 'openrouter':
			provider = new ProviderOpenRouter(apiKeyOpenRouter, selectedModelName);
			break;
		default: 
			vscode.window.showErrorMessage('No provider selected');
			return; 
	}

  const result = await provider.runPrompt(prompt);

  return result;
};

const runCommand = async (command: string) => {
  const activeTextEditor = vscode.window.activeTextEditor;

  if (!activeTextEditor) {
    vscode.window.showErrorMessage('No active text editor');
    return;
  }

  const selection = returnActiveSelection(activeTextEditor.selection, activeTextEditor);

  if (!selection) {
    vscode.window.showErrorMessage('No active selection');
    return;
  }

  const vsCodeConfig = vscode.workspace.getConfiguration(PACKAGE_NAME);
	
  if (!vsCodeConfig.apiKeyOpenRouter && !vsCodeConfig.apiKeyGemini) {
    vscode.window.showErrorMessage('Neither OpenRouter nor Gemini API key is set');
    return;
  }

	const commandNameWithoutPrefix = command.replace(`${PACKAGE_NAME}.`, "");
	
	const commandConfig = {
		prompt: (selection: string, programmingLanguage: string) => replacePlaceholders(vsCodeConfig[`${commandNameWithoutPrefix}Prompt`], programmingLanguage) + `\n\n${selection}`,
		contentHandling: vsCodeConfig[`${commandNameWithoutPrefix}ContentHandling`]
	};

  const programmingLanguage =
    vsCodeConfig.programmingLanguage !== 'auto' ? vsCodeConfig.programmingLanguage : activeTextEditor.document.languageId;
  const prompt = commandConfig.prompt(selection, programmingLanguage);

	const startTime = performance.now();
  let result = await runPrompt(prompt, vsCodeConfig.selectedProviderName, vsCodeConfig.selectedModelName, vsCodeConfig.apiKeyGemini, vsCodeConfig.apiKeyOpenRouter);
	const formattedTime = ((performance.now() - startTime) / 1000).toFixed(1);

  if (!result) {
    vscode.window.showErrorMessage('Something went wrong');
    return;
  }

  if (vsCodeConfig.formatLLMResponse === true) {
    result = removeMarkdownCodeBlock(result);
  }

  const contentHandling = commandConfig.contentHandling;

  if (contentHandling === 'clipboard') {
    vscode.window.showInformationMessage(`Saved to clipboard (received response in ${formattedTime}s)`);
    vscode.env.clipboard.writeText(result);
  } else if (contentHandling === 'in_place') {
    vscode.window.showInformationMessage(`Received response in ${formattedTime}s`);
    activeTextEditor.edit((editBuilder) => {
      editBuilder.replace(activeTextEditor.selection, result);
    });
  }
};

export function activate(context: vscode.ExtensionContext) {
  const commands = returnCommands(context);

  for (const command of commands) {
    const commandDisposable = vscode.commands.registerCommand(command, async () => {
      await runCommand(command);
    });

    context.subscriptions.push(commandDisposable);
  }
}

export function deactivate() {}