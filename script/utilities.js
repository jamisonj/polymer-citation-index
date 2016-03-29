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
