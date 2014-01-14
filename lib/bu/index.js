exports.Graph = require('./Graph');
exports.Index = require('./Index');


function Config(config) {
    this.config = config || undefined;
};

exports.Config = Config;

/******************************************************************************/
/*                                                                            */
/* Get dependencies                                                           */
/*                                                                            */
/******************************************************************************/

var Logger = require('./Logger')
  , request = require('request');

/******************************************************************************/
/*                                                                            */
/* property getters and setter                                                */
/*                                                                            */
/******************************************************************************/


/******************************************************************************/
/*                                                                            */
/* Methods                                                                    */
/*                                                                            */
/******************************************************************************/

Config.prototype.test = function() {
    console.log('test successful');
}