import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let goToNext = vscode.commands.registerCommand(
    "extension.ptinosq.gtnc.goToNext",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const text = editor.document.getText();
        const newSelections: vscode.Selection[] = [];

        for (const selection of editor.selections) {
          let textToSearch;
          if (selection.isEmpty) {
            // If no text is selected, get the character at the cursor.
            textToSearch = editor.document.getText(
              new vscode.Range(selection.start, selection.end.translate(0, 1))
            );
          } else {
            // If text is selected, use the selected text.
            textToSearch = editor.document.getText(selection);
          }

          const regex = new RegExp(escapeRegExp(textToSearch), "g");
          let match;
          while ((match = regex.exec(text))) {
            const matchPosition = editor.document.positionAt(match.index);
            if (matchPosition.isAfter(selection.active)) {
              newSelections.push(
                new vscode.Selection(matchPosition, matchPosition)
              );
              break;
            }
          }
        }

        if (newSelections.length > 0) {
          editor.selections = newSelections;
          editor.revealRange(
            new vscode.Range(newSelections[0].start, newSelections[0].end)
          );
        }
      }
    }
  );

  // Register the new command
  let goToSearch = vscode.commands.registerCommand(
    "extension.ptinosq.gtnc.goToSearch",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const wordToSearch = await vscode.window.showInputBox({
          prompt: "Enter the character / word to search for",
        });
        if (wordToSearch) {
          const text = editor.document.getText();
          const regex = new RegExp(escapeRegExp(wordToSearch), "g");
          let match;
          while ((match = regex.exec(text))) {
            const matchPosition = editor.document.positionAt(match.index);
            if (matchPosition.isAfter(editor.selection.active)) {
              editor.selection = new vscode.Selection(
                matchPosition,
                matchPosition
              );
              editor.revealRange(
                new vscode.Range(matchPosition, matchPosition)
              );
              break;
            }
          }
        }
      }
    }
  );

  context.subscriptions.push(goToNext, goToSearch);
}

export function deactivate() {}

function escapeRegExp(string: string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
