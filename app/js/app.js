(function() {
    'use strict';

    /* Load modules */
    var app = angular.module('webcorpus', [
        'webcorpus.conf',
        'webcorpus.corpus',
        'webcorpus.methodology',
        'webcorpus.webentity',
        'webcorpus.welcome',
        'webcorpus.directives',
        'webcorpus.filters',
        'webcorpus.routes',
        'webcorpus.services',
        'ngMaterial'
    ]);

    app.controller('mapController', ['$scope', '$routeParams', '$window', '$timeout',
        function($scope, $routeParams, $window, $timeout) {

            var m_width = $('#map').width(),
                width = 965,
                height = 585,
                country,
                state

            var div = d3.select('body').append('div')
                .attr('class', 'tooltip country-tooltip')
                .style('opacity', 0);

            var projection = d3.geo.equirectangular()
                .center([-50, -15])
                .translate([width / 2, height / 1.5]);

            var path = d3.geo.path()
                .projection(projection);

            var svg = d3.select('#map').append('svg')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('viewBox', '0 0 ' + m_width + ' ' + height);

            svg.append('rect')
                .attr('class', 'background')
                .attr('width', width)
                .attr('height', height)
                .on('click', $scope.countryClicked);

            var g = svg.append('g');

            d3.json('../data/' + $scope.corpusId + '.topo.json', function(error, us) {
                g.append('g')
                    .attr('id', 'countries')
                    .selectAll('path')
                    .data(topojson.feature(us, us.objects.countries).features)
                    .enter()
                    .append('path')
                    .attr('id', function(d) {
                        return d.id;
                    })
                    .attr('d', path)
                    .on('click', countryClicked)
                    .on('mouseenter', countryHoverIn)
                    .on('mouseleave', countryHoverOut);
            });

            $scope.zoom = function(xyz) {
                g.transition()
                    .duration(750)
                    .attr('transform', 'translate(' + projection.translate() + ')scale(' + xyz[2] + ')translate(-' + xyz[0] + ',-' + xyz[1] + ')')
                    .selectAll(['#countries'])
                    .style('stroke-width', 1.0 / xyz[2] + 'px')
                    .selectAll('.city')
                    .attr('d', path.pointRadius(20.0 / xyz[2]));
            }

            $scope.get_xyz = function(d) {
                var bounds = path.bounds(d);
                var w_scale = (bounds[1][0] - bounds[0][0]) / width;
                var h_scale = (bounds[1][1] - bounds[0][1]) / height;
                var z = .96 / Math.max(w_scale, h_scale);
                var x = (bounds[1][0] + bounds[0][0]) / 2;
                var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
                return [x, y, z];
            }

            var countryClicked = function(country) {
                $timeout(function(){
                    $.each($scope.corpus.categories.area.values, function(i, value) {
                        if (value.id != country.id) {
                            value.isSelected = false;
                        } else {
                            value.isSelected = true;
                        }
                    });
                }, 0);
            }

            var countryHoverIn = function(country) {
                // Change country color
                $('#' + country.id).addClass('hover');
                // Display a tooltip with the country name
                div.transition().duration(300)
                    .style('opacity', 1)
                    .text($scope.getCountryLabel(country.id))
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px');
            }

            var countryHoverOut = function(country) {
                // Restore default country color
                $('#' + country.id).removeClass('hover');
                // Hide the tooltip
                div.transition().duration(300)
                    .style('opacity', 0);
            }

            $scope.getCountryLabel = function(countryId) {
                return $scope.corpus.categories.area.values.filter(
                    function(item, index) {
                        return item.id == countryId;
                    }
                )[0].label || 'missing country label';
            }

            // Recalculate the map dimensions when the whole DOM is loaded
            $timeout(
                function() {
                    $(window).resize();
                }
            );

            $(window).resize(function() {
                svg.attr('width', $('#map').width());
                svg.attr('height', $('#map').height());
                d3.select('g').attr('transform', 'scale(3.0) translate(-300, -300)');
            });
        }
    ]);

    /* Theming */
    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey', {
                'default': '400',
                'hue-1': '100',
                'hue-2': '600',
                'hue-3': 'A100'
            })
            .accentPalette('red');
    });

    /* Google analytics configuration */
    app.run(function(googleAnalyticsId, $rootScope, $location) {
        $rootScope.$on('$routeChangeSuccess', function() {
            ga('create', googleAnalyticsId, 'auto');
            ga('send', 'pageview', { 'page': $location.path() });
        });
    });
})();