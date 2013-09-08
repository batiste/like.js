
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

    like.reset();
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

  like.reset();
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

    like.reset();
    div.remove();

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
    like.reset();

});

test("html", function() {

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
    like.reset();
 
});

test("text", function() {

    var d = document.createElement("div");
    document.body.appendChild(d);
    d = like.here(d);

    d.html("<span>HELLO <span>WORLD</span></span>");

    equal("HELLO WORLD", d.text());
    
    d.text("NOP");

    equal("NOP", d.text());

    d.remove();
    like.reset();
 
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
    like.reset();

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
    like.reset();

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
    like.reset();

});

test("multiple events", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span class='like-a'></span>";
    document.body.appendChild(d);

    var div = like.here(d);

    var aCalled = false;
    like.a("a", "click", function(){aCalled=true});

    var bCalled = false;
    like.a("a", "click", function(){bCalled=true});

    div.rain({type:"click"});

    equal(bCalled, true);
    equal(aCalled, true);

    div.remove();
    like.reset();

});


test("multiple class doesn't trigger things twice", function() {

    like.reset();
  
    var d = document.createElement("div");
    d.innerHTML = "<span class='like-a-b'></span><span class='like-a-c'></span>";
    document.body.appendChild(d);

    var div = like.here(d);

    var abCalled = 0;
    var acCalled = 0;
    
    like.a("a-b", "click", function(dom, event){
      abCalled=abCalled+1
    });

    equal(like.register["click"]["like-a-b"].length, 1, "only one callback registered");
  
    like.a("a-c", "click", function(dom, event){
      acCalled=acCalled+1
    });

    equal(like.register["click"]["like-a-b"].length, 1, "only one callback registered");
    equal(like.register["click"]["like-a-c"].length, 1, "only one callback registered");

    div.rain({type:"click"});

    equal(abCalled, 1);
    equal(acCalled, 1);
    
    function eventFire(el, etype) {
      if (el.fireEvent) {
        (el.fireEvent('on' + etype));
      } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
      }
    }
    
    var abCalled = 0;
    var acCalled = 0;
    
    eventFire(d.childNodes[0], "click");
    equal(abCalled, 1, "should be triggered once");
    equal(acCalled, 0, "should not be triggered");

    var abCalled = 0;
    var acCalled = 0;
    
    eventFire(d.childNodes[1], "click");
    equal(abCalled, 0, "should not be triggered");
    equal(acCalled, 1, "should be triggered once");

    div.remove();
    like.reset();

});


test("reset", function() {

    var called = false;
    like.a("a", "click", function(){called=true});
    equal(typeof like.register.click["like-a"][0], "function");
    like.reset();
    equal(like.register["click"], undefined);
    like.reset();

});


test("int attributes", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='t2' data-test='int:89' />";
    document.body.appendChild(d);

    var el = like.here(d).byId("t2");

    equal(el.data("test"), 89);
    equal(typeof el.data("test"), "number");

    like.here(d).remove();
    like.reset();

});

test("json attributes", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='t2' data-test='json:{\"a\":1, \"b\":2}' />";
    document.body.appendChild(d);

    var el = like.here(d).byId("t2");

    equal(el.data("test").b, 2);
    equal(el.data("test").a, 1);

    like.here(d).remove();
    like.reset();

});

test("clone", function() {

    var a = {b:2, v:[1,2,3]};
    var b = like.clone(a);

    equal(a.v[0], b.v[0]);
    a.v[0] = 2
    notEqual(a.v[0], b.v[0]);

});


test("hasClass", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='t2' class=' hasClass1\r\nhasClass2\r\nhasClass-3 ' />";
    document.body.appendChild(d);

    var el = like.here(like.here(d).byId("t2").el(0));

    ok(el.hasClass("hasClass1"));
    ok(el.hasClass("hasClass2"));
    ok(el.hasClass("hasClass-3"));

    like.here(d).remove();
    like.reset();

});

test("hasClass bug", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='t2' class='like-bubble' />";
    document.body.appendChild(d);

    var el = like.here(like.here(d).byId("t2").el(0));

    ok(el.hasClass("like-bubble"));
    ok(!el.hasClass("bubble-over"));

    el.addClass("bubble-over");

    ok(el.hasClass("like-bubble"));
    ok(el.hasClass("bubble-over"));

    like.here(d).remove();
    like.reset();

});

test("addClass / removeClass", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span id='t23'>";
    document.body.appendChild(d);

    var el = like.here(like.here(d).byId("t3").el(0));

    equal(el.scope.className, undefined);
    equal(el.hasClass("hasClass1"), false);
    el.removeClass("hasClass1");
    equal(el.scope.className, undefined);
    el.addClass("hasClass1");
    equal(el.hasClass("hasClass1"), true);
    el.removeClass("hasClass1");
    equal(el.hasClass("hasClass1"), false);
    equal(el.scope.className, "");

    like.here(d).remove();
    like.reset();

});


test("trigger", function() {
    stop();

    var d = document.createElement("div");
    d.innerHTML = "<span class='like-local like-global'></span>";
    document.body.appendChild(d);
    var span = like.here(d).byTag("span");
    
    var local, global;
    like.a("local", "local", function(dom, event) {
      local=true;
    });
    like.a("global", "global", function(dom, event) {
      global=true;
    });

    span.trigger("local");
    like.trigger("global", {rain:document});

    setTimeout(function() {
      ok(local, "Custom local event should be called");
      ok(local, "Custom global event should be called");
      like.here(d).remove();
      like.reset();
      start();
    }, 50);
    
    like.reset();

});



test("collection", function() {

    var d = document.createElement("div");
    d.innerHTML = "<span class='like-c2'></span><span id='test' class='like-c2'></span><span></span>";
    document.body.appendChild(d);
    var span = like.here(d).byTag("span");

    equal(3, span.elements.length);
    span.text("hello");
    equal(like.here(span.elements[0].childNodes[0]).text(), "hello");
    equal(like.here(span.elements[1].childNodes[0]).text(), "hello");

    var test = span.byId("test");
    equal("test", test.scope.id);

    var test = span.byClass("like-c2");
    equal(2, test.elements.length);

    like.here(d).remove();    
    like.reset();

});


