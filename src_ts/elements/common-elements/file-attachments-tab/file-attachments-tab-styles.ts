import {html} from '@polymer/polymer/polymer-element';

// language=HTML
export const fileAttachmentsTabStyles = html`
  <style>
    :host a {
      padding-left: 5px;
      color: #40c4ff;
      text-decoration: none;
    }

    :host .truncate {
      white-space: nowrap;
    }

    #fileType {
      --paper-listbox: {
        max-height: 185px;
        -ms-overflow-style: auto;
      };
      margin-top: 2px;
    }

    paper-input-container {
      margin: 0 12px;
      --paper-input-container-focus-color: var(--module-primary);
      --paper-input-container: {
        color: var(--gray-50) !important;
        font-size: 13px;
        opacity: 1 !important;
      };
      --paper-input-container-underline: {
        display: none !important;
      };
      --paper-input-container-underline-focus: {
        display: none;
      };
      --paper-input-container-underline-disabled: {
        display: block !important;
        border-bottom: 1px dashed var(--gray-20) !important;
      };
    }

    paper-input {
      --paper-input-container-underline: {
        border-bottom: 1px solid var(--gray-20) !important;
      };
      --paper-input-container-underline-disabled: {
        display: block !important;
        border-bottom: 1px dashed var(--gray-20) !important;
      };
    }

    etools-content-panel {
      --ecp-content: {
        padding: 0;
      };
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

    .delete-icon iron-icon {
      --iron-icon-width: 20px;
      --iron-icon-height: 20px;
      --iron-icon-fill-color: var(--gray-50);
    }

  </style>
`;
