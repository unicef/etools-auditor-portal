'use strict';

Polymer({
    is: 'risk-element',
    properties: {
        blueprint: {
            type: Object,
            value: function() {
                return {};
            },
            notify: true
        },
        index: Number,
        riskOptions: {
            type: Object,
            value: function() {
                return [
                    {label: 'N/A', value: 0},
                    {label: 'Low', value: 1},
                    {label: 'Medium', value: 2},
                    {label: 'Significant', value: 3},
                    {label: 'High', value: 4}
                ];
            }
        },
        extra: {
            type: String,
            value: '{"comments": "", "answer": "no"}',
            observer: '_setValues'
        },
        answer_yes: {
            type: Boolean,
            value: false,
            observer: 'setYes'
        },
        answer_no: {
            type: Boolean,
            value: false,
            observer: 'setNo'
        },
        answer_na: {
            type: Boolean,
            value: false,
            observer: 'setNa'
        }
    },

    observers: [
        // '_setValues(blueprint.extra)',
        '_setQuestionHeader(blueprint.header)'
    ],

    _setIndex: function(index) {
        return index + 1;
    },

    _setRiskValue: function(value) {
        if (!this.riskOptions || (!value && value !== 0)) { return value; }
        if (typeof value !== 'object') {
            return this.riskOptions[+value];
        } else {
            return value;
        }
    },

    _setValues: function(values) {
        if (_.isUndefined(values) || _.isNull(values)) { return; }

        values = JSON.parse(values);

        this.comments = values.comments || '';
        if (values.answer) {
            this[`answer_${values.answer}`] = true;
        }
    },

    setYes: function(newV, oldV) {
        if (newV) { this.setAnswer('yes'); }
        if (oldV && !newV && this.checkRadio('yes')) { this.setAnswer('yes'); }
    },
    setNo: function(newV, oldV) {
        if (newV) { this.setAnswer('no'); }
        if (oldV && !newV && this.checkRadio('no')) { this.setAnswer('no'); }
    },
    setNa: function(newV, oldV) {
        if (newV) { this.setAnswer('na'); }
        if (oldV && !newV && this.checkRadio('na')) { this.setAnswer('na'); }
    },

    setAnswer: function(value) {
        var answers = ['yes', 'no', 'na'];

        answers.forEach(answer => {
            this[`answer_${answer}`] = (answer === value);
        });

        this.setExtra();
    },

    checkRadio: function(value) {
        var answers = ['yes', 'no', 'na'],
            setToTrue = true;

        answers.forEach(answer => {
            if (answer !== value && this[`answer_${answer}`]) {
                setToTrue = false;
            }
        });

        return setToTrue;
    },

    _setRiskAnswer: function() {
        if (this.answer_no) { return 'no'; }
        if (this.answer_yes) { return 'yes'; }
        return 'na';
    },

    setExtra: function() {
        let comments = this.comments,
            answer = this._setRiskAnswer();

        this.blueprint.extra = JSON.stringify({comments: comments, answer: answer});
    },

    _setRiskAssessment: function(e, value) {
        this.set('blueprint.value', value.selectedValues.value);
    },

    _setRequired: function(editMode) {
        if (editMode) {
            return 'required';
        } else {
            return '';
        }
    },

    validate: function() {
        return this.$.riskAssessmentInput.validate();
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },

    _setQuestionHeader: function(question) {
        if (!question) { return; }
        this.$.header.innerHTML = question;
    },

    getData: function() {
        if (!_.isNull(this.blueprint.value)) {
            return _.clone(this.blueprint);
        }
    }
});
