(function() {
    'use strict';

    var app = angular.module('webcorpus', [
        'ui.bootstrap',
        'ngRoute',
        'webcorpus.corpus'
    ]);

    app.controller('CorpusSnippetCtrl', ['$scope', 
        function($scope) {
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

    app.config(['$routeProvider', function($routeProvider) {
      $routeProvider.otherwise({redirectTo: '/'});
    }]);

})();