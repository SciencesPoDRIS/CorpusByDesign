(function() {
    'use strict';

    /* Load modules */
    var app = angular.module('webcorpus', [
        'webcorpus.conf',
        'webcorpus.main',
        'webcorpus.directives',
        'webcorpus.filters',
        'webcorpus.routes',
        'webcorpus.services',
        'webcorpus.webentity',
        'webcorpus.methodology',
        'ngMaterial',
        'ui.bootstrap'
    ]);

    app.controller('mapController', ['$scope', '$window',
        function($scope, $window) {
            var m_width = $('#map').width(),
                width = 965,
                height = 585,
                country,
                state,
                countryDefaultColor = '#cde',
                countryOverColor = '#123';

            var div = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

            var projection = d3.geo.equirectangular()
                .center([-75, -35])
                .scale(300)
                .translate([width / 2, height / 1.5]);

            var path = d3.geo.path()
                .projection(projection);

            var svg = d3.select('#map').append('svg')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('viewBox', '0 0 ' + width + ' ' + height);

            svg.append('rect')
                .attr('class', 'background')
                .attr('width', width)
                .attr('height', height)
                .on('click', $scope.country_clicked);

            var g = svg.append('g');

            d3.json('../data/ameriquelatine.topo.json', function(error, us) {
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
                    .on('click', $scope.countryClicked)
                    .on('mouseenter', $scope.countryHoverIn)
                    .on('mouseleave', $scope.countryHoverOut);
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

            $scope.countryClicked = function(country) {
                // Unselect all area checkboxes but the one of the area clicked
                $.each($scope.categories.area.values, function(index, item) {
                    if (item.id != country.id) {
                        item.isSelected = false;
                    }

                });
                $scope.filter2();
            }

            $scope.countryHoverIn = function(country) {
                // Change country color
                $('#' + country.id).attr('fill', countryOverColor);
                // Display a tooltip with the country name
                div.transition().duration(300)
                    .style('opacity', 1)
                    .text($scope.getCountryLabel(country.id))
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px');
            }

            $scope.countryHoverOut = function(country) {
                // Restore default country color
                $('#' + country.id).attr('fill', countryDefaultColor);
                // Hide the tooltip
                div.transition().duration(300)
                    .style('opacity', 0);
            }

            $scope.getCountryLabel = function(countryId) {
                return $scope.categories.area.values.filter(
                    function(item, index) {
                        return item.id == countryId;
                    }
                )[0].label;
            }

            $(window).resize(function() {
                var w = $('#map').width();
                var h = $('#map').height();
                svg.attr('width', w);
                svg.attr('height', h);
            });
        }
    ]);

    /* Google analytics configuration */
    app.run(function(googleAnalyticsId, $rootScope, $location) {
        $rootScope.$on('$routeChangeSuccess', function() {
            ga('create', googleAnalyticsId, 'auto');
            ga('send', 'pageview', { 'page': $location.path() });
        });
    });
})();