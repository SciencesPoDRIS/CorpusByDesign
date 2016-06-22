(function() {
    'use strict';

    var app = angular.module('webcorpus.corpus', []);

    app.controller('CorpusController', ['$scope', '$routeParams', '$location', 'loadCorpus', 'loadCorpusData', 'colors', '$sce', 'utils',
        function($scope, $routeParams, $location, loadCorpus, loadCorpusData, colors, $sce, utils) {
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

            // On view change ('grid', 'list', 'graph', 'map')
            $scope.changeView = function(currentView) {
                $scope.currentView = currentView;
                $scope.init(currentView);
            }

            $scope.init = function(currentView) {
                // Load the corpus configurations
                loadCorpus.getCorpus($scope.corpusId).then(function(corpus) {
                    $scope.corpus = corpus;

                    // Consolidate corpus data
                    var cat
                    for (cat in $scope.corpus.categories) {
                        var category = $scope.corpus.categories[cat]
                        category.valuesPreview = category.values.map(function(d){return d.label}).join(', ')
                    }
                    
                    $scope.currentView = (currentView == undefined ? $scope.corpus.defaultView : currentView);
                    
                    // Load the corpus content
                    $scope.initResults = [];
                    loadCorpusData.getData($scope.corpusId).then(function(data) {
                        data = data.split('\n');
                        headers = data[0].split('\t');
                        for (i = 1; i < data.length; i++) {
                            obj = {};
                            currentLine = data[i].split('\t');
                            for (j = 0; j < headers.length; j++) {
                                obj[headers[j]] = currentLine[j];
                            }
                            $scope.initResults.push(obj);
                        }
                        $scope.initResultsCount = $scope.initResults.length;
                        updateFiltering()
                    });
                });
            }

            // Deep watch corpus categories to update filtering
            $scope.$watch('corpus.categories', updateFiltering, true)

            // Watch search field to update filtering
            $scope.$watch('queryTerm', updateFiltering)

            function updateFiltering() {
                // If no initResults, then no filteredResults! Happens during loading.
                if ($scope.initResults === undefined) {
                    $scope.filteredResults = []
                    return false;
                }

                // Filter items by search query
                if ($scope.queryTerm === undefined || $scope.queryTerm.trim() == '') {
                    // If no query, everyone is valid
                    $scope.initResults.forEach(function(item) { item.validForSearch = true })
                } else {
                    $scope.queryTermFormatted = accentsTidy($scope.queryTerm).split(' ');
                    $scope.initResults.forEach(function(item) {
                        // Check if the searched term is present into the name of the site or into the actors' type of the site
                        if (isSearchedFullText($scope.queryTermFormatted, item) && isSearchedAmongCriteria(searchCriteria, item)) {
                            item.validForSearch = true
                        } else {
                            item.validForSearch = false
                        }
                    });
                }

                // Filter items by selected categories
                $scope.initResults.forEach(function(item) {
                    item.validForMetadataFiltering = true
                })
                $scope.initResults.forEach(function(item) {
                    var catId;
                    $.each($scope.corpus.categories, function(catId, category){
                        var field = category.mappedField
                        var values = item[field].split(multiValuesSeparator)
                        // Item is valid for this category if one of its values is selected
                        var validForThisCategory = values.some(function(value) {
                            // Search the value in the category's list
                            return category.values.some(function(catValue) {
                                return catValue.id == value && catValue.isSelected;
                            })
                        })
                        // If item is invalid for one category, hide it
                        if (!validForThisCategory) {
                            item.validForMetadataFiltering = false
                        }
                    });
                });

                $scope.filteredResults = $scope.initResults.filter(function(item){
                    return item.validForSearch && item.validForMetadataFiltering
                })
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

            // $scope.filter = function(category, value) {
            //     if ($scope.corpusId == 'amerique-latine') {
            //         $scope.filter2();
            //         return;
            //     }
            //     // Create JSON object to encapsulate the search criteria
            //     searchCriteria = {};
            //     $.each($scope.corpus.categories, function(index_01, item_01) {
            //         // Don't put language as a search criteria
            //         if ((item_01.values !== undefined) && (index_01 != 'language')) {
            //             searchCriteria[index_01] = [];
            //             $.each(item_01.values, function(index_02, item_02) {
            //                 // Reset count before filtering
            //                 item_02.count = 0;
            //                 if (item_02.isSelected) {
            //                     searchCriteria[index_01].push(item_02.id);
            //                 }
            //                 // Set default nodes color
            //                 item_02.color = defaultNodeColor;
            //                 item_02.colorClass = 'grey';
            //             });
            //         }
            //     });
            //     ids = [];
            //     $scope.filteredResults = $scope.initResults.filter(function(item) {
            //         $scope.queryTermFormatted = accentsTidy($scope.queryTerm).split(' ');
            //         if (isSearchedFullText($scope.queryTermFormatted, item) && isSearchedAmongCriteria(searchCriteria, item)) {
            //         // if ((
            //                 // Check if the searched term is present into the name of the site or into the actors' type of the site
            //             ids.push(item.ID);
            //             // Increment categories count, for those who are displayed
            //             $.each($scope.corpus.categories, function(index_02, item_02) {
            //                 if ($scope.corpus.categories[index_02].isDiplayed) {
            //                     $scope.corpus.categories[index_02].values.filter(function(index) {
            //                         return index.id == item[$scope.corpus.categories[index_02].mappedField];
            //                     })[0].count++;
            //                 }
            //             });
            //             return true;
            //         } else {
            //             return false;
            //         }
            //     });
            //     $scope.legend = [];
            //     $.each($scope.corpus.categories, function(index, item) {
            //         // Order items of a category by count descending order
            //         $scope.corpus.categories[index].values.sort(function(a, b) {
            //             return b.count - a.count;
            //         });
            //         // Set colors to nodes and loadBar
            //         if ($scope.corpus.categories[index].id == $scope.corpus.nodesColor) {
            //             $.each($scope.corpus.categories[index].values.slice(0, 6), function(index_02, item_02) {
            //                 item_02.color = colors[index_02].color;
            //                 item_02.colorClass = colors[index_02].label;
            //                 // Create the legend object
            //                 $scope.legend[index_02] = { 'id': item_02.id, 'label': item_02.label, 'color': item_02.color };
            //             });
            //         }
            //         // Order items of a category by alphabetical ascending order
            //         $scope.corpus.categories[index].values.sort(function(a, b) {
            //             // 'Not applicable' should be the last item
            //             if (a.id == 'not_applicable') {
            //                 return 1;
            //             } else if (b.id == 'not_applicable') {
            //                 return -1;
            //                 // 'Don't know' should be the before second last item
            //             } else if (a.id == 'dont_know') {
            //                 return 1;
            //             } else if (b.id == 'dont_know') {
            //                 return -1;
            //             } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
            //                 return -1;
            //             } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
            //                 return 1;
            //                 // Should never happen
            //             } else {
            //                 return 0;
            //             }
            //         });
            //         // Order items of legend by alphabetical ascending order
            //         $scope.legend.sort(function(a, b) {
            //             // 'Not applicable' should be the last item
            //             if (a.id == 'not_applicable') {
            //                 return 1;
            //             } else if (b.id == 'not_applicable') {
            //                 return -1;
            //                 // 'Don't know' should be the before second last item
            //             } else if (a.id == 'dont_know') {
            //                 return 1;
            //             } else if (b.id == 'dont_know') {
            //                 return -1;
            //             } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
            //                 return -1;
            //             } else if (a.label.toLowerCase() > b.label.toLowerCase()) {
            //                 return 1;
            //                 // Should never happen
            //             } else {
            //                 return 0;
            //             }
            //         });
            //         // Calculate the item count in percentil for the progress bar
            //         $.each($scope.corpus.categories[index].values, function(index_02, item_02) {
            //             item_02.count_percent = ((parseFloat(item_02.count) / parseFloat($scope.initResults.length)) * 100).toFixed(2);
            //         });
            //     });
            //     $scope.filteredResultsCount = $scope.filteredResults.length;
            //     $scope.display();
            // }

            // $scope.filter2 = function(category, value) {
            //     // Create JSON object to encapsulate the search criteria
            //     searchCriteria = {};
            //     $.each($scope.corpus.categories, function(index_01, item_01) {
            //         searchCriteria[index_01] = [];
            //         $.each(item_01.values, function(index_02, item_02) {
            //             // Reset count before filtering
            //             item_02.count = 0;
            //             if (item_02.isSelected) {
            //                 searchCriteria[index_01].push(item_02.id);
            //             }
            //             // Set default nodes color
            //             item_02.color = defaultNodeColor;
            //             item_02.colorClass = 'grey';
            //         });
            //     });
            //     ids = [];
            //     $scope.queryTermFormatted = accentsTidy($scope.queryTerm).split(' ');
            //     $scope.filteredResults = $scope.initResults.filter(function(item) {
            //         if (isSearchedFullText($scope.queryTermFormatted, item) && isSearchedAmongCriteria(searchCriteria, item)) {
            //             ids.push(item.ID);
            //             // Increment categories count, for those who are displayed
            //             $.each($scope.corpus.categories, function(index_02, item_02) {
            //                 if ($scope.corpus.categories[index_02].isDiplayed) {
            //                     elementCriteriaValues = item[$scope.corpus.categories[index_02].mappedField].split(multiValuesSeparator);
            //                     $.each(elementCriteriaValues, function(index_03, item_03) {
            //                         $scope.corpus.categories[index_02].values.filter(function(index) {
            //                             return index.id == item_03;
            //                         })[0].count++;
            //                     });
            //                 }
            //             });
            //             return true;
            //         } else {
            //             return false;
            //         }
            //     });
            //     $.each($scope.corpus.categories, function(index, item) {
            //         // Check that this item should be displayed
            //         if (item.isDiplayed) {
            //             // Filter items from facet where the count is null
            //             if (firstLoad) {
            //                 $scope.corpus.categories[index].values = $.grep($scope.corpus.categories[index].values, function(item_02, index_02) {
            //                     return item_02.count > 0;
            //                 });
            //             }
            //             // Calculate the item count in percentil for the progress bar
            //             $.each($scope.corpus.categories[index].values, function(index_02, item_02) {
            //                 item_02.count_percent = ((parseFloat(item_02.count) / parseFloat($scope.initResults.length)) * 100).toFixed(2);
            //             });
            //             // Order items of a category by count descending order
            //             $scope.corpus.categories[index].values.sort(function(a, b) {
            //                 return b.count - a.count;
            //             });
            //             // Set colors to nodes and loadBar
            //             if ($scope.corpus.categories[index].id == $scope.corpus.nodesColor) {
            //                 $.each($scope.corpus.categories[index].values.slice(0, 6), function(index_02, item_02) {
            //                     item_02.color = colors[index_02].color;
            //                 });
            //             }
            //             // Order items of a category by alphabetical ascending order
            //             $scope.corpus.categories[index].values.sort(function(a, b) {
            //                 if (accentsTidy(a.label) < accentsTidy(b.label)) {
            //                     return -1;
            //                 } else if (accentsTidy(a.label) > accentsTidy(b.label)) {
            //                     return 1;
            //                 }
            //             });
            //             var t = ['other', 'dont_know', 'not_applicable'];
            //             for (i = 0; i < t.length; i++) {
            //                 j = $scope.corpus.categories[index].values.map(function(e) {
            //                     return e.id; }).indexOf(t[i]);
            //                 $scope.corpus.categories[index].values.push($scope.corpus.categories[index].values.splice(j, 1)[0])
            //             }
            //         }
            //     });
            //     $scope.filteredResultsCount = $scope.filteredResults.length;
            //     $scope.display2();
            // }

            // // Filter the results to display the current page
            // $scope.display = function() {

            //     $scope.displayedResults = $scope.filteredResults;
            //     // Color nodes, according to the configuration file
            //     /*
            //     $scope.graph.graph.nodes().forEach(function(n) {
            //         if (ids.indexOf(n.id) != -1) {
            //             n.color = $scope.corpora.categories[$scope.corpora.nodesColor].values.filter(function(item) {
            //                 if (n.attributes[$scope.corpora.categories[$scope.corpora.nodesColor].mappedField] == undefined) {
            //                     // If no mapping on this node, set default color
            //                     return item.id == 'other_unknown_not_categorized';
            //                 } else {
            //                     return item.id == n.attributes[$scope.corpora.categories[$scope.corpora.nodesColor].mappedField];
            //                 }
            //             })[0].color;
            //         } else {
            //             // Else reset nodes' color to the light grey
            //             n.color = defaultNodeColor;
            //         }
            //         // Change default label by the value of the column "FULL_NAME"
            //         n.label = n.attributes.FULL_NAME;
            //     });
            //     $scope.graph.refresh();
            //     */
            // }

            // // Filter the results to display the current page
            // $scope.display2 = function() {
            //     $scope.displayedResults = $scope.filteredResults;
            //     if(!firstLoad) {
            //         $scope.$apply();
            //     } else {
            //         firstLoad = false;
            //     }
            // }

            $scope.init();
        }
    ]);

})();