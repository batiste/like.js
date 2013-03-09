
test("data", function() {

    var d = document.createElement("div");

    d.innerHTML = "<span id='test1' data-test1='lorem ipsum' data-test2='json:[1,2]'></span>";
    document.body.appendChild(d);

    var span = like.here(like.byId("test1"));
    equal(span.data("test1"), 'lorem ipsum', "get normal value");
    equal(span.data("wrong"), undefined, "wrong data return undefined");

    span.data("test1", null);
    equal(span.data("test1"), undefined, "delete value");

    equal(span.data("test2")[0], 1, "get JSON");

    span.data("test1", {a:2, b:1});
    equal(span.data("test1").a, 2, "set JSON");

});

test("id", function() {

    var d = document.createElement("div");
    document.body.appendChild(d);
    var div = like.here(d);
    var id = div.id();

    notEqual(id, undefined, "has an id");
    notEqual(div.id(), undefined, "has an id");
    equal(div.id(), id, "id stay constant");

});


test("store", function() {

    var d = document.createElement("div");
    document.body.appendChild(d);

    var div = like.here(d);

    div.store("test1", 'lorem ipsum');
    equal(div.store("test1"), 'lorem ipsum', "get normal value");

    div.store("test2", function(){return 2;});
    equal(div.store("test2")(), 2, "get function");

});
