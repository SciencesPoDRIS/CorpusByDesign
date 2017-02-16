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
            });
        }
    ]);

})();