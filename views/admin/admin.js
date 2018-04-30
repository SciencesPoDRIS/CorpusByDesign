(function() {
    'use strict';

    var app = angular.module('webcorpus.admin', []);

    app.controller('AdminController', ['$scope', 'loadCorpus',
        function($scope, loadCorpus) {
            loadCorpus.getCorpus('election-presidentielle-2017').then(function(corpus) {
                $scope.corpus = corpus;
                $scope.corpus.update = new Date($scope.corpus.update);
                $scope.corpus.creation = new Date($scope.corpus.creation);
            });
        }
    ]);

})();