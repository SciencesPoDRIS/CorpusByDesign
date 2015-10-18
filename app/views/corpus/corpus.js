(function() {
'use strict';

    var app = angular.module('webcorpus.corpus', [
        'ngRoute'
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/corpus/corpus.html',
            controller: 'CorpusController'
        })
    }]);

    app.controller('CorpusController', function($scope) {
        /*
        loadCorpora.getCorpora().then(function(data) {
            $scope.corpus = data[0];
        });
        */
        $scope.isCollapsed = true;
        $scope.collapseFilters = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
            if(!$scope.isCollapsed) {
                $('.content .filters').height('100%');
            } else {
                $('.content .filters').height('150px');
            }
        }
    });

})();