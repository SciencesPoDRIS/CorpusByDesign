(function() {
    'use strict';

    /* Services */

    var app = angular.module('webcorpus.services', []);

    // Factory to load the json corpora
    app.factory('loadCorpora', ['$http',
        function($http) {
            return {
                getCorpora: function(corpusId) {
                    return $http.get('../data/corpora.json', { cache: true }).then(function(data) {
                        return (typeof corpusId === 'undefined') ? data.data.corpora : data.data.corpora[corpusId];
                    });
                }
            }
        }
    ]);

    // Factory to load the tsv corpus data
    app.factory('loadCorpus', ['$http',
        function($http) {
            return {
                getCorpus: function(corpusId) {
                    return $http.get('../data/' + corpusId + '.tsv', { cache: true }).then(function(data) {
                        return data.data;
                    });
                }
            }
        }
    ]);

})();