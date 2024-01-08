import {css, LitElement, html, CSSResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../../styles/module-styles';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {BASE_PATH} from '../../../config/config';

@customElement('send-back-comments')
export class SendBackComments extends LitElement {
  render() {
    return html`
      ${sharedStyles}

      <etools-content-panel class="content-section comment-container clearfx" panel-title="">
        <img class="flag-icon" src="${BASE_PATH}/assets/images/flag-icon.svg" />
        <div class="layout-horizontal">
          <div class="col col-12">
            <div class="title">Sent Back Comments</div>
          </div>
        </div>
        <div class="layout-horizontal">
          <div class="col col-12">
            <span>${this.comments}</span>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  comments = '';

  static get styles(): CSSResult[] {
    return [
      gridLayoutStylesLit,
      moduleStyles,
      tabInputsStyles,
      css`
        .comment-container {
          padding: -4px 0px 24px 0px;
          margin-bottom: 24px;
          background-color: var(--primary-background-color);
          border-top: 4px solid var(--module-warning);
          border-top-left-radius: 4px;
        }

        .flag-icon {
          position: absolute;
          top: -5px;
          left: 16px;
          width: 24px;
        }

        .title {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 15px;
        }

        etools-content-panel:not([list])::part(ecp-content) {
          padding: 24px 12px;
        }

        etools-content-panel::part(ecp-header) {
          display: none;
        }

        .layout-horizontal {
          padding: 0px 12px;
          margin-left: 36px;
        }
      `
    ];
  }
}
