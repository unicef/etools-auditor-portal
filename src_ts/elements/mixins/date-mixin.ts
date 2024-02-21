import {LitElement} from 'lit';
import {Constructor} from '@unicef-polymer/etools-types';
import dayjs from 'dayjs';
import dayJsUtc from 'dayjs/plugin/utc.js';
dayjs.extend(dayJsUtc);
/**
 * @polymer
 * @mixinFunction
 */
function DateMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DateMixinClass extends baseClass {
    /**
     * Format date string to any format supported by dayjs
     */
    prettyDate(dateString, format) {
      if (!format) {
        format = 'D MMM YYYY';
      }
      if (typeof dateString === 'string' && dateString !== '') {
        const date = new Date(dateString);
        if (date.toString() !== 'Invalid Date') {
          // using dayjs.utc() ensures that the date will not be changed no matter timezone the user has set
          return dayjs.utc(date).format(format);
        }
      }
      return '';
    }

    /**
     * Prepare date from string
     */
    prepareDate(dateString) {
      if (typeof dateString === 'string' && dateString !== '') {
        let date = new Date(dateString);
        if (date.toString() === 'Invalid Date') {
          date = new Date();
        }
        return date;
      } else {
        return new Date();
      }
    }
  }
  return DateMixinClass;
}

export default DateMixin;
