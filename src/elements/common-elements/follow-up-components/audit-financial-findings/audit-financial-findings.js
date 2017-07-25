'use strict';

Polymer({
    is: 'audit-financial-findings',

    behaviors: [
        APBehaviors.CommonMethodsBehavior,
        APBehaviors.PermissionController
    ],

    observers: ['setAuditOpinionChoices(basePermissionPath, engagement)'],

    setAuditOpinionChoices: function(basePermissionPath) {
        if (!basePermissionPath) { return []; }
        this.set('auditOpinionChoices', this.getChoices(`${basePermissionPath}.audit_opinion`) || []);
    },

    getFindingsData: function() {
        let fields = ['additional_supporting_documentation_provided', 'amount_refunded',
                    'justification_provided_and_accepted', 'write_off_required', 'explanation_for_additional_information'];

        return _.pickBy(this.engagement, (value, key) => {
            return ~fields.indexOf(key) && (this.originalData[key] !== this.engagement[key]);
        });
    }

});
