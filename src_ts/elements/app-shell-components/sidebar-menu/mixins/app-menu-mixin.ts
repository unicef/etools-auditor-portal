import {LitElement} from 'lit';
import {property, query} from 'lit/decorators.js';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * App menu functionality mixin
 * @LitElement
 * @mixinFunction
 */
export function AppMenuMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class AppMenuClass extends baseClass {
    @property({type: Boolean})
    smallMenu = false;

    @property({type: Boolean})
    drawerOpened = true;

    @query('#drawer') private drawer!: LitElement;

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

      this.addEventListener('toggle-small-menu', this._toggleSmallMenu);
      this.addEventListener('drawer', this.onDrawerToggle);
      this.addEventListener('change-drawer-state', this.changeDrawerState);
    }

    private _removeMenuListeners(): void {
      this.removeEventListener('toggle-small-menu', this._toggleSmallMenu);
      this.removeEventListener('drawer', this.onDrawerToggle);
      this.removeEventListener('change-drawer-state', this.changeDrawerState);
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

    public changeDrawerState() {
      this.drawerOpened = !this.drawerOpened;
    }

    public onDrawerToggle() {
      const drawerOpened = (this.drawer as any).opened;
      if (this.drawerOpened !== drawerOpened) {
        this.drawerOpened = drawerOpened;
      }
    }
    private _toggleSmallMenu(e: Event): void {
      e.stopImmediatePropagation();
      this.smallMenu = !this.smallMenu;
      this._smallMenuValueChanged(this.smallMenu);
    }

    private _smallMenuValueChanged(newVal: boolean) {
      const localStorageVal: number = newVal ? 1 : 0;
      localStorage.setItem('etoolsAppSmallMenuIsActive', String(localStorageVal));
    }
  }

  return AppMenuClass;
}
