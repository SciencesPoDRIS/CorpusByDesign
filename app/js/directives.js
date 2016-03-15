(function() {
    'use strict';

    /* Directives */

    var app = angular.module('webcorpus.directives', []);

    app.directive('myFilters', function() {
        return {
            restrict: 'E',
            templateUrl: 'app/partials/filters/filters.html',
            scope: {
                categories: '='
            },
            link: 'app/partials/filters/filters.js'
        }
    });

})();