/**
* trigger a DOM event via script
* @param {Object,String} element a DOM node/node id
* @param {String} event a given event to be fired - click,dblclick,mousedown,etc.
*/
var fireEvent = function(element, event) {
   var evt;
   var isString = function(it) {
       return typeof it == "string" || it instanceof String;
   }
   element = (isString(element)) ? document.getElementById(element) : element;
   if (document.createEventObject) {
       // dispatch for IE
       evt = document.createEventObject();
       return element.fireEvent('on' + event, evt)
   }
   else {
       // dispatch for firefox + others
       evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true); // event type,bubbling,cancelable
       return !element.dispatchEvent(evt);
   }
};

function sleep(ms){
   var start = Date.now();
   while(true){
      var now = Date.now();
      if (now - start > ms) break;
   }
}

Array.prototype.unique = Array.prototype.unique ||
  function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
          j = ++i;
      }
      a.push(this[i]);
    }
    return a;
  };
  
var mcmaster_fireClick = function (dom_element) {
    var dom_evt = document.createEvent("MouseEvents");
    dom_evt.initEvent("click", true, true);
    return !dom_element.dispatchEvent(dom_evt);
};

var mcmaster_homepage = function (cmd) {
   //console.log("enter mcmaster_homepage.")
    var results = {};
    results['STATUS'] = 'success';
    results['RESULTS'] = {};
    results['RESULTS']['TYPE'] = 'categories-list';
    results['RESULTS']['DATAHDR'] = cmd;
    results['RESULTS']['DATA'] = [];
    var jq_maincatgs = $('div#MainContent div#HomePage div#HomePageContent div.catg');
    for (var i = 0, len = jq_maincatgs.length; i < len; i++) {
        var main_title;
        main_title = jq_maincatgs.eq(i).find('h1').text();
        var jq_subcatgs = jq_maincatgs.eq(i).find('div.subcat');
        for (var j = 0, len1 = jq_subcatgs.length; j < len1; j++) {
            var sub_title = jq_subcatgs.eq(j).find('h2').text();
            var title = '';
            if (main_title) title += main_title + '>';
            if (sub_title) title += sub_title + '>';
            var jq_archors = jq_subcatgs.eq(j).find('ul li a');
            for (var k = 0, len2 = jq_archors.length; k < len2; k++) {
                var category = {};
                category['title'] = title + jq_archors.eq(k).text();
                category['url'] =  jq_archors[k].href;
                results['RESULTS']['DATA'].push(category);
            }
        }
    }
    return results;
}

var mcmaster_intermediatepage = function (cmd) {
    //console.log("enter mcmaster_intermediatepage.")
    var results = {};
    results['STATUS'] = 'success';
    results['RESULTS'] = {};
    results['RESULTS']['TYPE'] = 'categories-list';
    results['RESULTS']['DATAHDR'] = cmd;
    results['RESULTS']['DATA'] = [];
    var jq_els = $('div#MainContent div.IntermediatePrsnttnLayout_Prsnttn_Img_List');
    for (var i = 0; i < jq_els.length; i++) {
      var sub_title = jq_els.eq(i).prev('div').find('h1').html().trim();
      var sub_categories = jq_els.eq(i).find('a');
      for (var j = 0; j < sub_categories.length; j++) {
            var title = sub_categories.eq(j).next().find('span').html().trim();
            var url = sub_categories[j].href;
            results['RESULTS']['DATA'].push({'title':sub_title + '>' + title, 'url':url});
      }
   }
   return results;
}

var mcmaster_productpage_categories = function (cmd) {
   //console.log("enter mcmaster_productpage_categories.")
   var results = {};
   results['STATUS'] = 'success';
   results['RESULTS'] = {};
   results['RESULTS']['TYPE'] = 'categories-list';
   results['RESULTS']['DATAHDR'] = cmd;
   results['RESULTS']['DATA'] = [];
   var jq_els = $('div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr');
   for (var i = 0; i < jq_els.length; i++) {
       var sub_title = jq_els.eq(i).children().first().find('h3').html().replace(/<br>/g, ' ').replace(/<[^<>]*>/g, '').replace(/\s+/g, ' ');
       var jq_prods = jq_els.eq(i).find('div#PrsnttnRowCntnr').find('div[id*="Abbr_"]');
       for (var j = 0; j < jq_prods.length; j++) {
           var id = jq_prods.eq(j).attr('id');
           var prod_title = jq_prods.eq(j).find('h3').html().replace(/<br>/g, ' ').replace(/<[^<>]*>/g, '').replace(/\s+/g, ' ');
           if (sub_title) prod_title = sub_title + '>' + prod_title;
           results['RESULTS']['DATA'].push({'title':prod_title, 'url':cmd['url'], 'domid':id});
       }
       
   }
   return results;
}

var mcmaster_productpage_products = function (cmd) {
   //console.log("enter mcmaster_productpage_products.")
   var results = {};
   results['STATUS'] = 'success';
   results['RESULTS'] = {};
   results['RESULTS']['TYPE'] = 'products-list';
   results['RESULTS']['DATAHDR'] = cmd;
   var jq_els = $('table[id*="RenderableTbl_"] td.ItmTblCellPartNbr');
   var skus = [];
   for (var i = 0; i < jq_els.length; i++) {
      var sku = jq_els.eq(i).text();
      sku = sku.match(/[\dA-Za-z]+/) ? sku.match(/[\dA-Za-z]+/)[0] : null;
      if (sku) skus.push(sku);
   }
   results['RESULTS']['DATA'] = skus.sort().unique();
   return results;
}

var mcmaster_productpage = function (cmd) {
   //console.log("enter mcmaster_productpage.")
   //if (cmd['dom_id']) {
   //   var selector = 'div#MainContent div#ProductPage div#ProdPrsnttnGrpCntnr div#' + cmd['dom_id'];
   //   console.log(selector);
   //   var dom_el = $(selector)[0];
   //   console.log(dom_el.outerHTML);
   //   if (dom_el) {
   //      fireEvent(dom_el, 'click');
   //   }
   //   sleep(5000); // busy waiting
   //}
   if ($('table[id*="RenderableTbl_"]').length > 0) {
      return mcmaster_productpage_products(cmd);
   } else {
      return mcmaster_productpage_categories(cmd);
   }
}