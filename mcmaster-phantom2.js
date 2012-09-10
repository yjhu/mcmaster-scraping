/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    //console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0';
var target_url = 'http://www.mcmaster.com/#socket-head-cap-screws';
//page.onConsoleMessage = function (msg) { console.log(msg); };
page.open(target_url, function (status) {
    if (status === 'success') {       
        //console.log('loading ' + page.evaluate(function(){return window.location.toString();}) + ' done.');
        
        page.injectJs('page_utils.js');
        page.injectJs('jquery-1.8.1.min.js');
        
        waitFor(function(){
            return page.evaluate(function() {
                var dom_el = $('div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr div#Abbr_476881629883')[0];
                if (dom_el) {
                    fireEvent(dom_el, 'click');
                    return true;
                } else
                    return false;
                //if ($('div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr div#Abbr_476881629883')){
                //    $('div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr div#Abbr_476881629883').click();
                //    return true;
                //} else {
                //    return false;
                //}
            });
        }, function(){
        }, 3000);
        
        waitFor(function() {
            return page.evaluate(function() {
                return ($('table[id*="RenderableTbl_"]').length > 0);
            });
        }, function() {
            var results = page.evaluate(function() {
                var jq_els = $('table[id*="RenderableTbl_"]');
                var results = {};
                for (var i = 0; i < jq_els.length; i++) {
                    var thread_size;
                    var trs = jq_els.eq(i).find('tbody').find('tr');
                    for (var j = 0; j < trs.length; j++) {
                        if (trs.eq(j).find('td').length == 0) {
                            thread_size = trs.eq(j).find('th').text();
                        } else {
                            var tmp_item = {};
                            var tds = trs.eq(j).find('td');
                            tmp_item['Thread Size'] = thread_size;
                            tmp_item['Length'] = tds.eq(0).text();
                            tmp_item['Package Quantity'] = tds.eq(1).text();
                            var sku = tds.eq(2).text();
                            if (sku.indexOf('*') != -1) {
                                tmp_item['Threaded'] = 'Fully Threaded';                                
                            } else {
                                tmp_item['Threaded'] = 'Partially Threaded';
                            }
                            tmp_item['SKU'] = sku.replace('*','');
                            tmp_item['Price Per Package'] = tds.eq(3).text().replace('$','');
                            results[tmp_item['SKU']] = tmp_item;
                        }
                    }
                }
                return results;
            });
            //console.log("Thread Size\tLength\tPackage Quantity\tSKU\tPrice Per Package\tThreaded");
            //var total = 0;
            //for (var key in results) {
            //    total++;
            //    console.log(results[key]['Thread Size'] + "\t" + results[key]['Length'] + "\t" + results[key]['Package Quantity']
            //                + "\t" + results[key]['SKU'] + "\t" + results[key]['Price Per Package'] +
            //                "\t" + results[key]['Threaded']);
            //}
            //console.log("Totally " + total + " items.");
            console.log(JSON.stringify(results));
            phantom.exit();
        }, 10000);
     
    } else {
        console.log('loading ' + target_url + ' failed.');
    }
});