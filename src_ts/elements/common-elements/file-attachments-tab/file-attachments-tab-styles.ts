import {html} from 'lit';

// language=HTML
export const fileAttachmentsTabStyles = html`
  <style>
    :host {
      display: block;
    }

    :host a {
      padding-left: 5px;
      color: #40c4ff;
      text-decoration: none;
    }

    .truncate {
      white-space: wrap;
    }

    #fileType {
      margin-top: 2px;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
    }

    .attachment-error {
      position: relative;
      visibility: visible;
      margin-left: 12px;
    }

    .row-data > * {
      box-sizing: border-box;
      padding-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .row-data:hover .delete-icon {
      display: block;
    }

    .delete-icon {
      position: absolute;
      right: 10px;
      display: none;
      cursor: pointer;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
      overflow: hidden;
    }

    .attachment {
      margin-inline-end: 8px;
    }
    etools-icon {
      color: var(--dark-icon-color);
    }
    icons-actions {
      visibility: hidden;
    }
    etools-data-table-row:hover icons-actions {
      visibility: visible;
    }
    .separator {
      border-inline-start: solid 1px var(--light-secondary-text-color);
      padding-inline-end: 10px;
      margin: 6px 0 6px 10px;
    }
    .editable-row {
      padding: 12px 0;
    }

    etools-data-table-header {
      --list-header-wrapper-column-height: 48px;
    }
    etools-content-panel div[slot='panel-btns'] .panel-button {
      color: #ffffff;
    }
    etools-icon-button[name='add-box'] {
      margin-inline-start: 20px;
    }
    .container {
      padding-block-start: 0px !important;
    }
  </style>
`;
