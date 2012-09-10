var phantom = require('phantom');

phantom.create('--cookies-file=cookies\\cookies.txt',
               function(ph) {
    ph.createPage(function(page){
        var target_url = 'http://www.mcmaster.com/#orders';
        //var jquery_url = 'http://code.jquery.com/jquery-1.8.0.min.js';
        page.set('settings.userAgent',
                 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0');
        page.open(target_url, function (status) {
            if (status) {
                console.log('loading ' + target_url + ' done.');
                page.evaluate(function(){
                    return document.documentElement.innerHTML;
                }, function(results){
                    if (results) {
                        console.log(results);
                        ph.exit();
                    }
                });
            } else {
                console.log('loading ' + target_url + ' failed.');
            }
        });
    });
});
