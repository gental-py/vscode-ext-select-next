import * as vscode from "vscode";

const WORD_TERMINATION_CHARS = " \t\n:;[]()<>{}/.,?'\""; 

function getNextCharacterAndPosition(document: vscode.TextDocument, position: vscode.Position): [string | undefined, vscode.Position | undefined] {
    const lineText = document.lineAt(position.line).text;

    if (position.character < lineText.length) {
        const nextPosition = position.translate(0, 1);
        const nextCharacter = lineText.charAt(position.character + 1);
        return [nextCharacter || undefined, nextPosition];
    } else {
        return [undefined, undefined];
    }
}

export function activate(context: vscode.ExtensionContext) {
  let selectSearch = vscode.commands.registerCommand(
    "extension.gentalpy.snwo.selectNextWord",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const wordToSearch = await vscode.window.showInputBox({
          prompt: "String query...",
        });
        if (wordToSearch) {
          const text = editor.document.getText();
          const regex = new RegExp(escapeRegExp(wordToSearch), "g");

          let match;
          while ((match = regex.exec(text))) {
            const matchPosition = editor.document.positionAt(match.index);
            if (matchPosition.isAfter(editor.selection.active)) {
              let nextPos = matchPosition;

              while (nextPos !== undefined) {
                let [char, next] = getNextCharacterAndPosition(editor.document, nextPos); 
                if (char === undefined || next === undefined) { break; }
                if (WORD_TERMINATION_CHARS.includes(char)) { break; }

                nextPos = next;
              }

              const stopPos = nextPos.translate(0, 1);
              editor.selection = new vscode.Selection(
                matchPosition,
                stopPos
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

  context.subscriptions.push(selectSearch);
}

export function deactivate() {}

function escapeRegExp(string: string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
