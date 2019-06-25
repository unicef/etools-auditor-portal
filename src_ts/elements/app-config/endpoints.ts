const famEndpoints = {
  userProfile: {
    url: '/api/v3/users/profile/'
  },
  engagementsList: {
    url: '/api/audit/engagements/'
  },
  staffSCList: {
    url: '/api/audit/staff-spot-checks/'
  },
  engagementInfo: {
    template: '/api/audit/<%=type%>/<%=id%>/'
  },
  createEngagement: {
    template: '/api/audit/engagements/'
  },
  partnerOrganisations: {
    url: '/api/v2/partners/?hidden=false',
    exp: 24 * 60 * 60 * 1000, // 24h
    cachingKey: 'partners'
  },
  partnerInfo: {
    template: '/api/v2/partners/<%=id%>/'
  },
  authorizedOfficers: {
    template: '/api/v2/partners/<%=id%>/staff-members/'
  },
  auditFirms: {
    url: '/api/audit/audit-firms/'
  },
  filterAuditors: {
    url: '/api/audit/audit-firms/current_tenant/'
  },
  filterPartners : {
    url: '/api/audit/engagements/partners/'
  },
  agreementData: {
    template: '/api/audit/purchase-orders/sync/<%=id%>/?auditor_firm__unicef_users_allowed=False'
  },
  purchaseOrder: {
    template: '/api/audit/purchase-orders/<%=id%>/'
  },
  staffMembers: {
    template: '/api/audit/audit-firms/<%=id%>/staff-members/'
  },
  userExistence: {
    template: '/api/audit/audit-firms/users/?email=<%=email%>'
  },
  changeCountry: {
    url: '/api/v3/users/changecountry/'
  },
  users: {
    url: '/api/v3/users/'
  },
  staffMembersUsers: {
    url: '/api/audit/audit-firms/users/?purchase_order_auditorstaffmember__auditor_firm__unicef_users_allowed=true'
  },
  sectionsCovered: {
    url: '/api/reports/sectors/',
    exp: 24 * 60 * 60 * 1000, // 24h
    cachingKey: 'sections'
  },
  offices: {
    url: '/api/offices/',
    exp: 23 * 60 * 60 * 1000, // 23h
    cachingKey: 'offices'
  },
  reportAttachments: {
      template: '/api/audit/engagements/<%=id%>/report-attachments/'
  },
  attachments: {
      template: '/api/audit/engagements/<%=id%>/engagement-attachments/'
  },
  globalAttachments: {
      template: '/api/v2/attachments/'
  },
  auditLinks: {
      template: '/api/audit/<%=type%>/<%=id%>/links'
  },
  linkAttachment: {
      template: '/api/v2/attachments/links/<%=id%>/'
  },
  static: {
    url: '/api/v2/dropdowns/static',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'static'
  }
}

export default famEndpoints;
