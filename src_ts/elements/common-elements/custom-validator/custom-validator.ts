import {PolymerElement} from '@polymer/polymer/polymer-element';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class';
import {IronValidatorBehavior} from '@polymer/iron-validator-behavior/iron-validator-behavior';

/**
 * @customElement
 * @polymer
 * @appliesMixin IronValidatorBehavior
 */
class CustomValidator extends mixinBehaviors([IronValidatorBehavior], PolymerElement) {
  // TODO: polymer 3 migration - is this still used? Do we need it?
}

window.customElements.define('custom-validator', CustomValidator);
