(function() {
    'use strict';

    var app = angular.module('webcorpus.methodology', []);

    app.controller('MethodologyController', ['$scope', '$routeParams', '$sce', 'loadCorpus',
        function($scope, $routeParams, $sce, loadCorpus) {
            // Init routing variables
            $scope.corpusId = $routeParams.corpusId;
            $scope.lang = $routeParams.lang;

            // Load all the corpora descriptions
            loadCorpus.getCorpus($scope.corpusId).then(function(corpus) {
                $scope.corpus = corpus;
                $scope.purpose = $sce.trustAsHtml($scope.corpus.purpose);
                $scope.selection = $sce.trustAsHtml($scope.corpus.selection);
                $scope.indexing = $sce.trustAsHtml($scope.corpus.indexing);
                $scope.footnote = $sce.trustAsHtml($scope.corpus.footnote);
                $scope.creation = $sce.trustAsHtml($scope.corpus.creation);
                $scope.update = $sce.trustAsHtml($scope.corpus.update);
                $scope.authors = $sce.trustAsHtml($scope.corpus.authors);
                $scope.size = $sce.trustAsHtml($scope.corpus.size);
                $scope.subtitle = $sce.trustAsHtml($scope.corpus.subtitle);
            });
        }
    ]);

})();