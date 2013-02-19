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
  iterate(byTag("*", d), function(el) {
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
  // classes that have the likeInsert event
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
proto.toString = function(){return "Like("+this.scope.toString()+")"};

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
  var target = event.target, signature, that=this, complete, fun, ret;
  while(target) {
    if(!target.className || target.className.indexOf("like-") == -1) {
      target = target.parentNode;
      continue;
    }
    complete = iterate(target.className.split(" "), function(cls) {
      if(cls.indexOf("like-") == 0) {
        signature = cls + "|" + event.type;
        if(that.register[signature]) {
           fun = that.register[signature];
           ret = fun.call(new Like(target), target, event);
           if(ret === false) {
              event.preventDefault();
           }
           return ret;
        }
      }
    });
    if(complete === false) {
      break;
    }
    target = target.parentNode;
  }
}

/**
 * Add a (className, eventName) couple to the event register. 
 * Execute likeInit events.
 *
 * @param {className}  Class name upon to fire the event
 * @param {eventName}  The event name
 * @param {callback}   Callback defined by the user
 */
proto.addEvent = function(className, eventName, callback) {
  var signature = className + "|" + eventName, that=this;
  // only one event by signature is allowed
  if(!this.register[signature]) {
    function listener(e) {
      return that.execute(e);
    }
    listenTo(eventName, listener);
    this.register[signature] = callback;
    if(eventName == "likeInsert") {
      this.insertClasses.push(className);
    }
    if(eventName == "likeInit") {
      iterate(byClass(className), function(el) {
        callback.call(new Like(el), el, {type:"likeInit", target:el});
      });
    }
  }
}

/**
 * Add behavior  to the event register. Execute likeInit events.
 *
 * @param {name}       name of the behavior
 * @param {reactOn}    space separated list of events
 * @param {callback}   Callback defined by the user
 */
proto.a = proto.an = function(name, reactOn, obj) {
  var that=this, fun;
  iterate(reactOn.split(" "), function(evt) {
    if(typeof obj == "object") {
      if(obj[evt]) {
        that.addEvent("like-"+name, evt, obj[evt]);
      }
    } else {
      that.addEvent("like-"+name, evt, obj);
    }
  });
}

proto.domInserted = function(dom) {
  var that = this, signature;
  iterate(this.insertClasses, function(cls) {
    // search for dom element matching those classes
    iterate(byClass(cls, dom), function(el) {
       signature = cls + "|likeInsert";
       if(that.register[signature]) {
         that.register[signature](el, {type:"likeInsert", target:el});
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

if(!global.like) {
  global.like = new Like(doc);
}

}(this))

