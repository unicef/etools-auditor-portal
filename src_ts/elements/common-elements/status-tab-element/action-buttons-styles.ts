import {html} from 'lit';

export const ActionButtonsStyles = html`
  <style>
    :host {
      display: flex;
    }
    *[hidden] {
      display: none;
    }
    etools-button {
      margin-inline: 0px !important;
      --sl-spacing-medium: 0;
    }
    etools-button-group {
      --etools-button-group-color: var(--sl-color-primary-600);
    }
    etools-button[slot='trigger'] {
      width: 45px;
      min-width: 45px;
      border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
    }
    etools-button#primary {
      flex: 1;
    }
    etools-button#primary::part(label) {
      display: flex;
      width: 100%;
      justify-content: center;
    }

    sl-menu-item {
      text-transform: uppercase;
    }
    etools-icon {
      --etools-icon-font-size: var(--etools-font-size-20, 20px);
      vertical-align: sub;
    }
  </style>
`;
