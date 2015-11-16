(function() {
    'use strict';

    var app = angular.module('webcorpus.corpus', []);

    app.controller('CorpusController', ['$scope', '$http', 'loadCorpora', 'loadCorpus', 'categories', 'nodesColor',
        function($scope, $http, loadCorpora, loadCorpus, categories, nodesColor) {
            // Init variables
            var filter,
                ids,
                result,
                searchCriteria,
                tmp;

            // Init scope variables
            $scope.categories = [];
            $scope.filtersLabel = 'More filters';
            $scope.isCollapsed = true;
            $scope.quantity = 12;
            $scope.queryTerm = '';
            $scope.initResults = [];

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

            $scope.moreFilters = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
                if (!$scope.isCollapsed) {
                    $('.content .filters').height('100%');
                    $scope.filtersLabel = 'Less filters';
                    $scope.quantity = 200;
                } else {
                    $('.content .filters').height('150px');
                    $scope.filtersLabel = 'More filters';
                    $scope.quantity = 12;
                }
            }

            $scope.init = function() {
                // Load all categories from config file
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
                            defaultEdgeColor: '#d3d3d3',
                            edgeColor: 'default',
                            labelThreshold: 100
                        },
                        type: 'canvas'
                    },
                    function(s) {
                        $scope.graph = s;
                        // Initialize the Sigma Filter API
                        // filter = new sigma.plugins.filter(s);
                        // On node hover, color all the connected edges in the node color
                        $scope.graph.bind('overNode', function(n) {
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
                            $scope.graph.refresh();
                            // Simulate mouse hover effect on the tiles
                            $('#' + n.data.node.id + ' img').addClass('hover');
                        });
                        // On node out, reset all edges color to the default one
                        $scope.graph.bind('outNode', function(n) {
                            $scope.graph.graph.edges().forEach(function(e) {
                                e.color = '#d3d3d3';
                            });
                            $scope.graph.refresh();
                            // Simulate mouse out effect on the tiles
                            $('#' + n.data.node.id + ' img').removeClass('hover');
                        });

                        // Load the corpus
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
                                    'COUNTRY': item[8],
                                    'AREA': item[9],
                                    'ANTHROPOGENIC_CLIMATE_CHANGE': item[10],
                                    'MITIGATION_ADAPTATION': item[11],
                                    'INDUSTRIAL_DELEGATION': item[12],
                                    'THEMATIC_DELEGATION': item[13],
                                    'LANGUAGE': item[14],
                                    'COLLECTION': item[15],
                                    'ABSTRACT_DRAFT': item[16],
                                    'ABSTRACT': item[17],
                                    'COMMENT': item[18]
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

            $scope.filter = function() {
                // Create JSON object to encapsulate the search criteria
                searchCriteria = {};
                $.each(categories, function(index_01, item_01) {
                    if (item_01.values !== undefined) {
                        searchCriteria[index_01] = [];
                        $.each(item_01.values, function(index_02, item_02) {
                            if (item_02.isSelected) {
                                searchCriteria[index_01].push(item_02.id);
                            }
                        });
                    }
                });
                // ids = [];
                $scope.filteredResults = $scope.initResults.filter(function(item) {
                    if ((
                            // Check if the searched term is present into the name of the site or into the actors' type of the site
                            (item.FULL_NAME.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.INDUSTRIAL_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.THEMATIC_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ABSTRACT.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0)) && isSearchedAmongCriteria(searchCriteria, item)) {
                        // ids.push(item.ID);
                        // Increment categories count
                        $.each(categories, function(index_02, item_02) {
                            categories[index_02].values.filter(function(index) {
                                return index.id == item[categories[index_02].mappedField];
                            })[0].count++;
                            categories[index_02].values.filter(function(index) {
                                return index.id == 'all';
                            })[0].count++;
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
                // Reorder categories by count attribute
                $.each(categories, function(index, item) {
                    categories[index].values.sort(function(a, b) {
                        if (a.id == 'all') {
                            return 1;
                        } else if (b.id == 'all') {
                            return -1;
                        } else {
                            return b.count - a.count;
                        }
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
                    if (n.id != '765ebd9e-f6c6-4175-8fd1-d18e1b546206') {
                        n.color = categories[nodesColor].values.filter(function(item) {
                            return item.id == n.attributes[categories[nodesColor].mappedField];
                        })[0].color;
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