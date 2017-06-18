import vscode = require('vscode');
import cqlCompletionItems = require('./cqlCompletionItems');
import cqlSymbolProvider = require('./cqlSymbolProvider');



export function registerOnDidOpenTextDocument(): vscode.Disposable {
    return vscode.workspace.onDidOpenTextDocument(function(evt) {
        console.log(evt);
        let sqlText = evt.getText();
        var source = evt.getText().replace(/(\r\n|\n|\r)/gm,"");
        
        console.log('source', source);
        var re = /(?:create table)\s(.*)\(/i;
        var match = source.match(/(?:create table)\s(.*)\(/i);
        console.log(match);
        var tableName = match[1];

        if (tableName) {
            if(cqlCompletionItems.completionTables.indexOf(tableName) === -1) {
                var item = new vscode.CompletionItem(tableName);
                item.detail = "Table: " + tableName;
                item.filterText = tableName;
                item.insertText = tableName;
                item.kind = vscode.CompletionItemKind.Class;
                cqlCompletionItems.completionTables.push(tableName);
                cqlCompletionItems.completionItemList.push(item);
            }
        }

        var columns = source.match(/.*CREATE\s+TABLE\s+(\S+)\s*\((.*)\).*/i)[2].split(/,/);

        for (i = 0; i < columns.length; i++) {
            var val = columns[i];
            var val2 = columns[i].match(/([^\s]+)/i)[0].trim();
            columns[i] = val2;
        }
        
        let currentText = evt.getText();

        for (var i = 0; i < columns.length; i++) {
            var currentValue = columns[i];
            
            if(cqlCompletionItems.completionFields.indexOf(currentValue) === -1) {
                var item = new vscode.CompletionItem(currentValue);
                item.detail = "Column: " + currentValue + " from table " + tableName;
                item.filterText = currentValue;
                item.insertText = currentValue;
                item.kind = vscode.CompletionItemKind.Field;
                
                cqlCompletionItems.completionFields.push(currentValue);
                cqlCompletionItems.completionItemList.push(item);
                
                for(let i = 0; i < evt.lineCount; i++) {
                    var currentLine = evt.lineAt(i).text;
                    let symbolFoundIndex = currentLine.indexOf(currentValue);
                    if(symbolFoundIndex > -1) {
                        let symbolRange = new vscode.Range(i, symbolFoundIndex, i, symbolFoundIndex + currentValue.length);
                        
                        let symbolItem = new vscode.SymbolInformation(currentValue, vscode.SymbolKind.Field, symbolRange, vscode.Uri.file(evt.fileName), tableName);
                        cqlSymbolProvider.DocumentSymbols.push(symbolItem);
                        cqlSymbolProvider.WorkspaceSymbols.push(symbolItem);
                        break;                        
                    }
                }
            }
        }
    });
}