import {css} from 'lit';

// language=HTML
export const moduleStyles = css`
  :host {
    --gray-06: rgba(0, 0, 0, 0.06);
    --gray-08: rgba(0, 0, 0, 0.08);
    --gray-lighter: rgba(0, 0, 0, 0.12);
    --gray-20: rgba(0, 0, 0, 0.2);
    --gray-28: rgba(0, 0, 0, 0.28);
    --gray-light: rgba(0, 0, 0, 0.38);
    --gray-50: rgba(0, 0, 0, 0.5);
    --gray-mid: rgba(0, 0, 0, 0.54);
    --gray-mid-dark: rgba(0, 0, 0, 0.7);
    --gray-dark: rgba(0, 0, 0, 0.87);
    --gray-darkest: #000000;

    --gray-border: rgba(0, 0, 0, 0.15);

    /*--primary-color: #00AEEF;*/
    /* --primary-color: #0099ff; */
    /*--primary-color-dark: #4893ff;*/

    --module-sec-blue: #0061e9;
    --module-sec-green: #009a54;
    --module-sec-lightgreen: #72c300;
    --module-sec-gray: #233944;

    --module-error: #ea4022;
    --module-error-2: #f1b8ae;
    --module-warning: #ff9044;
    --module-warning-2: #ffc8a2;
    --module-success: #72c300;
    --module-success-2: #bef078;
    --module-info: #cebc06;
    --module-info-2: #fff176;

    --module-planned: rgba(250, 237, 119, 0.6);
    --module-approved: rgba(141, 198, 63, 0.45);
    --module-submitted: rgba(206, 188, 6, 0.6);
    --module-sent: rgba(30, 134, 191, 0.45);
    --module-completed: rgba(141, 198, 63, 1);
  }

  *[hidden] {
    display: none;
  }

  .readonly {
    pointer-events: none;
  }
  etools-input::part(readonly-input-value) {
    word-break: break-word;
  }

  /* TABS */
  .container {
    padding: 16px 16px;
  }

  etools-dropdown,
  etools-dropdown-multi {
    padding: 0 12px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  etools-upload {
    padding: 0 12px;
  }
  datepicker-lite {
    padding: 0 12px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    width: 100%;
  }
  etools-content-panel {
    position: relative;
  }
  etools-content-panel::part(ecp-header-title) {
    font-weight: 500;
    line-height: 43px;
    display: contents;
  }
  @media (min-width: 850px) {
    etools-content-panel::part(ecp-header-title) {
      padding: 0 30px;
    }
  }
  etools-content-panel::part(ecp-header) {
    background-color: var(--primary-color);
  }
  etools-content-panel::part(ecp-toggle-btn) {
    position: absolute;
    top: 3px;
    left: 13px;
    width: 45px;
    height: 45px;
    display: contents;
  }

  etools-content-panel div[slot='panel-btns'] .panel-button {
    color: #ffffff;
  }
  etools-content-panel div[slot='panel-btns'] {
    position: relative;
  }
  .pl-30 {
    padding-left: 30px;
  }

  div[slot='panel-btns'] {
    position: absolute;
    top: 4px;
    right: 16px;
    opacity: 1;
  }

  .wrap-text {
    white-space: normal;
    line-height: 14px;
    display: flex;
    word-break: break-word;
    width: 100%;
    justify-content: left;
    align-items: center;
    padding: 4px 0px;
  }

  .wrap-text etools-icon {
    flex-shrink: 0;
    width: 16px;
  }

  etools-data-table-row {
    --list-divider-color: var(--dark-divider-color);
  }
  etools-data-table-header {
    --list-divider-color: var(--dark-divider-color);
  }
  etools-data-table-row::part(edt-list-row-wrapper) {
    min-height: 24px;
  }
  etools-data-table-row *[slot='row-data'] .col-data {
    line-height: 16px;
  }
  .editable-row:hover .hover-block,
  .editable-row:hover .hover-block:focus {
    background-color: transparent;
  }
  .rdc-title {
    display: inline-block;
    width: 100%;
    color: var(--secondary-text-color);
    font-weight: 500;
    font-size: var(--etools-font-size-13, 13px);
    margin-bottom: 6px;
  }
  .row-details-content {
    font-size: var(--etools-font-size-14, 14px);
  }

  div[slot='panel-btns'] .panel-button {
    opacity: 0.7;
  }

  div[slot='panel-btns'] .panel-button:hover {
    opacity: 0.87;
  }

  .pr-25 {
    padding-right: 25px !important;
  }

  .pr-45 {
    padding-right: 45px !important;
  }
  .text-ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .col-data.truncate {
    display: inline-block;
    overflow: hidden;
    font-size: var(--etools-font-size-13, 13px);
    text-overflow: ellipsis;
    padding-right: 16px;
    padding-left: 1px;
    box-sizing: border-box;
  }
  .truncate {
    white-space: nowrap;
  }
  .caps::first-letter {
    text-transform: uppercase;
  }
  .editable-row:hover .hover-block {
    background-color: transparent;
  }

  .f1 {
    flex: 1;
  }

  .f2 {
    flex: 2;
  }

  .f3 {
    flex: 3;
  }

  .f4 {
    flex: 4;
  }

  .f5 {
    flex: 5;
  }

  .f6 {
    flex: 6;
  }

  .f7 {
    flex: 7;
  }

  .f8 {
    flex: 8;
  }

  .w4 {
    width: 4%;
  }

  .w5 {
    width: 5%;
  }

  .w7 {
    width: 7%;
  }

  .w8 {
    width: 8%;
  }

  .w9 {
    width: 9%;
  }

  .w10 {
    width: 10%;
  }

  .w11 {
    width: 11%;
  }

  .w12 {
    width: 12%;
  }

  .w13 {
    width: 13%;
  }

  .w14 {
    width: 14%;
  }

  .w15 {
    width: 15%;
  }

  .w16 {
    width: 16%;
  }

  .w17 {
    width: 17%;
  }

  .w18 {
    width: 18%;
  }

  .w19 {
    width: 19%;
  }

  .w20 {
    width: 20%;
  }

  .w22 {
    width: 22%;
  }

  .w25 {
    width: 25%;
  }

  .w28 {
    width: 28%;
  }

  .w30 {
    width: 30%;
  }

  .w32 {
    width: 32%;
  }

  .w35 {
    width: 35%;
  }

  .w45 {
    width: 45%;
  }

  .w40 {
    width: 40%;
  }

  .w50 {
    width: 50%;
  }

  .w55 {
    width: 55%;
  }

  .w60 {
    width: 60%;
  }

  .w65 {
    width: 65%;
  }

  .w70 {
    width: 70%;
  }

  .w75 {
    width: 75%;
  }

  .w80 {
    width: 80%;
  }

  .w90 {
    width: 90%;
  }

  .w95 {
    width: 95%;
  }

  .w96 {
    width: 96%;
  }

  .w100 {
    width: 100%;
  }

  .w30px {
    width: 30px;
  }

  .w35px {
    width: 35px;
  }

  .w40px {
    width: 40px;
  }

  .w45px {
    width: 45px;
  }

  .w50px {
    width: 50px;
  }

  .w60px {
    width: 60px;
  }

  .w70px {
    width: 70px;
  }

  .w80px {
    width: 80px;
  }

  .w100px {
    width: 100px;
  }

  .w120px {
    width: 120px;
  }

  .w130px {
    width: 130px;
  }

  .w140px {
    width: 140px;
  }

  .w150px {
    width: 150px;
  }

  .w160px {
    width: 160px;
  }

  .w200px {
    width: 200px;
  }
`;
