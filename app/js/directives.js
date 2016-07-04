(function() {
    'use strict';

    /* Directives */

    var app = angular.module('webcorpus.directives', []);

    app.directive('myFilters', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'partials/myFilters.html',
            scope: {
                categories: '=',
                corpusId: '=',
                filteredResultsCount: '=',
                prefix: '='
            },
            link: function($scope, element, attrs) {
                // Uncollapse filters
                $scope.isCollapsed = true;
                $scope.allChecked = {};
                $scope.indeterminate = {};
                
                // Deep watch categories to maintain the general status arrays
                // Note: inefficient but relevant since it happens rarely and the array is small
                $scope.$watch('categories', function() {
                    $scope.allChecked = {};
                    $scope.indeterminate = {};
                    var cid
                    for(cid in $scope.categories) {
                        $scope.allChecked[cid] = $scope.isAllChecked(cid)
                        $scope.indeterminate[cid] = $scope.isIndeterminate(cid)
                    }
                }, true)

                var offset = $('.top-bar').innerHeight() || 200;
                $scope.moreFilters = function() {
                    $scope.isCollapsed = !$scope.isCollapsed;
                    // Scroll to the top left of filters
                    $('.facets').scrollTop(0);
                    $('.facets').scrollLeft(0);
                    if (!$scope.isCollapsed) {
                        // Calculate filters height
                        $('.my-filters').height(($(window).height() - offset) + 'px');
                        $('.facets').height(($('.my-filters').height() - $('.search-bottom').height()) + 'px');
                        $('.my-filters').addClass('uncollapsed').removeClass('collapsed');
                        // Show vertical scrollbar
                        $('.my-filters .facets').css('overflow-y', 'auto');
                    } else {
                        // Calculate filters height
                        $('.my-filters').height('188px');
                        $('.facets').height('auto');
                        $('.my-filters').addClass('collapsed').removeClass('uncollapsed');
                        // Hide vertical scrollbar
                        $('.my-filters .facets').css('overflow-y', 'hidden');
                    }
                }

                $scope.currentCategoryId = undefined; // Just a reminder that we use this
                $scope.setCategory = function(cid) {
                    $scope.currentCategoryId = cid;
                }

                $scope.toggleSelectAll = function(categoryId) {
                    if ($scope.categories[categoryId]) {
                        // Unless everything is already selected, select all
                        if ($scope.isAllChecked(categoryId)) {
                            $scope.categories[categoryId].values.forEach(function(v){v.isSelected = false})
                        } else {
                            $scope.categories[categoryId].values.forEach(function(v){v.isSelected = true})
                        }
                    }
                }

                $scope.isAllChecked = function(categoryId) {
                    if (categoryId === undefined) return true;
                    return !$scope.categories[categoryId].values.some(function(v){ return !v.isSelected})
                }

                $scope.isAllUnchecked = function(categoryId) {
                    if (categoryId === undefined) return true;
                    return !$scope.categories[categoryId].values.some(function(v){ return v.isSelected})
                }

                $scope.isIndeterminate = function(categoryId) {
                    if (categoryId === undefined) return false;
                    return !$scope.isAllChecked(categoryId) && !$scope.isAllUnchecked(categoryId)
                }

                $scope.exists = function(value) {
                    return value.isSelected;
                }

                $scope.toggle = function(value) {
                    value.isSelected = !value.isSelected;
                    return value.isSelected;
                }

                $scope.filter = function(categoryId, value) {
                    $timeout(function(){
                        // If all the checkboxes are of this category are selected, force the check of the "all" checkbox
                        if ($('.' + categoryId + ' .checkbox:not(.all) :checked').length == $('.' + categoryId + ' .checkbox:not(.all)').length) {
                            $('.' + categoryId + ' .checkbox.all input').prop('checked', true);
                            // Else, force the uncheck of the "all" checkbox
                        } else {
                            $('.' + categoryId + ' .checkbox.all input').prop('checked', false);
                        }
                        switch ($scope.corpusId) {
                            case 'climate-changes':
                                $scope.$parent.filter(categoryId, value);
                                break;
                            case 'amerique-latine':
                                $scope.$parent.filter2(categoryId, value);
                                break;
                        }
                    }, 0);
                }
            }
        };
    }]);

    app.directive('myGraph', [function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/myGraph.html',
            scope: {
                corpusId: '=',
                categories: '=',
                nodesColor: '='
            },
            link: function($scope, element, attrs) {
                // Init variables
                var defaultEdgeColor = '#f1f1f1';
                
                // Load the specific corpus configuration
                $scope.selectedCategory = $scope.categories[$scope.nodesColor].label;
                
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
                        case 'climate-changes':
                            $scope.filter();
                            break;
                        case 'amerique-latine':
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

    app.directive('topBar', ['$sce', '$timeout', '$location', function($sce, $timeout, $location) {
        return {
            restrict: 'E',
            templateUrl: 'partials/topBar.html',
            scope: {
                corpus: '=',
                lang: '=',
                corpusId: '=',
                currentView: '='
            },
            link: function($scope, element, attrs) {
                $scope.$watch('corpus', function(){
                    $scope.selectedIndex = 0
                    $scope.tabList = []

                    // Build menu tabs
                    $scope.$watch('corpus.availableViews', function(){
                        $scope.tabList = [];

                        // Home
                        $scope.tabList.push({
                            label: 'Home',
                            active: false,
                            onClick: function(){
                                // Change location, with a small delay to have the tab animation
                                $timeout(function(){
                                    $location.url($scope.lang)
                                }, 300)
                            }
                        })
                        // Available views
                        if ($scope.corpus && $scope.corpus.availableViews) {
                            $scope.corpus.availableViews.forEach(function(view) {
                                $scope.tabList.push({
                                    label: view,
                                    active: view == $scope.currentView,
                                    onClick: function(){
                                        $timeout(function(){
                                            changeView(view)
                                        }, 300)
                                    }
                                })
                            })
                        }
                        // Methology
                        $scope.tabList.push({
                            label: 'Methodology',
                            active: $scope.currentView == 'methodology',
                            onClick: function(){
                                // Change location, with a small delay to have the tab animation
                                $timeout(function(){
                                    $location.url($scope.lang+'/'+$scope.corpusId+'/methodology')
                                }, 300)
                            }
                        })
                    })
                    // On view change ('grid', 'list', 'graph', 'map')
                    var changeView = function(view) {
                        $scope.currentView = view;
                    }
                })
            }
        };

    }])

    app.directive('filterCategoryBadge', [function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/filterCategoryBadge.html',
            scope: {
                category: '='
            },
            link: function($scope, element, attrs) {
                $scope.display = false
                $scope.text = ''
                $scope.$watch('category', function(){
                    if($scope.category) {
                        var selected = $scope.category.values.filter(function(v){
                            return v.isSelected
                        })
                        var unselected = $scope.category.values.filter(function(v){
                            return !v.isSelected
                        })

                        if (unselected.length == 0) {
                            $scope.display = false
                            $scope.text = ''
                        } else if (selected.length == 1) {
                            $scope.display = true
                            $scope.text = selected[0].label
                        } else if (selected.length == 0) {
                            $scope.display = true
                            $scope.text = 'Hide everything'
                        } else {
                            $scope.display = true
                            $scope.text = selected.length + '/' + $scope.category.values.length + ' selected'
                        }
                    }
                }, true)

                $scope.closeBadge = function() {
                    $scope.category.values.forEach(function(v) {
                        v.isSelected = true
                    })
                }
            }
        };

    }])

})();