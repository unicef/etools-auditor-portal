import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from "@polymer/decorators/lib/decorators";

/**
 * @customElement
 * @polymer
 */
class InsertHtml extends PolymerElement {

  static get template() {
    return html``;
  }
  @property({type: String, observer: '_htmlChanged'})
  html: string = '';

  _htmlChanged(html) {
    this.shadowRoot!.innerHTML = html || '--';
  }
}

window.customElements.define('insert-html', InsertHtml);
