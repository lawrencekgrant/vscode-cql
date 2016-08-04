import * as vscode from 'vscode';   
import * as executor from './cqlExecutor';

export class cqlResultDocumentProvider implements vscode.TextDocumentContentProvider {
    public provideTextDocumentContent(uri: vscode.Uri) {
        console.log('current results', executor.currentResults);
        return getTableFromResults(executor.currentResults);
    }
}

function getTableFromResults(results) : string {
    let isFirstRow = true;
    let metaDataString = '<div>'
    for(var property in results) {
        if(results.hasOwnProperty(property) && property != 'rows')
            metaDataString += `<div>${property}:${results[property]}</div>`;
    }
    metaDataString += '</div>'

    let returnString = '<table>';

    results.rows.forEach(row => {
        if(isFirstRow) {

            let headerString = '<thead><tr>'

            for (var column in row) {
                if(row.hasOwnProperty(column))
                    headerString += `<th>${column}</th>`;
            }
            
            headerString += '</tr></thead>';
            returnString += headerString;
            isFirstRow = false;
        }

        let rowString = "<tr>"
        for (var column in row) {
            if(row.hasOwnProperty(column))
                rowString += `<td>${row[column]}</td>`;
        }

        returnString += rowString;

    });

    returnString += '</table>';

    return metaDataString + returnString;
}
