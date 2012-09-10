var phantom = require('phantom');
var Encoder = require('node-html-encoder').Encoder;
var encoder = new Encoder('entity');
var fs = require('fs');
var page_loaded = false;

phantom.create('--cookies-file=cookies.txt',
               function(ph) {
    ph.createPage(function(page){
        var target_url = 'http://www.mcmaster.com/#socket-head-cap-screws';
        var jquery_url = 'http://code.jquery.com/jquery-1.8.0.min.js';
        page.set('settings.userAgent',
                 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0');
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
                                page_loaded = true
                                setTimeout(function() {
                                page.evaluate(function(){
                                    var jq_els = $('div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr div#Abbr_9746256602121 img');
                                    var results = [];
                                    for (k in jq_els.properties)
                                        results.push(jq_els.properties[k]);
                                }, function(results) {
                                    console.log(results.join('\n'));
                                });
                                }, 5000);
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
