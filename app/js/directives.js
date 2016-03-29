(function() {
    'use strict';

    /* Directives */

    var app = angular.module('webcorpus.directives', []);

    app.directive('myFilters', [function() {
        return {
            restrict: 'E',
            templateUrl: 'app/partials/myFilters.html',
            scope: {
                categories: '=',
                corpusId: '=',
                filteredResultsCount: '=',
                prefix: '='
            },
            link: function($scope, element, attrs) {
                // Uncollapse filters
                $scope.filtersLabel = 'More filters';
                $scope.isCollapsed = true;
                $scope.moreFilters = function() {
                    $scope.isCollapsed = !$scope.isCollapsed;
                    if (!$scope.isCollapsed) {
                        $('.my-filters').height(($(window).height() - 127) + 'px');
                        $scope.filtersLabel = 'Less filters';
                    } else {
                        $('.my-filters').height('210px');
                        $scope.filtersLabel = 'More filters';
                    }
                }

                $scope.selectAll = function(categoryId) {
                    $('.' + categoryId + ' .checkbox.all input').prop('checked', true);
                    // Check all the facets of this category
                    $.each($scope.categories, function(index_01, item_01) {
                        if (item_01.id == categoryId) {
                            $.each(item_01.values, function(index_02, item_02) {
                                item_02.isSelected = true;
                            });
                        }
                    });
                    switch ($scope.corpusId) {
                        case 'climatechanges':
                            $scope.$parent.filter();
                            break;
                        case 'ameriquelatine':
                            $scope.$parent.filter2();
                            break;
                    }
                }

                $scope.filter = function(categoryId, value) {
                    // If all the checkboxes are of this category are selected, force the check of the "all" checkbox
                    if($('.' + categoryId + ' .checkbox:not(.all) :checked').length == $('.' + categoryId + ' .checkbox:not(.all)').length) {
                        $('.' + categoryId + ' .checkbox.all input').prop('checked', true);
                    // Else, force the uncheck of the "all" checkbox
                    } else {
                        $('.' + categoryId + ' .checkbox.all input').prop('checked', false);
                    }
                    switch ($scope.corpusId) {
                        case 'climatechanges':
                            $scope.$parent.filter(categoryId, value);
                            break;
                        case 'ameriquelatine':
                            $scope.$parent.filter2(categoryId, value);
                            break;
                    }
                }
            }
        }
    }]);

})();