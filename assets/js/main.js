(function($) {

    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $main = $('#main'),
        settings = {

            // Keyboard shortcuts.
            keyboardShortcuts: {
                enabled: true,
                distance: 50
            },

            // Scroll wheel.
            scrollWheel: {
                enabled: true,
                factor: 1
            },

            // Scroll zones.
            scrollZones: {
                enabled: true,
                speed: 15
            }

        };

    // Breakpoints.
    breakpoints({
        xlarge:  [ '1281px',  '1680px' ],
        large:   [ '981px',   '1280px' ],
        medium:  [ '737px',   '980px'  ],
        small:   [ '481px',   '736px'  ],
        xsmall:  [ null,      '480px'  ],
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Fancybox
    Fancybox.bind("[data-fancybox]", {
        // Your custom options
    });

    // Keyboard shortcuts.
    if (settings.keyboardShortcuts.enabled)
        (function() {
            $window.on('keydown', function(event) {
                var scrolled = false;

                if ($body.hasClass('is-poptrox-visible'))
                    return;

                switch (event.keyCode) {
                    // Left arrow.
                    case 37:
                        $main.scrollLeft($main.scrollLeft() - settings.keyboardShortcuts.distance);
                        scrolled = true;
                        break;

                    // Right arrow.
                    case 39:
                        $main.scrollLeft($main.scrollLeft() + settings.keyboardShortcuts.distance);
                        scrolled = true;
                        break;

                    // Page Up.
                    case 33:
                        $main.scrollLeft($main.scrollLeft() - $window.width() + 100);
                        scrolled = true;
                        break;

                    // Page Down, Space.
                    case 34:
                    case 32:
                        $main.scrollLeft($main.scrollLeft() + $window.width() - 100);
                        scrolled = true;
                        break;

                    // Home.
                    case 36:
                        $main.scrollLeft(0);
                        scrolled = true;
                        break;

                    // End.
                    case 35:
                        $main.scrollLeft($main.width());
                        scrolled = true;
                        break;
                }

                // Scrolled?
                if (scrolled) {
                    // Prevent default.
                    event.preventDefault();
                    event.stopPropagation();

                    // Stop link scroll.
                    $main.stop();
                }
            });
        })();

    // Scroll wheel.
    if (settings.scrollWheel.enabled)
        (function() {
            var normalizeWheel = function(event) {
                var pixelStep = 10,
                    lineHeight = 40,
                    pageHeight = 800,
                    sX = 0,
                    sY = 0,
                    pX = 0,
                    pY = 0;

                if ('detail' in event) { sY = event.detail; }
                else if ('wheelDelta' in event) { sY = event.wheelDelta / -120; }
                else if ('wheelDeltaY' in event) { sY = event.wheelDeltaY / -120; }

                if ('wheelDeltaX' in event) { sX = event.wheelDeltaX / -120; }

                if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
                    sX = sY;
                    sY = 0;
                }

                pX = sX * pixelStep;
                pY = sY * pixelStep;

                if ('deltaY' in event) { pY = event.deltaY; }
                if ('deltaX' in event) { pX = event.deltaX; }

                if ((pX || pY) && event.deltaMode) {
                    if (event.deltaMode == 1) {
                        pX *= lineHeight;
                        pY *= lineHeight;
                    } else {
                        pX *= pageHeight;
                        pY *= pageHeight;
                    }
                }

                if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
                if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

                return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
            };

            $body.on('wheel', function(event) {
                // Disable on <=small.
                if (breakpoints.active('<=small'))
                    return;

                // Prevent default.
                event.preventDefault();
                event.stopPropagation();

                // Stop link scroll.
                $main.stop();

                // Calculate delta, direction.
                var n = normalizeWheel(event.originalEvent),
                    x = (n.pixelX != 0 ? n.pixelX : n.pixelY),
                    delta = Math.min(Math.abs(x), 150) * settings.scrollWheel.factor,
                    direction = x > 0 ? 1 : -1;

                // Scroll page.
                $main.scrollLeft($main.scrollLeft() + (delta * direction));
            });
        })();

    // Scroll zones.
    if (settings.scrollZones.enabled)
        (function() {
            var $left = $('<div class="scrollZone left"></div>'),
                $right = $('<div class="scrollZone right"></div>'),
                $zones = $left.add($right),
                paused = false,
                intervalId = null,
                direction,
                activate = function(d) {
                    // Disable on <=small.
                    if (breakpoints.active('<=small'))
                        return;

                    // Paused? Bail.
                    if (paused)
                        return;

                    // Stop link scroll.
                    $main.stop();

                    // Set direction.
                    direction = d;

                    // Initialize interval.
                    clearInterval(intervalId);
                    intervalId = setInterval(function() {
                        $main.scrollLeft($main.scrollLeft() + (settings.scrollZones.speed * direction));
                    }, 25);
                },
                deactivate = function() {
                    // Unpause.
                    paused = false;

                    // Clear interval.
                    clearInterval(intervalId);
                };

            $zones
                .appendTo($wrapper)
                .on('mouseleave mousedown', function(event) {
                    deactivate();
                });

            $left
                .css('left', '0')
                .on('mouseenter', function(event) {
                    activate(-1);
                });

            $right
                .css('right', '0')
                .on('mouseenter', function(event) {
                    activate(1);
                });

            $body
                .on('---pauseScrollZone', function(event) {
                    paused = true;
                })
                .on('---unpauseScrollZone', function(event) {
                    paused = false;
                });
        })();

})(jQuery);