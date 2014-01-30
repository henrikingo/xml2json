/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.10
	Author:  Stefan Goessner/2006, Henrik Ingo/2013
	Web:     https://github.com/henrikingo/xml2json 
*/
function json2xml_translator() {
 var X = {
   toXml: function(v, name=null, ind="", mySiblingAttrs = {}) {
      var xml = "";

      if (v instanceof Array) {
         xml += ind + "<" + name;
         // Since we are dealing with an Array, there cannot be child attributes, 
         // but there can be sibling attributes passed by caller
         for (var m in mySiblingAttrs) {
               xml += " " + m + "=\"" + mySiblingAttrs[m].toString() + "\"";            
         }
         xml += ">\n";
         for (var i=0, n=v.length; i<n; i++) {
            if (v[i] instanceof Array) {
               // TODO: Honestly, I have no idea what this does, nor what it should do... (nested lists, what does that even mean in xml?)
               xml += ind + X.toXml(v[i], name, ind+"\t") + "\n";
            }
            else if ( typeof v[i] == 'object' ) {
               xml += X.toXml(v[i], null, ind);
            }
            else {
               xml += ind + "\t" + v[i].toString();
               xml += (xml.charAt(xml.length-1)=="\n"?"":"\n");
            }
         }
         if( name != null ) {
            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
         }
      }
      else if (typeof(v) == "object") {
         var hasChild = false;
         if (name === null ) {
            // root element
            // note: for convenience, if the top level in json has multiple elements, we'll just output multiple xml documents after each other
            // ... this space intentionally left blank ...
         }
         else {
            xml += ind + "<" + name;
         }
         // Before doing anything else, check for and separate those that 
         // are attributes of the "sibling attribute" type (see below)
         var newSiblingAttrs = {};
         for (var m in v) {
            if( m.search("@") >= 1 ) { // @ exists, but is not the first character
               var parts = m.split("@");
               if( typeof newSiblingAttrs[parts[0]] == 'undefined' ) newSiblingAttrs[parts[0]] = {};
               newSiblingAttrs[parts[0]][parts[1]] = v[m];
               delete v[m];
            }
         }
         for (var m in v) {
            // For backward compatibility we allow both forms. An attribute can 
            // either be a child, like so: {e : {@attribute : value}} or a
            // sibling, like so: {e : ..., e@attribute : value }
            // This test for the child (legacy)
            if (m.charAt(0) == "@")
               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
               hasChild = true;
         }
         // Now add sibling attributes (passed by caller)
         for (var m in mySiblingAttrs) {
               xml += " " + m + "=\"" + mySiblingAttrs[m].toString() + "\"";            
         }
         if( name != null ) {
            xml += hasChild ? "" : "/";
            xml += ">\n";
         }
         if (hasChild) {
            for (var m in v) {
               // legacy form
               if (m == "#text")
                  xml += v[m];
               else if (m == "#cdata")
                  xml += "<![CDATA[" + v[m] + "]]>";
               else if ( m.charAt(0) != "@" )
                  xml += X.toXml(v[m], m, ind+"\t", newSiblingAttrs[m]) + "\n";
            }
            if( name != null ) {
               xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
            }
         }
      }
      else {
         // string or number value
         xml += ind + "<" + name;
         // Add sibling attributes (passed by caller)
         for (var m in mySiblingAttrs) {
               xml += " " + m + "=\"" + mySiblingAttrs[m].toString() + "\"";            
         }
         xml += ">";
         xml += v.toString() +  "</" + name + ">";
      }
      return xml;
   },
   parseJson: function(jsonString) {
      var obj;
      // TODO: Should use real JSON parser (in a way that works both in node and browser)
      eval( "obj = " + jsonString + ";" );
      return obj;
   }
 };
 return X;
}

function json2xml(json, tab) {
   var X = json2xml_translator();
   var xml = X.toXml( X.parseJson(json) );
   // If tab given, do pretty print, otherwise remove white space
   return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}


// node.js
if ( typeof module != 'undefined' ) {
    module.exports = json2xml_translator();
}
