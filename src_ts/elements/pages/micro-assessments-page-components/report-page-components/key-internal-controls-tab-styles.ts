import {html} from '@polymer/polymer';

export const KeyInternalControlsTabStyles = html`
  <style>
  :host {
    position: relative;
    display: block;
    margin: 20px 0;
    box-sizing: border-box;
  }

  .row-h.repeatable-item-container[without-line] {
    margin-bottom: 0 !important;
  }
  .repeatable-item-container .repeatable-item-content {
    margin-left: 25px;
  }
  .form-title {
    position: relative;
    width: 100%;
    line-height: 40px;
    color: var(--module-primary);
    font-weight: 600;
    box-sizing: border-box;
    margin: 10px 0 0 !important;
    padding: 0 !important;
  }
  .form-title .text {
    background-color: var(--gray-06);
    border-radius: 3px;
    margin: 0 24px;
    padding: 0 24px;
  }
  .line {
    width: calc(100% - 48px);
    margin-left: 24px;
    box-sizing: border-box;
    margin-bottom: 0 !important;
    border-bottom: 1px solid var(--gray-border);
  }

  etools-content-panel {
    --ecp-content: {
      padding: 0;
    };
  }

  </style>
`;
