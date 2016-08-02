import * as vscode from 'vscode';
import cqlCompletionItems = require('./cqlCompletionItems');
import cqlTypes = require('./types/cqlTypes');

export class cqlSchemaDocumentProvider implements vscode.TextDocumentContentProvider {
    public provideTextDocumentContent(uri: vscode.Uri) {
        //alert(cqlCompletionItems.scannedKeyspaces.length);

        let tables = cqlCompletionItems.scannedTables.map(table => { return `<li>${table.Keyspace.Name}.${table.Name}</li>`; }).join();
        let columns = cqlCompletionItems.scannedColumns.map(col => `<li>${col.ColumnFamily.Keyspace.Name}.${col.ColumnFamily.Name}.${col.Name}</li>`).join();

        return `
            <html>
                <head>
                    <style>${getStyleData()}</style>
                </head>
                <body>
                    ${cqlCompletionItems.scannedKeyspaces.map(element => getHeirarchicalListFromKeyspace(element)).join()}
                <script type="javascript">
                    document.body.onLoad = function(){document.body.style.backgroundColor = 'red'};    
                </script>    
                </body>

            </html>`;
    }
}

function getHeirarchicalListFromKeyspace(keyspace: cqlTypes.Keyspace) {
    let databaseImage = `<img width="16pt" height="16pt" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAw0lEQVRIx+3VvYkCURSG4UcHjI1MjKYIsYWFxRLswG7swBKWDSxBsAdNTMxMBZ0x8MwGy65zR0ZM5oUvuecP7ne4l44aeg9iGT5CE+QYRuyEPbZYh65NBs+wQ5moXdQkMUfRoHmlImprOTzRvNLhd7N+I8da4uVXNPa8yeOUASv39c3wiSU2OOIcOsbZMnKyqFmlDCjx5b73qeRRU6YkV1t0wTcWmGKEQWgUZ4vIufhni/6iM7mWzuQkWnuu3/bhdPxwAyw0sUuyXGTSAAAAAElFTkSuQmCC"/>`;

    let tableImage = `<img width="16pt" height="16pt" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAAVklEQVR4Ae2WMQrAMAwDb3J/H9BLTV6QQjePFYHS4NOm4SaBzflciGS9zEQEBbHMiELaoqTwlF7znahFTn4k8psW9SB7kC2auw6kbNGgENYTkQyC07kBd7Q2CnGIr7YAAAAASUVORK5CYII=">`;

    let columnImage = `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAh0lEQVR4Ae3WQQ6CMBCF4f80lcObYDkYEmGpPheup2I7BIPzv22TL2k35cDpPbdzAbCyExduqHILAx2FElfUuKlEnJHDMmajCzBjdkcuM3sE8D9AbfsDz8MBWrcAPu93HlkBfAvIXgAbA7UFEAAsW39+Bxegx6xjQo0bSVAiMnPD5fQkosi5F5S6PvA1GSEvAAAAAElFTkSuQmCC" width="16pt" height="16pt"/>`;

    let address = `${vscode.workspace.getConfiguration("cql")["connection"].contactPoints[0]}`;

    return `<div>
        ${address}
        <ul class="tree">
            <li>${databaseImage}${keyspace.Name}
            <ul>
                ${keyspace.ColumnFamilies.map(columnFam =>
                `<li>${tableImage}${columnFam.Name}
                    <ul>
                        ${columnFam.Columns.map(column => 
                            `<li>${columnImage}${column.Name} (${htmlEscape(column.Type)})</li>`
                            ).join('')}
                    </ul>
                </li>`).join('')}
            </li></ul>
    </ul></div>`;
}

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getStyleData() {
    let fontFamily = vscode.workspace.getConfiguration("editor")["fontFamily"];
    return `
    body {
    font:normal normal 13px/1.4 ${fontFamily};
    padding:50px;
    }

    .tree,
    .tree ul {
    margin:0 0 0 1em;
    padding:0;
    list-style:none;
    position:relative;
    }

    .tree ul {margin-left:.5em}

    .tree:before,
    .tree ul:before {
    content:"";
    display:block;
    width:0;
    position:absolute;
    top:0;
    bottom:0;
    left:0;
    border-left:1px solid;
    }

    .tree li {
    margin:0;
    padding:0 1.5em;
    line-height:2em;
    position:relative;
    }

    .tree li:before {
    content:"";
    display:block;
    width:10px;
    height:0;
    border-top:1px solid;
    margin-top:-1px;
    position:absolute;
    top:1em;
    left:0;
    }

    .tree li:last-child:before {
    height:auto;
    top:1em;
    bottom:0;
    }
    
    /** Theming */

    .vscode-light {
        color: rgb(30, 30, 30);
    }

    .vscode-dark {
        color: #DDD;
    }

    .vscode-high-contrast {
        color: white;
    }

    .vscode-light code {
        color: #A31515;
    }

    .vscode-dark code {
        color: #D7BA7D;
    }

    .vscode-light code > div {
        background-color: rgba(220, 220, 220, 0.4);
    }

    .vscode-dark code > div {
        background-color: rgba(10, 10, 10, 0.4);
    }

    .vscode-high-contrast code > div {
        background-color: rgb(0, 0, 0);
    }

    .vscode-high-contrast h1 {
        border-color: rgb(0, 0, 0);
    }

    .vscode-light table > thead > tr > th {
        border-color: rgba(0, 0, 0, 0.69);
    }

    .vscode-dark table > thead > tr > th {
        border-color: rgba(255, 255, 255, 0.69);
    }

    .vscode-light h1,
    .vscode-light hr,
    .vscode-light table > tbody > tr + tr > td {
        border-color: rgba(0, 0, 0, 0.18);
    }

    .vscode-dark h1,
    .vscode-dark hr,
    .vscode-dark table > tbody > tr + tr > td {
        border-color: rgba(255, 255, 255, 0.18);
    }

    .vscode-light blockquote,
    .vscode-dark blockquote {
        background: rgba(127, 127, 127, 0.1);
        border-color: rgba(0, 122, 204, 0.5);
    }

    .vscode-high-contrast blockquote {
        background: transparent;
        border-color: #fff;
    }
`;
}