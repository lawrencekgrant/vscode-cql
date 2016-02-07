'use strict';
var vscode_languageserver_1 = require('vscode-languageserver');
console.log("language server!");
// Create a connection for the server. The connection uses 
// stdin / stdout for message passing
var connection = vscode_languageserver_1.createConnection(process.stdin, process.stdout);
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.onDidChangeContent(function (change) {
    console.log("document changed! This shit works!");
});
documents.listen(connection);
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites. 
var workspaceRoot;
connection.onInitialize(function (params) {
    console.log("fuuuuuuuck!");
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind
        }
    };
});
// Listen on the connection
console.log('listening');
connection.listen();
//# sourceMappingURL=server.js.map