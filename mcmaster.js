var phantom = require('phantom');
var Encoder = require('node-html-encoder').Encoder;
var encoder = new Encoder('entity');
var fs = require('fs');
//var mysql = require('mysql');
//var db_cli = mysql.createClient({
//    'host':'localhost',
//    'user':'linda',
//    'password':'zhu',
//    'database':'mcmaster'});

phantom.create('--cookies-file=cookies\\cookies.txt --proxy=64.191.90.8:32662 --proxy-auth=pp-maybemacho:6jzkiasr',
               function(ph) {
    ph.createPage(function(page){
        var target_url = 'http://www.mcmaster.com';
        var jquery_url = 'http://code.jquery.com/jquery-1.8.0.min.js';
        page.set('settings.userAgent',
                 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.83 Safari/537.1');
        var t = Date.now();
        page.open(target_url, function (status) {
            if (status == 'success') {
                t = Date.now() - t;
                console.log('loading ' + target_url + ' done. [ ' + t + ' ms ]');
                t = Date.now();
                page.includeJs(jquery_url, function() {
                    t = Date.now() - t;
                    console.log('loading ' + jquery_url + ' done. [ ' + t + ' ms ]');
                    //page.evaluate(function(){
                    //        return $('*').html();
                    //    }, function(results){
                    //        var dump_fn = target_url.replace('http://', '') + '.htm';
                    //        fs.writeFile(dump_fn, results, function(err){
                    //            if (err) throw(err);
                    //            console.log(dump_fn + " saved.");
                    //        });
                    //    });
                    page.evaluate(function(){
                            var jq_maincategories = $('div#HomePageContent > div'), main_categories = [];
                            for (var i = 0; i < jq_maincategories.length; i++) {
                                var maincategory_title = jq_maincategories.eq(i).find('h1').html().trim();
                                main_categories[i] = {'title':maincategory_title, 'subcategories':[]};
                                var jq_subcategories = jq_maincategories.eq(i).find('div');
                                for (var j = 0; j < jq_subcategories.length; j++) {
                                    var subcategory_title = jq_subcategories.eq(j).find('h2').html().trim();
                                    if (subcategory_title.length > 0)
                                        subcategory_title = maincategory_title + '>' + subcategory_title;
                                    else
                                        subcategory_title = maincategory_title;
                                    var jq_leafcategories = jq_subcategories.eq(j).find('ul li a');
                                    for (var k = 0; k < jq_leafcategories.length; k++) {
                                        var title = jq_leafcategories.eq(k).text();
                                        var url = jq_leafcategories.get(k).href;
                                        main_categories[i]['subcategories'].push({'title': subcategory_title + '>' + title, 'url':url});
                                    }
                                }
                            }
                           return main_categories;
                        }, function (results){
                            console.log('Results:');
                            var total_categories = 0;
                            for (var i = 0; i < results.length; i++) {
                                console.log(i + ": " + encoder.htmlDecode(results[i]['title']));
                                for (var j = 0; j < results[i]['subcategories'].length; j++) {
                                    console.log("\t" + i + '|' + j + ': ' +
                                                encoder.htmlDecode(results[i]['subcategories'][j]['title'])
                                                + " [URL: " +
                                                encoder.htmlDecode(results[i]['subcategories'][j]['url']) + "]");
                                    total_categories++;
                                    //db_cli.query('INSERT INTO categories (title, url) VALUES (' + 
                                    //             db_cli.escape(encoder.htmlDecode(results[i]['subcategories'][j]['title'])) + ', ' + 
                                    //             db_cli.escape(encoder.htmlDecode(results[i]['subcategories'][j]['url'])) + ')',
                                    //             function(err, rows, cols){
                                    //                if (err) throw err;
                                    //                });
                                }
                            }
                            console.log("Totally %d categories.", total_categories);
                            ph.exit();
                            //db_cli.end();
                        });
                });
            } else {
                console.log('loading ' + target_url + ' failed.');
            }
        });
    });
});
