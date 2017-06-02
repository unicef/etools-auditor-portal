'use strict';

const fs = require('fs'),
    path = require('path');

function improveElement(path, content) {
    let exist = fs.existsSync(path);
    if (exist) {
        let file_content = fs.readFileSync(path, 'utf8');
        if (~file_content.indexOf('/*test_code*/')) { return; }
        let index = file_content.indexOf(' </style>');

        file_content = `${file_content.slice(0, index)} ${content} ${file_content.slice(index)}`;

        fs.writeFileSync(path, file_content, 'utf-8');
    }
}


module.exports = function(done) {
    improveElement('./src/bower_components/etools-searchable-multiselection-menu/etools-searchable-multiselection-menu.html', ` paper-input#singleSelectionDropdown {
                --paper-input-container-label: {
                    @apply(--esmm-input-container-label);
                }; 
            }/*test_code*/`);

    improveElement('./src/bower_components/etools-currency-amount-input/etools-currency-amount-input.html', ` paper-input {
    --paper-input-container: {
         @apply(--etools-currency-container);
    };
}/*test_code*/`);
    done();
};
