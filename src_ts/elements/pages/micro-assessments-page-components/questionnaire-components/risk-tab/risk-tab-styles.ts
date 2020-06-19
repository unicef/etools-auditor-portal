import {html} from '@polymer/polymer';

export const RiskTabStyles = html`
  <style>
    :host {
      position: relative;
      display: block;
    }
    .edit-icon-slot {
      overflow: visible !important;
      line-height: 57px;
      display: flex;
      align-items: center;
      height: 100%;
    }
    .tab-container {
      position: relative;
      width: 100%;
      margin-bottom: 24px;
    }
    .tab-container .risk-result-container {
      position: absolute;
      top: 51px;
      left: 0;
      width: 100%;
      background-color: #fff;
      padding-bottom: 7px;
      box-shadow: 0 3px 11px -2px rgba(0, 0, 0, 0.4);
      opacity: 1;
      transition: 0.25s;
    }
    .tab-container .risk-result-container[hidden_results] {
      opacity: 0;
      z-index: -1;
    }
    .tab-container .risk-result-container .result-element {
      position: relative;
      height: 58px;
      padding: 16px calc(2% + 120px) 16px 2%;
      box-sizing: border-box;
      font-size: 17px;
    }
    .tab-container .risk-result-container .result-element .text {
      width: 100%;
      display: inline-block;
      padding-right: 10px;
      box-sizing: border-box;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .tab-container .risk-result-container .result-element .value {
      position: absolute;
      right: 2%;
      top: 16px;
      width: 120px;
      display: inline-block;
      text-align: center;
      font-weight: 800;
    }
    .tab-container .risk-result-container .result-element .value.low {
      color: var(--module-success);
    }
    .tab-container .risk-result-container .result-element .value.medium {
      color: var(--module-warning);
    }
    .tab-container .risk-result-container .result-element .value.significant,
    :host .tab-container .risk-result-container .result-element .value.high {
      color: var(--module-error);
    }
    .tab-container .risk-result-container .result-element.risk-rating .value {
      font-weight: 400;
    }
    .tab-container .risk-result-container .result-element.result-element {
      border-bottom: solid 1px #e8e8e8;
    }

    etools-searchable-multiselection-menu {
      white-space: normal;
      margin-left: -11px;
      margin-top: -16px;
    }

    etools-content-panel {
      position: relative;
      --ecp-header-height: 51px;
      --ecp-header-bg: var(--module-primary);

      --ecp-content: {
        padding: 0;
      }
    }
  </style>
`;
