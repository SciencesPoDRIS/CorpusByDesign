(function() {
    'use strict';

    /* Services */

    var app = angular.module('webcorpus.services', []);

    // Factory to load the json corpora
    app.factory('loadCorpora', ['$http',
        function($http) {
            return {
                getCorpora: function() {
                    return $http.get('../data/corpora.json', {cache: true}).then(function(data) {
                        return data.data.corpora;
                    });
                }
            }
        }
    ]);

    // Factory to load the tsv corpus data
    app.factory('loadCorpus', ['$http',
        function($http) {
            return {
                getCorpus: function() {
                    return $http.get('../data/COP21.tsv', {cache: true}).then(function(data) {
                        return data.data;
                    });
                }
            }
        }
    ]);

})();