(function() {
    'use strict';

    var app = angular.module('webcorpus.methodology', []);

    app.controller('MethodologyController', ['$scope', '$routeParams', '$sce', 'loadCorpora',
        function($scope, $routeParams, $sce, loadCorpora) {
            // Init routing variables
            $scope.corpusId = $routeParams.corpusId;
            $scope.lang = $routeParams.lang;

            // Load all the corpora descriptions
            loadCorpora.getCorpora($scope.corpusId).then(function(data) {
                $scope.corpora = data;
                $scope.purpose = $sce.trustAsHtml($scope.corpora.purpose);
                $scope.selection = $sce.trustAsHtml($scope.corpora.selection);
                $scope.indexing = $sce.trustAsHtml($scope.corpora.indexing);
                $scope.footnote = $sce.trustAsHtml($scope.corpora.footnote);
                $scope.creation = $sce.trustAsHtml($scope.corpora.creation);
                $scope.update = $sce.trustAsHtml($scope.corpora.update);
                $scope.authors = $sce.trustAsHtml($scope.corpora.authors);
                $scope.size = $sce.trustAsHtml($scope.corpora.size);
                $scope.subtitle = $sce.trustAsHtml($scope.corpora.subtitle);
            });
        }
    ]);

})();