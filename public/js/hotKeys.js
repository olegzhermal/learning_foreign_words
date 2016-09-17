Mousetrap.bind('s', function() {
    $('html, body').animate({
        scrollTop: $("#screen2").offset().top
    }, 500);
});

Mousetrap.bind('q', function() {
    $('html, body').animate({
        scrollTop: $("#screen1").offset().top
    }, 500);
});
