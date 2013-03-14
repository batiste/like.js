
module("1")

test("data", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='test-data' data-test1='lorem ipsum' data-test2='json:[1,2]'></span>";
    document.body.appendChild(d);

    ok(like.byId("test-data"), "Dom present")

    var span = like.byId("test-data");
    equal(span.data("test1"), 'lorem ipsum', "get normal value");
    equal(span.data("wrong"), undefined, "wrong data return undefined");

    span.data("test1", null);
    equal(span.data("test1"), undefined, "delete value");

    equal(span.data("test2").length, 2, "get JSON, test the list has the right length");
    equal(span.data("test2")[0], 1, "get JSON");

    span.data("test1", {a:2, b:1});
    equal(span.data("test1").a, 2, "set JSON");

    like.here(d).remove();

});

test("id", function() {

  var d = document.createElement("div");
  document.body.appendChild(d);
  var div = like.here(d);
  var id = div.id();

  notEqual(id, undefined, "has an id");
  notEqual(div.id(), undefined, "has an id");
  equal(div.id(), id, "id stay constant");

  div.remove();

});


test("store", function() {

    var d = document.createElement("div");
    document.body.appendChild(d);

    var div = like.here(d);

    div.store("test1", 'lorem ipsum');
    equal(div.store("test1"), 'lorem ipsum', "get normal value");

    div.store("test2", function(){return 2;});
    equal(div.store("test2")(), 2, "get function");

    div.remove();

});


test("trigger", function() {
    stop();

    var d = document.createElement("div");
    d.innerHTML = "<span class='like-local like-global'></span>";
    document.body.appendChild(d);
    var span = like.here(d).byTag("span");
    
    var local, global;
    like.a("local", "local", function(dom, event){
      local=true;
    });
    like.a("global", "global", function(dom, event){
      global=true;
    });

    span.trigger("local");
    like.trigger("global", {rain:document});

    setTimeout(function() {
      ok(local, "Custom local event should be called");
      ok(local, "Custom global event should be called");
      like.here(d).remove();
      start();
    }, 20);



});


test("wrapper", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='t1' class='test'></span><span id='t2' class='test'></span>";
    document.body.appendChild(d);

    var div = like.here(d);
    var wrapper = div.byClass("test");
  
    wrapper.store("hello", "world");

    equal(like.byId("t1").store("hello"), "world");
    equal(like.byId("t2").store("hello"), "world");

    div.remove();

});

test("insert", function() {

    var d = document.createElement("div");
    document.body.appendChild(d);
    d = like.here(d);

    var insertedCalled = false;
    like.an("inserted", "likeInsert", function() {
      insertedCalled = true;
    });

    d.html("<span id='t1' class='like-inserted'></span>");
    
    equal(true, insertedCalled);

    d.remove();
 
});

test("byClass chaining", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span class='test1'><span class='test3'></span></span><span class='test2'></span>";
    document.body.appendChild(d);

    var div = like.here(d);

    equal(div.byClass("test1").byClass("test3").el(0).className, "test3");
    equal(div.byClass("test2").byClass("test3").el(0), undefined);
    equal(div.byClass("test3").byClass("test1").el(0), undefined);
    equal(div.byClass("test2").el(0).className, "test2");

    div.remove();

});

test("rain", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span class='test1'><span class='test3 like-a'></span></span><span class='test2 like-b'></span>";
    document.body.appendChild(d);

    var div = like.here(d);

    var aCalled = false;
    like.a("a", "click", function(){aCalled=true});

    var bCalled = false;
    like.a("b", "click", function(){bCalled=true});

    div.rain({type:"click"});

    equal(bCalled, true);
    equal(aCalled, true);

    div.remove();

});

test("rain2", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span class='test1'><span class='test3 like-aa'></span></span><span class='test2 like-bb'></span>";
    document.body.appendChild(d);

    var c1 = like.here(like.here(d).byClass("test1").el(0));

    var aCalled = false;
    like.a("aa", "click", function(){aCalled=true});

    var bCalled = false;
    like.a("bb", "click", function(){bCalled=true});

    c1.rain({type:"click"});

    equal(aCalled, true);
    equal(bCalled, false);

    like.here(d).remove();

});
