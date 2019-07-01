import {html} from '@polymer/polymer/polymer-element';

// language=HTML
export const ListTabMainStyles = html`
  <style>
  :host {
    display: block;
    margin-top: 25px;
    --paper-card: {
          background-color: white;
          margin: 0 24px;
          width: calc(100% - 48px);
      };
  }
  .data-table .data-card-heading {
    display: block;
    font-size: 20px;
    margin-left: 20px;
    font-weight: 500;
    line-height: 64px;
  }
  .data-table .data-card-heading.table-title {
    margin-left: 0;
    text-align: center;
    background-color: var(--module-primary);
    line-height: 48px;
    color: #fff;
    margin-bottom: 17px;
  }

  .data-table {
    margin-bottom: 24px;
    padding-bottom: 5px;
  }

  </style>
`;
