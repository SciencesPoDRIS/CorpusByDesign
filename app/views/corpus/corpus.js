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
            var tmp;

            // Load all categories from conf file to display
            $scope.categories = [];
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
                $scope.corpus = data;
                // Count item by categories
                $.each(data.split('\n').slice(1), function(index, item) {
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
            $scope.quantity = 12;
            $scope.isCollapsed = true;
            $scope.collapseFilters = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
                if (!$scope.isCollapsed) {
                    $('.content .filters').height('100%');
                    $scope.quantity = 200;
                } else {
                    $('.content .filters').height('150px');
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
                        $scope.graph = s;
                        // Color nodes, according to the configuration file
                        $scope.graph.graph.nodes().forEach(function(n) {
                            // Hide Heartland node because it has no attribute
                            if (n.id != '765ebd9e-f6c6-4175-8fd1-d18e1b546206') {
                                n.color = categories[categories.nodesColor].values.filter(function(item) {
                                    return item.id == n.attributes[categories[categories.nodesColor].mappedField];
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
                            // $('#' + n.data.node.id + ' img').addClass('hover');
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
                            $scope.displayedResults = $scope.allResults;
                            // $scope.filter();
                        });
                    }
                );
            }

            $scope.init();
        }
    ]);

})();