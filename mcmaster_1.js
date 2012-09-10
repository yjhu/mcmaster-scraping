var phantom = require('phantom');
var Encoder = require('node-html-encoder').Encoder;
var encoder = new Encoder('entity');
var fs = require('fs');

phantom.create('--cookies-file=cookies\\cookies.txt',
               function(ph) {
    ph.createPage(function(page){
        var target_url = 'http://www.mcmaster.com#screws';
        var jquery_url = 'http://code.jquery.com/jquery-1.8.0.min.js';
        page.set('settings.userAgent',
                 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.83 Safari/537.1');
        var t = Date.now();
        page.open(target_url, function (status) {
            if (status) {
                t = Date.now() - t;
                console.log('loading ' + target_url + ' done. [ ' + t + ' ms ]');
                t = Date.now();
                page.includeJs(jquery_url, function() {
                    t = Date.now() - t;
                    console.log('loading ' + jquery_url + ' done. [ ' + t + ' ms ]');
                    page.evaluate(function(){
                            var jq_els = $('div#MainContent div.IntermediatePrsnttnLayout_Prsnttn_Img_List'), results = [];
                            for (var i = 0; i < jq_els.length; i++) {
                                var sub_title = jq_els.eq(i).prev('div').find('h1').html().trim();
                                var sub_categories = jq_els.eq(i).find('a');
                                for (var j = 0; j < sub_categories.length; j++) {
                                    var title = sub_categories.eq(j).next().find('span').html().trim();
                                    var url = sub_categories[j].href;
                                    results.push({'title':sub_title + '>' + title, 'url':url});
                                }
                                
                            }
                           return results;
                        }, function (results){
                            console.log('Results:');
                            for (var i = 0; i < results.length; i++) {
                                console.log('====== results ' + i + ' ========');
                                console.log(results[i]['title'] + '(' + results[i]['url'] + ')');
                            }
                            ph.exit();
                        });
                });
            } else {
                console.log('loading ' + target_url + ' failed.');
            }
        });
    });
});
