import vscode = require("vscode");
import cqlCompletionItems = require('./cqlCompletionItems');

var keywords = ["ADD", "ALL", "ALLOW", "ALTER", "AND", "ANY", "APPLY", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "COUNT", "COUNTER", "CONSISTENCY", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FILTERING", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "INET", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "KEYSPACES", "LEVEL", "LIMIT", "LIST", "LOCAL_ONE", "LOCAL_QUORUM", "MAP", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "RENAME", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "TO", "TOKEN", "THREE", "TRUNCATE", "TTL", "TWO", "TYPE", "UNLOGGED", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE", "WITH", "WRITETIME"];

export function registerKeywords() {
    var items = keywords.map(function(val) {
            var itm = new vscode.CompletionItem(val);
            itm.detail = val;
            itm.filterText = val;
            itm.insertText = val;
            itm.kind = vscode.CompletionItemKind.Keyword;
            return itm;
        });
        
        for (var i = 0; i < items.length; i++) {
            cqlCompletionItems.completionItemList.push(items[i]);
            console.log('added completion items.');
        }
}