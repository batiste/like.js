;(function(global) {

var doc = global.document, 
iterate = function (obj, fct) {
  var i;
  for(i=0; i<obj.length; i++) {
    if(fct(obj[i]) === false) {
      return false;
    }
  }
  // sucessful full iteration
  return true;
},
hasClass = function (dom, cls) {
  var m = new RegExp("\\b" + cls + "\\b");
  return dom.className && dom.className.match(m);
},
get = function(id){return doc.getElementById(id)},
byTag = function(tag, dom){return (dom || doc).getElementsByTagName(tag)};
byClass = function(cls, dom) {
  var d = (dom || doc);
  // apparently faster
  if(d.getElementsByClassName) {return d.getElementsByClassName(cls)};
  if(d.querySelectorAll) {return d.querySelectorAll("."+cls)};
  // < IE8
  var accu = [];
  iterate(byTag("*"), function(el) {
    if(hasClass(el, cls)) {
      accu.push(el);
    }
  });
  return accu;
},
listenTo = function (event, listener, dom) {
  var d = dom || doc;
  if(d.addEventListener) {
    d.addEventListener(event, listener, false);
  } else if(d.attachEvent) {
    d.attachEvent("on" + event, function(e) {
      // IE fix the target
      e.target = e.target || e.srcElement;
      return listener(e);
    });
  }
};

function Like() {
  // register of callback for every (class, event) couple
  this.register = {};
  // classes that have the like-insert event
  this.insertClasses = [];
}

var proto = Like.prototype;
proto.get = get;
proto.byClass = byClass;
proto.byTag = byTag;
proto.iterate = iterate;
proto.hasClass = hasClass;
proto.listenTo = listenTo;

proto.addClass = function(dom, cls) {
  if(!hasClass(dom, cls)) {
    dom.className = dom.className + " " + cls;
  }
}

proto.removeClass = function(dom, cls) {
  var m = new RegExp("\\b" + cls + "\\b");
  dom.className = dom.className.replace(m, "");
}

proto.execute = function(event) {
  var target = event.target, signature, that=this, response;
  while(target) {
    if(!target.className || target.className.indexOf("like-") == -1) {
      target = target.parentNode;
      continue;
    }
    response = iterate(target.className.split(" "), function(cls) {
      if(cls.indexOf("like-") == 0) {
        signature = cls + "|" + event.type;
        if(that.register[signature]) {
           return that.register[signature](target, event);      
        }
      }
    });
    if(response === false) {
      break;
    }
    target = target.parentNode;
  }
}

proto.addEvent = function(className, eventName, callback) {
  var signature = className + "|" + eventName, that=this;
  // only one event by signature allowed
  if(!this.register[signature]) {
    function listener(e) {
      return that.execute(e);
    }
    listenTo(eventName, listener);
    this.register[signature] = callback;
    if(eventName == "like-insert") {
      this.insertClasses.push(className);
    }
    if(eventName == "like-init") {
      iterate(byClass(className), function(el) {
        callback(el, {type:"like-init", target:el});
      });
    }
  }
}

function eventDispatcher(obj) {
  return function(dom, event) {
    if(obj[event.type]) {
      return obj[event.type](dom, event);
    }
  }
}

proto.a = proto.an = function(name, reactOn, callback) {
  var events = reactOn.split(" "), i, that=this;
  if(typeof callback !== "function") {
    callback = eventDispatcher(callback);
  }
  iterate(events, function(evt) {
    that.addEvent("like-"+name, evt, callback);
  });
}

proto.domInserted = function(dom) {
  var that = this, signature;
  iterate(this.insertClasses, function(cls) {
    // search for dom element matching those classes
    iterate(byClass(cls, dom), function(el) {
       signature = cls + "|like-insert";
       if(that.register[signature]) {
         that.register[signature](el, {type:"like-insert", target:el});
       }
    });
  });
}

proto.insert = function(dom, html) {
  dom.innerHTML = html;
  this.domInserted(dom);
}

proto.data = function(dom, key) {
  dom.getAttribute("data-" + key);
}

global.like = new Like();

}(this))

