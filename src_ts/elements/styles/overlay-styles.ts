import {html} from '@polymer/polymer/polymer-element';

// language=HTML
export const overlayStyles = html`
  <style>
    .dialogOverlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .dialogOverlay.opened {
      opacity: 0.6;
      z-index: 102;
    }
  </style>
`;
