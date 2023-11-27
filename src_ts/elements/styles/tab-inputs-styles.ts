import {css} from 'lit';

export const tabInputsStyles = css`
  *[hidden] {
    display: none !important;
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
    position: relative;
    float: left;
    margin-right: 0;
    width: 33.33%;
  }

  .input-container:last-of-type {
    margin-right: 0;
  }

  .input-container.input-container-s {
    width: 30%;
  }

  .input-container.input-container-40 {
    width: 35%;
  }

  .input-container.input-container-m {
    width: 66.66%;
  }

  .input-container.input-container-45 {
    width: 45%;
  }

  .input-container.input-container-ms {
    width: 50%;
  }

  .input-container.input-container-l {
    width: 100%;
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
    font-size: 14px;
  }

  etools-dialog paper-textarea {
    --paper-input-container-input: {
      display: block;
    }
    --iron-autogrow-textarea: {
      overflow: auto;
      padding: 0;
      max-height: 96px;
    }
  }

  etools-dropdown,
  etools-dropdown-multi,
  etools-input,
  paper-textarea,
  paper-dropdown-menu,
  datepicker-lite,
  etools-currency-amount-input {
    box-sizing: border-box;
    padding: 0 12px;
    outline: none !important;

    --paper-input-container-input-color: var(--gray-dark, rgba(0, 0, 0, 0.87));

    --paper-input-container-underline: {
      border-bottom: 1px solid var(--gray-mid, rgba(0, 0, 0, 0.54));
    }

    --paper-input-container-input: {
      font-size: 15px;
      box-sizing: border-box;
    }

    --paper-input-container-label: {
      color: var(--gray-50);
    }
    --paper-input-container-label-floating: {
      color: var(--gray-50);
    }
    --paper-input-container-invalid-color: var(--module-error);

    --paper-input-container-disabled: {
      color: var(--gray-light);
      opacity: 1;
    }
    --paper-input-char-counter: {
      color: var(--gray-light);
    }

    --paper-input-prefix: {
      margin-right: 10px;
      color: var(--gray-mid);
    }

    --paper-input-error: {
      overflow: hidden;
    }

    --etools-currency-container-label-floating: {
      -webkit-transform: none;
      -moz-transform: none;
      -ms-transform: none;
      -o-transform: none;
      transform: none;
      top: -21px;
      width: 100%;
      font-size: 12px;
    }
  }

  paper-textarea {
    --paper-input-container-input: {
      white-space: normal;
      display: block !important;
    }

    --iron-autogrow-textarea: {
      overflow: hidden;
      padding: 0;
    }
  }

  etools-currency-amount-input {
    --etools-currency-container-label: {
      color: var(--gray-50);
    }
  }

  :host > * {
    --required-star-style: {
      background: url('./assets/images/required.svg') no-repeat 98% 14%/7px;
      width: auto !important;
      max-width: 133%;
      right: auto;
      padding-right: 15px;
      color: var(--gray-50);
    }
  }

  etools-input[required]:not([disabled]),
  paper-input.required:not([disabled]),
  paper-input-container[required]:not([disabled]),
  paper-input-container.required:not([disabled]),
  datepicker-lite[required]:not([disabled]),
  etools-dropdown[required]:not([disabled]),
  etools-dropdown-multi[required]:not([disabled]),
  etools-upload[required]:not([disabled]),
  etools-currency-amount-input[required]:not([disabled]),
  paper-textarea[required]:not([disabled]) {
    --paper-input-container-label: {
      @apply --required-star-style;
    }
    --paper-input-container-label-floating: {
      @apply --required-star-style;
    }
  }

  paper-input.deleted {
    --paper-input-container-input: {
      color: #b0b0b0;
    }
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
    min-width: 500px;
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
    font-size: 13px;
  }

  etools-currency-amount-input {
    padding: 0 12px;
    box-sizing: border-box;
  }
  etools-content-panel[list]::part(ecp-content) {
    padding: 0;
    padding-left: 0;
  }
  etools-content-panel:not([list])::part(ecp-content) {
    padding: 8px 12px;
    padding-left: 12px;
  }

  etools-currency-amount-input {
    --etools-currency-container-input: {
      line-height: 0;
    }
  }

  etools-dropdown-multi[disabled],
  etools-currency-amount-input[disabled],
  etools-dropdown[disabled],
  paper-textarea[disabled],
  paper-dropdown-menu[disabled],
  paper-input[disabled],
  datepicker-lite[disabled] {
    --paper-input-container: {
      opacity: 1 !important;
    }
    --paper-input-container-underline: {
      border-bottom: 1px dashed var(--gray-20, rgba(0, 0, 0, 0.2));
      display: block !important;
    }
    --paper-input-container-underline-disabled: {
      border-bottom: 1px dashed var(--gray-20, rgba(0, 0, 0, 0.2));
      display: block !important;
    }
    --paper-input-container-underline-focus: {
      display: none;
    }
  }

  etools-dropdown-multi[readonly],
  etools-currency-amount-input[readonly],
  etools-dropdown[readonly],
  paper-textarea[readonly],
  paper-dropdown-menu[readonly],
  paper-input[readonly],
  datepicker-lite[readonly] {
    --paper-input-container: {
      opacity: 1 !important;
    }
    --paper-input-container-underline: {
      border-bottom: none !important;
      display: none !important;
    }
    --paper-input-container-underline-focus: {
      display: none;
    }
  }

  .paper-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding-top: 6px;
  }

  .input-label {
    min-height: 24px;
    padding-top: 4px;
    padding-bottom: 6px;
    min-width: 0;
    font-size: 16px;
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
`;
