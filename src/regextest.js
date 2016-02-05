var cql = "create table complete.messages(message text,attachments set<text>,read_on timestamp,created_on timestamp,message_from int,message_to int);"


var columns= cql.match(/.*CREATE\s+TABLE\s+(\S+)\s*\((.*)\).*/i)[2].split(/,/);
for(i = 0;i < columns.length; i++) {
    columns[i] = columns[i].replace(/\s.*/g, '');
}

var name = cql.match(/(?:create table)\s(.*)\(/i);
console.log(name);

console.log(columns);

