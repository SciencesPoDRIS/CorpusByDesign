(function() {
    'use strict';

    var app = angular.module('webcorpus.main', []);

    app.controller('MainController', ['$scope', '$routeParams', '$http', '$location', 'loadCorpora', 'loadCorpus', 'colors',
        function($scope, $routeParams, $http, $location, loadCorpora, loadCorpus, colors) {
            // Init variables
            var ids,
                nodesColor,
                bool_01,
                bool_02,
                searchCriteria,
                elementCriteriaValues,
                tmp;
            var defaultNodeColor = '#d3d3d3';
            var defaultEdgeColor = '#f1f1f1';
            var multiValuesSeparator = ' ; ';

            // Init scope variables
            $scope.filtersIcon = 'glyphicon-chevron-down';
            $scope.categoryQuantity = 3;
            $scope.queryTerm = '';
            $scope.corpusId = $routeParams.corpusId;
            $scope.lang = $routeParams.lang;

            // On view change ('grid', 'list', 'graph', 'map')
            $scope.changeView = function(currentView) {
                $scope.currentView = currentView;
                $scope.init(currentView);
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

            $scope.init2 = function(currentView) {
                // For a checkbox, on click on label
                $('.checkbox > span').click(
                    function() {
                        $(this).siblings('input').click();
                    }
                );

                // Load the corpus configurations
                loadCorpora.getCorpora().then(function(data) {
                    $scope.corpora = data[$scope.corpusId];
                    nodesColor = $scope.corpora.nodesColor;
                    $scope.categories = $scope.corpora.categories;
                    $scope.currentView = (currentView == undefined ? $scope.corpora.defaultView : currentView);
                    $scope.availableViews = $scope.corpora.availableViews;

                    // Load the corpus content
                    $scope.initResults = [];
                    loadCorpus.getCorpus($scope.corpusId).then(function(data) {
                        $.each(data.split('\n').slice(1), function(index, item) {
                            item = item.split('\t');
                            $scope.initResults.push({
                                'ID': item[0],
                                'URL': item[5],
                                'FULL_NAME': item[6],
                                'ACTORS_TYPE': item[7],
                                'SOURCE': item[8],
                                'AREA': item[16],
                                'ABSTRACT_FR': item[18],
                                'ABSTRACT_ES': item[19],
                                'KEYWORDS_FR': item[21],
                                'KEYWORDS_EN': item[22],
                                'KEYWORDS_ES': item[23],
                                'LANGUAGE': item[26]
                            });
                        });
                        $scope.initResultsCount = $scope.initResults.length;
                        $scope.filter2();
                    });
                });
            }

            $scope.init = function(currentView) {
                // Load the corpus configurations
                loadCorpora.getCorpora().then(function(data) {
                    $scope.corpora = data[$scope.corpusId];
                    nodesColor = $scope.corpora.nodesColor;
                    $scope.categories = $scope.corpora.categories;
                    $scope.currentView = (currentView == undefined ? $scope.corpora.defaultView : currentView);
                    $scope.availableViews = $scope.corpora.availableViews;
                    // Load the specific corpus configuration
                    $scope.selectedCategory = $scope.categories[nodesColor].label;
                });

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
                        // Load the corpus
                        $scope.initResults = [];
                        loadCorpus.getCorpus($scope.corpusId).then(function(data) {
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
                            $scope.initResultsCount = $scope.initResults.length;
                            $scope.filter();
                        });
                    }
                );
            }

            /* *
             * Return true if the element matches the search criteria, else return false
             * @var element 
             * @var searchCriteria JSONObject
             * 
             * @return boolean
             * */
            var isSearchedAmongCriteria = function(searchCriteria, element) {
                bool_01 = true;
                $.each(searchCriteria, function(index_01, item_01) {
                    bool_02 = false;
                    elementCriteriaValues = element[$scope.categories[index_01].mappedField].split(multiValuesSeparator);
                    $.each(elementCriteriaValues, function(index_02, item_02) {
                        bool_02 = bool_02 || (item_01.indexOf(item_02) >= 0);
                    });
                    bool_01 = bool_01 && bool_02;
                });
                return bool_01;
            }

            $scope.filter = function(category, value) {
                if ($scope.corpusId == 'ameriquelatine') {
                    $scope.filter2();
                    return;
                }
                // Create JSON object to encapsulate the search criteria
                searchCriteria = {};
                $.each($scope.categories, function(index_01, item_01) {
                    // Don't put language as a search criteria
                    if ((item_01.values !== undefined) && (index_01 != 'language')) {
                        searchCriteria[index_01] = [];
                        $.each(item_01.values, function(index_02, item_02) {
                            // Reset count before filtering
                            item_02.count = 0;
                            if (item_02.isSelected) {
                                searchCriteria[index_01].push(item_02.id);
                            }
                            // Set default nodes color
                            item_02.color = defaultNodeColor;
                            item_02.colorClass = 'grey';
                        });
                    }
                });
                ids = [];
                $scope.filteredResults = $scope.initResults.filter(function(item) {
                    if ((
                            // Check if the searched term is present into the name of the site or into the actors' type of the site
                            (item.FULL_NAME.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.INDUSTRIAL_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.THEMATIC_DELEGATION.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ABSTRACT.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0)) && isSearchedAmongCriteria(searchCriteria, item)) {
                        ids.push(item.ID);
                        // Increment categories count, for those who are displayed
                        $.each($scope.categories, function(index_02, item_02) {
                            if ($scope.categories[index_02].isDiplayed) {
                                $scope.categories[index_02].values.filter(function(index) {
                                    return index.id == item[$scope.categories[index_02].mappedField];
                                })[0].count++;
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
                $scope.legend = [];
                $.each($scope.categories, function(index, item) {
                    // Order items of a category by count descending order
                    $scope.categories[index].values.sort(function(a, b) {
                        return b.count - a.count;
                    });
                    // Set colors to nodes and loadBar
                    if ($scope.categories[index].id == nodesColor) {
                        $.each($scope.categories[index].values.slice(0, 6), function(index_02, item_02) {
                            item_02.color = colors[index_02].color;
                            item_02.colorClass = colors[index_02].label;
                            // Create the legend object
                            $scope.legend[index_02] = { 'id': item_02.id, 'label': item_02.label, 'color': item_02.color };
                        });
                    }
                    // Order items of a category by alphabetical ascending order
                    $scope.categories[index].values.sort(function(a, b) {
                        // 'Not applicable' should be the last item
                        if (a.id == 'not_applicable') {
                            return 1;
                        } else if (b.id == 'not_applicable') {
                            return -1;
                            // 'Don't know' should be the before second last item
                        } else if (a.id == 'dont_know') {
                            return 1;
                        } else if (b.id == 'dont_know') {
                            return -1;
                        } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
                            return -1;
                        } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                            // Should never happen
                        } else {
                            return 0;
                        }
                    });
                    // Order items of legend by alphabetical ascending order
                    $scope.legend.sort(function(a, b) {
                        // 'Not applicable' should be the last item
                        if (a.id == 'not_applicable') {
                            return 1;
                        } else if (b.id == 'not_applicable') {
                            return -1;
                            // 'Don't know' should be the before second last item
                        } else if (a.id == 'dont_know') {
                            return 1;
                        } else if (b.id == 'dont_know') {
                            return -1;
                        } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
                            return -1;
                        } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                            // Should never happen
                        } else {
                            return 0;
                        }
                    });
                    // Calculate the item count in percentil for the progress bar
                    $.each($scope.categories[index].values, function(index_02, item_02) {
                        item_02.count_percent = ((parseFloat(item_02.count) / parseFloat($scope.initResults.length)) * 100).toFixed(2);
                    });
                });
                $scope.filteredResultsCount = $scope.filteredResults.length;
                $scope.display();
            }

            $scope.filter2 = function(category, value) {
                // Create JSON object to encapsulate the search criteria
                searchCriteria = {};
                $.each($scope.categories, function(index_01, item_01) {
                    if (item_01.values !== undefined) {
                        searchCriteria[index_01] = [];
                        $.each(item_01.values, function(index_02, item_02) {
                            // Reset count before filtering
                            item_02.count = 0;
                            if (item_02.isSelected) {
                                searchCriteria[index_01].push(item_02.id);
                            }
                            // Set default nodes color
                            item_02.color = defaultNodeColor;
                            item_02.colorClass = 'grey';
                        });
                    }
                });
                ids = [];
                $scope.filteredResults = $scope.initResults.filter(function(item) {
                    if ((
                            // Check if the searched term is present into the name of the site or into the actors' type of the site
                            (item.FULL_NAME.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ACTORS_TYPE.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.AREA.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ABSTRACT_FR.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0) || (item.ABSTRACT_ES.toLowerCase().indexOf($scope.queryTerm.toLowerCase()) >= 0)) && isSearchedAmongCriteria(searchCriteria, item)) {
                        ids.push(item.ID);
                        // Increment categories count, for those who are displayed
                        $.each($scope.categories, function(index_02, item_02) {
                            if ($scope.categories[index_02].isDiplayed) {
                                elementCriteriaValues = item[$scope.categories[index_02].mappedField].split(multiValuesSeparator);
                                $.each(elementCriteriaValues, function(index_03, item_03) {
                                    $scope.categories[index_02].values.filter(function(index) {
                                        return index.id == item_03;
                                    })[0].count++;
                                });
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
                $.each($scope.categories, function(index, item) {
                    // Order items of a category by count descending order
                    $scope.categories[index].values.sort(function(a, b) {
                        return b.count - a.count;
                    });
                    // Set colors to nodes and loadBar
                    if ($scope.categories[index].id == nodesColor) {
                        $.each($scope.categories[index].values.slice(0, 6), function(index_02, item_02) {
                            item_02.color = colors[index_02].color;
                            item_02.colorClass = colors[index_02].label;
                        });
                    }
                    // Order items of a category by alphabetical ascending order
                    $scope.categories[index].values.sort(function(a, b) {
                        // 'Not applicable' should be the last item
                        if (a.id == 'not_applicable') {
                            return 1;
                        } else if (b.id == 'not_applicable') {
                            return -1;
                            // 'Don't know' should be the before second last item
                        } else if (a.id == 'dont_know') {
                            return 1;
                        } else if (b.id == 'dont_know') {
                            return -1;
                        } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
                            return -1;
                        } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
                            return 1;
                            // Should never happen
                        } else {
                            return 0;
                        }
                    });
                    // Calculate the item count in percentil for the progress bar
                    $.each($scope.categories[index].values, function(index_02, item_02) {
                        item_02.count_percent = ((parseFloat(item_02.count) / parseFloat($scope.initResults.length)) * 100).toFixed(2);
                    });
                });
                $scope.filteredResultsCount = $scope.filteredResults.length;
                $scope.display2();
            }

            // Filter the results to display the current page
            $scope.display = function() {
                $scope.displayedResults = $scope.filteredResults;
                // Color nodes, according to the configuration file
                $scope.graph.graph.nodes().forEach(function(n) {
                    if (ids.indexOf(n.id) != -1) {
                        n.color = $scope.categories[nodesColor].values.filter(function(item) {
                            if (n.attributes[$scope.categories[nodesColor].mappedField] == undefined) {
                                // If no mapping on this node, set default color
                                return item.id == 'other_unknown_not_categorized';
                            } else {
                                return item.id == n.attributes[$scope.categories[nodesColor].mappedField];
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

            // Filter the results to display the current page
            $scope.display2 = function() {
                $scope.displayedResults = $scope.filteredResults;
            }

            switch ($scope.corpusId) {
                case 'climatechanges':
                    $scope.init();
                    break;
                case 'ameriquelatine':
                    $scope.init2();
                    break;
            }
        }
    ]);

})();