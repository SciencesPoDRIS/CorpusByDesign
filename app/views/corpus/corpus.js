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

    app.controller('CorpusController', ['$scope', 'loadCorpora', 'loadCorpus', 'categories', 
        function($scope, loadCorpora, loadCorpus, categories) {
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
                        if(item2.id == item[7]) {
                            item2.count++;
                        }
                    });
                    $.each(categories['anthropogenicClimateChange'].values, function(index2, item2) {
                        if(item2.id == item[10]) {
                            item2.count++;
                        }
                    });
                    $.each(categories['mitigationAdaptation'].values, function(index2, item2) {
                        if(item2.id == item[11]) {
                            item2.count++;
                        }
                    });
                    $.each(categories['collection'].values, function(index2, item2) {
                        if(item2.id == item[15]) {
                            item2.count++;
                        }
                    });
                });
                // Reorder categories by count attribute
                categories['actorsType'].values.sort(function(obj1, obj2) { return obj2.count - obj1.count });
                categories['anthropogenicClimateChange'].values.sort(function(obj1, obj2) { return obj2.count - obj1.count });
                categories['mitigationAdaptation'].values.sort(function(obj1, obj2) { return obj2.count - obj1.count });
                categories['collection'].values.sort(function(obj1, obj2) { return obj2.count - obj1.count });
            });
            $scope.quantity = 12;
            $scope.isCollapsed = true;
            $scope.collapseFilters = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
                if(!$scope.isCollapsed) {
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
                        }
                    },
                    function(s) {
                        $scope.graph = s;
                    }
                );
            }

            $scope.init();
        }
    ]);

})();