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
                queryTerm: '=',
                corpusId: '=',
                filteredResultsCount: '='
            },

            link: function($scope, element, attrs) {
                // Uncollapse filters
                $scope.filtersLabel = 'More filters';
                $scope.isCollapsed = true;
                $scope.moreFilters = function() {
                    $scope.isCollapsed = !$scope.isCollapsed;
                    if (!$scope.isCollapsed) {
                        $('.filters').height(($(window).height() - 127) + 'px');
                        $scope.filtersLabel = 'Less filters';
                    } else {
                        $('.filters').height('200px');
                        $scope.filtersLabel = 'More filters';
                    }
                }

                $.each($scope.categories, function(index_01, item_01) {
                    item_01.check = 'Unselect all';
                });
                $scope.selectAll = function(categoryId) {
                    // If is checked, check all the facets of this category
                    var element = $('input#' + categoryId);
                    if (element.prop('checked')) {
                        $.each($scope.categories, function(index_01, item_01) {
                            item_01.check = 'Unselect all';
                            if (item_01.id == categoryId) {
                                $.each(item_01.values, function(index_02, item_02) {
                                    item_02.isSelected = true;
                                });
                            }
                        });
                        // Else, uncheck all the facets of this category
                    } else {
                        $.each($scope.categories, function(index_01, item_01) {
                            item_01.check = 'Select all';
                            if (item_01.id == categoryId) {
                                $.each(item_01.values, function(index_02, item_02) {
                                    item_02.isSelected = false;
                                });
                            }
                        });
                    }
                    switch ($scope.corpusId) {
                        case 'climatechanges':
                            $scope.$parent.filter();
                            break;
                        case 'ameriquelatine':
                            $scope.$parent.filter2();
                            break;
                    }
                }
            }
        }
    }]);

})();