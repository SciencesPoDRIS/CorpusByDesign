(function() {
    'use strict';

    /* Filters */

    var app = angular.module('webcorpus.filters', []);

    app.filter('translate', [
        function() {
            return function(input, $scope, facet) {
                var txt, i;
                if (input === undefined) {
                    return '';
                } else {
                    txt = '';
                    $.each(input.split(' ; '), function(index, item) {
                        i = 0;
                        while ($scope.corpus.categories[facet].values[i].id != item) {
                            i++;
                        }
                        txt += (txt == '' ? '' : ', ');
                        txt += $scope.corpus.categories[facet].values[i].label;
                    });
                    return txt;
                }
            };
        }
    ]);

    app.filter('displayedCategories', [
        function() {
            return function(input, search) {
                var result = {};
                angular.forEach(search, function(value, key) {
                    if(value.isDiplayed) {
                        result[key] = value;
                    }
                });
                return result;
            }
        }
    ]);

})();