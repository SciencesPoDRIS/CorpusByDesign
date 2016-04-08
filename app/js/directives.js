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
                        $('.my-filters').height(($(window).height() - 138) + 'px');
                        $scope.filtersLabel = 'Less filters';
                        $('.grid-list .tile-link').hide();
                        $('.my-filters .facets').css('overflow-y', 'auto');
                    } else {
                        $('.my-filters').height('213px');
                        $scope.filtersLabel = 'More filters';
                        $('.grid-list .tile-link').show();
                        $('.my-filters .facets').css('overflow-y', 'hidden');
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
                    if ($('.' + categoryId + ' .checkbox:not(.all) :checked').length == $('.' + categoryId + ' .checkbox:not(.all)').length) {
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
        };
    }]);

    app.directive('myGraph', [function() {
        return {
            restrict: 'E',
            templateUrl: 'app/partials/myGraph.html',
            scope: {
                corpusId: '=',
                corpora: '='
            },
            link: function($scope, element, attrs) {
                // Init variables
                var defaultEdgeColor = '#f1f1f1';

                // Load the specific corpus configuration
                $scope.selectedCategory = $scope.corpora.categories[$scope.corpora.nodesColor].label;

                // Center the whole graph
                $scope.sigmaCenter = function() {
                    var c = $scope.graph.cameras[0]
                    c.goTo({
                        ratio: 1,
                        x: 0,
                        y: 0
                    })
                }

                // Zoom on the graph
                $scope.sigmaZoom = function() {
                    var c = $scope.graph.cameras[0]
                    c.goTo({
                        ratio: c.ratio / c.settings('zoomingRatio')
                    })
                }

                // Unzoom on the graph
                $scope.sigmaUnzoom = function() {
                    var c = $scope.graph.cameras[0]
                    c.goTo({
                        ratio: c.ratio * c.settings('zoomingRatio')
                    })
                }

                // Change nodes color on the graph and the filters parts
                $scope.changeNodesColor = function(e) {
                    nodesColor = e.currentTarget.id;
                    $scope.selectedCategory = $scope.categories[nodesColor].label;
                    switch ($scope.corpusId) {
                        case 'climatechanges':
                            $scope.filter();
                            break;
                        case 'ameriquelatine':
                            $scope.filter2();
                            break;
                    }
                }

                // Load the graph
                sigma.parsers.gexf(
                    '../data/' + $scope.corpusId + '.gexf', {
                        container: 'graph',
                        settings: {
                            defaultEdgeColor: defaultEdgeColor,
                            edgeColor: 'default',
                            labelThreshold: 100
                        }
                    },
                    function(s) {
                        $scope.graph = s;
                        $scope.graph.bind('overNode outNode', function(n) {
                            // On node hover, color all the connected edges in the node color
                            if (n.type == 'overNode') {
                                // Get the connected edges
                                $scope.graph.graph.edges().forEach(function(e, i) {
                                    if (e.source == n.data.node.id || e.target == n.data.node.id) {
                                        e.color = n.data.node.color;
                                        // Remove edge from edges array
                                        $scope.graph.graph.dropEdge(e.id);
                                        // Add edge as last element of edges array (to render it at the top of other edges)
                                        $scope.graph.graph.addEdge(e);
                                    }
                                });
                                // Simulate mouse hover effect on the tiles
                                $('#' + n.data.node.id + ' img').addClass('hover');
                                // On node out, reset all edges color to the default one
                            } else if (n.type == 'outNode') {
                                $scope.graph.graph.edges().forEach(function(e) {
                                    e.color = defaultEdgeColor;
                                });
                                // Simulate mouse out effect on the tiles
                                $('#' + n.data.node.id + ' img').removeClass('hover');
                            }
                            $scope.graph.refresh();
                        });
                        // On node click, open the webentity page
                        $scope.graph.bind('clickNode', function(n) {
                            $location.path($scope.lang + '/' + $scope.corpusId + '/' + n.data.node.id);
                            $scope.$apply();
                        });
                    }
                );

            }
        };
    }]);

})();