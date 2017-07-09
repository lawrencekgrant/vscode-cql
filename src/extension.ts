'use strict';

import * as vscode from "vscode";
import cqlAbout = require("./cqlAbout");
import cqlKeywords = require("./cqlKeywords");
import cqlDocumentParser = require("./cqlDocumentParser");
import cqlCompletionItems = require("./cqlCompletionItems");
import cqlExecutor = require("./cqlExecutor");
import cqlSymbolProvider = require("./cqlSymbolProvider");

import cqlCassandraScanner = require("./cqlCassandraScanner");
import { CqlSchemaTreeDataProvider } from './cqlSchemaTreeDataProvider';
import cqlSchema = require("./cqlSchema");
import { cqlTreeItem } from './cqlTreeItem';
import { columnFamily } from './types/columnFamily';


export function activate(context: vscode.ExtensionContext) {
    console.log('CQL extension for vscode is now running. Registering functionality.');    

    cqlKeywords.registerKeywords();

    context.subscriptions.push(cqlAbout.registerAboutMessage());
    context.subscriptions.push(cqlDocumentParser.registerOnDidOpenTextDocument());
    context.subscriptions.push(cqlCompletionItems.registerCompletionItemProvider());
    context.subscriptions.push(...cqlExecutor.registerAll());
    context.subscriptions.push(cqlSymbolProvider.registerDocumentSymbolProvider());
    // context.subscriptions.push(cqlSymbolProvider.registerWorkspaceSymbolProvider());
    let cassandraTreeProvider = new CqlSchemaTreeDataProvider(this.context);
    vscode.window.registerTreeDataProvider('cqlTables', cassandraTreeProvider);
    
    context.subscriptions.push(cqlCassandraScanner.registerScanCommand(()=>{
        cassandraTreeProvider.getChildren();
        cassandraTreeProvider.refresh();
    }));
    context.subscriptions.push(...cqlSchema.registerSchemaCommand());
    vscode.commands.registerCommand('cql.show-table', (treeItem: cqlTreeItem) => {
        console.log(treeItem)
        cqlExecutor.executeCqlStatement((treeItem.item as columnFamily).GetSelectAllStatement());
    });

    console.log('Completed registration of CQL extension functionality.');

    console.log("Scan on startup? ", vscode.workspace.getConfiguration("cql")["scanOnStartup"]);

    if (vscode.workspace.getConfiguration("cql")["scanOnStartup"] === true)
        cqlCassandraScanner.executeScan();
}

export function deactivate() {
}