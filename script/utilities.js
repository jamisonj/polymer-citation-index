// See http://bit.ly/1Ro3MO9 for this pattern.
if (window.jQuery !== undefined) {
    jQuery.fn.animateRotate = function(angle, fromAngle, duration, easing, complete) {
        var args = $.speed(duration, easing, complete);
        var step = args.step;

        return this.each(function(i, e) {
            args.complete = $.proxy(args.complete, e);
            args.step = function(now) {
                $.style(e, 'transform', 'rotate(' + now + 'deg)');
                if (step) {
                    return step.apply(e, arguments);
                }
            };

            $({deg: fromAngle}).animate({deg: angle}, args);
        });
    };
}

var globalToggleCollapse = function (event, collapseId, iconId) {
    var volumeId = event.target.dataArgs;
    var collapse;
    var icon;
    var rotate;

    if (volumeId === undefined) {
        volumeId = event.target.parentElement.dataArgs;
    }

    collapse = document.querySelector('#' + collapseId + volumeId);
    icon = document.querySelector('#' + iconId + volumeId);

    rotate = collapse.opened ? 180 : 0;
    collapse.toggle();

    if (window.$ !== undefined && $.fn.animateRotate !== undefined) {
        $(icon).animateRotate(rotate, 180 - rotate, 200);
    } else {
        icon.style.transform = "rotate(" + rotate + "deg)";
    }
}