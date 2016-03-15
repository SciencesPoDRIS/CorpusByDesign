(function() {
    'use strict';

    /* Filters */

    var app = angular.module('webcorpus.filters', []);

    app.filter('translate', [
        function() {
            return function(input, $scope, facet) {
                if (input === undefined) {
                    return '';
                } else {
                    var index = 0;
                    while ($scope.categories[facet].values[index].id != input) {
                        index++;
                    }
                    return $scope.categories[facet].values[index].label;
                }
            };
        }
    ]);

})();