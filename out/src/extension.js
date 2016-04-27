'use strict';
var cqlAbout = require('./cqlAbout');
var cqlKeywords = require('./cqlKeywords');
var cqlDocumentParser = require('./cqlDocumentParser');
var cqlCompletionItems = require('./cqlCompletionItems');
var cqlExecutor = require('./cqlExecutor');
var cqlSymbolProvider = require('./cqlSymbolProvider');
function activate(context) {
    console.log('CQL extension for vscode is now running. Registering functionality.');
    cqlKeywords.registerKeywords();
    context.subscriptions.push(cqlAbout.registerAboutMessage());
    context.subscriptions.push(cqlDocumentParser.registerOnDidOpenTextDocument());
    context.subscriptions.push(cqlCompletionItems.registerCompletionItemProvider());
    context.subscriptions.push(cqlExecutor.registerExecuteCommand());
    context.subscriptions.push(cqlSymbolProvider.registerDocumentSymbolProvider());
    console.log('Completed registration of CQL extension functionality.');
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map