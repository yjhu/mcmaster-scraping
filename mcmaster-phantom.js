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
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0';
var target_url = 'http://www.mcmaster.com';
page.open(target_url, function (status) {
    if (status === 'success') {
        page.injectJs('page_utils.js');
        console.log('loading ' + page.evaluate(function(){return window.location.toString();}) + ' done.');
        waitFor(function() {
            return page.evaluate(function() {
                return document.getElementById('MastheadLoginUsrCtrlCntnr');
            });
        }, function() {
            var login = page.evaluate(function() {
                return (document.getElementById('MastheadLoginUsrCtrlCntnr').getElementsByTagName('a')[0].textContent);
            });
            if (login === 'Log in') {
                page.evaluate(function() {
                    var el = document.getElementById('MastheadLoginUsrCtrlCntnr').getElementsByTagName('a')[0];
                    fireEvent(el, 'click');
                });
                waitFor(function(){
                    return page.evaluate(function(){
                        return !(document.getElementById('MastheadLoginInner').style.display === 'none');
                    });
                }, function(){
                    var el = page.evaluate(function(){
                        return document.getElementById('MastheadLoginInner').innerHTML;
                    });
                    console.log(el);
                    phantom.exit();
                }, 3000);
            } else {
                console.log(login + ' logged in.');
                phantom.exit();
            }
        }, 3000);
     
    } else {
        console.log('loading ' + target_url + ' failed.');
    }
});