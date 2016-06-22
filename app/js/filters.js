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

    app.filter('limitTo', [
        function() {
            return function(input, limit) {
                if (input === undefined) return []
                if (isNaN(limit)) { limit = Infinity; }
                return input.filter(function(d, i) {return i<limit})
            }
        }
    ]);

    app.filter('filterBy', [
        function() {
            return function(input, attr) {
                if (input === undefined) return []
                if (input.filter) {
                    return input.filter(function(d, i) {return d[attr]})
                } else {
                    var result = {}
                    var i
                    for (i in input) {
                        if (input[i][attr]) {
                            result[i] = input[i]
                        }
                    }
                    return result
                }
            }
        }
    ]);

})();