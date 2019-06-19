import {Constructor} from '../../types/global';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

declare const moment: any;
/**
 * @polymer
 * @mixinFunction
 */
function DateMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class DateMixinClass extends baseClass {

        @property({type: Boolean})
        datepickerModal!: boolean = false;

        // TODO: added only for ts-lint, find a better way to make this accessible... might not be the best solution
        @property({type: Object})
        shadowRoot: ShadowRoot;

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

        /**
         * Open input field assigned(as prefix or suffix) etools-datepicker on tap.
         * Make sure you also have the data-selector attribute set on the input field.
         */
        openDatePicker(event) {
            // do not close datepicker on mouse up
            this.datepickerModal = true;
            const id = (event.target as HTMLElement).getAttribute('data-selector');
            if (id) {
                const datepickerId = `#${id}`;
                const datePicker = this.shadowRoot.querySelector(datepickerId);
                if (datePicker) {
                    (datePicker as any).open = true;
                }
            }
            // allow outside click closing
            setTimeout(() => this.datepickerModal = false, 300);
        }
    }
    return DateMixinClass;
}

export default DateMixin;
