(function() {
    'use strict';

    var app = angular.module('webcorpus.admin', []);

    app.controller('AdminController', ['$scope', 'loadCorpus',
        function($scope, loadCorpus) {
            // Load list of the corpora
            loadCorpus.getCorpora().then(function(corpora) {
                // Add the possibility to create a new corpus
                corpora['new'] = { title : 'Nouveau corpus' };
                $scope.corpora = corpora;
            });
            $scope.corpusid = '';

            $scope.load = function() {
                if($scope.corpusid != '') {
                    // Create a new and empty corpus
                    if($scope.corpusid == 'new') {
                        $scope.corpus = {};
                        $scope.corpus.categories = {};
                    // Load an existing corpus and set it into the scope
                    } else {
                        loadCorpus.getCorpus($scope.corpusid).then(function(corpus) {
                            $scope.corpus = corpus;
                            $scope.corpus.id = $scope.corpusid;
                            $scope.corpus.creation = new Date($scope.corpus.creation);
                            $scope.corpus.update = new Date($scope.corpus.update);
                            $scope.views.map(function(value) {
                                value.isChecked = $scope.corpus.availableViews.indexOf(value.name) > -1;
                            });
                        });
                    }
                    // List of the name of all available views
                    $scope.views = [
                        {name : 'graph', isChecked : 0},
                        {name : 'grid', isChecked : 0},
                        {name : 'list', isChecked : 0},
                        {name : 'map', isChecked : 0}
                    ];
                    // Display form
                    $('.corpus-form').css('display', 'initial');
                }
            }

            $scope.save = function() {
                // Duplicate as a deep copy, the corpus Object
                $scope.savedCorpus = jQuery.extend(true, {}, $scope.corpus);
                // Adapt creation date format
                var d = $scope.savedCorpus.creation.getDate();
                var m = $scope.savedCorpus.creation.getMonth() + 1;
                m = (m > 9) ? '' + m : '0' + m;
                var y = $scope.savedCorpus.creation.getFullYear();
                $scope.savedCorpus.creation = y + '-' + m + '-' + d;
                // Adapt update date format
                d = $scope.savedCorpus.update.getDate();
                m = $scope.savedCorpus.update.getMonth() + 1;
                m = (m > 9) ? '' + m : '0' + m;
                y = $scope.savedCorpus.update.getFullYear();
                $scope.savedCorpus.update = y + '-' + m + '-' + d;
                // On added category, for each value, set count to zero
                // Iterate over categories
                Object.keys($scope.savedCorpus.categories).forEach(
                    function(key) {
                        // Iterate over category values
                        $.each($scope.savedCorpus.categories[key].values, function(index, value) {
                            value['count'] = 0;
                        });
                    }
                );
                // Add into the DOM an a tag and simulate a click on it
                // To download the JSON file
                var downloadLink = document.createElement('a');
                downloadLink.setAttribute('download', $scope.corpus.id + '.json');
                var blob = new Blob([angular.toJson($scope.savedCorpus, 4)], {
                    type: 'application/json;charset=utf-8;'
                });
                downloadLink.setAttribute('href', window.URL.createObjectURL(blob));
                downloadLink.click();
            }

            // Add a new then empty tool
            $scope.addTool = function() {
                $scope.corpus.tools.push({name: '', url: ''});
            }

            // Add a new then empty category
            $scope.addCategory = function() {
                $scope.corpus.categories['new_category'] = { id: '', label: '', tooltip: '', isDiplayed: 0, mappedField: '', mappedFieldId: '', values: [] };
            }

            $scope.addCategoryValue = function(category) {
                category.values.push({ id: '', label: '', isSelected: 0 });
            }

        }
    ]);

}) ();