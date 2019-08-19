import {html} from '@polymer/polymer/polymer-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

export const HeaderStyles = html`
  <style>
    .layout-horizontal {
      @apply --layout-horizontal;
    }

    .arrow-up { display: none; }

    paper-menu-button {
        padding: 0;
        font-size: 16px;
    }

    paper-button {
      height: 60px;
      margin: 0;
      padding: 12px 12px 12px 12px;
      min-width: 50px;
      text-transform: none;
      font-weight: normal !important;
    }

    paper-button .dropdown-text {
      margin-left: 5px;
      color: var(--light-secondary-text-color);
    }

    paper-button .arrow-down {
      color: var(--light-ink-color);
    }

    paper-button .arrow-up {
      color: var(--light-ink-color);
    }

    iron-icon {
      color: var(--light-ink-color);
    }

    iron-icon.mr-8 {
      bottom: 3px;
    }

    iron-icon.b-8 {
      margin-right: 8px;
    }

    paper-listbox {
      max-height: 296px;
    }

    paper-listbox iron-icon {
      margin-right: 13px;
      color: var(--dark-icon-color);
    }

    paper-listbox paper-item {
      height: 48px;
      min-height: initial;
      font-weight: 500 !important;
      color: var(--dark-primary-text-color);
      cursor: pointer;
      padding: 0 16px;
      white-space: nowrap;
      min-width: 140px;
    }


    :host([opened]) .arrow-up {
        display: inherit;
    }

    :host([opened]) .arrow-down {
      display: none;
    }

    :host([opened]) iron-icon {
      color: var(--dark-icon-color);
    }

    :host([opened]) paper-menu-button {
      color: var(--dark-icon-color);
      background-color: var(--primary-background-color);
    }

    :host([opened]) paper-button .dropdown-text{
      color: var(--dark-primary-text-color);
    }

    :host([opened]) paper-button .arrow-down, :host([opened]) paper-button .arrow-up
    color: var(--dark-icon-color);
    }


    /* TODO - is this style needed? */
    paper-listbox.no-focus {
      --paper-menu-focused-item-after: {
          background: var(--primary-background-color);
          opacity: 0;
      };
    }

    paper-listbox.no-focus paper-item {
      --paper-item-focused-before: {
          background: var(--primary-background-color);
          opacity: 0;
      };
    }

    paper-listbox.no-focus paper-item:hover {
      background: #EEEEEE;
    }

</style>
`;
