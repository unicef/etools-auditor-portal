import {css} from 'lit';

// language=HTML
export const pageLayoutStyles = css`
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
    padding: 25px;
  }

  .page-content {
    margin: 24px;
  }

  section.page-content:not(.filters) {
    padding: 18px 24px;
  }

  section.page-content.filters {
    padding: 8px 24px;
  }

  section.page-content.no-padding {
    padding: 0;
  }

  @media (max-width: 576px) {
    section.page-content.filters {
      padding: 5px;
    }
    .page-content {
      margin: 5px;
    }
  }
`;
