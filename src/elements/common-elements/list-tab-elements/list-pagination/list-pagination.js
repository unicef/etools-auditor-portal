'use strict';

Polymer({
    is: 'list-pagination',
    behaviors: [TPMBehaviors.QueryParamsController],
    properties: {
        sizesAllowed: {
            type: Array,
            value: ['10', '25', '50', '100']
        },
        pageSize: {
            type: String,
            notify: true,
            observer: '_sizeChanged'
        },
        pageNumber: {
            type: String,
            notify: true,
            observer: '_pageChanged'
        },
        currentPage: {
            type: Number,
            value: 1
        },
        lastPage: {
            type: Number,
            computed: '_calcLastPage(datalength, pageSize)'
        }
    },
    _sizeChanged: function(newSize) {
        if (this.sizesAllowed.indexOf(newSize) < 0) { this.set('pageSize', '10'); }
    },

    goToFirst: function() { this.set('pageNumber', '1'); },
    goToLeft: function() {
        if (this.currentPage <= 2) { this.updateQueries({page: false}); } else { this.set('pageNumber', `${+this.currentPage - 1}`); }
    },
    goToRight: function() {
        if (this.currentPage !== this.lastPage) { this.set('pageNumber', `${(+this.currentPage || 1) + 1}`); }
    },
    goToLast: function() { this.set('pageNumber', this.lastPage); },

    _disableButton: function(currentPage, datalength, label) {
        if (+this.currentPage === 1 && !label || +this.currentPage === +this.lastPage && label || this.pageSize >= datalength) { return true; }
    },
    _calcLastPage: function(dataLength, size) {
        return dataLength % size ? Math.floor(dataLength / size + 1) : dataLength / size;
    },
    _pageChanged: function(pageNumber) {
        this.currentPage = pageNumber || 1;
    }
});
