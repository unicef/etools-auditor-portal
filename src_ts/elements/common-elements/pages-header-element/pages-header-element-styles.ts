import {css} from 'lit';

// language=HTML
export const pagesHeaderElementStyles = css`
  :host {
    position: relative;
    display: block;
  }

  paper-listbox.mw-150 {
    min-width: 150px;
    white-space: nowrap;
  }

  paper-item {
    cursor: pointer;
  }

  .export-buttons:not([hidden]) {
    display: inline-block;
  }

  .export-buttons {
    padding: 12px 9px;
  }

  .export-buttons > etools-button {
    height: 36px;
  }

  paper-menu-button {
    padding: 0;
  }

  .header-wrapper {
    /*box-shadow: inset 0 -1px rgba(0,0,0,0.26);*/
    background-color: white;
  }

  .side-heading {
    margin: 0 !important;
    height: 80px;
    padding-top: 20px;
    box-sizing: border-box;
  }
  @media (max-width: 1024px) {
    .side-heading {
      height: auto;
    }
  }
  .side-heading span.title {
    font-size: var(--etools-font-size-24, 24px);
    padding-left: 48px;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .side-heading .grey-buttons {
    color: var(--gray-mid);
    font-weight: 500;
    font-size: var(--etools-font-size-14, 14px);
  }

  .side-heading .grey-buttons etools-icon {
    margin-right: 8px;
  }

  .side-heading etools-button.add-btn {
    background-color: var(--primary-color);
    color: white;
    height: 36px;
    font-weight: 500;
    padding-left: 10px;
    padding-right: 15px;
  }

  .side-heading etools-button.add-btn span {
    margin-left: 4px;
  }

  .side-heading .add-btn {
    font-size: var(--etools-font-size-14, 14px);
    margin: 11px 4px 12px 18px;
    background-color: var(--primary-color);
  }

  .side-heading-button-holder {
    text-align: end;
  }

  .btn-link {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
`;
