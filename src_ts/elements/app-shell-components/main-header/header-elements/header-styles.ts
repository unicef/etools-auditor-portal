import {html} from '@polymer/polymer/polymer-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

export const HeaderStyles = html`
  <style>
    .layout-horizontal {
      @apply --layout-horizontal;
    }

    .arrow-up {
      display: none;
    }

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
      color: var(--light-secondary-text-color);
    }

    paper-button .arrow-up {
      color: var(--light-secondary-text-color);
    }

    iron-icon {
      color: var(--light-secondary-text-color);
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

    :host([opened]) paper-button .dropdown-text {
      color: var(--dark-primary-text-color);
    }

    :host([opened]) paper-button .arrow-down,
    :host([opened]) paper-button .arrow-up {
      color: var(--dark-icon-color);
    }

    etools-dropdown {
      --paper-listbox: {
        max-height: 600px;
      }

      --esmm-icons: {
        color: var(--light-secondary-text-color);
        cursor: pointer;
      }

      --paper-input-container-underline: {
        display: none;
      }

      --paper-input-container-underline-focus: {
        display: none;
      }

      --paper-input-container-underline-disabled: {
        display: none;
      }

      --paper-input-container-shared-input-style: {
        color: var(--light-secondary-text-color);
        cursor: pointer;
        font-size: 16px;
        text-align: right;
        width: 100%;
      }

      --paper-menu-button-dropdown: {
        max-height: 380px;
      }
    }

    etools-dropdown::placeholder {
      color: red;
      opacity: 1;
    }

    .w100 {
      width: 100%;
    }

    etools-dropdown.warning {
      --paper-input-container: {
        padding-left: 3px;
        box-sizing: border-box;
        box-shadow: inset 0px 0px 0px 1.5px red;
      }
    }

    @media (max-width: 768px) {
      etools-dropdown {
        min-width: 130px;
        width: 130px;
      }
    }
  </style>
`;
