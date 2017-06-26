import vscode = require('vscode');

export class cqlHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position : vscode.Position, token: vscode.CancellationToken): vscode.Hover |  Promise<vscode.Hover> {
        
        console.log("text document hover provider called: " + document);
        return null;
    }
}