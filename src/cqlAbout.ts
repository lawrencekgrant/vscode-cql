import vscode = require('vscode');

export function registerAboutMessage(): vscode.Disposable {
    return vscode.commands.registerCommand("cql.about", ()=> {
        vscode.window.showInformationMessage("This is an extension to help me with projects!");
    });
}
