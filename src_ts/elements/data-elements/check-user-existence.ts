import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import get from 'lodash-es/get';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import {getEndpoint} from '../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class CheckUserExistence extends EtoolsAjaxRequestMixin(PolymerElement) {

  @property({type: String, notify: true, observer: '_emailChanged'})
  email: string | null = null;

  @property({type: Boolean, notify: true})
  emailChecking = false;

  @property({type: Object, notify: true})
  errors: any | null = null;

  @property({type: Boolean, notify: true})
  unicefUsersAllowed!: boolean;

  @property({type: Object, notify: true})
  editedItem!: {};

  @property({type: Number})
  organisationId!: number;

  _emailChanged(email) {
    if (!email) {return;}
    if (isNaN(+this.organisationId)) {return;}

    this.emailChecking = true;
    const url = getEndpoint('userExistence', {
      email: encodeURIComponent(email),
      id: this.organisationId
    }).url;

    this.sendRequest({
      endpoint: {url}
    }).then((resp) => {
      this._handleResponse(resp);
    }).catch((err) => {
      this._handleError(err);
    });

  }

  _isUnicefUser(email) {
    return email.includes('unicef.org');
  }

  _handleResponse(details = []) {
    const user = get(details, '0');
    if (user) {
      const firmId = user.auditor_firm;
      const userIsNotDeleted = firmId === this.organisationId && !user.hidden;
      const alreadyExists = firmId && (firmId !== this.organisationId || userIsNotDeleted);
      if (!this.unicefUsersAllowed && this._isUnicefUser(user.email)) {
        this._setError('UNICEF users can not be added to this engagement type.');
        this.editedItem = pick(this.editedItem, ['user', 'hasAccess']);
      }
      if (alreadyExists || (details.length && !this.unicefUsersAllowed && userIsNotDeleted)) {
        // if user exists in other firm, or in current but is not deleted,
        // or user exists and unicefUsersAllowed is false
        this._setError(`This user is already assigned to firm : ${user.auditor_firm_description}`);
        const email = get(this, 'editedItem.user.email');
        const hasAccess = false;
        this.editedItem = {user: {email}, hasAccess};
      }

      if (firmId === this.organisationId) {
        // if user was deleted from current organization
        const user = details[0] as any;
        user.is_active = true;
        this.editedItem = {
          id: user.staff_member_id,
          hidden: false,
          hasAccess: true,
          user: omit(user, ['id', 'auditor_firm', 'staff_member_id', 'hidden'])
        };
      } else if (details.length) {
        // if user exists but doesn't belong to any auditor_firm
        const user = details[0] as any;
        const user_pk = user.id;

        this.editedItem = {
          hasAccess: true,
          user: omit(user, ['id', 'auditor_firm']),
          user_pk
        };
      } else if (this.unicefUsersAllowed) {
        // if is new user and unicefUsersAllowed
        this._setError(`You can't add new user to this firm.`);
        this.editedItem = pick(this.editedItem, ['user', 'hasAccess']);
      } else {
        // if is new user
        this.editedItem = pick(this.editedItem, ['user', 'hasAccess']);
      }
    } else if (this.unicefUsersAllowed) {
      const errorMsg = this._isUnicefUser(this.email) ?
        `We could not find this user at this time, please try again later or contact support if the issue persists` :
        'Only UNICEF users can be added to a Staff Spot Check';
      this._setError(errorMsg);
      this.editedItem = pick(this.editedItem, ['user', 'hasAccess']);

    } else if (this._isUnicefUser(this.email)) {
      this._setError('UNICEF users can not be added to this engagement type.');
      this.editedItem = pick(this.editedItem, ['user', 'hasAccess']);
    }

    this.emailChecking = false;
    this.email = null;
  }

  _handleError(err) {
    this._setError(`Can't get Email data!`);
    this.emailChecking = false;
    this.email = null;
  }

  _setError(error) {
    if (!this.errors) {this.set('errors', {});}
    if (!this.errors.user) {this.set('errors.user', {});}
    if (!this.errors.user.email) {this.set('errors.user.email', error);}
  }
}
window.customElements.define('check-user-existence', CheckUserExistence);
