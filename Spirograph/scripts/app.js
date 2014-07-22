/// <reference path='definitions/references.d.ts' />
'use strict';
var _this = this;
var Spirograph;
(function (Spirograph) {
    var canvas = d3.select("body").append("canvas").attr('id', 'spirograph-canvas').attr("width", window.innerWidth).attr("height", window.innerHeight);

    var ctx = canvas.node().getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    var svgContainer = d3.select("body").append("svg").attr("width", window.innerWidth).attr("height", window.innerHeight);

    var gearOptions = (new Spirograph.Shapes.GearOptionsFactory(1)).create(60);
    var ringGearOptions = (new Spirograph.Shapes.RingGearOptionsFactory(1)).create(144, 96);

    var beamOptions = {
        endCapsToothCount: 20,
        toothHeight: 10,
        totalToothCount: 144
    };

    var beam = svgContainer.append('g').attr('class', 'gear beam').attr("transform", "translate(" + Spirograph.Utility.getCenterX() + "," + Spirograph.Utility.getCenterY() + ")").datum(beamOptions).append("path").attr("d", Spirograph.Shapes.Beam);

    var ringGear = svgContainer.append("g").attr("class", "gear ring-gear").attr("transform", "translate(" + Spirograph.Utility.getCenterX() + "," + Spirograph.Utility.getCenterY() + ")").datum(ringGearOptions).append("path").attr("d", Spirograph.Shapes.RingGear);

    var gear = svgContainer.append("g").attr("class", "gear").datum(gearOptions);

    gear.append("path").attr("d", Spirograph.Shapes.Gear);

    Spirograph.Utility.changePenColor(0, 128, 0, .3);
    $('#change-color-button').click(function () {
        var red = parseInt($('#red-input').val(), 10);
        var green = parseInt($('#green-input').val(), 10);
        var blue = parseInt($('#blue-input').val(), 10);
        var alpha = parseFloat($('#alpha-input').val());
        Spirograph.Utility.changePenColor(red, green, blue, alpha);
    });

    $('#hide-gears-button').mousedown(function () {
        gear.style('visibility', 'hidden');
        ringGear.style('visibility', 'hidden');
    }).mouseup(function () {
        gear.style('visibility', 'visible');
        ringGear.style('visibility', 'visible');
    });

    ringGear.style('visibility', 'hidden');

    var allHoleOptions = (new Spirograph.Shapes.GearHoleGenerator()).generate(gearOptions);
    var holeOptions;
    allHoleOptions.forEach(function (hole, index) {
        var holeObject = gear.append('path').attr('class', 'gear-hole').datum(hole).attr('d', Spirograph.Shapes.GearHole);

        holeObject.on('click', function () {
            d3.selectAll('.selected').classed('selected', false);
            holeObject.classed('selected', true);

            holeOptions = hole;

            initializeGearAndPen(false);
        });

        if (index === 0) {
            holeObject.on('click')(null, null);
        }
    });

    var previousTransformInfo = null;

    //var rotater = new Shapes.RingGearRotater(ringGearOptions);
    var rotater = new Spirograph.Shapes.BeamRotater(beamOptions);
    console.log(JSON.stringify(rotater.rotate(gearOptions, 0, holeOptions)));

    var lastMouseAngle = null;
    var rotationOffset = 0;

    var svgContainerMouseMove = function (d, i) {
        var mouseCoords = Spirograph.Utility.toStandardCoords({ x: d3.event.clientX, y: d3.event.clientY }, { x: window.innerWidth, y: window.innerHeight });
        var mouseAngle = Spirograph.Utility.toDegrees(Math.atan2(mouseCoords.y, mouseCoords.x));

        if (lastMouseAngle != null) {
            if (lastMouseAngle < -90 && mouseAngle > 90) {
                rotationOffset--;
            } else if (lastMouseAngle > 90 && mouseAngle < -90) {
                rotationOffset++;
            }
        }

        lastMouseAngle = mouseAngle;
        mouseAngle += (rotationOffset * 360);

        var transformInfo = rotater.rotate(gearOptions, mouseAngle, holeOptions);

        //$('#output').html('<p>Mouse angle: ' + mouseAngle + '</p><p>Gear angle: ' + transformInfo.angle + '</p>');
        gear.attr("transform", "translate(" + transformInfo.x + "," + transformInfo.y + ") rotate(" + transformInfo.angle + ")");

        if (previousTransformInfo !== null) {
            ctx.beginPath();
            ctx.moveTo(previousTransformInfo.penX, previousTransformInfo.penY);
            ctx.lineTo(transformInfo.penX, transformInfo.penY);
            ctx.stroke();
            ctx.closePath();
        }

        previousTransformInfo = transformInfo;
    };

    gear.on("mousedown", function (d, i) {
        gear.classed('dragging', true);

        svgContainer.on("mousemove", svgContainerMouseMove);

        svgContainer.on("mouseup", function () {
            svgContainer.on("mousemove", null);
            gear.classed('dragging', false);
        });
    });

    function initializeGearAndPen(resetGear) {
        if (typeof resetGear === "undefined") { resetGear = true; }
        //previousTransformInfo = rotater.rotate(gearOptions, 0, holeOptions);
        previousTransformInfo = null;

        if (resetGear) {
            previousTransformInfo = rotater.rotate(gearOptions, 0, holeOptions);
            gear.attr("transform", "translate(" + previousTransformInfo.x + "," + Spirograph.Utility.getCenterY() + ") rotate(" + 0 + ")");
        }
    }

    initializeGearAndPen();
})(Spirograph || (Spirograph = {}));

// download canvas as image functionality... not fully working yet
document.getElementById('download-link').addEventListener('click', function () {
    var link = _this;
    var data = document.getElementById('spirograph-canvas').toDataURL();
    _this.download = 'spirograph.png';
    window.location.href = data;
}, false);
//# sourceMappingURL=app.js.map