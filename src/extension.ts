// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cassandra from 'cassandra-driver';

var keywords = ["ADD", "ALL", "ALLOW", "ALTER", "AND", "ANY", "APPLY", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "COUNT", "COUNTER", "CONSISTENCY", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FILTERING", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "INET", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "KEYSPACES", "LEVEL", "LIMIT", "LIST", "LOCAL_ONE", "LOCAL_QUORUM", "MAP", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "RENAME", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "TO", "TOKEN", "THREE", "TRUNCATE", "TTL", "TWO", "TYPE", "UNLOGGED", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE"
    , "WITH", "WRITETIME"];

var allCompletionItems: vscode.CompletionItem[] = [];
var tablesNames = [];
var columnNames = [];
var completionItemNames = []

export function activate(context: vscode.ExtensionContext) {

    var disposable = vscode.commands.registerCommand('cql.about', () => {
        vscode.window.showInformationMessage('This is an extension to help me with my projects!!');
    });
    context.subscriptions.push(disposable);

    var executeCommandDisposable = vscode.commands.registerCommand('cql.execute', () => {
        var cassandraLocation = vscode.workspace.getConfiguration("cql.configuration");
        console.log('cl', cassandraLocation);

        vscode.window.showInformationMessage(`Executing statement against Cassandra @ ${cassandraLocation['cassandra.location']}`);
        let conf = vscode.workspace.getConfiguration('cassandra');
        
        console.log(conf);
        console.log('cassandra location', cassandraLocation);
        var cassandraAddress = conf.get('address');
        var cassandraPort = conf.get('port');

        var client = new cassandra.Client({
            contactPoints: [cassandraAddress],
            hosts: [cassandraAddress]
        });

        vscode.workspace.getConfiguration("cassandra.cql")

        var statement = "";
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            statement = vscode.window.activeTextEditor.document.getText();
        } else {
            var selection = vscode.window.activeTextEditor.selection;
            statement = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        }

        console.log("statement: " + statement);

        client.connect(function(err, result) {
            client.execute(statement.toString(), [], { prepare: true }, function(err, result) {
                console.log('executed', err, result);

                var outputChannel = vscode.window.createOutputChannel("CQL Results");
                var resultText = "";

                outputChannel.clear();
                outputChannel.append(JSON.stringify(err ? err : result));
                outputChannel.show();
            });
        });
    });
    context.subscriptions.push(executeCommandDisposable);

    var subs = vscode.workspace.onDidOpenTextDocument(function(evt) {
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

    context.subscriptions.push(subs);

    var disposable4 = vscode.languages.registerCodeActionsProvider("cql", {
        provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
            var returnCommands = [];
            vscode.commands.getCommands(true).then((cmd) => {
                cmd.forEach((val) => {
                    if (val.toLowerCase().startsWith("cql"))
                        returnCommands.push(val);
                });
            });
            console.log("providing");
            return returnCommands;
        }
    });
    context.subscriptions.push(disposable4);

    var disposable2 = vscode.languages.registerCompletionItemProvider("cql",
        {
            resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.CompletionItem {
                return item;
            }
            ,
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
                return new Promise((resolve, reject) => {
                    return resolve(allCompletionItems);
                });
            }
        })

    context.subscriptions.push(disposable2);

    var items = keywords.map(function(val) {
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
}

export function deactivate() {
}