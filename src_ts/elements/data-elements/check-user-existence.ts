import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import get from 'lodash-es/get';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import {getEndpoint} from '../config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../types/global';

class CheckUserExistence extends PolymerElement {
  @property({type: String, observer: '_emailChanged'})
  email: string | null = null;

  @property({type: Boolean})
  unicefUsersAllowed!: boolean;

  @property({type: Object})
  editedItem!: GenericObject;

  @property({type: Number})
  organisationId!: number;

  _emailChanged(email) {
    if (!email) {
      return;
    }
    if (isNaN(+this.organisationId)) {
      return;
    }

    const url = getEndpoint('userExistence', {
      email: encodeURIComponent(email),
      id: this.organisationId
    }).url;

    sendRequest({
      endpoint: {url}
    })
      .then((resp) => {
        this._handleResponse(resp);
      })
      .catch(() => {
        this._handleError();
      });
  }

  _isUnicefUser(email) {
    return email.includes('unicef.org');
  }

  _handleResponse(details = []) {
    const user = get(details, '0') as any;
    let data;
    let error;
    if (user) {
      const firmId = user.auditor_firm;
      const userIsNotDeleted = firmId === this.organisationId && !user.hidden;
      const alreadyExists = firmId && (firmId !== this.organisationId || userIsNotDeleted);
      if (!this.unicefUsersAllowed && this._isUnicefUser(user.email)) {
        error = 'UNICEF users can not be added to this engagement type.';
        data = pick(this.editedItem, ['user', 'hasAccess']);
      } else if (alreadyExists || (details.length && !this.unicefUsersAllowed && userIsNotDeleted)) {
        // if user exists in other firm, or in current but is not deleted,
        // or user exists and unicefUsersAllowed is false
        error = `This user is already assigned to firm : ${user.auditor_firm_description}`;
        const email = get(this, 'editedItem.user.email');
        const hasAccess = false;
        data = {user: {email}, hasAccess};
      } else if (firmId === this.organisationId) {
        // if user was deleted from current organization
        const user = details[0] as any;
        user.is_active = true;
        data = {
          id: user.staff_member_id,
          hidden: false,
          hasAccess: true,
          user: omit(user, ['id', 'auditor_firm', 'staff_member_id', 'hidden'])
        };
      } else if (details.length) {
        // if user exists but doesn't belong to any auditor_firm
        const user = details[0] as any;
        const user_pk = user.id;

        data = {
          hasAccess: true,
          user: omit(user, ['id', 'auditor_firm']),
          user_pk
        };
      } else if (this.unicefUsersAllowed) {
        // if is new user and unicefUsersAllowed
        error = `You can't add new user to this firm.`;
        data = pick(this.editedItem, ['user', 'hasAccess']);
      } else {
        // if is new user
        data = pick(this.editedItem, ['user', 'hasAccess']);
      }
    } else if (this.unicefUsersAllowed) {
      error = this._isUnicefUser(this.email)
        ? `We could not find this user at this time, please try again later or contact support if the issue persists`
        : 'Only UNICEF users can be added to a Staff Spot Check';
      data = pick(this.editedItem, ['user', 'hasAccess']);
    } else if (this._isUnicefUser(this.email)) {
      error = 'UNICEF users can not be added to this engagement type.';
      data = pick(this.editedItem, ['user', 'hasAccess']);
    }

    fireEvent(this, 'email-checked', {error, data});
  }

  _handleError() {
    fireEvent(this, 'email-checked', {error: `Can't get Email data!`});
  }
}
window.customElements.define('check-user-existence', CheckUserExistence);
