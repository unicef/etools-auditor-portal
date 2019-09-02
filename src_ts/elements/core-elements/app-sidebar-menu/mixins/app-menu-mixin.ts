import {property} from '@polymer/decorators';
import {Constructor} from '../../../../types/global';
import {PolymerElement} from '@polymer/polymer/polymer-element';

/**
 * App menu functionality mixin
 * @polymer
 * @mixinFunction
 */
export function AppMenuMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class AppMenuClass extends baseClass {

    @property({type: Boolean})
    smallMenu: boolean = false;

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
      this.set('smallMenu', this._isSmallMenuActive());
    }

    private _isSmallMenuActive(): boolean {
      /**
       * localStorage value must be 0 or 1
       */
      let menuTypeStoredVal: string | null = localStorage.getItem('etoolsAppSmallMenuIsActive');
      if (!menuTypeStoredVal) {
        return false;
      }
      return !!parseInt(menuTypeStoredVal, 10);
    }

    private _toggleSmallMenu(e: Event): void {
      e.stopImmediatePropagation();
      this.set('smallMenu', !this.smallMenu);
      this._smallMenuValueChanged(this.smallMenu);
    }

    protected _resizeMainLayout(e: Event) {
      e.stopImmediatePropagation();
      this._updateDrawerStyles();
      this._notifyLayoutResize();
    }

    private _smallMenuValueChanged(newVal: boolean) {
      let localStorageVal: number = newVal ? 1 : 0;
      localStorage.setItem('etoolsAppSmallMenuIsActive', String(localStorageVal));
    }

    private _updateDrawerStyles(): void {
      let drawerLayout = this.$.layout as PolymerElement;
      if (drawerLayout) {
        drawerLayout.updateStyles();
      }
      let drawer = this.$.drawer as PolymerElement;
      if (drawer) {
        drawer.updateStyles();
      }
    }

    private _notifyLayoutResize(): void {
      let layout = this.$.layout as PolymerElement & {notifyResize(): void};
      if (layout) {
        layout.notifyResize();
      }
      let headerLayout = this.$.appHeadLayout as PolymerElement & {notifyResize(): void};
      if (headerLayout) {
        headerLayout.notifyResize();
      }
    }

    _toggleDrawer(): void {
      // @ts-ignore
      this.$.drawer.toggle();
    }
  }

  return AppMenuClass;

}

