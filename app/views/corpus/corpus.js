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
            });
            $scope.isCollapsed = true;
            $scope.collapseFilters = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
                if(!$scope.isCollapsed) {
                    $('.content .filters').height('100%');
                } else {
                    $('.content .filters').height('150px');
                }
            }
        }
    ]);

})();