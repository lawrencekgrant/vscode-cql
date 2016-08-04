import * as vscode from 'vscode';   
import * as executor from './cqlExecutor';
import * as util from 'util';

export class cqlResultDocumentProvider implements vscode.TextDocumentContentProvider {
    public provideTextDocumentContent(uri: vscode.Uri) {
        console.log('current results', executor.currentResults);
        let isError = uri.query.indexOf('error=true') > -1;
        if(isError)
            return getJsonFromResults(executor.currentResults);

        return vscode.workspace.getConfiguration("cql")['resultStyle'].format === 'tabular'
            ? getTableFromResults(executor.currentResults)
            : getJsonFromResults(executor.currentResults);
    }
}

function getJsonFromResults(results) : string {
    let returnString = `<div><pre>`;
    returnString += util.inspect(results, { depth: 64 }).replace(/\\n/g, '\n');
    returnString += '</pre></div>'
    return returnString;
}

function getTableFromResults(results) : string {
    let isFirstRow = true;

    let styleString = '<style>'
    styleString += getTableStyle();
    styleString += '</style>'
    
    let metaDataString = '<div>'
        metaDataString += `<div><strong>Queried Host:</strong>${results.info.queriedHost}</div>`;
        metaDataString += `<div><strong>Achieved Consistency</strong>: ${results.info.achievedConsistency}`;
        metaDataString += `<div><strong>Rows</strong>: ${results.rowLength}`
    metaDataString += '</div><br/>'

    let returnString = '';
        if(results.rows) {
        returnString = '<table>';
        let headerString = '<thead class="table-header"><tr>'
        for (var column in results.columns) {
            if(results.columns.hasOwnProperty(column))
                headerString += `<th>${results.columns[column].name}</th>`;
        }
        
        headerString += '</tr></thead>';

        returnString += headerString;

        let rowCount = 0;
        results.rows.forEach(row => {
            let rowString = `<tr class="tablerow-${(++rowCount % 2) ? 'light' : 'dark'}">`
            for (var column in row) {
                if(row.hasOwnProperty(column))
                    rowString += `<td>${util.inspect(row[column], {depth:3}).toString()}</td>`;
            }

            returnString += rowString;
            /* //TODO: Repeat header every x, this should be an option before it is implemented
            if(!(rowCount % 10))
                returnString += headerString;
            */
        });

        returnString += '</table>';
    }

    return styleString + metaDataString + returnString; 
}

function getTableStyle() {
    return `
        .tablerow-light {
            background-color: rgba(255,255,255, .15);
        }

        .tablerow-dark {
            background-color: rgba(0,0,0, .15);
        }

        .table-header {
            background-color: rgba(0,0,0,.25);;
        }

        .error {
            color: red;
        }
    `;
}