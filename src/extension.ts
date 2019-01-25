import {
  ExtensionContext,
  commands,
  TextEditor,
  window,
  languages,
  Selection
} from "vscode";
import { readFile, writeFile } from "fs";
import { promisify } from "util";

const readFileSync = promisify(readFile);
const writeFileSync = promisify(writeFile);

interface SnippetInfoInterface {
  lang: string;
  name: string;
  body: Array<string>;
  prefix: string;
  description: string;
}

export const activate = (context: ExtensionContext) => {
  let disposable = commands.registerCommand(
    "snippetmaker.make_snippet",
    async () => {
      let editor = <TextEditor>window.activeTextEditor;
      let selected = <Selection>editor.selection;

      let snippetBody = <string>editor.document.getText(selected);

      let listOfLanguages = await languages.getLanguages();

      let snippetInfo = <SnippetInfoInterface>{
        body: snippetBody.split("\n")
      };
      snippetInfo.lang = <string>await window.showQuickPick(listOfLanguages, {
        placeHolder: editor.document.languageId
      });

      snippetInfo.name = <string>await window.showInputBox({
        prompt: "Name"
      });

      snippetInfo.prefix = <string>await window.showInputBox({
        prompt: "Trigger"
      });

      snippetInfo.description = <string>await window.showInputBox({
        prompt: "Description"
      });

      let extensionPath = context.extensionPath;

      let snippetFilePath = `${extensionPath}/snippets/${
        snippetInfo.lang
      }.json`;

      let text = "{}";
      try {
        text = await readFileSync(snippetFilePath, {
          encoding: "utf8"
        });
      } catch (e) {
        if (e.code !== "ENOENT") {
          return;
        }

        await writeFileSync(snippetFilePath, "{}");
      }

      let currentSnippets = JSON.parse(text);
      currentSnippets[snippetInfo.name] = {
        prefix: snippetInfo.prefix,
        body: snippetInfo.body,
        description: snippetInfo.description
      };

      await writeFileSync(snippetFilePath, JSON.stringify(currentSnippets));
    }
  );

  context.subscriptions.push(disposable);
};

export const deactivate = () => {};
