// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var keywords = ["ADD", "ALL", "ALLOW", "ALTER", "AND", "ANY", "APPLY", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "COUNT", "COUNTER", "CONSISTENCY", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FILTERING", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "INET", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "KEYSPACES", "LEVEL", "LIMIT", "LIST", "LOCAL_ONE", "LOCAL_QUORUM", "MAP", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "RENAME", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "TO", "TOKEN", "THREE", "TRUNCATE", "TTL", "TWO", "TYPE", "UNLOGGED", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE",
    "WITH", "WRITETIME"];
var allCompletionItems = [];
var tablesNames = [];
var columnNames = [];
var completionItemNames = [];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "temp2" is now active!');
    var items = keywords.map(function (val) {
        var itm = new vscode.CompletionItem(val);
        itm.detail = val;
        itm.filterText = val;
        itm.insertText = val;
        return itm;
    });
    for (var i = 0; i < items.length; i++) {
        allCompletionItems.push(items[i]);
    }
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('cql.about', function () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('This is an extension to help me with my projects!!');
    });
    var subs = vscode.workspace.onDidOpenTextDocument(function (evt) {
        var source = "";
        for (var i = 0; i < evt.lineCount; i++) {
            source += evt.lineAt(i).text;
        }
        var re = /(?:create table)\s(.*)\(/i;
        var tableName = source.match(/(?:create table)\s(.*)\(/i)[1];
        if (tableName) {
            var item = new vscode.CompletionItem(tableName);
            item.detail = "Table: " + tableName;
            item.filterText = tableName;
            item.insertText = tableName;
            allCompletionItems.push(item);
        }
        var columns = source.match(/.*CREATE\s+TABLE\s+(\S+)\s*\((.*)\).*/i)[2].split(/,/);
        for (i = 0; i < columns.length; i++) {
            var val = columns[i];
            var val2 = columns[i].match(/([^\s]+)/i)[0].trim();
            columns[i] = val2;
        }
        for (var i = 0; i < columns.length; i++) {
            var currentValue = columns[i];
            var item = new vscode.CompletionItem(currentValue);
            item.detail = "Column: " + currentValue;
            item.filterText = currentValue;
            item.insertText = currentValue;
            completionItemNames.push(currentValue);
            allCompletionItems.push(item);
        }
    });
    var disposable2 = vscode.languages.registerCompletionItemProvider("cql", {
        resolveCompletionItem: function (item, token) {
            return item;
        },
        provideCompletionItems: function (document, position, token) {
            return new Promise(function (resolve, reject) {
                return resolve(allCompletionItems);
            });
        }
    });
    context.subscriptions.push(disposable, subs);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map