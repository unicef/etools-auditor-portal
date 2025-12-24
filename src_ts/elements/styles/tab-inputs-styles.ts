import {css} from 'lit';

export const tabInputsStyles = css`
  *[hidden] {
    display: none !important;
  }

  label[required] {
    background: url('./assets/images/required.svg') no-repeat 99% 10%/6px;
    width: auto !important;
    max-width: 100%;
    inset-inline-end: auto;
    padding-inline-end: 15px;
  }

  etools-icon-button[hidden] {
    display: inline-block !important;
    visibility: hidden;
  }

  .group:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: ' ';
    clear: both;
    height: 0;
  }

  .input-container {
    display: flex;
  }

  .input-container:last-of-type {
    margin-right: 0;
  }

  .row-h {
    margin-bottom: 8px;
  }

  .edit-icon {
    padding: 5px;
    width: 33px;
    height: 33px;
    color: var(--gray-mid);
  }

  .edit-icon-slot {
    overflow: visible !important;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .header-content {
    padding: 8px 12px 0;
  }

  .static-text {
    padding: 8px 12px;
    font-size: var(--etools-font-size-14, 14px);
  }

  :host > * {
    --required-star-style: {
      background: url('./assets/images/required.svg') no-repeat 98% 14%/7px;
      width: auto !important;
      max-width: 133%;
      right: auto;
      padding-right: 15px;
      color: var(--gray-50);
    };
  }

  #bottom-actions {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -ms-flex-direction: row;
    -webkit-flex-direction: row;
    flex-direction: row;
    -ms-flex-pack: end;
    -webkit-justify-content: flex-end;
    justify-content: flex-end;
    overflow: visible;
  }

  .repeatable-item-container {
    position: relative;
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 0 8%;
  }

  .form-title {
    position: relative;
    line-height: 40px;
    color: var(--primary-color);
    font-weight: 600;
    box-sizing: border-box;
    margin: 0 12px 15px !important;
    padding: 0 !important;
  }

  .form-title .text {
    background-color: var(--gray-06);
    border-radius: 3px;
    padding: 9px 24px;
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .repeatable-item-container.whithout-actions {
    padding: 0 !important;
  }

  .repeatable-item-container[without-line] {
    padding: 0 12px !important;
  }

  .repeatable-item-container[without-line] .repeatable-item-content {
    border-left: none;
    margin-left: 0;
    padding-left: 0;
  }

  .repeatable-item-container .repeatable-item-actions {
    display: flex;
    position: absolute;
    top: 0;
    left: 8px;
    width: 8%;
    height: 100%;
  }

  .repeatable-item-container .repeatable-item-actions .actions {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -ms-flex-wrap: wrap;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
  }

  .repeatable-item-actions .actions .action {
    width: 36px;
    height: 36px;
  }

  .repeatable-item-actions .actions .action.delete {
    color: #ea4022;
  }

  .repeatable-item-actions .actions .action.add {
    color: var(--primary-color);
  }

  .repeatable-item-actions .actions .action[disabled] {
    color: var(--gray-light);
  }

  .repeatable-item-container .repeatable-item-content {
    position: relative;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: inline-block;
    vertical-align: top;
    margin-left: 10px;
    padding-left: 20px;
    padding-bottom: 8px;
    border-left: 1px solid var(--gray-border);
    width: 100%;
    box-sizing: border-box;
  }

  .repeatable-item-container .repeatable-item-content .staff-check-box {
    margin-top: 10px;
  }

  .repeatable-item-container .repeatable-item-content .repeatable-item-index {
    position: absolute;
    top: -5px;
    left: -15px;
    width: 30px;
    height: 30px;
    background-color: #ffffff;
  }

  .repeatable-item-container .repeatable-item-content .repeatable-item-index .item-index {
    margin: 4px;
    width: 22px;
    height: 22px;
    line-height: 22px;
    border-radius: 50%;
    background-color: var(--gray-light);
    text-align: center;
    color: #ffffff;
    font-size: var(--etools-font-size-13, 13px);
  }

  etools-currency {
    padding: 0 12px;
    box-sizing: border-box;
  }
  etools-content-panel[list]::part(ecp-content) {
    padding: 0;
    padding-left: 0;
  }
  etools-content-panel:not([list])::part(ecp-content) {
    padding: 16px 12px;
    padding-left: 12px;
  }

  .etools-container,
  etools-dropdown,
  etools-dropdown-multi,
  etools-input,
  etools-textarea,
  datepicker-lite,
  etools-currency {
    box-sizing: border-box;
    padding: 0 12px;
    outline: none !important;
  }

  .paper-label {
    color: var(--sl-input-label-color);
    font-size: var(--etools-font-size-12, 12px);
    padding-top: 6px;
  }

  .input-label {
    min-height: 24px;
    padding-top: 4px;
    padding-bottom: 6px;
    min-width: 0;
    font-size: var(--etools-font-size-16, 16px);
    display: flex;
    flex-wrap: wrap;
  }

  .input-label[empty]::after {
    content: '—';
    color: var(--secondary-text-color);
  }

  .separator {
    padding: 0 8px;
  }

  .editable-row:hover .hover-block {
    background-color: transparent;
  }
  .editable-row .hover-block etools-icon-button {
    --iron-icon-fill-color: var(--gray-mid);
  }
  .editable-row {
    position: relative;
    align-items: center;
  }
  .align-right {
    justify-content: flex-end !important;
  }
  .align-center {
    justify-content: center !important;
    text-align: center !important;
    align-items: center !important;
  }
`;
