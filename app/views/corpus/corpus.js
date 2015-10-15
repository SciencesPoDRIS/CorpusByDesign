'use strict';

angular.module('webcorpus.corpus', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/corpus/corpus.html',
        controller: 'CorpusController'
    })
}])

.controller('CorpusController', function($scope) {

    $scope.isCollapsed = true;
    $scope.collapseFilters = function() {
        $scope.isCollapsed = !$scope.isCollapsed;
        if(!$scope.isCollapsed) {
            $('.content .filters').height('100%');
        } else {
            $('.content .filters').height('150px');
        }
    }

})

    .controller('CorpusSnippetCtrl', ['$scope',
        function($scope) {
            /*
            loadCorpora.getCorpora().then(function(data) {
                $scope.corpus = data[0];
            });
            */
        }
    ]);