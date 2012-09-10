var page = require('webpage').create();
var sys = require('system');

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0';
var target_url = 'http://www.mcmaster.com/#orders';

var first_round = true;
var product_sku = sys.args[1];
var product_qty = sys.args[2];

//page.onConsoleMessage = function (msg) { console.log(msg); };
page.open(target_url, function (status) {
    if (status === 'success') {       
        //console.log('loading ' + page.evaluate(function(){return window.location.toString();}) + ' done.');
        if (first_round) {
            setTimeout( function() {
                page.injectJs('jquery-1.8.1.min.js');
                page.evaluate(function() {
                    var product_sku = arguments[0], product_qty = arguments[1];
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_QtyCell:first input').focus();
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_QtyCell:first input').val(product_qty);
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first input').focus();
                    $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first input').val(product_sku);
                    $('table#OrdPadProdsWebPart_OrdLnTbl a.OrdPadProdsWebPart_AddOrdLnsLnk:first').click();
                }, product_sku, product_qty);
                setTimeout(function() {
                    var results = page.evaluate(function() {
                        var product_sku = arguments[0], product_qty = arguments[1];
                        var results = {};
                        if ($('div#OrdPadProdsWebPart_OrdLnErrMsgCntnr').hasClass('OrdPadProdsWebPartLayout_Hide') &&
                                $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first').text() == product_sku) {
                            results['STATUS'] = 'success';
                            results['RESULT'] = {};
                            results['RESULT']['TYPE'] = 'product-fullinfo';
                            results['RESULT']['DATA'] = {};
                            results['RESULT']['DATA']['sku'] = product_sku;
                            var title = $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_PartDscCell:first div > div > div').text();
                            var cut_pos = title.indexOf('Order quantity');
                            if (cut_pos > 0)
                                title = title.substring(0, cut_pos - 1);
                            results['RESULT']['DATA']['title'] = title;
                            var shipment = $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ShpsCell:first').text();
                            var online_inventory, nj_inventory;
                            if (shipment.match(/^\d+\s+week/i) != null) {
                                online_inventory = "<< " + product_qty;
                                nj_inventory = "unknown";
                            } else {
                                var numbers = shipment.match(/\d+/g);
                                if (!numbers) {
                                    online_inventory = "> " + product_qty;
                                    nj_inventory = "unknown";
                                } else if (shipment.indexOf('New Jersey') > 0) {
                                    online_inventory = product_qty - numbers[0];
                                    nj_inventory = "> " + numbers[0];
                                } else {
                                    online_inventory = numbers[0];
                                    nj_inventory = "unknown";
                                }
                            }
                            results['RESULT']['DATA']['online_inventory'] = online_inventory;
                            results['RESULT']['DATA']['nj_inventory'] = nj_inventory;
                            var unit_price = $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_UnitPrceCell:first').text();
                            var price = unit_price.match(/^\$[\d\.]+/)[0].replace('$', '');
                            var unit = unit_price.split(/\s+/)[1];
                            results['RESULT']['DATA']['price'] = price;
                            results['RESULT']['DATA']['unit'] = unit;
                            
                            $('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_DelCell:first a').click();
                        } else {
                            results['STATUS'] = 'failure';
                        }
                       
                        //console.log("Error? " + !$('div#OrdPadProdsWebPart_OrdLnErrMsgCntnr').hasClass('OrdPadProdsWebPartLayout_Hide'));
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_QtyCell:first input').val());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ItmCell:first').text());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_PartDscCell:first').text());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_ShpsCell:first').text());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_UnitPrceCell:first').text());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_TotLnPrceCell:first').text());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_DelCell:first a').html());
                        //console.log($('table#OrdPadProdsWebPart_OrdLnTbl a.OrdPadProdsWebPart_AddOrdLnsLnk:first').html());
                        //$('table#OrdPadProdsWebPart_OrdLnTbl td.OrdPadProdsWebPartLayout_DelCell:first a').click();
                        
                         return results;
                    }, product_sku, product_qty);
                    console.log(JSON.stringify(results));
                    phantom.exit();
                }, 5000);
            }, 5000);
            first_round= false;
        }
    } else {
        //console.log('loading ' + target_url + ' failed.');
        phantom.exit(1);
    }
});