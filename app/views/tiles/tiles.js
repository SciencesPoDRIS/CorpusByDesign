(function() {
    'use strict';

    var app = angular.module('webcorpus.tiles', []);

    app.controller('TilesController', ['$scope', '$http', '$location', 'loadCorpora', 'loadCorpus', 'categories', 'nodesColor', 'colors',
        function($scope, $http, $location, loadCorpora, loadCorpus, categories, nodesColor, colors) {
            // Init variables
            var ids,
                result,
                searchCriteria,
                tmp;
            var defaultNodeColor = '#D3D3D3';

            // Init scope variables
            $scope.filtersLabel = 'More filters';
            $scope.isCollapsed = true;
            $scope.categoryQuantity = 3;
            $scope.queryTerm = '';
            // Default entities view as grid
            $scope.view = 'grid';

            // On view change ('grid', 'list', 'graph')
            $scope.changeView = function(view) {
                // If the new view is grid or graph, reload the gexf graph
                if (['grid', 'graph'].indexOf(view) >= 0) {
                    $scope.init();
                }
            }

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

            // Expand filters
            $scope.moreFilters = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
                if (!$scope.isCollapsed) {
                    $('.content .filters').height(($(window).height() - 68) + 'px');
                    $scope.filtersLabel = 'Less filters';
                } else {
                    $('.content .filters').height('150px');
                    $scope.filtersLabel = 'More filters';
                }
            }

            $scope.selectAll = function(categoryId) {
                $.each($scope.categories, function(index_01, item_01) {
                    if(item_01.id == categoryId) {
                        $.each(item_01.values, function(index_02, item_02) {
                            item_02.isSelected = true;
                        });
                    }
                });
                $scope.filter();
            }

            $scope.deselectAll = function(categoryId) {
                $.each($scope.categories, function(index_01, item_01) {
                    if(item_01.id == categoryId) {
                        $.each(item_01.values, function(index_02, item_02) {
                            item_02.isSelected = false;
                        });
                    }
                });
                $scope.filter();
            }

            $scope.init = function() {
                // Load all categories from config file
                $scope.categories = [];
                $.each(categories, function(index, item) {
                    if (item.isDiplayed !== undefined && item.isDiplayed) {
                        $scope.categories.push(item);
                    }
                });

                // Load all the corpora descriptions
                loadCorpora.getCorpora().then(function(data) {
                    $scope.corpora = data[0];
                });

                // Load the graph
                sigma.parsers.gexf(
                    '../data/COP21.gexf', {
                        container: 'graph',
                        settings: {
                            defaultEdgeColor: defaultNodeColor,
                            edgeColor: 'default',
                            labelThreshold: 100
                        },
                        type: 'canvas'
                    },
                    function(s) {
                        $scope.graph = s;
                        $scope.graph.bind('overNode outNode', function(n) {
                            // On node hover, color all the connected edges in the node color
                            if(n.type == 'overNode') {
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
                            } else if(n.type == 'outNode') {
                                $scope.graph.graph.edges().forEach(function(e) {
                                    e.color = defaultNodeColor;
                                });
                                // Simulate mouse out effect on the tiles
                                $('#' + n.data.node.id + ' img').removeClass('hover');
                            }
                            $scope.graph.refresh();
                        });
                        // On node click, open the webentity page
                        $scope.graph.bind('clickNode', function(n) {
                            $location.path('webentity/' + n.data.node.id);
                            $scope.$apply();
                        });
                        // For a checkbox, on click on label
                        $('.checkbox > span').click(
                            function() {
                                $(this).siblings('input').click();
                            }
                        );
                        // Load the corpus
                        $scope.initResults = [];
                        loadCorpus.getCorpus().then(function(data) {
                            $.each(data.split('\n').slice(1), function(index, item) {
                                item = item.split('\t');
                                $scope.initResults.push({
                                    'ID': item[0],
                                    'NAME': item[1],
                                    'PREFIXES': item[2],
                                    'URL': item[3],
                                    'STATUS': item[4],
                                    'INDEGREE': item[5],
                                    'FULL_NAME': item[6],
                                    'ACTORS_TYPE': item[7],
                                    'ACTORS_TYPE_2': item[8],
                                    'COUNTRY': item[9],
                                    'AREA': item[11],
                                    'ANTHROPOGENIC_CLIMATE_CHANGE': item[12],
                                    'REDUCING_EMISSIONS': item[13],
                                    'MITIGATION_ADAPTATION': item[14],
                                    'INDUSTRIAL_DELEGATION': item[15],
                                    'THEMATIC_DELEGATION': item[16],
                                    'LANGUAGE': item[17],
                                    'COLLECTION': item[18],
                                    'ABSTRACT_DRAFT': item[19],
                                    'ABSTRACT': item[20]
                                });
                            });
                            $scope.filter();
                        });
                    }
                );
            }

            /* *
             * Return true if the node matches the search criteria, else return false
             * @var node 
             * @var searchCriteria JSONobject
             * 
             * @return boolean
             * */
            var isSearchedAmongCriteria = function(searchCriteria, node) {
                result = true;
                $.each(searchCriteria, function(index, item) {
                    result = result && (item.indexOf(node[categories[index].mappedField]) >= 0);
                });
                return result;
            }

            $scope.filter = function(category, value) {
                // Create JSON object to encapsulate the search criteria
                searchCriteria = {};
                $.each(categories, function(index_01, item_01) {
                    // Don't put language as a search criteria
                    if ((item_01.values !== undefined) && (index_01 != 'language')) {
                        searchCriteria[index_01] = [];
                        $.each(item_01.values, function(index_02, item_02) {
                            // Reset count before filtering
                            item_02.count = 0;
                            if(item_02.isSelected) {
                                searchCriteria[index_01].push(item_02.id);
                            }
                            // Set default color
                            item_02.colorClass = '#83878D';
                            item_02.colorClass = 'grey';
                        });
                    }
                });
                ids = [];
                $scope.filteredResults = $scope.initResults.filter(function(item) {
                    if((
                            // Check if the searched term is present into the name of the site or into the actors' type of the site
                            (item.FULL_NAME.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.INDUSTRIAL_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.THEMATIC_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ABSTRACT.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0)) && isSearchedAmongCriteria(searchCriteria, item)) {
                        ids.push(item.ID);
                        // Increment categories count, for those who are displayed
                        $.each(categories, function(index_02, item_02) {
                            if(categories[index_02].isDiplayed) {
                                categories[index_02].values.filter(function(index) {
                                    return index.id == item[categories[index_02].mappedField];
                                })[0].count++;
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
                
                $.each(categories, function(index, item) {
                    // Order items of a category by count descending order
                    categories[index].values.sort(function(a, b) {
                        return b.count - a.count;
                    });
                    // Set colors to nodes and loadBar
                    if(categories[index].id == nodesColor) {
                        $.each(categories[index].values.slice(0, 6), function(index_02, item_02) {
                            item_02.color = colors[index_02].color;
                            item_02.colorClass = colors[index_02].label;
                        });
                    }
                    // Order items of a category by alphabetical ascending order
                    categories[index].values.sort(function(a, b) {
                        // 'Not applicable' should be the last item
                        if(a.id == 'not_applicable') {
                            return 1;
                        } else if(b.id == 'not_applicable') {
                            return -1;
                        // 'Don't know' should be the before second last item
                        } else if(a.id == 'dont_know') {
                            return 1;
                        } else if(b.id == 'dont_know') {
                            return -1;
                        } else if(a.label.toLowerCase() < b.label.toLowerCase()) {
                            return -1;
                        } else if(a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                        // Should never happen
                        } else {
                            return 0;
                        }
                    });
                    // Calculate the item count in percentil for the progress bar
                    $.each(categories[index].values, function(index_02, item_02) {
                        item_02.count_percent = ((parseFloat(item_02.count) / parseFloat($scope.initResults.length)) * 100).toFixed(2);
                    });
                });
                $scope.resultsNumber = $scope.filteredResults.length;
                $scope.display();
            }

            // Filter the results to display the current page
            $scope.display = function() {
                $scope.displayedResults = $scope.filteredResults;
                // Color nodes, according to the configuration file
                $scope.graph.graph.nodes().forEach(function(n) {
                    // Hide Heartland node because it has no attribute
                    if (ids.indexOf(n.id) != -1) {
                        n.color = categories[nodesColor].values.filter(function(item) {
                            if(n.attributes[categories[nodesColor].mappedField] == undefined) {
                                // If no mapping on this node, set default color
                                return item.id == 'other_unknown_not_categorized';
                            } else {
                                return item.id == n.attributes[categories[nodesColor].mappedField];
                            }
                        })[0].color;
                    } else {
                        // Else reset nodes' color to the light grey
                        n.color = defaultNodeColor;
                    }
                    // Change default label by the value of the column "FULL_NAME"
                    n.label = n.attributes.FULL_NAME;
                });
                $scope.graph.refresh();
            }

            $scope.init();
        }
    ]);

})();