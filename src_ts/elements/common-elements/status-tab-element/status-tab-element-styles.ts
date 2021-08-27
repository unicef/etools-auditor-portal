import {html} from '@polymer/polymer/polymer-element';

export const StatusTabElementStyles = html` <style>
  :host {
    display: block;
  }
  etools-content-panel::part(ecp-content) {
    padding: 0;
  }

  .status-list {
    width: 100%;
    padding: 24px;
    box-sizing: border-box;
  }
  .status-buttons {
    width: 100%;
    padding: 24px;
    border-top: solid 1px #e8e8e8;
    text-align: center;
    box-sizing: border-box;
  }
  .status-buttons paper-button {
    height: 35px;
    color: #ffffff;
    background-color: var(--module-primary);
  }

  .status-buttons paper-button.with-actions {
    padding-right: 0;
  }

  .status-buttons paper-button span {
    padding: 0 29px;
  }

  .status-buttons paper-menu-button {
    padding: 0;
    border-left: solid 1px rgba(255, 255, 255, 0.5);
  }

  .status-buttons .dropdown-content {
    padding: 6px 0;
  }

  .status-buttons .other-title {
    cursor: default;
    padding: 10px 20px;
    text-transform: uppercase;
    color: var(--gray-mid);
    white-space: nowrap;
    font-weight: 500;
  }

  .status-buttons .other-options {
    min-width: 150px;
    text-align: left;
    padding: 13px;
    color: var(--gray-dark);
    font-weight: 500;
    white-space: nowrap;
  }

  .status-buttons .other-options:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .status-buttons .other-options .option-icon {
    width: 22px;
    height: 22px;
    margin-right: 15px;
    margin-left: 5px;
    color: var(--gray-mid);
    vertical-align: top;
  }
  .status-buttons .other-options span {
    vertical-align: top;
    margin-top: 1px;
    padding: 0;
    display: inline-block;
    height: 22px;
  }
  .status-container,
  .divider {
    height: 40px;
  }

  .status-container {
    position: relative;
    @apply --layout-horizontal;
    @apply --layout-center;
  }

  .status-container .status-icon,
  .status-container .status {
    @apply --layout-vertical;
    @apply --layout-center-justified;
    @apply --layout-warp;
  }
  .status-container iron-icon {
    display: inline-block !important;
  }

  .status-container .status-icon .icon-wrapper {
    background-color: var(--gray-light);
    text-align: center;
    width: 24px;
    height: 24px;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    color: #ffffff;
  }

  .status-container .status-icon .icon-wrapper iron-icon {
    --iron-icon-height: 16px;
    --iron-icon-width: 16px;
    width: 16px;
    height: 16px;
    color: #fff;
  }

  .status-container .status-icon .icon-wrapper span {
    height: 24px;
    line-height: 24px;
    font-size: 13px;
  }

  .status-container .status {
    margin-left: 10px;
    margin-top: 15px;
    margin-bottom: 15px;
    box-sizing: border-box;
    text-transform: capitalize;
    color: var(--gray-mid);
  }

  .status-container .status .status-date {
    color: var(--gray-mid);
    font-size: 12px;
    font-weight: 400;
    white-space: nowrap;
  }
  .status-container .status.multi-line .status-date {
    position: absolute;
    bottom: -18px;
    left: 33px;
  }

  .status-container .status.multi-line .status-header {
    position: absolute;
    bottom: 0;
  }

  .status-container.active .status-icon .icon-wrapper,
  .status-container.completed .status-icon .icon-wrapper {
    background: var(--module-success);
  }
  .status-container.active .status-icon .icon-wrapper iron-icon,
  .status-container.completed .status-icon .icon-wrapper iron-icon {
    --iron-icon-height: 100%;
    --iron-icon-width: 100%;
  }
  .status-container.active .status-icon .icon-wrapper .status-nr,
  .status-container.completed .status-icon .icon-wrapper .status-nr {
    display: none;
  }
  .status-container.active .status,
  .status-container.completed .status {
    color: inherit;
    font-weight: bold;
  }
  .status-container.pending iron-icon {
    display: none !important;
  }
  .status-container.active.first .status-icon .icon-wrapper {
    background-color: var(--module-primary);
  }
  .status-container.active.first iron-icon {
    display: none !important;
  }
  .status-container.active.first .status-icon .icon-wrapper .status-nr {
    display: inherit;
  }
  .status-container.cancelled .status-icon .icon-wrapper {
    background: transparent;
  }
  .status-container.cancelled .status-icon .icon-wrapper iron-icon {
    width: 25px;
    height: 25px;
    color: var(--gray-darkest);
  }
  .status-container.cancelled .status {
    color: inherit;
    font-weight: bold;
  }

  .divider {
    @apply --layout-vertical;
    width: 100%;
  }
  .divider .status-divider {
    height: 100%;
    width: 11px;
    border-right: 1px solid var(--gray-mid);
  }
</style>`;
