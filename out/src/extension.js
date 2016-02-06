// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var keywords = ["ADD", "ALL", "ALLOW", "ALTER", "AND", "ANY", "APPLY", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "COUNT", "COUNTER", "CONSISTENCY", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FILTERING", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "INET", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "KEYSPACES", "LEVEL", "LIMIT", "LIST", "LOCAL_ONE", "LOCAL_QUORUM", "MAP", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "RENAME", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "TO", "TOKEN", "THREE", "TRUNCATE", "TTL", "TWO", "TYPE", "UNLOGGED", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE",
    "WITH", "WRITETIME"];
var allCompletionItems = [];
var tablesNames = [];
var columnNames = [];
var completionItemNames = [];
function activate(context) {
    var items = keywords.map(function (val) {
        var itm = new vscode.CompletionItem(val);
        itm.detail = val;
        itm.filterText = val;
        itm.insertText = val;
        itm.kind = vscode.CompletionItemKind.Keyword;
        return itm;
    });
    for (var i = 0; i < items.length; i++) {
        allCompletionItems.push(items[i]);
    }
    var disposable = vscode.commands.registerCommand('cql.about', function () {
        vscode.window.showInformationMessage('This is an extension to help me with my projects!!');
    });
    var subs = vscode.workspace.onDidOpenTextDocument(function (evt) {
        var source = "";
        for (var i = 0; i < evt.lineCount; i++) {
            source += evt.lineAt(i).text;
        }
        var re = /(?:create table)\s(.*)\(/i;
        var tableName = source.match(/(?:create table)\s(.*)\(/i)[1];
        console.log(source.match(/(?:create table)\s(.*)\(/i));
        if (tableName) {
            var item = new vscode.CompletionItem(tableName);
            item.detail = "Table: " + tableName;
            item.filterText = tableName;
            item.insertText = tableName;
            item.kind = vscode.CompletionItemKind.Class;
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
            item.kind = vscode.CompletionItemKind.Field;
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
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map