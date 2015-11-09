(function() {
    'use strict';

    /* Filters */

    var app = angular.module('webcorpus.filters', []);

    app.filter('translate', ['categories',
        function(categories, input) {
            return function(input, facet) {
                if (input === undefined) {
                    return '';
                } else {
                    return categories[facet].values[input].label;
                }
            };
        }
    ]);

})();