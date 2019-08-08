import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from "@polymer/decorators/lib/decorators";

/**
 * TODO: polymer 3 migration - research if this is still needed? remove :) ?
 * @customElement
 * @polymer
 */
class InsertHtml extends PolymerElement {

  static get template() {
    // language=HTML
    return html``;
  }
  @property({type: String, observer: '_htmlChanged'})
  html: string = '';

  _htmlChanged(html) {
    this.shadowRoot!.innerHTML = html || '--';
  }
}

window.customElements.define('insert-html', InsertHtml);
