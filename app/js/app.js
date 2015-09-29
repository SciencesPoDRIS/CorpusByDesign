(function() {
    'use strict';

    var app = angular.module('webcorpus', [
        'ui.bootstrap'
    ]);

    app.controller('CorpusSnippetCtrl', ['$scope', 
        function($scope) {
            $scope.isCollapsed = true;
            // $scope.collapsedFilters = true;
            $scope.collapseFilters = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
            }
        }
    ]);

})();