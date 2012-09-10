var mysql = require('mysql');
var connection = mysql.createClient({
    'host':'localhost',
    'user':'linda',
    'password':'zhu',
    'database':'mcmaster'});
//connection.connect();
connection.query('SELECT * FROM categories', function(err, rows, cols){
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
            console.log(rows[i]['url']);
        }
    });
connection.end();