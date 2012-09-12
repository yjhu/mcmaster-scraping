var page = require('webpage').create();
var sys = require('system');

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0';

var first_round = true;
//console.log(sys.args[1]);
var cmd = JSON.parse(sys.args[1]);

//page.onConsoleMessage = function (msg) { console.log(msg); };
page.open(cmd['url'], function (status) {
    if (status === 'success') {       
        //console.log('loading ' + page.evaluate(function(){return window.location.toString();}) + ' done.');
        if (first_round) {
            setTimeout( function() {
                page.injectJs('page_utils.js');
                page.injectJs('jquery-1.8.1.min.js');
                
                var timeout = 0;
                if (cmd['dom_id']) {
                    page.evaluate(function() {
                        var selector = 'div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr div#' + arguments[0];
                        var dom_el = $(selector)[0];
                        if (dom_el) {
                           fireEvent(dom_el, 'click');
                        }
                    }, cmd['dom_id']);
                    timeout = 5000;
                }
                
                setTimeout(function () {
                    var results = page.evaluate(function(){
                        var cmd = arguments[0];
                        if ($('div#MainContent > div#HomePage').length > 0){
                            return mcmaster_homepage(cmd);
                        } else
                        if ($('div#MainContent div#IntermediatePageWebPart_Page').length > 0) {
                            return mcmaster_intermediatepage(cmd);
                        } else if ($('div#MainContent div#ProductPage').length > 0) {
                            return mcmaster_productpage(cmd);
                        } else {
                            var results = {};
                            results['STATUS'] = 'failure';
                            return results;
                        }
                    }, cmd);
                    console.log(JSON.stringify(results));
                    phantom.exit();
                }, timeout);
            }, 5000);
            first_round= false;
        }
    } else {
        //console.log('loading ' + target_url + ' failed.');
        phantom.exit(1);
    }
});