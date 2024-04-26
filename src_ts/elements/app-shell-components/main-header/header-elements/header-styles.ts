import {html} from 'lit';

export const HeaderStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }

    :host {
      display: block;
      --sl-spacing-small: 0;
    }

    :host(:hover) {
      cursor: pointer;
    }

    etools-dropdown::part(display-input) {
      text-align: end;
    }

    countries-dropdown[dir='rtl'] {
      margin-inline: 30px 20px;
    }

    organizations-dropdown {
      max-width: 180px;
      margin-inline-start: 10px;
    }

    countries-dropdown {
      max-width: 160px;
      margin-inline-start: auto;
    }

    .w100 {
      width: 100%;
    }

    etools-dropdown.warning::part(combobox) {
      outline: 1.5px solid red !important;
      padding: 4px;
    }

    etools-dropdown {
      --sl-input-placeholder-color: var(--light-secondary-text-color);
      opacity: 1;
    }

    @media (max-width: 768px) {
      etools-dropdown {
        max-width: 130px;
      }
    }
    @media (max-width: 1024px) {
      .envWarning {
        display: none;
      }
      .envLong {
        display: none;
      }
      etools-profile-dropdown {
        width: 40px;
      }
    }

    @media (max-width: 490px) {
      .dropdowns {
        order: 1;
        margin-top: 0;
      }
      app-toolbar {
        height: auto;
        padding-inline-end: 0px;
        margin: 0 !important;
      }
    }
  </style>
`;
