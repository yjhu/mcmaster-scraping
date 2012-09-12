var child_process = require('child_process');
var mysql = require('mysql');
var db_cli = mysql.createClient({
    'host':'localhost',
    'user':'linda',
    'password':'zhu',
    'database':'mcmaster'});

var category_savedb = function(category) {
    var query = db_cli.query("SELECT * FROM categories WHERE title LIKE ?", [category['title']], function(err, rows, cols){
        if (err) throw err;
        if (rows.length > 0) {
            query = db_cli.query("UPDATE categories SET is_leaf=?, scraped_flag=?, parent_id=?, valid=? WHERE id=" + rows[0].id,
                        [category['is_leaf'], category['scraped_flag'], category['parent_id'], category['valid']],
                        function (err, rows, cols){
                            if (err) throw err;
                        });
            console.log(query.sql);
        } else {
            query = db_cli.query("INSERT INTO categories (title, url, dom_id, parent_id) VALUES (?, ?, ?, ?)",
                         [category['title'], category['url'], category['domid'], category['parent_id']],
                         function (err, rows, cols) {
                            if (err) throw err;
                         });
            console.log(query.sql);
        }
    });
    console.log(query.sql);
};

var product_savedb = function(product) {
    var query = db_cli.query("SELECT * FROM products WHERE sku LIKE ?", [product['sku']], function(err, rows, cols){
        if (err) throw err;
        if (rows.length > 0) {
            query = db_cli.query("UPDATE products SET description=?, price=?, unit=?, online_inventory=?, nj_inventory=?, scraped=?, valid=? WHERE sku like ?",
                        [product['description'], product['price'], product['unit'], product['online_inventory'], product['nj_inventory'], product['scraped'], product['valid'], product['sku']],
                        function (err, rows, cols){
                            if (err) throw err;
                        });
            console.log(query.sql);
        } else {
            query = db_cli.query("INSERT INTO products (sku, category_id) VALUES (?, ?)",
                         [product['sku'], product['category_id']],
                         function (err, rows, cols) {
                            if (err) throw err;
                         });
            console.log(query.sql);
        }
    });
    console.log(query.sql);
};

var category_setScraped = function(id, scraped) {
    var query = db_cli.query("UPDATE categories SET scraped_flag = ? WHERE id=?", [scraped, id], function(err){if (err) throw err;});
    console.log(query.sql);
}

var category_setIsLeaf = function(id, isLeaf) {
    var query = db_cli.query("UPDATE categories SET is_leaf = ? WHERE id=?", [isLeaf, id], function(err){if (err) throw err;});
    console.log(query.sql);
}

                
var fs = require('fs');
var cookies = fs.readdirSync('cookies');
for (var i = 0; i < cookies.length; i++) {
    cookies[i] = 'cookies\\' + cookies[i];
}
db_cli.query("SELECT * FROM categories WHERE valid=true and scraped_flag=false", function (err, rows, cols){
    if (err) throw err;
    var processed_rows = 0;
    var len = rows.length > cookies.length ? cookies.length : rows.length;
    for (var i = 0; i < len; i++) {
        var cookie = cookies[i];
        var callback_func = function (error, stdout, stderr) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    } else {
                        var results = JSON.parse(stdout);
                        console.log('Results: ' + results['STATUS']);
                        if (results['STATUS'] === 'success') {
                            console.log('worker done: ' + JSON.stringify(results['RESULTS']['DATAHDR']));
                            switch (results['RESULTS']['TYPE']) {
                                case 'categories-list':
                                    var len = results['RESULTS']['DATA'].length;
                                    var parent_id = results['RESULTS']['DATAHDR']['id'];
                                    for (var i = 0; i < len; i++) {
                                        var category = results['RESULTS']['DATA'][i];
                                        category['parent_id'] = parent_id;
                                        category['valid'] = true;
                                        if (results['RESULTS']['DATAHDR']['title'])
                                            category['title'] = results['RESULTS']['DATAHDR']['title'] + '>' + category['title'];
                                        //if (category['domid'])
                                        //    category['is_leaf'] = true;
                                        //else
                                        //    category['is_leaf'] = false;
                                        //console.log(category['title'] + "\t" + category['url'] + " " + category['domid']);
                                        category_savedb(category);
                                    }
                                    console.log('totally ' + len + ' categories.');
                                    console.log('parent_id: ' + parent_id);
                                    if (len > 0) category_setScraped(parent_id, true);
                                    break;
                                
                                case 'products-list':
                                    var len = results['RESULTS']['DATA'].length;
                                    var parent_id = results['RESULTS']['DATAHDR']['id'];
                                    for (var i = 0; i < len; i++) {
                                        var sku = results['RESULTS']['DATA'][i];
                                        var product = {};
                                        product['sku'] = sku;
                                        product['category_id'] = parent_id;
                                        //console.log(category['title'] + "\t" + category['url'] + " " + category['domid']);
                                        product_savedb(product);
                                    }
                                    console.log('totally ' + len + ' products.');
                                    console.log('parent_id: ' + parent_id);
                                    if (len > 0) {
                                        category_setScraped(parent_id, true);
                                        category_setIsLeaf(parent_id, true);
                                    }
                                    break;
                            }
                        } else {
                            console.log('Error: ' + results['ERROR']);
                        }
                    }
                    if (processed_rows < rows.length) {
                        console.log('dispatching: cmd=' + JSON.stringify(rows[processed_rows]) + ' cookie=' + cookie);
                        child_process.exec("phantomjs --cookies-file=" + cookie + " phantom-worker-category.js '" + JSON.stringify(rows[processed_rows++]) + "'",
                            callback_func);
                    } else {
                        db_cli.end();
                    }
                };
        console.log('dispatching: cmd=' + JSON.stringify(rows[processed_rows]) + ' cookie=' + cookie);
        child_process.exec("phantomjs --cookies-file=" + cookie + " phantom-worker-category.js '" + JSON.stringify(rows[processed_rows++]) + "'",
            callback_func);
    }
});
//var cmd = {};
//cmd['url'] = 'http://www.mcmaster.com/#screws';
//cmd['id'] = 593;
//cmd['title'] = 'test_title';
//var worker = child_process.exec("phantomjs --cookies-file=cookies\\cookies.txt phantom-worker-category.js '" + JSON.stringify(cmd) + "'",
//                callback_func);
//db_cli.end();