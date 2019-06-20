
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';


import './../app-sidebar-menu/app-menu.js';
import './../app-main-header/page-header.js'
import './../app-footer/page-footer.js'

import './../app-theme.js';


// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

import {property} from '@polymer/decorators';
import { AppMenuMixin } from '../app-sidebar-menu/mixins/app-menu-mixin.js';

setRootPath('ap_poly3');

/**
 * @customElement
 * @polymer
 */
class AppShell extends AppMenuMixin(PolymerElement) {

  public static get template() {
    // main template
    // language=HTML
    return html`
    <static-data></static-data>

    <app-drawer-layout id="layout" responsive-width="850px"
                      fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
      <!-- Drawer content -->
      <app-drawer id="drawer" slot="drawer" transition-duration="350"
                  opened="[[_drawerOpened]]"
                  swipe-open="[[narrow]]" small-menu$="[[smallMenu]]">
        <app-menu root-path="[[rootPath]]"
          selected-option="[[_page]]"
          small-menu$="[[smallMenu]]"></app-menu>
      </app-drawer>

      <!-- Main content -->
      <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>

        <app-header slot="header" fixed shadow>
          <page-header id="pageheader" title="eTools"></page-header>
        </app-header>

        <main role="main" class="main-content">
          <iron-pages
              id="pages"
              selected="[[page]]"
              attr-for-selected="name"
              fallback-selection="not-found"
              role="main">

            <engagements-page-main
                    name="engagements"
                    id="engagements"
                    route="{{subroute}}"
                    query-params="{{queryParams}}">
            </engagements-page-main>

            <staff-sc-page-main
                    selected-page="[[page]]"
                    name="staff-sc"
                    id="staff-sc"
                    route="{{subroute}}"
                    query-params="{{queryParams}}">
            </staff-sc-page-main>

            <audits-page-main
                    name="audits"
                    id="audits"
                    route="{{subroute}}"
                    query-params="{{queryParams}}">
            </audits-page-main>

            <special-audits-page-main
                    name="special-audits"
                    id="special-audits"
                    route="{{subroute}}"
                    query-params="{{queryParams}}">
            </special-audits-page-main>

            <micro-assessments-page-main
                    name="micro-assessments"
                    id="micro-assessments"
                    route="{{subroute}}"
                    query-params="{{queryParams}}">
            </micro-assessments-page-main>

            <spot-checks-page-main
                    name="spot-checks"
                    id="spot-checks"
                    route="{{subroute}}"
                    query-params="{{queryParams}}">
            </spot-checks-page-main>

            <spot-checks-page-main
                    name="staff-spot-checks"
                    id="staff-spot-checks"
                    route="{{subroute}}"
                    query-params="{{queryParams}}"
                    is-staff-sc>
            </spot-checks-page-main>

            <not-found-page-view name="not-found" id="not-found"></not-found-page-view>
          </iron-pages>

        </main>

      </app-header-layout>
    </app-drawer-layout>
  `;
  }

    @property({type: String})
    _page: string = '';

    public connectedCallback() {
       super.connectedCallback();
       console.log('AppShell loaded...');
    }

}

window.customElements.define('app-shell', AppShell);
