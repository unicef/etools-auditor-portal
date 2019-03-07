( function(){

  Polymer({
  is: 'share-documents',
  behaviors: [
    APBehaviors.CommonMethodsBehavior,
    APBehaviors.TableElementsBehavior,
    APBehaviors.StaticDataController,
    etoolsAppConfig.globals,
    EtoolsAjaxRequestBehavior,
  ],

  properties: {
    shareParams: {
      type: Boolean,
      notify: true,
      reflectToAttribute: true,
    },
    partnerName: {
      type: String,
      observer: '_handlePartnerChanged'
    },
    selectedFiletype: {
      type: Object,
      value: '',
      observer: '_filterByFileType'
    },
    selectedAttachments: {
      type: Array,
      value: []
    },
    fileTypes: {
      type: Array,
      computed: '_getFileTypesFromStatic(partnerName)',
      notify: true
    },
    headingColumns: {
      type: Array,
      value: [
        {
          'size': 18,
          'label': 'Agreement Ref',
          'name': 'ref',
          'ordered': 'asc'
        },
        {
          'size': 30,
          'label': 'Document Type',
          'noOrder': true,
          'class': 'no-order'
        },
        {
          'size': 28,
          'label': 'Document',
          'noOrder': true,
          'class': 'no-order'
        },
        {
          'size': 20,
          'label': 'Date Uploaded',
          'noOrder': true,
          'class': 'no-order right'
        }
      ]
    },
  },

 
  _handlePartnerChanged: function (partnerName) {
    if (!partnerName) { return; }
    this._getPartnerAttachments(partnerName);
  },

  _getPartnerAttachments: function (partner) {
    const options = {
      endpoint: this.getEndpoint('globalAttachments'),
      params: {
        partner: partner,
        source: 'Partnership Management Portal'
      }
    };

    this.sendRequest(options)
      .then(resp => {
        this.set('attachmentsList', resp);
        this.set('originalList', resp);
      })
      .catch(err => this.fire('toast', { text: `Error fetching documents for ${partner}: ${err}` }));
    
  },

    _getFileTypesFromStatic: function () {
      const fileTypes = this.getData("staticDropdown").attachment_types
        .filter(val => !_.isEmpty(val))
        .map(
          typeStr => ({ label: typeStr, value: typeStr })
        );
      const uniques = _.uniqBy(fileTypes, 'label');
      return uniques

    },

  _getReferenceNumber: function (refNumber) {
    return refNumber || 'n/a';
  },

  _toggleChecked: function (e) {
    const {id} = e.model.item;
    const isChecked = e.target.checked
    if (isChecked) {
      this.push('selectedAttachments', {attachment: id});
    } else {
      let cloned = _.clone(this.selectedAttachments);
      _.remove(cloned, { attachment: id});
      this.set('selectedAttachments', cloned);
    }

    this._updateShareParams();
  },

  _updateShareParams: function(){
    this.set('shareParams', {
      attachments: this.selectedAttachments
    });
  },

  _orderChanged: function ({ detail }) {
    const newOrder = detail.item.ordered === 'desc' ? 'asc' : 'desc';
    this.set(`headingColumns.${detail.index}.ordered`, newOrder);
    this._handleSort(newOrder);
  },

  _handleSort: function(sortOrder){
    const sorted = this.attachmentsList.slice(0).sort((a,b)=> {
        if (a.agreement_reference_number > b.agreement_reference_number) {
          return sortOrder === 'asc' ? -1 : 1;
        } else if (a.agreement_reference_number < b.agreement_reference_number) {
          return sortOrder === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
    });
    this.set('attachmentsList', sorted);
  },

  _filterByFileType: function(selectedFileType){
    if (selectedFileType === '') { return; }
    if (selectedFileType === null) {
      // resets list when doc-type filter is cleared
      this.set('attachmentsList', this.originalList); 
      return; 
    }
    const { value } = selectedFileType;
    const newFilteredList = this.originalList.filter(row => row.file_type.toLowerCase() === value.toLowerCase());
    this.set('attachmentsList', newFilteredList)
  },



});
})();