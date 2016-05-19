'use strict';

import * as vscode from "vscode";
import cqlAbout = require("./cqlAbout");
import cqlKeywords = require("./cqlKeywords");
import cqlDocumentParser = require("./cqlDocumentParser");
import cqlCompletionItems = require("./cqlCompletionItems");
import cqlExecutor = require("./cqlExecutor");
import cqlSymbolProvider = require("./cqlSymbolProvider");

import cqlCassandraScan = require("./cqlCassandraScan");
import cqlConnect = require("./cqlConnect");


export function activate(context: vscode.ExtensionContext) {
    console.log('CQL extension for vscode is now running. Registering functionality.');    

    cqlKeywords.registerKeywords();

    context.subscriptions.push(cqlAbout.registerAboutMessage());
    // context.subscriptions.push(cqlDocumentParser.registerOnDidOpenTextDocument());
    context.subscriptions.push(cqlCompletionItems.registerCompletionItemProvider());
    context.subscriptions.push(cqlExecutor.registerExecuteCommand());
    context.subscriptions.push(cqlSymbolProvider.registerDocumentSymbolProvider());
    // context.subscriptions.push(cqlSymbolProvider.registerWorkspaceSymbolProvider());

    context.subscriptions.push(cqlCassandraScan.registerScanCommand());
    context.subscriptions.push(cqlConnect.registerConnectCommand());
    console.log('Completed registration of CQL extension functionality.');

    console.log("Scan on startup? ", vscode.workspace.getConfiguration("cql")["scanOnStartup"]);

    if (vscode.workspace.getConfiguration("cql")["scanOnStartup"] === true)
        cqlCassandraScan.executeScan();
}

export function deactivate() {
}