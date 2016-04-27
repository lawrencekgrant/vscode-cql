import vscode = require('vscode');
import cqlCompletionItems = require('./cqlCompletionItems');

export function registerOnDidOpenTextDocument(): vscode.Disposable {
    return vscode.workspace.onDidOpenTextDocument(function(evt) {
        console.log(evt);
        var source = evt.getText().replace(/(\r\n|\n|\r)/gm,"");
        
        console.log('source', source);
        var re = /(?:create table)\s(.*)\(/i;
        var tableName = source.match(/(?:create table)\s(.*)\(/i)[1];
        console.log(source.match(/(?:create table)\s(.*)\(/i));

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
            }
        }
    });
}