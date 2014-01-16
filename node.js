/**
 * Copyright 2013 MongoDB Inc
 * Author: Henrik Ingo
 *
 * Note: This software is published as open source for purposes of sharing 
 * MongoDB examples and use cases. This is not an official product of MongoDB Inc
 * and there's no support available.
 */

// Node.js entry file, contains only Node.js specific things

var clone = require('clone'); 
var debug = module.parent.exports.debug; 


var xml2json = module.exports = require('./xml2json.js');

debug("xml2json is loaded");


// Add 2 node.js middleware filters

/**
 * Pull data in req.body to req.rawBody where it can be read as simple text 
 * 
 * node.js / restify is so json centric, we have to implement xml support ourselves
 */
module.exports.rawBodyParser = function( req, res, next ) {
    var chunks = [];
    req.on('data', function (data) {
      chunks.push(data);
    });
    req.on('end', function(){
      req.rawBody = Buffer.concat(chunks).toString();
    });
    return next();
};
  
/**
 * When req.body contains application/xml, translate it to Json and put into req.params
 */
module.exports.xmlToJsonParams = function( req, res, next ) {
    var jsObj = {};
    if ( req.headers["content-type"] == "application/xml" ) {
      jsObj = xml2json.toObj( xml2json.parseXml( req.rawBody ) );
      for ( var key in jsObj ) {
        // Avoid overwriting things that might already be there (using params is wrong, but this is how rest of crest works...)
        if( ! req.params[key] ) {
          req.params[key] = jsObj[key];
        }
      }
    }
    return next();
};
