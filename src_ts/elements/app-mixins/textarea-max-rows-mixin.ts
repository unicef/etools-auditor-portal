import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../../types/global';
import {microTask} from '@polymer/polymer/lib/utils/async';

// TODO - is this mixin needed?
/**
 * @polymer
 * @mixinFunction
 */
function TextareaMaxRowsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class TextareaMaxRowsMixinClass extends (baseClass) {

        connectedCallback() {
            super.connectedCallback();
            let paperTextareas = this.shadowRoot!.querySelectorAll('paper-textarea') || [];

            paperTextareas.forEach((paperTextarea) => {
                this.setMaxHeight(paperTextarea);
            });
        }

        setMaxHeight(paperTextarea) {
            if (!paperTextarea) { return false; }

            let paperInputContainer = paperTextarea.shadowRoot!.querySelector('paper-input-container');
            let textareaAutogrow = paperInputContainer.shadowRoot!.querySelector('.paper-input-input');

            if (!textareaAutogrow) { return false; }

            let textareaAutogrowStyles = window.getComputedStyle(textareaAutogrow, null) || {};
            let maxRows = +paperTextarea.getAttribute('max-rows');

            if (!maxRows || maxRows <= 1) { return false; }

            microTask.run(() => {
                let lineHeight = textareaAutogrowStyles.lineHeight || '';
                let lineHeightPx = parseInt(lineHeight, 10);

                if (lineHeightPx) {
                    let maxHeight = maxRows * lineHeightPx + 5;
                    textareaAutogrow.style.maxHeight = `${maxHeight}px`;
                }
                textareaAutogrow.textarea.style.overflow = 'auto';
            });
        }
    }
    return TextareaMaxRowsMixinClass;
}

export default TextareaMaxRowsMixin;
