/* eslint-disable max-len */
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
    url: '/api/audit/engagements/'
  },
  partnerOrganisations: {
    url: '/api/pmp/v3/partners/?hidden=false',
    exp: 24 * 60 * 60 * 1000, // 24h
    cacheTableName: 'partners'
  },
  partnerInfo: {
    template: '/api/v2/partners/<%=id%>/'
  },
  authorizedOfficers: {
    template: '/api/pmp/v3/partners/<%=id%>/staff-members/'
  },
  auditFirms: {
    url: '/api/audit/audit-firms/'
  },
  filterAuditors: {
    url: '/api/audit/audit-firms/current_tenant/'
  },
  filterPartners: {
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
  changeOrganization: {
    url: '/api/v3/users/changeorganization/'
  },
  users: {
    url: '/api/v3/users/'
  },
  staffMembersUsers: {
    url: '/api/audit/audit-firms/users/?verbosity=minimal'
  },
  sectionsCovered: {
    url: '/api/reports/sectors/',
    exp: 24 * 60 * 60 * 1000, // 24h
    cacheTableName: 'sections'
  },
  offices: {
    url: '/api/offices/',
    exp: 23 * 60 * 60 * 1000, // 23h
    cacheTableName: 'offices'
  },
  reportAttachments: {
    template: '/api/audit/engagements/<%=id%>/report-attachments/?page_size=all'
  },
  attachments: {
    template: '/api/audit/engagements/<%=id%>/engagement-attachments/?page_size=all'
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
    url: '/api/v2/dropdowns/static/',
    exp: 6 * 60 * 60 * 1000, // 6h
    cachingKey: 'static'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  }
};

export default famEndpoints;
