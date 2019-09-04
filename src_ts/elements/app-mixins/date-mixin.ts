import {Constructor} from '../../types/global';
import {PolymerElement} from '@polymer/polymer/polymer-element';

declare const moment: any;
/**
 * @polymer
 * @mixinFunction
 */
function DateMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class DateMixinClass extends baseClass {
        /**
         * Format date string to any format supported by momentjs
         */
        prettyDate(dateString, format) {
            if (!format) {
                format = 'D MMM YYYY';
            }
            if (typeof dateString === 'string' && dateString !== '') {
                const date = new Date(dateString);
                if (date.toString() !== 'Invalid Date') {
                    // using moment.utc() ensures that the date will not be changed no matter timezone the user has set
                    return moment.utc(date).format(format);
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
