import { PolymerElement, html } from '@polymer/polymer';
import famEndpoints from '../app-config/endpoints';


class StaticData extends PolymerElement {

  public static get template() {
    return html`
      <user-data></user-data>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('user-profile-loaded', this.loadStaticData);

    // document??
    this._updateEngagementsFilters = this._updateEngagementsFilters.bind(this);
    document.addEventListener('update-engagements-filters', this._updateEngagementsFilters);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('update-engagements-filters', this._updateEngagementsFilters);
  }

  loadStaticData() {

  }

  _updateEngagementsFilters() {
    let time = new Date().getTime();

    this.filterAuditorsUrl = famEndpoints.filterAuditors.url + `?reload=${time}`;
    this.filterPartnersUrl = famEndpoints.filterPartners.url + `?reload=${time}`;
  }
}

window.customElements.define('static-data', StaticData);
