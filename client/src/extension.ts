// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace, Disposable, ExtensionContext, CompletionItem, CompletionItemKind, commands, CancellationToken, languages, TextDocument, window, Position } from 'vscode'
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions } from 'vscode-languageclient';

var keywords = ["ADD","ALL","ALLOW","ALTER","AND","ANY","APPLY","ASC","ASCII","AUTHORIZE","BATCH","BEGIN","BIGINT","BLOB","BOOLEAN","BY","CLUSTERING","COLUMNFAMILY","COMPACT","COUNT","COUNTER","CONSISTENCY","CREATE","DECIMAL","DELETE","DESC","DOUBLE","DROP","EACH_QUORUM","FILTERING","FLOAT","FROM","GRANT","IN","INDEX","INET","INSERT","INT","INTO","KEY","KEYSPACE","KEYSPACES","LEVEL","LIMIT","LIST","LOCAL_ONE","LOCAL_QUORUM","MAP","MODIFY","NORECURSIVE","NOSUPERUSER","OF","ON","ONE","ORDER","PASSWORD","PERMISSION","PERMISSIONS","PRIMARY","QUORUM","RENAME","REVOKE","SCHEMA","SELECT","SET","STORAGE","SUPERUSER","TABLE","TEXT","TIMESTAMP","TIMEUUID","TO","TOKEN","THREE","TRUNCATE","TTL","TWO","TYPE","UNLOGGED","UPDATE","USE","USER","USERS","USING","UUID","VALUES","VARCHAR","VARINT","WHERE"
,"WITH","WRITETIME"];

var allCompletionItems:CompletionItem[] = [];
var tablesNames = [];
var columnNames = [];
var completionItemNames = []

export function activate(context: ExtensionContext) {
    console.log('activating');
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join('../server', 'server.js'));
    // The debug options for the server
    let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
    
    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run : { module: serverModule },
        debug: { module: serverModule, options: debugOptions }
    }
    
    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: ['cql'],
        synchronize: {
            // Synchronize the setting section 'languageServerExample' to the server
            configurationSection: 'cql.languageServer',
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        }
    }
    
    let languageServerDisposable = new LanguageClient('CQL Language Server', serverOptions, clientOptions).start();
    context.subscriptions.push(languageServerDisposable);
    
    
    let disposable = commands.registerCommand('cql.about', () => {
		window.showInformationMessage('This is an extension to help me with my projects!!');
	});
    
    context.subscriptions.push(disposable);
    
    let subs = workspace.onDidOpenTextDocument(function(evt) {
        var source = "";
        for(var i = 0; i < evt.lineCount; i++) {
            source += evt.lineAt(i).text;
        }
        var re = /(?:create table)\s(.*)\(/i; 
        var tableName = source.match(/(?:create table)\s(.*)\(/i)[1];
        console.log(source.match(/(?:create table)\s(.*)\(/i));
        
        if(tableName) {
            var item = new CompletionItem(tableName);
            item.detail = "Table: " + tableName;
            item.filterText = tableName;
            item.insertText = tableName;
            item.kind = CompletionItemKind.Class;
            allCompletionItems.push(item);
        }
        
        var columns= source.match(/.*CREATE\s+TABLE\s+(\S+)\s*\((.*)\).*/i)[2].split(/,/);
        
        for(i = 0;i < columns.length; i++) {
            var val = columns[i];
            var val2 = columns[i].match(/([^\s]+)/i)[0].trim();
            columns[i] = val2;
        }
        
        for(var i = 0; i < columns.length; i++)
        {
            var currentValue = columns[i];
            
            var item = new CompletionItem(currentValue);
            item.detail = "Column: " + currentValue;
            item.filterText = currentValue;
            item.insertText = currentValue;
            item.kind = CompletionItemKind.Field;
            completionItemNames.push(currentValue);
            allCompletionItems.push(item);
        }
    });
    
    context.subscriptions.push(subs);
    	
    var disposable2 = languages.registerCompletionItemProvider("cql",
    {
        resolveCompletionItem(item:CompletionItem, token: CancellationToken): CompletionItem 
        {
            return item;
        }
        ,
        provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Promise<CompletionItem[]> 
        {
            return new Promise((resolve, reject) => { 
                return resolve(allCompletionItems) ;
            });
        }
    });
    
	context.subscriptions.push(disposable2);
    
    var items:CompletionItem[] = keywords.map(function(val) {
        var itm = new CompletionItem(val);
        itm.detail = val;
        itm.filterText = val;
        itm.insertText = val;
        itm.kind = CompletionItemKind.Keyword;
        return itm;
    });
    for(var i = 0; i < items.length; i++)
    {
        allCompletionItems.push(items[i]);
    }
}

export function deactivate() {
}