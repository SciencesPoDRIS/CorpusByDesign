(function() {
    'use strict';

    var app = angular.module('webcorpus.corpus', [
        'ngRoute',
        'webcorpus.conf',
        'webcorpus.services'
    ]);

    app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'views/corpus/corpus.html',
                controller: 'CorpusController'
            })
        }
    ]);

    app.controller('CorpusController', ['$scope', '$http', 'loadCorpora', 'loadCorpus', 'categories',
        function($scope, $http, loadCorpora, loadCorpus, categories) {
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
            $scope.nodesColor = 'actorsType';

            // Load all categories from conf file to display
            $.each(categories, function(index, item) {
                if (item.isDiplayed !== undefined && item.isDiplayed) {
                    $scope.categories.push(item);
                }
            });

            // Load all the corpora
            loadCorpora.getCorpora().then(function(data) {
                $scope.corpora = data[0];
            });

            // Load the corpus
            loadCorpus.getCorpus().then(function(data) {
                $scope.corpus = data.split('\n').slice(1);
                // Count item by categories
                $.each($scope.corpus, function(index, item) {
                    item = item.split('\t');
                    $.each(categories['actorsType'].values, function(index2, item2) {
                        if (item2.id == item[7]) {
                            item2.count++;
                        }
                    });
                    $.each(categories['anthropogenicClimateChange'].values, function(index2, item2) {
                        if (item2.id == item[10]) {
                            item2.count++;
                        }
                    });
                    $.each(categories['mitigationAdaptation'].values, function(index2, item2) {
                        if (item2.id == item[11]) {
                            item2.count++;
                        }
                    });
                    $.each(categories['collection'].values, function(index2, item2) {
                        if (item2.id == item[15]) {
                            item2.count++;
                        }
                    });
                });
                // Reorder categories by count attribute
                categories['actorsType'].values.sort(function(obj1, obj2) {
                    return obj2.count - obj1.count
                });
                categories['anthropogenicClimateChange'].values.sort(function(obj1, obj2) {
                    return obj2.count - obj1.count
                });
                categories['mitigationAdaptation'].values.sort(function(obj1, obj2) {
                    return obj2.count - obj1.count
                });
                categories['collection'].values.sort(function(obj1, obj2) {
                    return obj2.count - obj1.count
                });
            });

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
                        // Initialize the Sigma Filter API
                        filter = new sigma.plugins.filter(s);
                        $scope.graph = s;
                        // Color nodes, according to the configuration file
                        $scope.graph.graph.nodes().forEach(function(n) {
                            // Hide Heartland node because it has no attribute
                            if (n.id != '765ebd9e-f6c6-4175-8fd1-d18e1b546206') {
                                n.color = categories[$scope.nodesColor].values.filter(function(item) {
                                    return item.id == n.attributes[categories[$scope.nodesColor].mappedField];
                                })[0].color;
                            }
                        });
                        $scope.graph.refresh();
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
                            $('#' + n.data.node.id + ' img').removeClass('hover');
                        });

                        // Load all results
                        $http.get('../data/COP21.tsv').success(function(data) {
                            $scope.allResults = [];
                            $.each(data.split('\n').slice(1), function(index, item) {
                                item = item.split('\t');
                                tmp = {};
                                tmp['ID'] = item[0];
                                tmp['NAME'] = item[1];
                                tmp['PREFIXES'] = item[2];
                                tmp['URL'] = item[3];
                                tmp['STATUS'] = item[4];
                                tmp['INDEGREE'] = item[5];
                                tmp['FULL_NAME'] = item[6];
                                tmp['ACTORS_TYPE'] = item[7];
                                tmp['COUNTRY'] = item[8];
                                tmp['AREA'] = item[9];
                                tmp['ANTHROPOGENIC_CLIMATE_CHANGE'] = item[10];
                                tmp['MITIGATION_ADAPTATION'] = item[11];
                                tmp['INDUSTRIAL_DELEGATION'] = item[12];
                                tmp['THEMATIC_DELEGATION'] = item[13];
                                tmp['LANGUAGE'] = item[14];
                                tmp['COLLECTION'] = item[15];
                                tmp['ABSTRACT_DRAFT'] = item[16];
                                tmp['ABSTRACT'] = item[17];
                                tmp['COMMENT'] = item[18];
                                $scope.allResults.push(tmp);
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
                ids = [];
                $scope.currentPage = 1;
                $scope.filteredResults = $scope.allResults.filter(function(item) {
                    if ((
                            // Check if the searched term is present into the name of the site or into the actors' type of the site
                            (item.FULL_NAME.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.INDUSTRIAL_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.THEMATIC_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ABSTRACT.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0))
                        // Check if the actors' type is present into the actors' type searched
                        && isSearchedAmongCriteria(searchCriteria, item)
                    ) {
                        ids.push(item.ID);
                        return true;
                    } else {
                        return false;
                    }
                });

                // Filter nodes displayed on the graph
                filter.nodesBy(function(n) {
                    return ids.indexOf(n.id);
                }).apply();
                // $scope.displayedResults = $scope.filteredResults;
                $scope.resultsNumber = $scope.filteredResults.length;
                $scope.display();
            }

            // Filter the results to display the current page according to pagination
            $scope.display = function() {
                // begin = ($scope.currentPage - 1) * 10;
                // end = begin + $scope.numPerPage;
                // $scope.displayedResults = $scope.filteredResults.slice(begin, end);
                $scope.displayedResults = $scope.filteredResults;
                $scope.graph.graph.nodes().forEach(function(node) {
                    // Reset all nodes' color to the light grey
                    node.color = '#d3d3d3';
                    // Change default label by the value of the column "FULL_NAME"
                    node.label = node.attributes.FULL_NAME;
                });
                // Color only selected nodes, according to the configuration file
                $scope.graph.graph.nodes().forEach(function(node) {
                    if (ids.indexOf(node.id) != -1) {
                        node.color = categories[$scope.nodesColor].values.filter(function(item) {
                            return item.id == node.attributes[categories[$scope.nodesColor].mappedField];
                        })[0].color;
                    }
                });
                $scope.graph.refresh();
            }

            $scope.init();
        }
    ]);

})();