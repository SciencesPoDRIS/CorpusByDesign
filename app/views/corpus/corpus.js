(function() {
    'use strict';

    var app = angular.module('webcorpus.corpus', []);

    app.controller('CorpusController', ['$scope', '$routeParams', 'loadCorpus', 'loadCorpusData', 'get', 'utils',
        function($scope, $routeParams, loadCorpus, loadCorpusData, get, utils) {
            // Init variables
            var bool_01,
                bool_02,
                currentLine,
                elementCriteriaValues,
                headers,
                ids,
                i, j,
                searchCriteria,
                obj;
            var defaultNodeColor = '#d3d3d3';
            var multiValuesSeparator = ' ; ';
            var firstLoad = true;

            // Init scope variables
            $scope.queryTerm = '';
            // Init routing variables
            $scope.corpusId = $routeParams.corpusId;
            $scope.lang = $routeParams.lang;
            $scope.view = $routeParams.viewName;

            // Limit results displayed for performance issues
            var defaultResultsDisplayCount = 48
            $scope.resultsDisplayCount = defaultResultsDisplayCount;
            $scope.displayAllResults = function() {
                $scope.resultsDisplayCount = Infinity
            }
            function resetDisplayCount() {
                $scope.resultsDisplayCount = defaultResultsDisplayCount;
            }

            // Regenerate the legend
            $scope.onNodesColor = function() {
                $scope.legend = get.legend($scope.corpus.categories, $scope.corpus.nodesColor);
            }

            $scope.highlightedNode = null;
            // When the mouse enter a tile, color the node on the graph part
            $scope.onMouseOverTile = function(e) {
                $scope.highlightedNode = e.currentTarget.id;
            }
            // When the mouse leave a tile, reset the nodes color on the graph part
            $scope.onMouseLeaveTile = function(e) {
                $scope.highlightedNode = null;
            }

            $scope.init = function() {
                // Load the corpus configurations
                loadCorpus.getCorpus($scope.corpusId).then(function(corpus) {
                    $scope.corpus = corpus;

                    // Consolidate corpus data
                    var cat
                    for (cat in $scope.corpus.categories) {
                        var category = $scope.corpus.categories[cat]
                        category.valuesPreview = category.values.map(function(d){return d.label}).join(', ')
                    }

                    // Load the corpus content
                    $scope.initResults = [];
                    loadCorpusData.getData($scope.corpusId).then(function(data) {
                        data = data.split('\n');
                        // Remove end of line
                        headers = data[0].replace(/(\r\n|\n|\r)/gm, '').split('\t');
                        for (i = 1; i < data.length; i++) {
                            obj = {};
                            currentLine = data[i].split('\t');
                            for (j = 0; j < headers.length; j++) {
                                obj[headers[j]] = currentLine[j];
                            }
                            $scope.initResults.push(obj);
                        }
                        $scope.initResultsCount = $scope.initResults.length;
                        updateFiltering();
                        // Check that this corpus has nodesColor (ie. it has a graph part)
                        if('nodesColor' in $scope.corpus) {
                            // Generate the legend
                            $scope.legend = get.legend($scope.corpus.categories, $scope.corpus.nodesColor);
                        }
                    });

                });
            }

            // Deep watch corpus categories to update filtering
            $scope.$watch('corpus.categories', updateFiltering, true);

            // Watch search field to update filtering
            $scope.$watch('queryTerm', updateFiltering);

            function updateFiltering() {
                // If no initResults, then no filteredResults! Happens during loading.
                if ($scope.initResults === undefined) {
                    $scope.filteredResults = [];
                    return false;
                }

                // Reset limited results
                resetDisplayCount();

                // Init summary data
                $.each($scope.corpus.categories, function(catId, category){
                    category.values.forEach(function(v) {
                        v.count = 0;
                    });
                });

                // Filter items by search query
                if ($scope.queryTerm === undefined || $scope.queryTerm.trim() == '') {
                    // If no query, everyone is valid
                    $scope.initResults.forEach(function(item) { item.validForSearch = true })
                } else {
                    $scope.queryTermFormatted = accentsTidy($scope.queryTerm).split(' ');
                    $scope.initResults.forEach(function(item) {
                        // Check if the searched term is present into the name of the site or into the actors' type of the site
                        if (isSearchedFullText($scope.queryTermFormatted, item) && isSearchedAmongCriteria(searchCriteria, item)) {
                            item.validForSearch = true;
                        } else {
                            item.validForSearch = false;
                        }
                    });
                }

                // Filter items by selected categories
                $scope.initResults.forEach(function(item) {
                    item.validForMetadataFiltering = true;
                })
                $scope.initResults.forEach(function(item) {
                    var catId;
                    $.each($scope.corpus.categories, function(catId, category) {
                        var field = category.mappedField;
                        // Avoid the language field
                        if(field != 'LANGUAGE') {
                            var itemValues = item[field].split(multiValuesSeparator);
                            // Item is valid for this category if one of its values is selected
                            var validForThisCategory = itemValues.some(function(value) {
                                // Search the value in the category's list
                                return category.values.some(function(catValue) {
                                    return catValue.id == value && catValue.isSelected;
                                });
                            });
                            // If item is invalid for one category, hide it
                            if (!validForThisCategory) {
                                item.validForMetadataFiltering = false;
                            }
                        }
                    });
                });

                // Finalize filtered results
                $scope.filteredResults = $scope.initResults.filter(function(item) {
                    var displayItem = item.validForSearch && item.validForMetadataFiltering;
                    if (displayItem) {
                        // Update summary data
                        $.each($scope.corpus.categories, function(catId, category){
                            var field = category.mappedField
                            var itemValues = item[field].split(multiValuesSeparator)
                            category.values.forEach(function(v) {
                                if (itemValues.indexOf(v.id) >= 0) {
                                    v.count++;
                                }
                            });
                        });
                    }
                    return displayItem;
                });

                // Finalize summary data (percents)
                $.each($scope.corpus.categories, function(catId, category){
                    category.values.forEach(function(v) {
                        v.count_percent = ((parseFloat(v.count) / parseFloat($scope.initResults.length)) * 100).toFixed(2);
                    })
                });
            }

            /* *
             * Return true if the item matches the search criteria, else return false
             * @var item 
             * @var searchCriteria JSONObject
             * 
             * @return boolean
             * */
            var isSearchedAmongCriteria = function(searchCriteria, item) {
                bool_01 = true;
                $.each(searchCriteria, function(index_01, item_01) {
                    bool_02 = false;
                    elementCriteriaValues = item[$scope.corpus.categories[index_01].mappedField].split(multiValuesSeparator);
                    $.each(elementCriteriaValues, function(index_02, item_02) {
                        bool_02 = bool_02 || (item_01.indexOf(item_02) >= 0);
                    });
                    bool_01 = bool_01 && bool_02;
                });
                return bool_01;
            }

            // Replace accentuated characters from a string
            var accentsTidy = function(s) {
                return utils.removeDiacritics(s).toLowerCase()
            };

            var isSearchedFullText = function(query, item) {
                if (query == '') {
                    return true;
                } else {
                    bool_01 = true;
                    var valuesToFilter = ['not_applicable', 'dont_know'];
                    var queryTermFormatted = accentsTidy($.map($scope.corpus.fullTextSearchFields, function(value, index) {
                        return $.inArray(item[value], valuesToFilter) ? item[value] : '';
                    }).join(' '));
                    for (i = 0; i < query.length; i++) {
                        bool_01 = bool_01 && (queryTermFormatted.indexOf(query[i]) == -1 ? false : true);
                    }
                    return bool_01;
                }
            }

            $scope.init();
        }
    ]);

})();