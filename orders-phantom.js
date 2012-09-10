var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0';
var target_url = 'http://www.mcmaster.com/#orders';
page.onConsoleMessage = function (msg) { console.log(msg); };
page.viewportSize = { width: 800, height: 600 }
var first_round = true;
var test_qty = '999999';
var test_item = '91251A001';
page.open(target_url, function (status) {
    if (status === 'success') {       
        console.log('loading ' + page.evaluate(function(){return window.location.toString();}) + ' done.');
        if (first_round) {
            setTimeout( function() {
                page.injectJs('jquery-1.8.1.min.js');
                page.evaluate(function() {
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_QtyCell:first input').focus();
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_QtyCell:first input').val('999999');
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first input').focus();
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first input').val('91251A001');
                    $('table#OrdPadProdsWebPart_OrdLnTbl a.OrdPadProdsWebPart_AddOrdLnsLnk:first').click();
                });
                setTimeout(function() {
                    page.evaluate(function() {
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl').html());
                        console.log("Error? " + !$('div#OrdPadProdsWebPart_OrdLnErrMsgCntnr').hasClass('OrdPadProdsWebPartLayout_Hide'));
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_QtyCell:first input').val());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first input').val());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_PartDscCell:first').text());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ShpsCell:first').text());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_UnitPrceCell:first').text());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_TotLnPrceCell:first').text());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_DelCell:first a').html());
                        console.log($('table#OrdPadProdsWebPart_OrdLnTbl a.OrdPadProdsWebPart_AddOrdLnsLnk:first').html());
                        $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_DelCell:first a').click();
                    });
                    phantom.exit();
                }, 5000);
            }, 5000);
            first_round= false;
        }
    } else {
        console.log('loading ' + target_url + ' failed.');
    }
});