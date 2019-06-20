import {Constructor} from '../../types/global';


function TextareaMaxRowsMixin<T extends Constructor>(baseClass: T) {
  class TextareaMaxRowsMixin extends (baseClass) {
    attached() {
      Polymer.dom.flush();
      let paperTextareas = Polymer.dom(this.root).querySelectorAll('paper-textarea') || [];

      paperTextareas.forEach((paperTextarea) => {
        this.setMaxHeight(paperTextarea);
      });
    }

    setMaxHeight(paperTextarea) {
      if (!paperTextarea) {
        return false;
      }

      let paperInputContainer = Polymer.dom(paperTextarea.root).querySelector('paper-input-container');
      let textareaAutogrow = Polymer.dom(paperInputContainer).querySelector('.paper-input-input');

      if (!textareaAutogrow) {
        return false;
      }

      let textareaAutogrowStyles = window.getComputedStyle(textareaAutogrow, null) || {};
      let maxRows = +paperTextarea.getAttribute('max-rows');

      if (!maxRows || maxRows <= 1) {
        return false;
      }

      this.async(() => {
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

  return TextareaMaxRowsMixin;

}

export default TextareaMaxRowsMixin;
