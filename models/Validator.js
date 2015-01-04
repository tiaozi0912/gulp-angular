/**
 * Validator class for validating data with pre-defined rules
 *
 * Usage:
 * var data = {name: 'Y'};
 * var validator = new Validator({name: presence, minLength: 2});
 * if (validator.validates(data) === true) { ... } // -> {field: name, message: 'name can't be less than 2 characters.'}
 *
 * Author: Yujun Wu <wyj0912@gmail.com>
 * Date: 1/3/2015
 */

(function() {
  'use strict';

  var _ = require('underscore');

  /**
   * Validator Class
   *
   * @param {Object} validation - specify how to validate
   *   - key: field name
   *   - value: validation rule
   *   e.x. { name: { presence: true, minLength: 2 } }
   *
   * Validation Rules:
   *   presence
   *   minLength
   *   maxLength
   *   regex
   *
   * @return {Array | Boolean} res - true if valid. Otherwises returns the errors array
   */
  var Validator = function(validation) {
    this.validation = validation;
  };

  Validator.prototype.validates = function(data) {
    var errors = [],
        errMsg;

    _.each(this.validation, function(rule, property) {
      if (rule.presence) {
        if (!data.hasOwnProperty(property)) {
          errMsg = property + ' can\'t be empty.';
          errors.push({
            field: property,
            message: errMsg
          });

          return;
        }
      }

      if (rule.maxLength && data.hasOwnProperty(property)) {
        if (data[property].length > rule.maxLength) {
          errMsg = property + ' can\'t be more than ' + rule.maxLength + ' characters.';
          errors.push({
            field: property,
            message: errMsg
          });
        }
      }

      if (rule.minLength && data.hasOwnProperty(property)) {
        if (data[property].length < rule.minLength) {
          errMsg = property + ' can\'t be less than ' + rule.minLength + ' characters.';
          errors.push({
            field: property,
            message: errMsg
          });
        }
      }

      if (rule.regex && data.hasOwnProperty(property)) {
        if (!rule.regex.test(data[property])) {
          errMsg = property + ' is not valid.';
          errors.push({
            field: property,
            message: errMsg
          });
        }
      }
    });

    if (errors.length) {
      return errors;
    }

    return true;
  };

  module.exports = Validator;
})();
