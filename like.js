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
hasClass = function (cls, dom) {
  var d = (dom || this.scope);
  var m = new RegExp("\\b" + cls + "\\b");
  return d.className && d.className.match(m);
},
byId = function(id, dom){return (dom || this.scope || doc).getElementById(id)},
byTag = function(tag, dom){return (dom || this.scope || doc).getElementsByTagName(tag)};
byClass = function(cls, dom) {
  var d = dom || this.scope || doc;
  // apparently faster
  if(d.getElementsByClassName) {return d.getElementsByClassName(cls)};
  if(d.querySelectorAll) {return d.querySelectorAll("."+cls)};
  // < IE8
  var accu = [];
  iterate(byTag("*"), function(el) {
    if(hasClass(cls, el)) {
      accu.push(el);
    }
  });
  return accu;
},
listenTo = function (event, listener, dom) {
  var d = dom || this.scope || doc;
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

function Like(scope) {
  // register of callback for every (class, event) couple
  this.register = {};
  // classes that have the like-insert event
  this.insertClasses = [];
  this.scope = scope || doc;
}

var proto = Like.prototype;
proto.byId = byId;
proto.byClass = byClass;
proto.byTag = byTag;
proto.iterate = iterate;
proto.hasClass = hasClass;
proto.listenTo = listenTo;
proto.toSring = function(){"Like("+this.scope.toString()+")"};

proto.addClass = function(cls, dom) {
  var d = dom || this.scope;
  if(!hasClass(cls, d)) {
    d.className = d.className + " " + cls;
  }
}

proto.removeClass = function(cls, dom) {
  var d = dom || this.scope;
  var m = new RegExp("\\b" + cls + "\\b");
  d.className = d.className.replace(m, "");
}

/**
 * Execute an event on the current target and bubble up
 *
 * @param {event} The event
 */
proto.execute = function(event) {
  var target = event.target, signature, that=this, response, fun;
  while(target) {
    if(!target.className || target.className.indexOf("like-") == -1) {
      target = target.parentNode;
      continue;
    }
    response = iterate(target.className.split(" "), function(cls) {
      if(cls.indexOf("like-") == 0) {
        signature = cls + "|" + event.type;
        if(that.register[signature]) {
           fun = that.register[signature];
           return fun.call(new Like(target), target, event);
        }
      }
    });
    if(response === false) {
      break;
    }
    target = target.parentNode;
  }
}

/**
 * Add a (className, eventName) couple to the event register. 
 * Execute like-init events.
 *
 * @param {className}  Class name upon to fire the event
 * @param {eventName}  The event name
 * @param {callback}   Callback defined by the user
 */
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
        callback.call(new Like(el), el, {type:"like-init", target:el});
      });
    }
  }
}

function eventDispatcher(obj) {
  return function(dom, event) {
    if(obj[event.type]) {
      return obj[event.type].call(new Like(dom), dom, event);
    }
  }
}

/**
 * Add behavior  to the event register. Execute like-init events.
 *
 * @param {name}       name of the behavior
 * @param {reactOn}    space separated list of events
 * @param {callback}   Callback defined by the user
 */
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

