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
                initResultsCount: '=',
                filteredResultsCount: '=',
                prefix: '=',
                legend: '=?'
            },
            link: function($scope, element, attrs) {
                // Uncollapse filters
                $scope.isCollapsed = true;
                $scope.allChecked = {};
                $scope.indeterminate = {};
                $scope.selectPeru = false;

                // Deep watch categories to maintain the general status arrays
                // Note: inefficient but relevant since it happens rarely and the array is small
                $scope.$watch('categories', function() {
                    $scope.allChecked = {};
                    $scope.indeterminate = {};
                    var cid;
                    for (cid in $scope.categories) {
                        $scope.allChecked[cid] = $scope.isAllChecked(cid);
                        $scope.indeterminate[cid] = $scope.isIndeterminate(cid);
                    }
                    // Get aray of selected values for the 'area' category
                    var selected = $scope.categories.area.values.filter(function(v) {
                        return v.isSelected;
                    });
                    // If switcher is ON and that I deselect Perou, deselect the switcher and select all countries
                    if ($scope.selectPeru && selected.length == 0) {
                        $scope.selectPeru = false;
                        $scope.switchPeru();
                        // If switcher is ON and that I select 2 or more countries, deselect switcher
                    } else if ($scope.selectPeru && selected.length > 1) {
                        $scope.selectPeru = false;
                        // If switcher is OFF and that I select only one country that is 'Peru', select switcher
                    } else if (!$scope.selectPeru && selected.length == 1 && selected[0].id == 'perou') {
                        $scope.selectPeru = true;
                    }
                }, true);

                var offset = ($('.top-bar').innerHeight() + $('#header-inmedia_1').innerHeight()) || 200;
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
                            $scope.categories[categoryId].values.forEach(function(v) { v.isSelected = false });
                        } else {
                            $scope.categories[categoryId].values.forEach(function(v) { v.isSelected = true });
                        }
                    }
                }

                $scope.isAllChecked = function(categoryId) {
                    if (categoryId === undefined) return true;
                    return !$scope.categories[categoryId].values.some(function(v) {
                        return !v.isSelected
                    });
                }

                $scope.isAllUnchecked = function(categoryId) {
                    if (categoryId === undefined) return true;
                    return !$scope.categories[categoryId].values.some(function(v) {
                        return v.isSelected
                    });
                }

                $scope.isIndeterminate = function(categoryId) {
                    if (categoryId === undefined) {
                        return false;
                    }
                    return !$scope.isAllChecked(categoryId) && !$scope.isAllUnchecked(categoryId);
                }

                $scope.exists = function(value) {
                    return value.isSelected;
                }

                $scope.toggle = function(value) {
                    value.isSelected = !value.isSelected;
                    return value.isSelected;
                }

                $scope.filter = function(categoryId, value) {
                    $timeout(function() {
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

                $scope.switchPeru = function(selectPeru) {
                    // If the switcher is selected
                    if (selectPeru) {
                        // Deselect all countries but Peru
                        $scope.categories.area.values.forEach(function(v) {
                            if (v.id == 'perou') {
                                v.isSelected = true;
                            } else {
                                v.isSelected = false;
                            }
                        });
                        // If the switcher is deselected
                    } else {
                        $scope.categories.area.values.forEach(function(v) {
                            v.isSelected = true;
                        });
                    }
                }

                if ('legend' in $scope) {
                    $.each($scope.categories, function(index, item) {
                        $.each(item.values, function(index_02, item_02) {
                            var mappedLegend = $.grep($scope.legend, function(item_03, index_03) {
                                return item_03.id == item_02.id;
                            });
                            if (mappedLegend.length > 0) {
                                item_02.colorClass = mappedLegend[0].colorClass;
                            }
                        });
                    });
                }
            }
        };
    }]);

    app.directive('myGraph', ['$timeout', '$window', function($timeout, $window) {
        return {
            restrict: 'E',
            templateUrl: 'partials/myGraph.html',
            scope: {
                corpusId: '=',
                categories: '=',
                lang: '=',
                nodesColor: '=',
                legend: '=?',
                webentity: '=?',
                filteredResults: '=?'
            },
            link: function($scope, element, attrs) {
                // Init variables
                var defaultEdgeColor = '#f1f1f1';

                // This function return true if the node in argument is in the searched results
                // #return : boolean
                function isNodeInSearchedResults(node) {
                    return ($.grep($scope.filteredResults, function(item, index) {
                        return node.id == item.ID;
                    }).length == 1);
                }

                // Function to set the nodes color according to the choosen legend
                function setNodesColor() {
                    // Set node color according to the legend
                    var mappedField = $scope.categories[$scope.nodesColor].mappedField;
                    $.each($scope.graph.graph.nodes(), function(index, item) {
                        var mappedLegend = $.grep($scope.legend, function(item_02, index_02) {
                            return item_02.id == item.attributes[mappedField];
                        });
                        // If node is in legend and node is in the results array
                        if (mappedLegend.length == 1) {
                            if ('filteredResults' in $scope) {}
                            // If node is in results list
                            if (!('filteredResults' in $scope) || ('filteredResults' in $scope && isNodeInSearchedResults(item))) {
                                item.color = mappedLegend[0].color;
                                // If node is not in results list
                            } else {
                                item.color = '#ccc';
                            }
                        }
                    });
                    $scope.graph.bind('overNode outNode', function(n) {
                        $timeout(function() {
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
                        }, 300);
                    });
                    $scope.graph.refresh();
                }

                // Center the whole graph
                $scope.sigmaCenter = function() {
                    var c = $scope.graph.cameras[0]
                    c.goTo({
                        ratio: 1,
                        x: 0,
                        y: 0
                    });
                }

                // Zoom on the graph
                $scope.sigmaZoom = function() {
                    var c = $scope.graph.cameras[0]
                    c.goTo({
                        ratio: c.ratio / c.settings('zoomingRatio')
                    });
                }

                // Unzoom on the graph
                $scope.sigmaUnzoom = function() {
                    var c = $scope.graph.cameras[0]
                    c.goTo({
                        ratio: c.ratio * c.settings('zoomingRatio')
                    });
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

                        // If the loaded page is the detail page of a website
                        if ('webentity' in $scope) {
                            // Set red as node color
                            $.each($scope.graph.graph.nodes(), function(index, item) {
                                if (item.id == $scope.webentity.ID) {
                                    item.color = '#ff0000';
                                }
                            });
                            // Set red light as edges color
                            $.each($scope.graph.graph.edges(), function(index, item) {
                                if (item.source == $scope.webentity.ID || item.target == $scope.webentity.ID) {
                                    item.color = '#f58787';
                                    // Remove edge from edges array
                                    $scope.graph.graph.dropEdge(item.id);
                                    // Add edge as last element of edges array (to render it at the top of other edges)
                                    $scope.graph.graph.addEdge(item);
                                }
                            });
                            // Add a method to the graph model that returns an object with every neighbors of a node inside
                            if (!sigma.classes.graph.hasMethod('neighbors')) {
                                sigma.classes.graph.addMethod('neighbors', function(nodeId) {
                                    var k,
                                        neighbors = [],
                                        index = this.allNeighborsIndex[nodeId] || {};
                                    for (k in index) {
                                        neighbors.push(this.nodesIndex[k])
                                    }
                                    return neighbors;
                                });
                            };
                            // Get all the neighbors of a node
                            var neighbors = $scope.graph.graph.neighbors($scope.webentity.ID);
                            var neighborsIds = $.map(neighbors, function(item) {
                                return item.id;
                            });
                            // Set red light as color of the neighbors nodes
                            $.each($scope.graph.graph.nodes(), function(index, item) {
                                if (neighborsIds.indexOf(item.id) >= 0) {
                                    item.color = '#f58787';
                                }
                            });
                            $scope.$watch('webentity', function() {
                                $scope.webentity.neighbours = neighbors;
                            });
                            $scope.graph.refresh();
                        }

                        // If the loaded page is the one with the full corpus
                        if ('legend' in $scope) {
                            $scope.$watch('legend', setNodesColor);
                        }

                        if ('filteredResults' in $scope) {
                            $scope.$watch('filteredResults', setNodesColor);
                        }

                        // On node click, open the webentity page in a new tab
                        $scope.graph.bind('clickNode', function(n) {
                            $timeout(function() {
                                $window.open('#/' + $scope.lang + '/' + $scope.corpusId + '/' + n.data.node.id);
                            }, 300);
                        });
                    }
                );

                // Unbind all events when the graph is destroyed
                $scope.$on('$destroy', function() {
                    $scope.graph.unbind('overNode outNode');
                    $scope.graph.unbind('clickNode');
                });
            }
        };
    }]);

    app.directive('myLegend', ['get', function(get) {
        return {
            restrict: 'E',
            templateUrl: 'partials/myLegend.html',
            scope: {
                legend: '=',
            },
            link: function($scope, element, attrs) {}
        }
    }]);

    app.directive('topBar', ['$timeout', '$location', '$routeParams', function($timeout, $location, $routeParams) {
        return {
            restrict: 'E',
            templateUrl: 'partials/topBar.html',
            scope: {
                corpus: '=',
                lang: '=',
                corpusId: '='
            },
            link: function($scope, element, attrs) {
                $scope.$watch('corpus', function() {
                    $scope.selectedIndex = 0;
                    $scope.tabList = [];

                    // Build menu tabs
                    $scope.$watch('corpus.availableViews', function() {
                        $scope.tabList = [];

                        // Home
                        $scope.tabList.push({
                                label: 'Home',
                                active: false,
                                onClick: function() {
                                    // Change location, with a small delay to have the tab animation
                                    $timeout(function() {
                                        $location.url($scope.lang);
                                    }, 300);
                                }
                            })
                            // Available views
                        if ($scope.corpus && $scope.corpus.availableViews) {
                            $scope.corpus.availableViews.forEach(function(view) {
                                $scope.tabList.push({
                                    label: view,
                                    active: view == $routeParams.viewName,
                                    onClick: function() {
                                        $timeout(function() {
                                            $location.url($scope.lang + '/' + $scope.corpusId + '/view/' + view);
                                        }, 300);
                                    }
                                })
                            })
                        }
                        // Methodology
                        $scope.tabList.push({
                            label: 'Methodology',
                            active: $location.path().split('/').pop() == 'methodology',
                            onClick: function() {
                                // Change location, with a small delay to have the tab animation
                                $timeout(function() {
                                    $location.url($scope.lang + '/' + $scope.corpusId + '/methodology');
                                }, 300);
                            }
                        })
                    });
                });
            }
        };
    }]);

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
                $scope.$watch('category', function() {
                    if ($scope.category) {
                        var selected = $scope.category.values.filter(function(v) {
                            return v.isSelected;
                        });
                        var unselected = $scope.category.values.filter(function(v) {
                            return !v.isSelected;
                        });

                        if (unselected.length == 0) {
                            $scope.display = false;
                            $scope.text = '';
                        } else if (selected.length == 1) {
                            $scope.display = true;
                            $scope.text = selected[0].label;
                        } else if (selected.length == 0) {
                            $scope.display = true;
                            $scope.text = 'Hide everything';
                        } else {
                            $scope.display = true;
                            $scope.text = selected.length + '/' + $scope.category.values.length + ' selected';
                        }
                    }
                }, true);

                $scope.closeBadge = function() {
                    // Select all values of this category
                    $scope.category.values.forEach(function(v) {
                        v.isSelected = true
                    });
                }
            }
        };

    }])

})();