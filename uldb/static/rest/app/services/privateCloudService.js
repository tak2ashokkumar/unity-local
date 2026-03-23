/**
 * Created by rt on 1/31/17.
 */
var app = angular.module('uldb');
app.factory('PrivateCloudService', [
    function () {
        var updateGraphFactory = function (idField) {
            return function (arr) {
                // array is
                // [switches, firewalls, lbs, servers, vms]
                var nodes = new vis.DataSet([
                    { id: 1, label: arr[0], title: 'Switches', x: 0, y: 0, value: 1, level: 0 },
                    { id: 2, label: arr[1], x: 0, y: 1, value: 1, level: 1 },
                    { id: 3, label: arr[2], x: 0, y: 2, value: 1, level: 2 },
                    { id: 4, label: arr[3], x: 0, y: 3, value: 4, level: 3 },
                    { id: 5, label: arr[4], x: 0, y: 4, value: 1, level: 4 }
                ]);
                // create an array with edges
                var edges = new vis.DataSet([
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 4 },
                    { from: 4, to: 5 }
                ]);
                // create a network
                var container = document.getElementById(idField);
                var data = {
                    nodes: nodes,
                    edges: edges
                };
                var options = {
                    nodes: {
                        shape: 'circle',
                        // physics: false,
                        fixed: {
                            x: true
                            //     y: true
                        },
                        color: {
                            background: 'rgb(103, 184, 151)',
                            border: 'rgb(103, 184, 151)'
                        },
                        font: {
                            face: 'Open Sans',
                            color: '#eee'
                        },
                        scaling: {
                            min: 50,
                            max: 50,
                            label: {
                                enabled: true,
                                min: 50,
                                max: 50
                            }
                        }
                    },
                    layout: {
                        hierarchical: {
                            enabled: true,
                            levelSeparation: 150,
                            nodeSpacing: 100,
                            treeSpacing: 200,
                        }
                    },
                    interaction: {
                        dragNodes: false,
                        zoomView: false,
                        dragView: false,
                        selectable: false
                    }
                };
                var network = new vis.Network(container, data, options);
            };
        };



        return {
            updateGraphFactory: updateGraphFactory
        };
    }
]);


// probably useless crap
var idk = function () {
    var inner = '<svg xmlns="http://www.w3.org/2000/svg" width="390" height="65">' +
        '<rect x="0" y="0" width="100%" height="100%" fill="#7890A7" stroke-width="20" stroke="#ffffff" ></rect>' +
        '<foreignObject x="15" y="10" width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
        ' <em>9</em>' +
        '</div>' +
        '</foreignObject>' +
        '</svg>';
    var DOMURL = window.URL || window.webkitURL || window;
    var url = DOMURL.createObjectURL(new Blob([inner], { type: 'image/svg+xml;charset=utf-8' }));
    // end useless crap
};
