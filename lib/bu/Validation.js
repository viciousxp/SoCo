// file: node.js
// Description: Node Object Superclass

var Validator = require('validator').Validator
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , logger = require('../routes/logger');

function Validation() {};

//custom validation methods
Validator.prototype.isBoolean = function(str) {
    if (this.str == 'true' || this.str == 'false') {
        return true;
    } else {
        this.error(this.msg || this.str + ' is not of type Boolean');
    }
}

Validator.prototype.isString = function(str) {
    if (typeof this.str === 'string' || this.str instanceof String) {
        return true;
    } else {
        this.error(this.msg || this.str + ' is not of type String');
    }
}


Validation.prototype.validate = function (object, validation) {
    // this function will actually perform the validation. It expects three parameters,
    // the object is the string against which validation will be performed.
    // the validation should be made up of two key value pairs, i.e. {type: 'type', validation: 'validation'}
    // the type represents the type of validation to be performaed, whereas validation represents
    // the expected outcome. validation can also accept an array of validation methods.
    // the callback only accepts one parameter, err. If there is an error the callback will be 
    // triggered with an err, otherwise null will be returned.

    if (typeof object === 'undefined' || typeof validation === 'undefined') {
        return ['Missing parameters for validation'];
    }

    if (Array.isArray(object)) return callback('object cannot be an array');

    if (!Array.isArray(validation)) validation = [validation];

    var errs = [];

    for (var i = 0; i < validation.length; i++) {
        var validate = validation[i];

        logger.debug('***** validation *****');
        logger.debug('> ' + object);
        logger.debug('> ' + validate.type);
        logger.debug('> ' + validate.validation);

        if (typeof validate.type === 'undefined' || typeof validate.validation === 'undefined') errs.push('Invalide validation object provided');
        var errorMsg = (typeof validate.errorMsg !== 'undefined') ? validate.errorMsg : {}; 
        if (validate.type === 'is') {
            try {
                if (Array.isArray(validate.validation)) {
                    check(object, errorMsg).is(validate.validation[0], validate.validation[1]);
                } else {
                    check(object, errorMsg).is(validate.validation);
                }
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'not') {
            try {
                if (Array.isArray(validate.validation)) {
                    check(object, errorMsg).not(validate.validation[0], validate.validation[1]);
                } else {
                    check(object, errorMsg).not(validate.validation);
                }
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isBoolean') {
            try {
                check(object, errorMsg).isBoolean()
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isString') {
            try {
                check(object, errorMsg).isString()
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isEmail') {
            try {
                check(object, errorMsg).isEmail(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isUrl') {
            try {
                check(object, errorMsg).isUrl(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isIP') {
            try {
                check(object, errorMsg).isIP(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isIPv4') {
            try {
                check(object, errorMsg).isIPv4(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isIPv6') {
            try {
                check(object, errorMsg).isIPv6(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isAlpha') {
            try {
                check(object, errorMsg).isAlpha(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isAlphanumeric') {
            try {
                check(object, errorMsg).isAlphanumeric(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isNumeric') {
            try {
                check(object, errorMsg).isNumeric(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isHexadecimal') {
            try {
                check(object, errorMsg).isHexadecimal(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isHexColor') {
            try {
                check(object, errorMsg).isHexColor(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isInt') {
            try {
                check(object, errorMsg).isInt(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isLowercase') {
            try {
                check(object, errorMsg).isLowercase(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isUppercase') {
            try {
                check(object, errorMsg).isUppercase(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isDecimal') {
            try {
                check(object, errorMsg).isDecimal(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isFloat') {
            try {
                check(object, errorMsg).isFloat(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'notNull') {
            try {
                check(object, errorMsg).notNull(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isNull') {
            try {
                check(object, errorMsg).isNull(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'notEmpty') {
            try {
                check(object, errorMsg).notEmpty(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'equals') {
            try {
                check(object, errorMsg).equals(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'contains') {
            try {
                check(object, errorMsg).contains(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'notContains') {
            try {
                check(object, errorMsg).notContains(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'regex') {
            try {
                if (Array.isArray(validate.validation)) {
                    check(object, errorMsg).regex(validate.validation[0], validate.validation[1]);
                } else {
                    check(object, errorMsg).regex(validate.validation);
                }
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'notRegex') {
            try {
                if (Array.isArray(validate.validation)) {
                    check(object, errorMsg).notRegex(validate.validation[0], validate.validation[1]);
                } else {
                    check(object, errorMsg).notRegex(validate.validation);
                }
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'len') {
            try {
                if (Array.isArray(validate.validation)) {
                    check(object, errorMsg).len(validate.validation[0], validate.validation[1]);
                } else {
                    check(object, errorMsg).len(validate.validation);
                }
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isUUID') {
            try {
                check(object, errorMsg).isUUID(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isUUIDv3') {
            try {
                check(object, errorMsg).isUUIDv3(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isUUIDv4') {
            try {
                check(object, errorMsg).isUUIDv4(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isUUIDv5') {
            try {
                check(object, errorMsg).isUUIDv5(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isDate') {
            try {
                check(object, errorMsg).isDate(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isAfter') {
            try {
                check(object, errorMsg).isAfter(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isBefore') {
            try {
                check(object, errorMsg).isBefore(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isIn') {
            try {
                check(object, errorMsg).isIn(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'notIn') {
            try {
                check(object, errorMsg).notIn(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'not') {
            try {
                check(object, errorMsg).not(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'max') {
            try {
                check(object, errorMsg).max(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'min') {
            try {
                check(object, errorMsg).min(validate.validation);
            } catch (e) {
                errs.push(e.message);
            }
        } else if (validate.type === 'isCreditCard') {
            try {
                check(object, errorMsg).isCreditCard(validate.validation)
            } catch (e) {
                errs.push(e.message);
            }
        } else {
            logger.debug('Validation method not found');
            errs.push('Invalid validation method, please contact site administrator.')
        }
    }
    if (errs.length > 0) {
        return errs;
    } else {
        return;
    }
}

module.exports = Validation;

