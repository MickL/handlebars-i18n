/********************************************************************
 * handlebars-i18next.js
 *
 * @author: Florian Walzel
 * @version: 1.0.1
 * @licence: MIT
 * @date: 2020-03
 *
 * Handlebars-i18next adds features for localization/
 * internationalization to handelbars.js
 *
 *********************************************************************/

'use strict';

class HandelbarsI18next {

  constructor() {
    this.configuredOptions = {
      DateTimeFormat : { },
      NumberFormat : { },
      PriceFormat : {
        all : { style: 'currency', currency: 'EUR' }
      }
    };
  }

  init(handlebars, i18next)  {

      let _this = this;

      handlebars.registerHelper('__',
        /**
         * retrieves the translation phrase from a key given as string
         * use like: {{__ "key_name"}}
         * or with attributes: {{__ "key_with_count" count=7}}
         *
         * @param str
         * @param attributes
         * @returns {*}
         */
        function (str, attributes) {
          return new handlebars.SafeString((typeof(i18next) !== 'undefined' ? i18next.t(str, attributes.hash) : str));
        }
      );
      handlebars.registerHelper('_locale',
        /**
         * echos the current language
         * use like: {{_locale}}
         *
         * @returns {language|any|string|*|e}
         */
        function() {
          return i18next.language;
        }
      );
      handlebars.registerHelper('localeIs',
        /**
         * checks against the current language
         * use like: {{#if (localeIs "en")}} Hello EN {{/if}}
         *
         * @returns {language|any|string|*|e}
         */
        function(language) {
          return i18next.language === language;
        }
      );
      handlebars.registerHelper('_date',
        /**
         * formats a given date by the give internationalization options
         *
         * allows multiple input forms:
         * {{_date}}
         * -> returns the current date
         *
         * {{_date "now" hour="numeric" minute="numeric" second="numeric"}}
         * -> returns the current date with specific options
         *
         * {{_date 1583922952743}}
         * -> returns the date given in milliseconds since begin of unix epoch
         *
         * {{_date "2020-03-11T03:24:00"}} or {{_date "March 11, 2020 03:24:00"}}
         * -> returns the date given according to date string
         *
         * {{_date "[2020, 2, 11]"}}
         * -> returns the date given according to parameters: year, month, day, hours, minutes, seconds, milliseconds
         *
         * @link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
         *
         * @param dateInput : string | number
         * @param options
         */
        function(dateInput, options) {

          var date;

          if (typeof dateInput == 'number') {
            // input as milliseconds since unix epoch, like: 1583922952743
            date = new Date(dateInput);
          }
          if (typeof dateInput == 'string') {

            if (dateInput.charAt(0) == '[' && dateInput.slice(-1) == ']') {
              // input as array represented as string such as "[2020, 11]"
              dateInput = dateInput.substring(1, dateInput.length-1).replace(/ /g,'');
              var dateArr = dateInput.split(',');
              var dateFactory = _this.__applyToConstructor.bind(null, Date);
              date = dateFactory(dateArr);
            }
            else if (dateInput.toLowerCase() == 'now' || dateInput.toLowerCase() == 'today') {
              // input as word "now" or "today"
              date = new Date();
            }
            else {
              // input as date string such as "1995-12-17T03:24:00"
              date = new Date(dateInput);
            }
          }
          else {
            // fallback: today date
            date = new Date();
          }

          var opts =
            (typeof options !== 'undefined' && Object.keys(options.hash).length != 0) ?
              options.hash : _this.configuredOptions.DateTimeFormat[i18next.language] ||
              _this.configuredOptions.DateTimeFormat.all;

          const dateFormat = Intl.DateTimeFormat(i18next.language, opts);
          return dateFormat.format(date);
        }
      );
      handlebars.registerHelper('_num',
        /**
         * formats a given number by internationalization options
         *
         * use with preset: {{_num 3000}}
         * or with individual option parameters: {{_num 3000 maximumSignificantDigits=1}}
         *
         *  * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
         *
         * @param number : number
         * @param options
         * @returns {*}
         */
        function(number, options) {
          var opts =
            (Object.keys(options.hash).length != 0) ? options.hash : _this.configuredOptions.NumberFormat[i18next.language] ||
            _this.configuredOptions.NumberFormat.all;

          const priceFormat = Intl.NumberFormat(i18next.language, opts);
          return priceFormat.format(number);
        }
      );
      handlebars.registerHelper('_price',
        /**
         * formats a number as currency
         *
         * use with preset: {{_price 4999.99}
               * or with individual option parameters: {{_price 4999.99 currency="EUR" maximumSignificantDigits=2}}
               *
         * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
         *
         * @param price : number
         * @param options
         * @returns {*}
         */
        function(price, options) {
          var opts =
            (Object.keys(options.hash).length != 0) ? options.hash : _this.configuredOptions.PriceFormat[i18next.language] ||
            _this.configuredOptions.PriceFormat.all;

          // for usage convenience automatically add the object parameter style:'currency' if not given
          if (typeof opts['style'] !== 'string' )
            opts['style'] = 'currency';

          const priceFormat = Intl.NumberFormat(i18next.language, opts);
          return priceFormat.format(price);
        }
      );
  }

  /**
   *
   * @param constructor
   * @param argArray
   * @returns {function(this:*)}
   * @private
   */
  __applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
  }

  /**
   *
   * @param lngShortcode
   * @param typeOfFormat
   * @param options
   * @returns {boolean}
   * @private
   */
   __validateArgs(lngShortcode, typeOfFormat, options) {

    if (typeof lngShortcode !== 'string') {
      console.log('@ HandelbarsI18next.configure(): False Argument ['+ lngShortcode +'] '+
        'First argument must be a string with language code such as "en".');
      return false;
    }

    if (typeOfFormat !== 'DateTimeFormat'
      && typeOfFormat !== 'NumberFormat'
      && typeOfFormat !== 'PriceFormat') {
      console.log('@ HandelbarsI18next.configure(): False Argument ['+ typeOfFormat +'] ' +
        'Second argument must be a string with the options key. ' +
        'Use either "DateTimeFormat", "NumberFormat" oer "PriceFormat".');
      return false;
    }

    if (typeof options !== 'object') {
      console.log('@ HandelbarsI18next.configure(): False Argument [' + options + '] ' +
        'Third argument must be an object containing the configuration parameters');
      return false;
    }

    return true;
  }

  /**
   *
   * @param langOrArr
   * @param typeOfFormat
   * @param options
   * @returns {boolean}
   */
  configure(langOrArr, typeOfFormat, options) {

    if (Array.isArray(langOrArr)) {
      langOrArr.forEach(elem => {
        if (this.__validateArgs(elem[0], elem[1], elem[2]))
          this.configuredOptions[elem[1]][elem[0]] = elem[2];
        else
          return false;
      });
    }
    else {
      if (this.__validateArgs(langOrArr, typeOfFormat, options))
        this.configuredOptions[typeOfFormat][langOrArr] = options;
      else
        return false;
    }

    return true;
  }
}