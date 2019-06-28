import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {property} from "@polymer/decorators/lib/decorators";

class InsertHtml extends PolymerElement {

  static get template() {
    // language=HTML
    return html``;
  }
  @property({type: String, observer: '_htmlChanged'})
  html: string = '';

  _htmlChanged (html) {
    this.shadowRoot.innerHTML = html || '--';
  }
}

window.customElements.define('insert-html', InsertHtml);
