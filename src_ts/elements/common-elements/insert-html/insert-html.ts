import {LitElement, html, customElement, property, PropertyValues} from 'lit-element';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('insert-html')
export class InsertHtml extends LitElement {
  render() {
    return html``;
  }
  @property({type: String})
  html = '';

  _htmlChanged(html) {
    this.shadowRoot!.innerHTML = html || '--';
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('html')) {
      this._htmlChanged(this.html);
    }
  }
}
