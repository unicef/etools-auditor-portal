import {html} from '@polymer/polymer/polymer-element';

// language=HTML
export const searchAndFilterStyles = html`
  <style>
    :host {
      display: block;
      margin-top: 25px;
      --paper-card: {
        background-color: white;
        margin: 0 24px;
        width: calc(100% - 48px);
      }
    }

    .second-header {
      padding: 8px 0;
      margin-bottom: 12px;
      --paper-card-background-color: #ffffff;
    }

    .second-header paper-input {
      --paper-input-container: {
        width: 240px;
        margin-left: 26px;
      }
      --paper-input-container-color: var(--gray-light);
    }

    .second-header paper-input iron-icon {
      color: var(--gray-mid);
    }

    .second-header .toggle-hidden-div {
      margin-right: 26px;
    }

    .second-header .toggle-hidden-div span {
      color: var(--gray-dark);
      font-size: 16px;
      margin-right: 8px;
    }

    .second-header .toggle-hidden-div {
      margin-right: 26px;
    }

    .second-header .toggle-hidden-div span {
      color: var(--gray-dark);
      font-size: 16px;
      margin-right: 8px;
    }

    #add-filter-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-self: stretch;
      padding: 0 0 0 8px;
      margin: 8px 0 8px 24px;
      border-left: 2px solid var(--gray-lighter);
    }

    .second-header #add-filter-container .add-filter-text {
      margin-top: 4px;
    }

    .second-header #add-filter-container paper-button {
      --paper-button_-_color: var(--module-primary);
      color: var(--module-primary);
      font-weight: bold;
    }

    .second-header #add-filter-container paper-icon-item {
      --paper-item-selected-weight: normal;
      --paper-item: {
        cursor: pointer;
      }
      --paper-item-focused-before: {
        background: none;
        opacity: 0;
      }
      --paper-item-focused-after: {
        background: none;
        opacity: 0;
      }
      --paper-item-focused: {
        background-color: rgb(198, 198, 198);
      }
      white-space: nowrap;
      text-transform: capitalize;
    }

    #add-filter-container paper-icon-item[selected] {
      font-weight: normal !important;
      background-color: rgb(220, 220, 220);
    }

    #add-filter-container paper-icon-item[focused] {
      font-weight: normal !important;
      background-color: rgb(198, 198, 198);
    }

    .second-header #add-filter-container paper-menu-button {
      padding: 0;
      margin: 8px;
    }

    .second-header #add-filter-container paper-menu-button paper-button {
      margin: 0;
    }

    .filter-dropdown {
      margin-left: 20px;
      min-width: 200px;
      max-width: 350px;

      --paper-listbox: {
        margin-top: 0;
        padding-bottom: 8px;
        -ms-overflow-style: auto;
      }

      --esmm-dropdown-menu-position: absolute;
    }

    .filter-date {
      margin-left: 20px;
      width: 200px;
    }

    .filter-reset-button {
      margin: auto 12px;
      transform: translate(0, 8px);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      line-height: 16px;
      background-color: var(--module-error);
      color: white;
      font-weight: 500;
      font-size: 14px;
      text-align: center;
      cursor: pointer;
    }

    .clear-all-filters {
      min-height: 48px;
      display: flex;
      flex-direction: row;
      align-items: center;
      color: var(--primary-color);
      padding-right: 16px;
      padding-left: 10px;
      border-bottom: 1px solid var(--dark-divider-color, #9d9d9d);
    }
  </style>
`;
