
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

import {property} from '@polymer/decorators';

setRootPath('ap_poly3');

/**
 * @customElement
 * @polymer
 */
class AppShell extends PolymerElement {

    public static get template() {
        // main template
        // language=HTML
        return html`
    <app-drawer-layout id="layout" responsive-width="850px"
                       fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
      <!-- Drawer content -->
      <app-drawer id="drawer" slot="drawer" transition-duration="350"
                  opened="[[_drawerOpened]]"
                  swipe-open="[[narrow]]" small-menu$="[[smallMenu]]">
        app menu...
      </app-drawer>

      <!-- Main content -->
      <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>

        <app-header slot="header" fixed shadow>
          header...
        </app-header>

        main content...
        
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
