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

var mcmaster_fireClick = function (dom_element) {
    var dom_evt = document.createEvent("MouseEvents");
    dom_evt.initEvent("click", true, true);
    return !dom_element.dispatchEvent(dom_evt);
};