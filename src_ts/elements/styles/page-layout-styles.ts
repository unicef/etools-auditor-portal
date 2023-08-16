import {html} from 'lit-element';

// language=HTML
export const pageLayoutStyles = html`
  <style>
    app-header {
      box-sizing: border-box;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: var(--primary-background-color);
      z-index: 1;
    }

    app-drawer {
      z-index: 1;
    }

    #pages {
      padding-top: 60px;
      min-height: calc(100vh - 130px);
    }

    .page {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      padding: 24px;
    }

    #pageContent {
      width: 100%;
    }

    #sidebar {
      display: flex;
      width: 224px;
      padding-left: 24px;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }
  </style>
`;
