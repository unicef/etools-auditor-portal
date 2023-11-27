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
      --paper-listbox: {
        max-height: 600px;
        -ms-overflow-style: auto;
      }
      margin-top: 2px;
    }

    paper-input-container {
      margin: 0 12px;
      --paper-input-container-focus-color: var(--primary-color);
      --paper-input-container: {
        color: var(--gray-50) !important;
        font-size: 13px;
        opacity: 1 !important;
      }
      --paper-input-container-underline: {
        display: none !important;
      }
      --paper-input-container-underline-focus: {
        display: none;
      }
      --paper-input-container-underline-disabled: {
        display: block !important;
        border-bottom: 1px dashed var(--gray-20) !important;
      }
    }

    etools-input {
      --paper-input-container-underline: {
        border-bottom: 1px solid var(--gray-20) !important;
      }
      --paper-input-container-underline-disabled: {
        display: block !important;
        border-bottom: 1px dashed var(--gray-20) !important;
      }
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
    }

    .download-icon {
      --iron-icon-width: 25px;
      --iron-icon-height: 25px;
      --iron-icon-fill-color: var(--gray-50);
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

    .delete-icon etools-icon {
      --iron-icon-width: 20px;
      --iron-icon-height: 20px;
      --iron-icon-fill-color: var(--gray-50);
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
    etools-icon-button[name='add-box'] {
      color: var(--primary-text-color);
      margin-inline-start: 20px;
    }
  </style>
`;
