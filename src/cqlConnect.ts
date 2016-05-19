import vscode = require("vscode");

export function registerConnectCommand(): vscode.Disposable {
    return vscode.commands.registerCommand("cql.connect", () => {
        /*
        vscode.window.showInputBox()
            .then(input => vscode.window.showInformationMessage(input));
        */
    });
}