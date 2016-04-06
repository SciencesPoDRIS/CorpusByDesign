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
                        while ($scope.corpora.categories[facet].values[i].id != item) {
                            i++;
                        }
                        txt += (txt == '' ? '' : ', ');
                        txt += $scope.corpora.categories[facet].values[i].label;
                    });
                    return txt;
                }
            };
        }
    ]);

})();