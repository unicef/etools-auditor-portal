import { PolymerElement } from "@polymer/polymer";
import { property } from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class AddNewEngagement extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {
  // behaviors: [
  //     etoolsAppConfig.globals,
  //     EtoolsAjaxRequestBehavior
  // ],

  @property({type: Object})
  newEngagementData!: {};

  @property({type: Object, notify: true})
  errorObject = {};

  @property({type: String})
  endpointName: string = "";

  static get observers() {
    return ["_newEngagementChanged(newEngagementData, endpointName)"];
  }

  _handleResponse(data) {
    fireEvent(this, "engagement-created", { success: true, data });
  }

  _handleError(error) {
    let { status, response } = error;
    if (typeof response === "string") {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    if (status === 400) {
      this.set("errorObject", response);
    } else if (status === 413) {
      this.set("errorObject", {});
      fireEvent(this, "toast", {
        text: `Error: Exceeded the maximum size of uploaded file(s).`
      });
    }

    fireEvent(this, "engagement-created");
    fireEvent(this, "global-loading", { type: "create-engagement" });
  }

  _newEngagementChanged(engagement, endpointName) {
    if (!engagement || !endpointName) {
      return;
    }

    fireEvent(this, "global-loading", {
      type: "create-engagement",
      active: true,
      message: "Creating new engagement..."
    });
    this.postData = engagement.data;
    this._makeRequest(endpointName);
  }

  _makeRequest(endpointName) {
    const options = {
      method: "POST",
      body: this.postData,
      endpoint: this.getEndpoint(endpointName)
    };
    this.sendRequest(options)
      .then(this._handleResponse.bind(this))
      .catch(this._handleError.bind(this));
  }
}

window.customElements.define("add-new-engagement", AddNewEngagement);
