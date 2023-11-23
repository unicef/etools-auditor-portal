import {html} from 'lit';

export const HeaderStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }

    :host {
      display: block;
    }

    :host(:hover) {
      cursor: pointer;
    }

    :host([dir='rtl']) etools-dropdown {
      --paper-input-container-shared-input-style_-_max-width: 75px;
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
      --paper-input-container-shared-input-style: {
        color: var(--light-secondary-text-color);
        cursor: pointer;
        font-size: 16px;
        text-align: right;
        width: 100%;
      }
    }

    countries-dropdown[dir='rtl'] {
      margin-inline: 30px 20px;
    }

    organizations-dropdown {
      width: 165px;
    }

    countries-dropdown {
      width: 160px;
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

    etools-dropdown,
    etools-dropdown-multi {
      --esmm-external-wrapper: {
        width: auto;
        max-width: 650px;
      }
    }

    @media (max-width: 940px) {
      .envWarning {
        display: none;
      }
      countries-dropdown,
      organizations-dropdown {
        width: 130px;
      }
    }
    @media (max-width: 785px) {
      #app-logo {
        height: 16px !important;
        margin: 0 2px !important;
      }
      countries-dropdown,
      organizations-dropdown {
        width: 90px;
      }
    }
  </style>
`;
