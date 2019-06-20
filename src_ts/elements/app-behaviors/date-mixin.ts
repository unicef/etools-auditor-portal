import { PolymerElement } from '@polymer/polymer';

declare const moment: any;


export const DateMixin = (baseClass) => class extends PolymerElement(baseClass) {

    /**
     * Format date string to any format supported by momentjs
     */
    prettyDate(dateString, format) {
        if (!format) {
            format = 'D MMM YYYY';
        }
        if (typeof dateString === 'string' && dateString !== '') {
            var date = new Date(dateString);
            if (date.toString() !== 'Invalid Date') {
                // using moment.utc() ensures that the date will not be changed no matter timezone the user has set
                return moment.utc(date).format(format);
            }
        }
        return '';
    };

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
    };

    /**
     * Open input field assigned(as prefix or suffix) etools-datepicker on tap.
     * Make sure you also have the data-selector attribute set on the input field.
     */
    openDatePicker(event) {
        //do not close datepicker on mouse up
        this.datepickerModal = true;
        let id = Polymer.dom(event).localTarget.getAttribute('data-selector');
        if (id) {
            let datepickerId = '#' + id;
            let datePicker = Polymer.dom(this.root).querySelector(datepickerId);
            if (datePicker) {
                datePicker.open = true;
            }
        }
        //allow outside click closing
        setTimeout(() => this.datepickerModal = false, 300);
    };

};
