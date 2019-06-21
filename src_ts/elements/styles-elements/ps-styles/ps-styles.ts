import {html} from '@polymer/polymer/polymer-element';


// language=HTML
export const psStyles = html`
<style>
  .ps, :host ::content .ps {
    -ms-touch-action: auto;
    touch-action: auto;
    overflow: hidden !important;
    -ms-overflow-style: none;
  }
  @supports (-ms-overflow-style: none) {
    overflow: auto !important;
  }
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .ps, :host ::content .ps {
      overflow: auto !important;
    }
  }
  .ps.ps--active-x > .ps__scrollbar-x-rail, :host ::content .ps.ps--active-x > .ps__scrollbar-x-rail, .ps.ps--active-y > .ps__scrollbar-y-rail, :host ::content .ps.ps--active-y > .ps__scrollbar-y-rail {
    display: block;
    background-color: transparent;
  }
  .ps.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail, :host ::content .ps.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail {
    background-color: transparent;
    opacity: 0.7;
  }
  .ps.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail > .ps__scrollbar-x, :host ::content .ps.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail > .ps__scrollbar-x {
    background-color: #aaa;
    height: 6px;
  }
  .ps.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail, :host ::content .ps.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail {
    background-color: transparent;
    opacity: 0.7;
  }
  .ps.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail > .ps__scrollbar-y, :host ::content .ps.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail > .ps__scrollbar-y {
    background-color: #aaa;
    width: 6px;
  }
  .ps > .ps__scrollbar-x-rail, :host ::content .ps > .ps__scrollbar-x-rail {
    display: none;
    position: absolute;
    /* please don't change 'position' */
    opacity: 0;
    transition: background-color 0.2s linear, opacity 0.2s linear;
    bottom: 2px;
    /* there must be 'bottom' for ps__scrollbar-x-rail */
    height: 6px;
  }
  .ps > .ps__scrollbar-x-rail > .ps__scrollbar-x, :host ::content .ps > .ps__scrollbar-x-rail > .ps__scrollbar-x {
    position: absolute;
    /* please don't change 'position' */
    background-color: #aaa;
    border-radius: 6px;
    transition: background-color 0.2s linear, height 0.2s linear, width 0.2s ease-in-out, border-radius 0.2s ease-in-out;
    bottom: 2px;
    /* there must be 'bottom' for ps__scrollbar-x */
    height: 6px;
  }
  .ps > .ps__scrollbar-x-rail:hover > .ps__scrollbar-x, :host ::content .ps > .ps__scrollbar-x-rail:hover > .ps__scrollbar-x, .ps > .ps__scrollbar-x-rail:active > .ps__scrollbar-x, :host ::content .ps > .ps__scrollbar-x-rail:active > .ps__scrollbar-x {
    height: 6px;
  }
  .ps > .ps__scrollbar-y-rail, :host ::content .ps > .ps__scrollbar-y-rail {
    display: none;
    position: absolute;
    /* please don't change 'position' */
    opacity: 0;
    transition: background-color 0.2s linear, opacity 0.2s linear;
    right: 2px;
    /* there must be 'right' for ps__scrollbar-y-rail */
    width: 6px;
  }
  .ps > .ps__scrollbar-y-rail > .ps__scrollbar-y, :host ::content .ps > .ps__scrollbar-y-rail > .ps__scrollbar-y {
    position: absolute;
    /* please don't change 'position' */
    background-color: #aaa;
    border-radius: 6px;
    transition: background-color 0.2s linear, height 0.2s linear, width 0.2s ease-in-out, border-radius 0.2s ease-in-out;
    right: 2px;
    /* there must be 'right' for ps__scrollbar-y */
    width: 6px;
  }
  .ps > .ps__scrollbar-y-rail:hover > .ps__scrollbar-y, :host ::content .ps > .ps__scrollbar-y-rail:hover > .ps__scrollbar-y, .ps > .ps__scrollbar-y-rail:active > .ps__scrollbar-y, :host ::content .ps > .ps__scrollbar-y-rail:active > .ps__scrollbar-y {
    width: 6px;
  }
  .ps:hover.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail, :host ::content .ps:hover.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail {
    background-color: transparent;
    opacity: 0.7;
  }
  .ps:hover.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail > .ps__scrollbar-x, :host ::content .ps:hover.ps--in-scrolling.ps--x > .ps__scrollbar-x-rail > .ps__scrollbar-x {
    background-color: #aaa;
    height: 6px;
  }
  .ps:hover.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail, :host ::content .ps:hover.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail {
    background-color: transparent;
    opacity: 0.7;
  }
  .ps:hover.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail > .ps__scrollbar-y, :host ::content .ps:hover.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail > .ps__scrollbar-y {
    background-color: #aaa;
    width: 6px;
  }
  .ps:hover > .ps__scrollbar-x-rail, :host ::content .ps:hover > .ps__scrollbar-x-rail, .ps:hover > .ps__scrollbar-y-rail, :host ::content .ps:hover > .ps__scrollbar-y-rail {
    opacity: 0.5;
  }
  .ps:hover > .ps__scrollbar-x-rail:hover, :host ::content .ps:hover > .ps__scrollbar-x-rail:hover {
    background-color: transparent;
    opacity: 0.7;
  }
  .ps:hover > .ps__scrollbar-x-rail:hover > .ps__scrollbar-x, :host ::content .ps:hover > .ps__scrollbar-x-rail:hover > .ps__scrollbar-x {
    background-color: #aaa;
  }
  .ps:hover > .ps__scrollbar-y-rail:hover, :host ::content .ps:hover > .ps__scrollbar-y-rail:hover {
    background-color: transparent;
    opacity: 0.7;
  }
  .ps:hover > .ps__scrollbar-y-rail:hover > .ps__scrollbar-y, :host ::content .ps:hover > .ps__scrollbar-y-rail:hover > .ps__scrollbar-y {
    background-color: #aaa;
  }
  .ps .input-container, :host ::content .ps .input-container {
    -ms-overflow-style: auto;
  }

</style>
`;