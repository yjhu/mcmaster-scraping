var phantom = require('phantom');
var Encoder = require('node-html-encoder').Encoder;
var encoder = new Encoder('entity');
var fs = require('fs');
var page_loaded = false;

phantom.create('--cookies-file=cookies\\cookies.txt',
               function(ph) {
    ph.createPage(function(page){
        var target_url = 'http://www.mcmaster.com/#socket-head-cap-screws';
        var jquery_url = 'http://code.jquery.com/jquery-1.8.0.min.js';
        page.set('settings.userAgent',
                 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.83 Safari/537.1');
        page.open(target_url, function (status) {
            if (status) {
                console.log('loading ' + target_url + ' done.');
                page.includeJs(jquery_url, function() {
                    console.log('loading ' + jquery_url + ' done.');
                    page.evaluate(function(){
                       if ($('div#MainContent div#ProductPage').length > 0) {
                            return true;
                       } else {
                            return false;
                       }                   
                   }, function (results){
                       if (results) {
                            if (!page_loaded) {
                                page_loaded = true;
                                page.evaluate(function(){
                                    var jq_els = $('div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr'), results = [];
                                    for (var i = 0; i < jq_els.length; i++) {
                                        var sub_title = jq_els.eq(i).children().first().find('h3').html().replace(/<br>/g, ' ').replace(/\s+/g, ' ');
                                        var jq_prods = jq_els.eq(i).find('div#PrsnttnRowCntnr').find('div[id*="Abbr_"]');
                                        for (var j = 0; j < jq_prods.length; j++) {
                                            var id = jq_prods.eq(j).attr('id');
                                            var prod_title = jq_prods.eq(j).find('h3').html().replace(/<br>/g, ' ').replace(/<[^<>]*>/g, '').replace(/\s+/g, ' ');
                                            results.push(id + ':' + sub_title + '>' + prod_title);
                                        }
                                        
                                    }
                                    return results;
                                }, function(results){
                                    for (var i = 0; i < results.length; i++) {
                                        console.log(results[i]);
                                    }
                                    var id = results[0].split(':')[0];
                                    console.log(id);
                                    page.evaluate(function(id){
                                        var jq_str = 'div#' + id;
                                        return $(jq_str).click();
                                    }, function(results) {
                                        page.get('content', function(results){
                                            console.log(results);
                                        });
                                    });
                                    ph.exit();
                                });
                            }
                       }
                   });
                });   
            } else {
                console.log('loading ' + target_url + ' failed.');
            }
        });
    });
});
