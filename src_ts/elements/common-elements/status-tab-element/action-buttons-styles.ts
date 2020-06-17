import {html} from '@polymer/polymer';

export const ActionButtonsStyles = html`
  <style>
    :host {
      position: relative;
      display: block;
      text-align: center;
      width: 100%;
    }
    .main-action.text {
      font-weight: 500;
    }
    paper-button {
      --paper-button_-_color: #fff;
      height: 34px;
      color: #fff;
      background-color: var(--module-primary);
      margin: 0;
      width: 100%;
    }
    paper-button span {
      padding: 0 29px;
    }
    paper-button.with-menu {
      padding-right: calc(0.57em + 41px);
    }
    paper-menu-button {
      padding: 0;
      border-left: solid 1px rgba(255, 255, 255, 0.5);
      position: absolute;
      right: 0;
      top: 0;
      height: 34px;
      overflow: hidden;
    }
    paper-menu-button paper-icon-button {
      top: -2px;
    }
    .dropdown-content {
      padding: 6px 0;
    }
    .other-title {
      cursor: default;
      padding: 10px 20px;
      text-transform: uppercase;
      color: var(--gray-mid);
      white-space: nowrap;
      font-weight: 500;
    }
    .other-options {
      min-width: 150px;
      text-align: left;
      padding: 13px;
      color: var(--gray-dark);
      font-weight: 500;
      white-space: nowrap;
    }
    .other-options:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    .other-options .option-icon {
      width: 22px;
      height: 22px;
      margin-right: 15px;
      margin-left: 5px;
      color: var(--gray-mid);
      vertical-align: top;
    }
    .other-options span {
      vertical-align: top;
      margin-top: 1px;
      padding: 0;
      display: inline-block;
      height: 22px;
    }
  </style>
`;
