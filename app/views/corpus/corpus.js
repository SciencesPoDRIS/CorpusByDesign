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

    app.controller('CorpusController', ['$scope', 'loadCorpora', 'categories', 
        function($scope, loadCorpora, categories) {
            // Load the corpus
            loadCorpora.getCorpora().then(function(data) {
                $scope.corpus = data[0];
            });
            // Load all categories from conf file to display
            $scope.categories = [];
            $.each(categories, function(index, item) {
                if (item.isDiplayed !== undefined && item.isDiplayed) {
                    $scope.categories.push(item);
                }
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