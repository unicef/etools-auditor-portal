import '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/custom-style.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/color.js';

const documentContainer = document.createElement('template');
documentContainer.innerHTML = `
  <custom-style>
    <style>
      html {
        --primary-color: #0099ff;
        --primary-background-color: white;
        --secondary-background-color: var(--paper-indigo-700);
        --ternary-background-color: var(--paper-indigo-800);
        --accent-color: var(--paper-light-blue-a200);
        --error-color: var(--paper-deep-orange-a700);
        --dark-primary-text-color: rgba(0, 0, 0, 0.87);
        --light-primary-text-color: rgba(255, 255, 255, 1);
        --dark-secondary-text-color: rgba(0, 0, 0, 0.54);
        --light-secondary-text-color: rgba(255, 255, 255, 0.7);
        --dark-disabled-text-color: rgba(0, 0, 0, 0.38);
        --light-disabled-text-color: rgba(255, 255, 255, 0.5);
        --dark-icon-color: rgba(0, 0, 0, 0.54);
        --light-icon-color: rgba(255, 255, 255, 1);
        --dark-disabled-icon-color: rgba(0, 0, 0, 0.38);
        --light-disabled-icon-color: rgba(255, 255, 255, 0.5);
        --dark-divider-color: rgba(0, 0, 0, 0.12);
        --light-divider-color: rgba(255, 255, 255, 0.12);
        --dark-hover-color: rgba(0, 0, 0, 0.01);
        --light-hover-color: rgba(255, 255, 255, 0.01);
        --dark-ink-color: rgba(0, 0, 0, 0.3);
        --light-ink-color: rgba(255, 255, 255, 0.30);
        --light-theme-background-color: var(--paper-grey-50);
        --light-theme-content-color: #FFFFFF;
        --dark-theme-background-color: #233944;

        --nonprod-header-color: #a94442;
        --nonprod-text-warn-color: #e6e600;
        --header-bg-color: var(--dark-theme-background-color);
        --partnership-management-color: var(--primary-background-color);
        --work-planning-color: var(--paper-light-green-500);
        --field-monitering-color: var(--paper-green-500);

        --title-toolbar-secondary-text-color : #C7CED2;
        --subtitle-background-color: #eeeeee;
        --toolbar-height: 60px;
        --side-bar-scrolling: hidden;
      }
    </style>
  </custom-style>`;

document.head.appendChild(documentContainer.content);