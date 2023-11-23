import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {Constructor} from '@unicef-polymer/etools-types';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer';
import {AppDrawerLayoutElement} from '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import {AppHeaderLayoutElement} from '@polymer/app-layout/app-header-layout/app-header-layout.js';

/**
 * App menu functionality mixin
 * @LitElement
 * @mixinFunction
 */
export function AppMenuMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class AppMenuClass extends baseClass {
    @property({type: Boolean})
    smallMenu = false;

    public connectedCallback() {
      super.connectedCallback();
      this._initMenuListeners();
      this._initMenuSize();
    }

    public disconnectedCallback() {
      super.disconnectedCallback();
      this._removeMenuListeners();
    }

    private _initMenuListeners(): void {
      this._toggleSmallMenu = this._toggleSmallMenu.bind(this);
      this._resizeMainLayout = this._resizeMainLayout.bind(this);
      this._toggleDrawer = this._toggleDrawer.bind(this);

      this.addEventListener('toggle-small-menu', this._toggleSmallMenu);
      this.addEventListener('resize-main-layout', this._resizeMainLayout);
      this.addEventListener('drawer', this._toggleDrawer);
    }

    private _removeMenuListeners(): void {
      this.removeEventListener('toggle-small-menu', this._toggleSmallMenu);
      this.removeEventListener('resize-main-layout', this._resizeMainLayout);
      this.removeEventListener('drawer', this._toggleDrawer);
    }

    private _initMenuSize(): void {
      this.smallMenu = this._isSmallMenuActive();
    }

    private _isSmallMenuActive(): boolean {
      /**
       * localStorage value must be 0 or 1
       */
      const menuTypeStoredVal: string | null = localStorage.getItem('etoolsAppSmallMenuIsActive');
      if (!menuTypeStoredVal) {
        return false;
      }
      return !!parseInt(menuTypeStoredVal, 10);
    }

    private _toggleSmallMenu(e: Event): void {
      e.stopImmediatePropagation();
      this.smallMenu = !this.smallMenu;
      this._smallMenuValueChanged(this.smallMenu);
    }

    protected _resizeMainLayout(e: Event) {
      e.stopImmediatePropagation();
      this._updateDrawerStyles();
      this._notifyLayoutResize();
    }

    private _smallMenuValueChanged(newVal: boolean) {
      const localStorageVal: number = newVal ? 1 : 0;
      localStorage.setItem('etoolsAppSmallMenuIsActive', String(localStorageVal));
    }

    private _updateDrawerStyles(): void {
      const drawerLayout: AppDrawerLayoutElement | null = this.shadowRoot!.querySelector('#layout');
      if (drawerLayout) {
        drawerLayout.updateStyles();
      }
      const drawer: AppDrawerElement | null = this.shadowRoot!.querySelector('#drawer');
      if (drawer) {
        drawer.updateStyles();
      }
    }

    private _notifyLayoutResize(): void {
      const drawerLayout: AppDrawerLayoutElement | null = this.shadowRoot!.querySelector('#layout');
      if (drawerLayout) {
        drawerLayout.notifyResize();
      }
      const headerLayout: AppHeaderLayoutElement | null = this.shadowRoot!.querySelector('#appHeadLayout');
      if (headerLayout) {
        headerLayout.notifyResize();
      }
    }

    _toggleDrawer(): void {
      (this.shadowRoot!.querySelector('#drawer') as AppDrawerElement).toggle();
    }
  }

  return AppMenuClass;
}
