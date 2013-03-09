

test("data", function() {
    var d = document.createElement("<div data-test='lorem ipsum'>");
    var l = like.here(d);
    equal(l.data("test"), 'lorem ipsum', "get normal value");
    equal(l.data("wrong"), "toto");
});
