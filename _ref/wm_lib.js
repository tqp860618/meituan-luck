!function(e) {
  'function' == typeof define && define.amd ? define(['zepto'], e) : e(Zepto);
}(function(e) {
  function n(e) {
    return u.raw ? e : encodeURIComponent(e);
  }

  function o(e) {
    return u.raw ? e : decodeURIComponent(e);
  }

  function t(e) {
    return n(u.json ? JSON.stringify(e) : String(e));
  }

  function i(e) {
    0 === e.indexOf('"') &&
    (e = e.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    try {
      e = decodeURIComponent(e.replace(c, ' '));
    } catch (n) {
      return;
    }
    try {
      return u.json ? JSON.parse(e) : e;
    } catch (n) {
    }
  }

  function r(n, o) {
    var t = u.raw ? n : i(n);
    return e.isFunction(o) ? o(t) : t;
  }

  var c = /\+/g,
      u = e.cookie = function(i, c, a) {
        if (void 0 !== c && !e.isFunction(c)) {
          if (a = e.extend({}, u.defaults, a), 'number' == typeof a.expires) {
            var d = a.expires,
                f = a.expires = new Date;
            f.setDate(f.getDate() + d);
          }
          return document.cookie = [
            n(i), '=', t(c),
            a.expires ? '; expires=' + a.expires.toUTCString() : '',
            a.path ? '; path=' + a.path : '',
            a.domain ? '; domain=' + a.domain : '',
            a.secure ? '; secure' : ''].join('');
        }
        for (var p = i ? void 0 : {}, s = document.cookie ?
            document.cookie.split('; ') :
            [], m = 0, v = s.length; v > m; m++) {
          var x = s[m].split('='),
              l = o(x.shift()),
              g = x.join('=');
          if (i && i === l) {
            p = r(g, c);
            break;
          }
          i || void 0 === (g = r(g)) || (p[l] = g);
        }
        return p;
      };
  u.defaults = {}, e.removeCookie = function(n, o) {
    return void 0 !== e.cookie(n) ? (e.cookie(n, '', e.extend({}, o, {
      expires: -1,
    })), !0) : !1;
  };
});
!function(i) {
  function e(i, e) {
    var o = this.os = {},
        a = this.browser = {},
        t = i.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
        r = i.match(/(Android);?[\s\/]+([\d.]+)?/),
        s = !!i.match(/\(Macintosh\; Intel /),
        h = i.match(/(iPad).*OS\s([\d_]+)/),
        c = i.match(/(iPod)(.*OS\s([\d_]+))?/),
        n = !h && i.match(/(iPhone\sOS)\s([\d_]+)/),
        d = i.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        m = /Win\d{2}|Windows/.test(e),
        l = i.match(/Windows Phone ([\d.]+)/),
        v = d && i.match(/TouchPad/),
        b = i.match(/Kindle\/([\d.]+)/),
        p = i.match(/Silk\/([\d._]+)/),
        S = i.match(/(BlackBerry).*Version\/([\d.]+)/),
        f = i.match(/(BB10).*Version\/([\d.]+)/),
        k = i.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
        w = i.match(/PlayBook/),
        P = i.match(/Chrome\/([\d.]+)/) || i.match(/CriOS\/([\d.]+)/),
        _ = i.match(/Firefox\/([\d.]+)/),
        u = i.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
        M = i.match(/MSIE\s([\d.]+)/) ||
            i.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
        O = !P && i.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
        T = O || i.match(
            /Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);
    (a.webkit = !!t) && (a.version = t[1]), r &&
    (o.android = !0, o.version = r[2]), n && !c &&
    (o.ios = o.iphone = !0, o.version = n[2].replace(/_/g, '.')), h &&
    (o.ios = o.ipad = !0, o.version = h[2].replace(/_/g, '.')), c &&
    (o.ios = o.ipod = !0, o.version = c[3] ?
        c[3].replace(/_/g, '.') :
        null), l && (o.wp = !0, o.version = l[1]), d &&
    (o.webos = !0, o.version = d[2]), v && (o.touchpad = !0), S &&
    (o.blackberry = !0, o.version = S[2]), f &&
    (o.bb10 = !0, o.version = f[2]), k &&
    (o.rimtabletos = !0, o.version = k[2]), w && (a.playbook = !0), b &&
    (o.kindle = !0, o.version = b[1]), p &&
    (a.silk = !0, a.version = p[1]), !p && o.android &&
    i.match(/Kindle Fire/) && (a.silk = !0), P &&
    (a.chrome = !0, a.version = P[1]), _ &&
    (a.firefox = !0, a.version = _[1]), u &&
    (o.firefoxos = !0, o.version = u[1]), M &&
    (a.ie = !0, a.version = M[1]), T && (s || o.ios || m) &&
    (a.safari = !0, o.ios || (a.version = T[1])), O &&
    (a.webview = !0), o.tablet = !!(h || w || r && !i.match(/Mobile/) || _ &&
        i.match(/Tablet/) || M && !i.match(/Phone/) &&
        i.match(/Touch/)), o.phone = !(o.tablet || o.ipod ||
        !(r || n || d || S || f || P && i.match(/Android/) || P &&
            i.match(/CriOS\/([\d.]+)/) || _ && i.match(/Mobile/) || M &&
            i.match(/Touch/)));
  }

  e.call(i, navigator.userAgent, navigator.platform), i.__detect = e;
}(Zepto);
!function() {
  function t(t, n) {
    return function() {
      var i = this._super;
      this._super = t;
      var r = n.apply(this, arguments);
      return this._super = i, r;
    };
  }

  var n = !1,
      i = /xyz/.test(function() {
      }) ? /\b_super\b/ : /.*/,
      r = function() {
      };
  r.extend = function(r) {
    function e() {
      !n && this.init && this.init.apply(this, arguments);
    }

    var s = this.prototype;
    n = !0;
    var u = new this;
    n = !1;
    for (var o in r) u[o] = 'function' == typeof r[o] &&
    'function' == typeof s[o] && i.test(r[o]) ? t(s[o], r[o]) : r[o];
    return e.prototype = u, e.constructor = e, e.extend = arguments.callee, e;
  }, window.Class = r;
}();
!function(n) {
  'function' == typeof define && define.amd ? define(n) : n();
}(function() {
  var n = {
    error: function(n) {
      window.Raven && Raven.captureMessage(n);
    },
  };
  return window.WmLog = n, window.$wm = window.$wm || {}, window.$wm.log = n, n;
});
!function(n) {
  'function' == typeof define && define.amd ? define(n) : n();
}(function() {
  var n = Class.extend({
    _events: null,
    init: function() {
      this._events = {};
    },
    on: function(n, e) {
      'function' == typeof e &&
      (this._events[n] || (this._events[n] = []), this._events[n].push(e));
    },
    off: function(n, e) {
      if (this._events[n]) {
        if (1 == arguments.length) return void(this._events[n] = null);
        for (var t, i = this._events[n], s = function() {
          for (var n = 0, t = i.length; t > n; n++)
            if (i[n] == e) return n;
          return -1;
        }; -1 != (t = s());) i.splice(t, 1);
      }
    },
    trigger: function(n) {
      if (this._events[n])
        for (var e = arguments.length > 1 ?
            Array.prototype.splice.call(arguments, 1) :
            [], t = this._events[n], i = 0; i < t.length; i++) t[i].apply(
            window, e);
    },
    has: function(n, e) {
      if (!this._events[n]) return !1;
      if (1 == arguments.length) return 0 == this._events[n].length ? !1 : !0;
      for (var t = this._events[n], i = 0, s = t.length; s > i; i++)
        if (t[i] == e) return !0;
      return !1;
    },
  });
  return window.WmEvent = n, window.$wm = window.$wm ||
      {}, window.$wm.Event = n, $wm.event = new n, n;
});
!function(e) {
  'function' == typeof define && define.amd ? define(['./WmLog'], e) : e(WmLog);
}(function(e) {
  var t = Class.extend({
        setItem: function() {
        },
        getItem: function() {
        },
        removeItem: function() {
        },
      }),
      o = Class.extend({
        _store: null,
        init: function(e) {
          this._store = 'sessionStorage' == e ? sessionStorage : localStorage;
        },
        setItem: function(e, t) {
          this._store.setItem(e, t);
        },
        getItem: function(e) {
          return this._store.getItem(e);
        },
        removeItem: function(e) {
          this._store.removeItem(e);
        },
      }),
      n = Class.extend({
        setItem: function(e, t) {
          $.cookie(e, t, {
            path: '/',
          });
        },
        getItem: function(e) {
          return $.cookie(e);
        },
        removeItem: function(e) {
          $.cookie(e, '', {
            path: '/',
            expires: -1,
          });
        },
      }),
      r = {
        supportTypes: [],
        init: function() {
          this.supportTypes = this.getSupportTypes();
        },
        getStore: function(e) {
          return e = this._getAvailableType(e), null == e ?
              new t :
              'cookie' == e ?
                  new n :
                  new o(e);
        },
        getSupportTypes: function() {
          for (var e = [], t = ['sessionStorage', 'localStorage'], o = 0; o <
          t.length; o++) {
            var n = t[o];
            try {
              var r = window[n];
              r &&
              (r.setItem('test', 'fortest'), 'fortest' == r.getItem('test') &&
              e.push(n), r.removeItem('test'));
            } catch (s) {
            }
          }
          try {
            $.cookie('test', 'fortest', {
              path: '/',
            }), 'fortest' == $.cookie('test') && e.push('cookie'), $.cookie(
                'test', '', {
                  path: '/',
                  expires: -1,
                });
          } catch (s) {
          }
          return e;
        },
        _getAvailableType: function(t) {
          function o(e, t) {
            for (var o = 0; o < t.length; o++)
              if (e == t[o]) return !0;
            return !1;
          }

          null == t && (t = 'localStorage');
          var n = this.supportTypes,
              r = null;
          return 'sessionStorage' == t && o('sessionStorage', n) ?
              r = 'sessionStorage' :
              'cookie' != t && o('localStorage', n) ?
                  r = 'localStorage' :
                  o('cookie', n) ?
                      r = 'cookie' :
                      e.error('No store can be used'), r;
        },
      };
  return r.init(), window.WmStoreFactory = r, window.$wm = window.$wm ||
      {}, window.$wm.StoreFactory = r, $wm.store = $wm.StoreFactory.getStore(), r;
});
!function(n) {
  'function' == typeof define && define.amd ?
      define(['./WmEvent'], n) :
      n(WmEvent);
}(function(n) {
  var t = Class.extend({
    __event: null,
    __initEvent: function() {
      null == this.__event && (this.__event = new n);
    },
    on: function(n, t) {
      return this.__initEvent(), this.__event.on(n, t);
    },
    off: function(n, t) {
      return this.__initEvent(), this.__event.off(n, t);
    },
    trigger: function() {
      return this.__initEvent(), this.__event.trigger.apply(this.__event,
          arguments);
    },
    hasEvent: function(n, t) {
      return this.__initEvent(), this.__event.has(n, t);
    },
  });
  return window.BaseClass = t, t;
});
!function(e, t, o, n) {
  var i = e(t),
      r = n,
      f = o.cookie.match(/webp=(\d)/);
  null == f ? !function() {
    var e = new Image;
    e.onload = e.onerror = function() {
      r = 2 === e.height;
      var t = new Date;
      t.setTime(t.getTime() + 4428e6), o.cookie = 'webp=' + (r ? 1 : 0) +
          ';expires=' + t.toGMTString(), e.onload = e.onerror = null, e = null;
    }, e.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }() : r = 1 == +f[1] ? !0 : !1, e.fn.lazyload = function(o) {
    function f() {
      var t = 0;
      a.each(function() {
        var o = e(this);
        if (!h.skip_invisible || 'none' !== o.css('display'))
          if (e.abovethetop(this, h) || e.leftofbegin(this, h)) ;
          else if (e.belowthefold(this, h) || e.rightoffold(this, h)) {
            if (++t > h.failure_limit) return !1;
          } else o.trigger('appear'), t = 0;
      });
    }

    var l, a = this,
        h = {
          threshold: 0,
          failure_limit: 0,
          event: 'scroll',
          effect: 'show',
          container: t,
          data_attribute: 'original',
          skip_invisible: !0,
          appear: null,
          load: null,
        };
    return o && (n !== o.failurelimit &&
    (o.failure_limit = o.failurelimit, delete o.failurelimit), n !==
    o.effectspeed &&
    (o.effect_speed = o.effectspeed, delete o.effectspeed), e.extend(h,
        o)), l = h.container === n || h.container === t ?
        i :
        e(h.container), 0 === h.event.indexOf('scroll') &&
    l.on(h.event, function() {
      return f();
    }), this.each(function() {
      var t, o = this,
          n = e(o);
      o.loaded = !1, n.one('appear', function() {
        if (!this.loaded) {
          if (h.appear) {
            var i = a.length;
            h.appear.call(o, i, h);
          }
          if (t = n.data(h.data_attribute), r) {
            var f = /(p0|p1)\.meituan\.net\/(.*)\.(jpg|jpeg|png)$/;
            f.test(t) && (t += '.webp');
          }
          e('<img />').on('load', function() {
            n.hide().attr('src', t)[h.effect](h.effect_speed), o.loaded = !0;
            var i = e.grep(a, function(e) {
              return !e.loaded;
            });
            if (a = e(i), h.load) {
              var r = a.length;
              h.load.call(o, r, h);
            }
          }).attr('src', t);
        }
      }), 0 !== h.event.indexOf('scroll') && n.on(h.event, function() {
        o.loaded || n.trigger('appear');
      });
    }), i.on('resize', function() {
      f();
    }), /iphone|ipod|ipad.*os 5/gi.test(navigator.appVersion) &&
    i.on('pageshow', function(t) {
      t = t.originalEvent || t, t.persisted && a.each(function() {
        e(this).trigger('appear');
      });
    }), e(t).on('load', function() {
      f();
    }), this;
  }, e.belowthefold = function(o, r) {
    var f;
    return f = r.container === n || r.container === t ?
        i.height() + i[0].scrollY :
        e(r.container).offset().top + e(r.container).height(), f <=
    e(o).offset().top - r.threshold;
  }, e.rightoffold = function(o, r) {
    var f;
    return f = r.container === n || r.container === t ?
        i.width() + i[0].scrollX :
        e(r.container).offset().left + e(r.container).width(), f <=
    e(o).offset().left - r.threshold;
  }, e.abovethetop = function(o, r) {
    var f;
    return f = r.container === n || r.container === t ?
        i[0].scrollY :
        e(r.container).offset().top, f >=
    e(o).offset().top + r.threshold + e(o).height();
  }, e.leftofbegin = function(o, r) {
    var f;
    return f = r.container === n || r.container === t ?
        i[0].scrollX :
        e(r.container).offset().left, f >=
    e(o).offset().left + r.threshold + e(o).width();
  }, e.inviewport = function(t, o) {
    return !(e.rightoffold(t, o) || e.leftofbegin(t, o) ||
        e.belowthefold(t, o) || e.abovethetop(t, o));
  }, e.extend(e.fn, {
    'below-the-fold': function(t) {
      return e.belowthefold(t, {
        threshold: 0,
      });
    },
    'above-the-top': function(t) {
      return !e.belowthefold(t, {
        threshold: 0,
      });
    },
    'right-of-screen': function(t) {
      return e.rightoffold(t, {
        threshold: 0,
      });
    },
    'left-of-screen': function(t) {
      return !e.rightoffold(t, {
        threshold: 0,
      });
    },
    'in-viewport': function(t) {
      return e.inviewport(t, {
        threshold: 0,
      });
    },
    'above-the-fold': function(t) {
      return !e.belowthefold(t, {
        threshold: 0,
      });
    },
    'right-of-fold': function(t) {
      return e.rightoffold(t, {
        threshold: 0,
      });
    },
    'left-of-fold': function(t) {
      return !e.rightoffold(t, {
        threshold: 0,
      });
    },
  });
}($, window, document);

function FastClick(t, e) {
  'use strict';

  function i(t, e) {
    return function() {
      return t.apply(e, arguments);
    };
  }

  var n;
  if (e = e ||
          {}, this.trackingClick = !1, this.trackingClickStart = 0, this.targetElement = null, this.touchStartX = 0, this.touchStartY = 0, this.lastTouchIdentifier = 0, this.touchBoundary = e.touchBoundary ||
          10, this.layer = t, this.tapDelay = e.tapDelay ||
          200, !FastClick.notNeeded(t)) {
    for (var o = [
      'onMouse',
      'onClick',
      'onTouchStart',
      'onTouchMove',
      'onTouchEnd',
      'onTouchCancel'], s = this, r = 0, c = o.length; c > r; r++) s[o[r]] = i(
        s[o[r]], s);
    deviceIsAndroid &&
    (t.addEventListener('mouseover', this.onMouse, !0), t.addEventListener(
        'mousedown', this.onMouse, !0), t.addEventListener('mouseup',
        this.onMouse, !0)), t.addEventListener('click', this.onClick,
        !0), t.addEventListener('touchstart', this.onTouchStart,
        !1), t.addEventListener('touchmove', this.onTouchMove,
        !1), t.addEventListener('touchend', this.onTouchEnd,
        !1), t.addEventListener('touchcancel', this.onTouchCancel,
        !1), Event.prototype.stopImmediatePropagation ||
    (t.removeEventListener = function(e, i, n) {
      var o = Node.prototype.removeEventListener;
      'click' === e ? o.call(t, e, i.hijacked || i, n) : o.call(t, e, i, n);
    }, t.addEventListener = function(e, i, n) {
      var o = Node.prototype.addEventListener;
      'click' === e ? o.call(t, e, i.hijacked || (i.hijacked = function(t) {
        t.propagationStopped || i(t);
      }), n) : o.call(t, e, i, n);
    }), 'function' == typeof t.onclick &&
    (n = t.onclick, t.addEventListener('click', function(t) {
      n(t);
    }, !1), t.onclick = null);
  }
}

var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0,
    deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent),
    deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent),
    deviceIsIOSWithBadTarget = deviceIsIOS &&
        /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);
FastClick.prototype.needsClick = function(t) {
  'use strict';
  switch (t.nodeName.toLowerCase()) {
    case 'button':
    case 'select':
    case 'textarea':
      if (t.disabled) return !0;
      break;
    case 'input':
      if (deviceIsIOS && 'file' === t.type || t.disabled) return !0;
      break;
    case 'label':
    case 'video':
      return !0;
  }
  return /\bneedsclick\b/.test(t.className);
}, FastClick.prototype.needsFocus = function(t) {
  'use strict';
  switch (t.nodeName.toLowerCase()) {
    case 'textarea':
      return !0;
    case 'select':
      return !deviceIsAndroid;
    case 'input':
      switch (t.type) {
        case 'button':
        case 'checkbox':
        case 'file':
        case 'image':
        case 'radio':
        case 'submit':
          return !1;
      }
      return !t.disabled && !t.readOnly;
    default:
      return /\bneedsfocus\b/.test(t.className);
  }
}, FastClick.prototype.sendClick = function(t, e) {
  'use strict';
  var i, n;
  document.activeElement && document.activeElement !== t &&
  document.activeElement.blur(), n = e.changedTouches[0], i = document.createEvent(
      'MouseEvents'), i.initMouseEvent(this.determineEventType(t), !0, !0,
      window, 1, n.screenX, n.screenY, n.clientX, n.clientY, !1, !1, !1, !1, 0,
      null), i.forwardedTouchEvent = !0, t.dispatchEvent(i);
}, FastClick.prototype.determineEventType = function(t) {
  'use strict';
  return deviceIsAndroid && 'select' === t.tagName.toLowerCase() ?
      'mousedown' :
      'click';
}, FastClick.prototype.focus = function(t) {
  'use strict';
  var e;
  deviceIsIOS && t.setSelectionRange && 0 !== t.type.indexOf('date') &&
  'time' !== t.type ?
      (e = t.value.length, t.setSelectionRange(e, e)) :
      t.focus();
}, FastClick.prototype.updateScrollParent = function(t) {
  'use strict';
  var e, i;
  if (e = t.fastClickScrollParent, !e || !e.contains(t)) {
    i = t;
    do {
      if (i.scrollHeight > i.offsetHeight) {
        e = i, t.fastClickScrollParent = i;
        break;
      }
      i = i.parentElement;
    } while (i);
  }
  e && (e.fastClickLastScrollTop = e.scrollTop);
}, FastClick.prototype.getTargetElementFromEventTarget = function(t) {
  'use strict';
  return t.nodeType === Node.TEXT_NODE ? t.parentNode : t;
}, FastClick.prototype.onTouchStart = function(t) {
  'use strict';
  var e, i, n;
  if (t.targetTouches.length > 1) return !0;
  if (e = this.getTargetElementFromEventTarget(
          t.target), i = t.targetTouches[0], deviceIsIOS) {
    if (n = window.getSelection(), n.rangeCount && !n.isCollapsed) return !0;
    if (!deviceIsIOS4) {
      if (i.identifier ===
          this.lastTouchIdentifier) return t.preventDefault(), !1;
      this.lastTouchIdentifier = i.identifier, this.updateScrollParent(e);
    }
  }
  return this.trackingClick = !0, this.trackingClickStart = t.timeStamp, this.targetElement = e, this.touchStartX = i.pageX, this.touchStartY = i.pageY, t.timeStamp -
  this.lastClickTime < this.tapDelay && t.preventDefault(), !0;
}, FastClick.prototype.touchHasMoved = function(t) {
  'use strict';
  var e = t.changedTouches[0],
      i = this.touchBoundary;
  return Math.abs(e.pageX - this.touchStartX) > i ||
  Math.abs(e.pageY - this.touchStartY) > i ? !0 : !1;
}, FastClick.prototype.onTouchMove = function(t) {
  'use strict';
  return this.trackingClick ?
      ((this.targetElement !== this.getTargetElementFromEventTarget(t.target) ||
          this.touchHasMoved(t)) &&
      (this.trackingClick = !1, this.targetElement = null), !0) :
      !0;
}, FastClick.prototype.findControl = function(t) {
  'use strict';
  return void 0 !== t.control ?
      t.control :
      t.htmlFor ?
          document.getElementById(t.htmlFor) :
          t.querySelector(
              'button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
}, FastClick.prototype.onTouchEnd = function(t) {
  'use strict';
  var e, i, n, o, s, r = this.targetElement;
  if (!this.trackingClick) return !0;
  if (t.timeStamp - this.lastClickTime <
      this.tapDelay) return this.cancelNextClick = !0, !0;
  if (this.cancelNextClick = !1, this.lastClickTime = t.timeStamp, i = this.trackingClickStart, this.trackingClick = !1, this.trackingClickStart = 0, deviceIsIOSWithBadTarget &&
      (s = t.changedTouches[0], r = document.elementFromPoint(s.pageX -
          window.pageXOffset, s.pageY - window.pageYOffset) ||
          r, r.fastClickScrollParent = this.targetElement.fastClickScrollParent), n = r.tagName.toLowerCase(), 'label' ===
      n) {
    if (e = this.findControl(r)) {
      if (this.focus(r), deviceIsAndroid) return !1;
      r = e;
    }
  } else if (this.needsFocus(r)) return t.timeStamp - i > 100 ||
  deviceIsIOS && window.top !== window && 'input' === n ?
      (this.targetElement = null, !1) :
      (this.focus(r), this.sendClick(r, t), deviceIsIOS && 'select' === n ||
      (this.targetElement = null, t.preventDefault()), !1);
  return deviceIsIOS && !deviceIsIOS4 &&
  (o = r.fastClickScrollParent, o && o.fastClickLastScrollTop !== o.scrollTop) ?
      !0 :
      (this.needsClick(r) || (t.preventDefault(), this.sendClick(r, t)), !1);
}, FastClick.prototype.onTouchCancel = function() {
  'use strict';
  this.trackingClick = !1, this.targetElement = null;
}, FastClick.prototype.onMouse = function(t) {
  'use strict';
  return this.targetElement ?
      t.forwardedTouchEvent ?
          !0 :
          t.cancelable &&
          (!this.needsClick(this.targetElement) || this.cancelNextClick) ?
              (t.stopImmediatePropagation ?
                  t.stopImmediatePropagation() :
                  t.propagationStopped = !0, t.stopPropagation(), t.preventDefault(), !1) :
              !0 :
      !0;
}, FastClick.prototype.onClick = function(t) {
  'use strict';
  var e;
  return this.trackingClick ?
      (this.targetElement = null, this.trackingClick = !1, !0) :
      'submit' === t.target.type && 0 === t.detail ?
          !0 :
          (e = this.onMouse(t), e || (this.targetElement = null), e);
}, FastClick.prototype.destroy = function() {
  'use strict';
  var t = this.layer;
  deviceIsAndroid &&
  (t.removeEventListener('mouseover', this.onMouse, !0), t.removeEventListener(
      'mousedown', this.onMouse, !0), t.removeEventListener('mouseup',
      this.onMouse, !0)), t.removeEventListener('click', this.onClick,
      !0), t.removeEventListener('touchstart', this.onTouchStart,
      !1), t.removeEventListener('touchmove', this.onTouchMove,
      !1), t.removeEventListener('touchend', this.onTouchEnd,
      !1), t.removeEventListener('touchcancel', this.onTouchCancel, !1);
}, FastClick.notNeeded = function(t) {
  'use strict';
  var e, i;
  if ('undefined' == typeof window.ontouchstart) return !0;
  if (i = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1]) {
    if (!deviceIsAndroid) return !0;
    if (e = document.querySelector('meta[name=viewport]')) {
      if (-1 !== e.content.indexOf('user-scalable=no')) return !0;
      if (i > 31 &&
          document.documentElement.scrollWidth <= window.outerWidth) return !0;
    }
  }
  return 'none' === t.style.msTouchAction ? !0 : !1;
}, FastClick.attach = function(t, e) {
  'use strict';
  return new FastClick(t, e);
}, 'undefined' != typeof define && define.amd ?
    define(function() {
      'use strict';
      return FastClick;
    }) :
    'undefined' != typeof module && module.exports ?
        (module.exports = FastClick.attach, module.exports.FastClick = FastClick) :
        window.FastClick = FastClick;
!function(n) {
  'use strict';

  function t() {
    f.gaGlobal ?
        n.TimeTracker && n.TimeTracker.lt ?
            e() :
            f.setTimeout(function() {
              t();
            }, m) :
        u > d ?
            e(a) :
            (f.setTimeout(function() {
              t();
            }, c), u += c);
  }

  function e(t) {
    if (!E) {
      var e = n.TimeTracker || {},
          a = f['_' + Date.now()] = new Image;
      n.HTTP_REFERER && (e.r = n.HTTP_REFERER), e.expire = t || 0, o(e), r(
          e), a.src = location.protocol + '//b.meituan.com/_.gif?' +
          i(e), E = !0;
    }
  }

  function o(t) {
    var e, o, r, i = [
          'navigationStart',
          'unloadEventStart',
          'unloadEventEnd',
          'redirectStart',
          'redirectEnd',
          'fetchStart',
          'domainLookupStart',
          'domainLookupEnd',
          'connectStart',
          'connectEnd',
          'secureConnectionStart',
          'requestStart',
          'responseStart',
          'responseEnd',
          'domLoading',
          'domInteractive',
          'domContentLoadedEventStart',
          'domContentLoadedEventEnd',
          'domComplete',
          'loadEventStart',
          'loadEventEnd'],
        a = [],
        c = Number.POSITIVE_INFINITY,
        d = f.performance;
    if (d) {
      if (d.timing) {
        for (r = d.timing, e = 0; e < i.length; e++) r[i[e]] ?
            (a[e] = r[i[e]], a[e] < c && (c = a[e])) :
            a[e] = -1;
        for (e = 0; e < i.length; e++) 'connectEnd' === i[e] ?
            a[e] = n.TimeTracker.rt - c :
            a[e] > 0 && (a[e] -= c);
        t.pt_start = c, t.pt_index = a.join(',');
      }
      d.navigation &&
      (o = d.navigation, t.pn_redirect = o.redirectCount, t.pn_type = o.type);
    }
  }

  function r(n) {
    n.page = p;
  }

  function i(n) {
    var t = [];
    for (var e in n) n &&
    t.push(encodeURIComponent(e) + '=' + encodeURIComponent(n[e]));
    return t.join('&');
  }

  var a = 1,
      c = 100,
      d = 15e3,
      m = 50,
      u = 0,
      E = !1,
      f = window,
      p = 'waimai_i_other';
  window.bLog = function(n) {
    p = n || p, t();
  };
}(MT_WM);
!function(e, t) {
  'object' == typeof exports && 'object' == typeof module ?
      module.exports = t() :
      'function' == typeof define && define.amd ?
          define([], t) :
          'object' == typeof exports ?
              exports.Owl = t() :
              e.Owl = t();
}(this, function() {
  return function(e) {
    function t(n) {
      if (r[n]) return r[n].exports;
      var i = r[n] = {
        exports: {},
        id: n,
        loaded: !1,
      };
      return e[n].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports;
    }

    var r = {};
    return t.m = e, t.c = r, t.p = '', t(0);
  }([
    function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in
                n && (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          a = r(1),
          o = r(7),
          s = r(9),
          c = r(12),
          u = r(15),
          f = r(17),
          g = r(19),
          p = r(20),
          h = r(21),
          l = r(22),
          d = r(23),
          v = r(14).version,
          y = r(11),
          m = r(6),
          w = function() {
            function e(t, r) {
              n(this, e);
              var i = new a(t);
              this.errManager = new c(i, this), this.pageManager = new f(
                  i), this.resManager = new u(i,
                  this.errManager), this.metricManager = new g(
                  i), this.cfgManager = i, this.init(), r && r.noFilter ||
              o(this.cfgManager);
            }

            return i(e, [
              {
                key: 'init',
                value: function() {
                  this.cfgManager.set({
                    ext: d.getExt(),
                  });
                },
              }, {
                key: 'config',
                value: function(e) {
                  this.cfgManager.set(e);
                },
              }, {
                key: 'addError',
                value: function(e, t) {
                  t && t.combo === !1 ?
                      this.errManager.report(e, t) :
                      this.cfgManager.get('error').combo === !1 ?
                          this.errManager.report(e, t) :
                          this.errManager.push(e, t);
                },
              }, {
                key: 'sendErrors',
                value: function() {
                  this.errManager.report();
                },
              }, {
                key: 'addPoint',
                value: function(e) {
                  this.pageManager.push(e);
                },
              }, {
                key: 'sendPoints',
                value: function() {
                  this.pageManager.setUserReady(), this.pageManager.report();
                },
              }, {
                key: 'addApi',
                value: function(e) {
                  if (e) {
                    if (void 0 !== e.networkCode &&
                        'number' != typeof e.networkCode) return m.ignore(
                        '网络状态码必须为Number类型', JSON.stringify(e));
                    if (void 0 !== e.statusCode &&
                        'number' != typeof e.statusCode) return m.ignore(
                        '业务状态码必须为Number类型', JSON.stringify(e));
                    var t = {
                      resourceUrl: e.name,
                      statusCode: (e.networkCode || '') + '|' +
                      (e.statusCode || ''),
                      responsetime: e.responseTime,
                    };
                    e.content &&
                    (t.firstCategory = y.AJAX, t.secondCategory = e.secondCategory ||
                        e.name, t.logContent = e.content), this.resManager.pushApi(
                        t);
                  }
                },
              }, {
                key: 'reportApi',
                value: function() {
                  this.addApi.apply(this, arguments);
                },
              }, {
                key: 'sendApis',
                value: function() {
                  this.resManager.report();
                },
              }, {
                key: 'updateFilter',
                value: function(e, t) {
                  void 0 === t ?
                      this.cfgManager.removeFilter(e) :
                      this.cfgManager.addFilter(e, t);
                },
              }, {
                key: 'wrap',
                value: function(e, t, r) {
                  if ('function' != typeof e) return e;
                  try {
                    if (e.__owl_wrapped__) return e;
                    if (e.__owl_wrapper__) return e.__owl_wrapper__;
                  } catch (t) {
                    return e;
                  }
                  var n = function() {
                    try {
                      return e.apply(t, arguments);
                    } catch (e) {
                      k.addError(e, r);
                    }
                  };
                  for (var i in e) e.prototype.hasOwnProperty(i) &&
                  (n[i] = e[i]);
                  return n.prototype = e.prototype, e.__owl_wrapper__ = n, n.__owl_wrapper__ = !0, n;
                },
              }]), e;
          }(),
          k = new w({}, {
            noFilter: !0,
          });
      k.OWL = w, k.__version__ = v, k.errorModel = s, k.MetricManager = g, k.start = function(e) {
        if (-1 !==
            window.navigator.userAgent.indexOf('Baiduspider')) return m.ignore(
            '当前环境被判断为百度爬虫，监控功能关闭');
        if (!this.isStarted) {
          this.isStarted = !0, k.cfgManager.set({
            pageUrl: window.location.href,
          }), e && (k.cfgManager.set(e), k.cfgManager.checkUpdate()), o(
              this.cfgManager), l(k.pageManager), p(k.errManager), h(
              k.resManager, k.errManager);
          var t = e.preLoadName || '_Owl_';
          if (window[t]) {
            window[t].isReady = !0;
            var n = window[t],
                i = n.config,
                a = n.preTasks,
                s = n.dataSet;
            k.cfgManager.set({
              autoCatch: i,
            }), a && a.length && (a.forEach(function(e) {
              k[e.api].apply(k, e.data);
            }), window[t].preTasks = []), setTimeout(function() {
              s && s.length && s.forEach(function(e) {
                e && 'jsError' === e.type ?
                    k.errManager.parseWindowError.apply(k.errManager, e.data) :
                    'resError' === e.type ?
                        k.resManager.parseResError.apply(k.resManager, e.data) :
                        'resTime' === e.type ?
                            k.resManager.parseRes.apply(k.resManager, e.data) :
                            'pageTime' === e.type &&
                            k.pageManager.parsePageTime.apply(k.pageManager,
                                e.data);
              }), window[t].dataSet = [];
            }, 0);
          }
          k.errManager.checkCache();
          var c = r(25);
          c('owl_sdk', k);
        }
      }, e.exports = k;
    }, function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = 'function' == typeof Symbol &&
          'symbol' == typeof Symbol.iterator ? function(e) {
            return typeof e;
          } : function(e) {
            return e && 'function' == typeof Symbol && e.constructor === Symbol &&
            e !== Symbol.prototype ? 'symbol' : typeof e;
          },
          a = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable ||
                    !1, n.configurable = !0, 'value' in n &&
                (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          o = r(2),
          s = r(3)(),
          c = r(4),
          u = r(6),
          f = window.location.protocol ? window.location.protocol : 'http:',
          g = f + '//catfront.dianping.com',
          p = f + '//catfront.51ping.com',
          h = 'owl_config',
          l = 36e5,
          d = function() {
            function e(t) {
              n(this, e), this.url = g, this.filters = [], this._config = {
                devMode: !1,
                project: '',
                pageUrl: '',
                disabledFilters: [],
                noScriptError: !0,
                ignoreList: {
                  js: [],
                  ajax: ['https?://report.meituan.com/'],
                  resource: ['https?://hls.dianping.com/'],
                },
                ext: {},
                resourceReg: /(.51ping|.dianping|.dpfile|.meituan|.sankuai|.maoyao|.kuxun)/,
                disableCache: !1,
                invalid: {
                  ajax: !0,
                },
                autoCatch: {
                  page: !0,
                  ajax: !0,
                  js: !0,
                  resource: !0,
                },
                ajax: {
                  flag: !1,
                  duration: 2e3,
                },
                image: {
                  flag: !1,
                  duration: 5e3,
                  fileSize: 100,
                  filter: function() {
                    return !1;
                  },
                },
                resource: {
                  sample: .1,
                  sampleApi: .1,
                  combo: !0,
                  delay: 1e3,
                },
                page: {
                  auto: !0,
                  sample: .5,
                },
                error: {
                  sample: 1,
                  delay: 1e3,
                  combo: !1,
                },
                metric: {
                  sample: .5,
                  combo: !0,
                  delay: 1500,
                },
              }, this.userConfig = {}, this.config = {}, t && this.set(t);
            }

            return a(e, [
              {
                key: 'removeFilter',
                value: function(e) {
                  for (var t = 0; t < this.filters.length; t++) {
                    var r = this.filters[t];
                    if (r.key === e) return void this.filters.splice(t, 1);
                  }
                },
              }, {
                key: 'addFilter',
                value: function(e, t) {
                  if (e && t instanceof Function &&
                      -1 === this.config.disabledFilters.indexOf(e)) {
                    for (var r = -1, n = 0; n < this.filters.length; n++) {
                      var i = this.filters[n];
                      i.key === e && (r = n, i.fn = t);
                    }
                    -1 === r && this.filters.push({
                      key: e,
                      fn: t,
                    });
                  }
                },
              }, {
                key: 'get',
                value: function(e) {
                  return e ? this.config[e] : this.config;
                },
              }, {
                key: 'set',
                value: function(e) {
                  for (var t in e)
                    if (e.hasOwnProperty(t)) {
                      if ('devMode' === t &&
                          (this.url = e[t] ? p : g), 'resourceReg' === t) try {
                        this.userConfig[t] = new RegExp(e[t]);
                      } catch (e) {
                        u.ignore(e);
                      }
                      this.userConfig[t] = 'object' !== i(e[t]) ||
                      e[t] instanceof RegExp || e[t] instanceof Array ?
                          e[t] :
                          o(this.userConfig[t], e[t]);
                    }
                  this.update();
                },
              }, {
                key: 'update',
                value: function() {
                  this.config = this._config;
                  for (var e in this.userConfig) {
                    var t = this.userConfig[e];
                    this.config[e] = 'object' !=
                    ('undefined' == typeof t ? 'undefined' : i(t)) ||
                    t instanceof RegExp || t instanceof Array ?
                        t :
                        o(this.config[e], this.userConfig[e]);
                  }
                },
              }, {
                key: 'reset',
                value: function() {
                  this.config = this._config;
                },
              }, {
                key: '_setDefault',
                value: function(e) {
                  e && (e.resourceReg &&
                  (e.resourceReg = new RegExp(e.resourceReg)), this._config = o(
                      this._config, e), this.update());
                },
              }, {
                key: 'checkUpdate',
                value: function() {
                  var e = this;
                  try {
                    var t = this.initFromCache();
                    if (t) {
                      var r = t.delay || l;
                      +new Date - t.ts > r || 0 === Object.keys(t).length ? c({
                        url: this.url + '/api/config',
                        success: function(t) {
                          t ?
                              (e.updateCache(t.config, t.md5,
                                  t.delay), e._setDefault(t.config)) :
                              e.clearCache();
                        },
                        fail: function() {
                          e._setDefault(t.config);
                        },
                      }) : this._setDefault(t.config);
                    }
                  } catch (e) {
                    u.ignore(e);
                  }
                },
              }, {
                key: 'updateCache',
                value: function(e, t, r) {
                  if (e) {
                    var n = {
                      config: e,
                      ts: +new Date,
                      md5: t,
                      delay: r || l,
                    };
                    if (s) try {
                      window.localStorage.setItem(h, JSON.stringify(n));
                    } catch (e) {
                      u.ignore(e);
                    }
                  }
                },
              }, {
                key: 'clearCache',
                value: function() {
                  if (s) try {
                    window.localStorage.removeItem(h);
                  } catch (e) {
                    u.ignore(e);
                  }
                },
              }, {
                key: 'initFromCache',
                value: function() {
                  var e = void 0;
                  if (s) try {
                    e = window.localStorage.getItem(h), e = e ?
                        JSON.parse(e) :
                        {};
                  } catch (t) {
                    e = {}, u.ignore(t);
                  }
                  return e;
                },
              }]), e;
          }();
      e.exports = d;
    }, function(e) {
      'use strict';
      e.exports = function(e, t) {
        var r = {},
            n = void 0;
        for (n in e) r[n] = e[n];
        for (n in t) t.hasOwnProperty(n) && void 0 !== t[n] && (r[n] = t[n]);
        return r;
      };
    }, function(e) {
      'use strict';
      e.exports = function() {
        var e = 'local_test';
        try {
          localStorage.setItem(e, 1), localStorage.removeItem(e);
        } catch (e) {
          return !1;
        }
        return !0;
      };
    }, function(e, t, r) {
      'use strict';
      var n = window,
          i = n.XMLHttpRequest,
          a = r(5),
          o = r(6),
          s = function() {
          },
          c = function() {
            if (i && !('_owl' in i)) {
              i._owl = !0;
              var e = n.location.protocol;
              if ('file:' !== e) {
                var t = i.prototype.open,
                    r = i.prototype.send;
                i.prototype.open = function(e, r) {
                  return this.url = r, this._startTime = +new Date, t.apply(
                      this, arguments);
                }, i.prototype.send = function() {
                  var e = 'addEventListener',
                      t = 'onreadystatechange',
                      n = function(e) {
                        if (e) {
                          var t = +new Date - n._startTime;
                          if (e.duration = t, /catfront.(dianping|51ping).com/.test(
                                  n.url)) {
                            var r = void 0;
                            try {
                              -1 !== n.getAllResponseHeaders('content-type').
                                  indexOf('application/json') &&
                              (r = e.currentTarget.response, r = JSON.parse(r));
                            } catch (n) {
                              o.ignore(n);
                            }
                            200 === e.currentTarget.status ?
                                n.success && n.success(r) :
                                n.fail && n.fail(r);
                          } else a.trigger('ajaxCall', e);
                        }
                      };
                  if (e in this) this[e]('load', n), this[e]('error',
                      n), this[e]('abort', n);
                  else {
                    var i = this[t];
                    this[t] = function(e) {
                      4 === this.readyState && n(e), i &&
                      i.apply(this, arguments);
                    };
                  }
                  return r.apply(this, arguments);
                };
              }
            }
          };
      c(), e.exports = function(e) {
        if (e) {
          var t = window.navigator.userAgent,
              r = window.navigator.appName,
              n = -1 !== r.indexOf('Microsoft Internet Explorer') &&
                  (-1 !== t.indexOf('MSIE 8.0') || -1 !==
                      t.indexOf('MSIE 9.0')),
              i = n && window.XDomainRequest,
              a = void 0;
          if (a = i ? new XDomainRequest : new XMLHttpRequest, a.open(e.type ||
                  'GET', e.url, !0), a.success = e.success ||
                  s, a.fail = e.fail || s, 'POST' === e.type) {
            if (e.header && !i)
              for (var o in e.header) e.header.hasOwnProperty(o) &&
              a.setRequestHeader(o, e.header[o]);
            a.send(e.data);
          } else a.send();
        }
      };
    }, function(e) {
      'use strict';
      e.exports = {
        on: function(e, t) {
          if (e) {
            this._events_ || (this._events_ = {});
            var r = this._events_;
            r[e] || (r[e] = []), r[e].push(t);
          }
        },
        trigger: function(e) {
          var t = this._events_;
          if (e && t && t[e])
            for (var r = t[e], n = r.length, i = Array.prototype.slice.call(
                arguments, 1), a = 0; n > a; a++) r[a].apply(this, i);
        },
      };
    }, function(e) {
      'use strict';
      e.exports = {
        ignore: function() {
          window._Owl_ && window._Owl_.debug && window.console.log &&
          window.console.log.apply(window.console, arguments);
        },
      };
    }, function(e, t, r) {
      'use strict';
      var n = r(8),
          i = window.navigator.userAgent;
      e.exports = function(e) {
        e.get('devMode') ||
        (e.addFilter('base', n.base), /MicroMessenger/.test(i) ?
            e.addFilter('weixin', n.weixin) :
            /dp\/com\.dianping/.test(i) && e.addFilter('dianping', n.dianping));
      };
    }, function(e) {
      'use strict';
      e.exports = {
        base: function(e) {
          return !e.resourceUrl ||
              /\.(dpfile|dianping|51ping|meituan)\.(com|net)/.test(
                  e.resourceUrl);
        },
        weixin: function(e) {
          return !/(WeixinJSBridge|_WXJS|WebViewJavascriptBridge)/.test(
              e.sec_category);
        },
        dianping: function(e) {
          return !/document.elementFromPoint/.test(e.sec_category);
        },
      };
    }, function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in
                n && (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          a = r(2),
          o = r(10),
          s = r(11),
          c = [
            'project',
            'pageUrl',
            'realUrl',
            'resourceUrl',
            'category',
            'sec_category',
            'level',
            'timestamp',
            'content'],
          u = ['rowNum', 'colNum', 'tags'].concat(c),
          f = function() {
            function e(t) {
              if (n(this, e), t) {
                var r = void 0;
                for (r in t) t.hasOwnProperty(r) && (this[r] = t[r]);
                this.parse(t);
              }
            }

            return i(e, [
              {
                key: 'parse',
                value: function() {
                  this.category || (this.category = s.SCRIPT), this.level ||
                  (this.level = o.ERROR), this.timestamp ||
                  (this.timestamp = +new Date), this.sec_category ||
                  (this.sec_category = 'default');
                },
              }, {
                key: 'isEqual',
                value: function(e) {
                  return this.sec_category === e.sec_category &&
                      this.resourceUrl === e.resourceUrl && this.colNum ===
                      e.colNum && this.rowNum === e.rowNum && this.content ===
                      e.content;
                },
              }, {
                key: 'update',
                value: function(e) {
                  for (var t in e) void 0 !== e[t] && -1 !== u.indexOf(t) &&
                  (this[t] = e[t]);
                  return this;
                },
              }, {
                key: 'updateTags',
                value: function(e) {
                  var t = a(this.tags || {}, e);
                  return this.tags = t, this;
                },
              }, {
                key: 'toJson',
                value: function() {
                  var e = this,
                      t = this.rowNum,
                      r = this.colNum,
                      n = {};
                  return c.map(function(t) {
                    void 0 !== e[t] && (n[t] = e[t]);
                  }), n.category === s.SCRIPT && t && r && (n.dynamicMetric = {
                    rowNum: t,
                    colNum: r,
                  }), this.tags &&
                  (n.dynamicMetric = a(n.dynamicMetric || {}, this.tags)), n;
                },
              }]), e;
          }();
      f.LEVEL = o, f.CATEGORY = s, e.exports = f;
    }, function(e) {
      'use strict';
      e.exports = {
        ERROR: 'error',
        INFO: 'info',
        WARN: 'warn',
        DEBUG: 'debug',
      };
    }, function(e) {
      'use strict';
      e.exports = {
        SCRIPT: 'jsError',
        AJAX: 'ajaxError',
        RESOURCE: 'resourceError',
      };
    }, function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = 'function' == typeof Symbol &&
          'symbol' == typeof Symbol.iterator ? function(e) {
            return typeof e;
          } : function(e) {
            return e && 'function' == typeof Symbol && e.constructor === Symbol &&
            e !== Symbol.prototype ? 'symbol' : typeof e;
          },
          a = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable ||
                    !1, n.configurable = !0, 'value' in n &&
                (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          o = r(4),
          s = r(2),
          c = r(9),
          u = r(13),
          f = r(14).version,
          g = r(11),
          p = r(6),
          h = function(e) {
            var t = e.stack.replace(/\n/gi, '').
                    split(/\bat\b/).
                    slice(0, 9).
                    join('@').
                    replace(/\?[^:]+/gi, ''),
                r = e.toString();
            return t.indexOf(r) < 0 && (t = r + '@' + t), t;
          },
          l = '/api/log?v=1&sdk=' + f,
          d = function() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ?
                arguments[0] :
                {};
            e && e.data && (e.beforeSend && e.beforeSend(), o({
              type: 'POST',
              url: e.url,
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              data: 'c=' + encodeURIComponent(JSON.stringify(e.data)),
              success: e.success,
              fail: e.fail,
            }));
          },
          v = function() {
            function e(t, r) {
              n(this,
                  e), this.parent = r, this.cfgManager = t, this.cache = [], this.comboTimeout = 0, this.detectLeave();
            }

            return a(e, [
              {
                key: 'getPageUrl',
                value: function() {
                  return window.location.href;
                },
              }, {
                key: '_handleError',
                value: function(e) {
                  try {
                    var t = this.cfgManager.get('onErrorPush');
                    if (t instanceof Function && (e = t(e)), e instanceof c ||
                        void 0 === e) return e;
                    p.ignore('onErrorPush方法返回结果有误');
                  } catch (t) {
                    return p.ignore('onErrorPush方法处理有误', t), e;
                  }
                },
              }, {
                key: 'parseWindowError',
                value: function(e, t, r, n, i) {
                  try {
                    i && i.stack ?
                        this.push(i) :
                        'string' == typeof e && this._push({
                          category: g.SCRIPT,
                          sec_category: e,
                          resourceUrl: t,
                          rowNum: r,
                          colNum: n,
                        });
                  } catch (e) {
                    this.reportSystemError(e);
                  }
                },
              }, {
                key: 'parsePromiseUnhandled',
                value: function(e) {
                  if (e) try {
                    var t = e.reason;
                    t && this._push({
                      category: g.SCRIPT,
                      sec_category: 'unhandledrejection',
                      content: t,
                    });
                  } catch (e) {
                    p.ignore(e);
                  }
                },
              }, {
                key: 'detectLeave',
                value: function() {
                  var e = this,
                      t = arguments,
                      r = window.onbeforeunload;
                  window.onbeforeunload = function() {
                    e.cfgManager.get('disableCache') || u.add(e.cache), r &&
                    r.apply(e, t);
                  };
                },
              }, {
                key: 'checkCache',
                value: function() {
                  var e = this,
                      t = u.get();
                  t && t.length && setTimeout(function() {
                    d({
                      url: e.cfgManager.url + l,
                      data: t,
                      success: function() {
                        u.clear();
                      },
                    });
                  }, 1500);
                },
              }, {
                key: 'reportSystemError',
                value: function(e) {
                  var t = this;
                  e && e.stack && (this.cache.push(new c({
                    project: 'owl',
                    pageUrl: 'default',
                    realUrl: t.getPageUrl(),
                    sec_category: e.msg || e.name || 'parseError',
                    content: JSON.stringify(e.stack),
                  })), this.send(!0));
                },
              }, {
                key: '_processError',
                value: function(e) {
                  var t = function(e) {
                        var t = 'object' ===
                        ('undefined' == typeof e ? 'undefined' : i(e)) ?
                            JSON.stringify(e) :
                            e;
                        return {
                          category: g.SCRIPT,
                          sec_category: 'Invalid_Error',
                          content: t,
                        };
                      },
                      r = function(e) {
                        var r = e.line,
                            n = e.column,
                            i = e.message || e.name || '';
                        if (e.stack) {
                          var a = e.stack.match('https?://[^\n]+');
                          a = a ? a[0] : '';
                          var o = /https?:\/\/(\S)*\.js/,
                              s = '';
                          o.test(a) && (s = a.match(o)[0]);
                          var c = a.match(':(\\d+):(\\d+)');
                          c || (c = [0, 0, 0]);
                          var u = h(e);
                          return {
                            category: g.SCRIPT,
                            sec_category: i,
                            content: u,
                            rowNum: void 0 !== r ? r : c[1],
                            colNum: void 0 !== n ? n : c[2],
                            resourceUrl: s,
                          };
                        }
                        return t(e);
                      };
                  try {
                    return r(e);
                  } catch (r) {
                    return this.reportSystemError(e), t(e);
                  }
                },
              }, {
                key: '_push',
                value: function(e, t) {
                  e = this.parse(e), this.push(new c(e), t);
                },
              }, {
                key: '_pushResource',
                value: function() {
                  var e = this.cfgManager.get('resource').sample;
                  Math.random() > e || this._push.apply(this, arguments);
                },
              }, {
                key: 'parse',
                value: function(e) {
                  return e.project ||
                  (e.project = this.cfgManager.get('project')), e.pageUrl ||
                  (e.pageUrl = this.cfgManager.get('pageUrl') ||
                      'default'), e.realUrl = this.getPageUrl(), e;
                },
              }, {
                key: 'push',
                value: function(e) {
                  var t = arguments.length > 1 && void 0 !== arguments[1] ?
                      arguments[1] :
                      {},
                      r = this.cfgManager;
                  if (e && !(Math.random() > r.get('error').sample)) {
                    e instanceof c || (e instanceof Error ?
                        e = this._processError(e) :
                        'string' == typeof e ?
                            e = {
                              sec_category: e,
                            } :
                            'object' ===
                            ('undefined' == typeof e ? 'undefined' : i(e)) &&
                            (e = {
                              sec_category: e.name,
                              content: e.msg,
                            }), e = this.parse(e), e = new c(e)), e.update(t);
                    var n = r.filters,
                        a = !0;
                    if (this.cfgManager.get('noScriptError') && 0 ===
                        e.sec_category.indexOf('Script error')) return a = !1;
                    if (n && n.length)
                      for (var o = 0; o < n.length; o++) {
                        var s = n[o];
                        if (!s.fn(e)) return a = !1;
                      }
                    var u = r.get('ignoreList').js;
                    if (u && u.length)
                      for (var f = 0; f < u.length; f++) {
                        var g = u[f];
                        if (0 === e.sec_category.indexOf(g)) return a = !1;
                      }
                    a && (this.isExist(e) ||
                        (this.onPush && this.onPush(e), e = this._handleError(
                            e), e && (this.cache.push(e), this.send())));
                  }
                },
              }, {
                key: 'isExist',
                value: function(e) {
                  for (var t = 0; t < this.cache.length; t++) {
                    var r = this.cache[t];
                    if (r instanceof c || (r = new c(r)), r.isEqual(
                            e)) return !0;
                  }
                  return !1;
                },
              }, {
                key: 'report',
                value: function() {
                  this.push.apply(this, arguments), this.send(!0);
                },
              }, {
                key: 'send',
                value: function(e) {
                  var t = this,
                      r = this.cfgManager,
                      n = this.comboTimeout,
                      i = function() {
                        if (t.cache.length) {
                          clearTimeout(n), n = 0, t.onSubmit &&
                          t.onSubmit(t.cache);
                          var e = t.getCache();
                          d({
                            url: t.cfgManager.url + l,
                            data: e,
                            beforeSend: function() {
                              t.nextCache = e, t.cache = [];
                            },
                            success: function() {
                              t.nextCache = [];
                            },
                            fail: function() {
                              t.cfgManager.get('disableCache') ||
                              u.add(t.nextCache);
                            },
                          });
                        }
                      },
                      a = r.get('error').delay;
                  e ? i() : n || -1 === a || (n = setTimeout(i, a));
                },
              }, {
                key: 'getCache',
                value: function() {
                  var e = this.cfgManager,
                      t = this.cache,
                      r = [],
                      n = e.get('ext');
                  if (t && t.length) {
                    for (var a = 0; a < t.length; a++) {
                      var o = t[a];
                      n && 'object' ===
                      ('undefined' == typeof n ? 'undefined' : i(n)) &&
                      (o = s(o.toJson(), n)), r.push(o);
                    }
                    return r;
                  }
                },
              }]), e;
          }();
      e.exports = v;
    }, function(e, t, r) {
      'use strict';
      var n = 'owl_cache',
          i = r(3),
          a = r(6);
      e.exports = {
        isSupport: i(),
        get: function() {
          if (this.isSupport) {
            var e = [];
            try {
              var t = localStorage.getItem(n);
              t && (e = JSON.parse(t));
            } catch (e) {
              a.ignore(e);
            }
            return e;
          }
        },
        add: function(e) {
          if (this.isSupport && e instanceof Array) {
            var t = this.get();
            e = e.concat(t);
            try {
              localStorage.setItem(n, JSON.stringify(e));
            } catch (e) {
              a.ignore(e);
            }
          }
        },
        clear: function() {
          if (this.isSupport) try {
            localStorage.removeItem(n);
          } catch (e) {
            a.ignore(e);
          }
        },
      };
    }, function(e, t) {
      'use strict';
      t.version = '1.5.16';
    }, function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in
                n && (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          a = r(4),
          o = r(16),
          s = r(14).version,
          c = r(11),
          u = r(5),
          f = r(6),
          g = {
            region: 1,
            operator: 2,
            network: 3,
            container: 4,
            os: 5,
          },
          p = 10,
          h = window.performance && void 0 !== window.performance.getEntries,
          l = function(e) {
            var t = e.split('//');
            return t && t.length > 1 ?
                t[0] + '//' + t[1].split('/')[0] + '/images' :
                void 0;
          },
          d = function() {
            function e(t, r) {
              n(this,
                  e), this.cfgManager = t, this.errManager = r, this.cache = [], this.comboTimeout = 0;
            }

            return i(e, [
              {
                key: 'parseAjax',
                value: function(e) {
                  var t = void 0,
                      r = void 0,
                      n = void 0,
                      i = void 0,
                      a = void 0;
                  try {
                    t = e.type, r = e.currentTarget.responseURL ||
                        e.currentTarget.url, n = e.duration, i = e.total, a = e.currentTarget.status;
                  } catch (e) {
                    return e;
                  }
                  if (void 0 !== n && !isNaN(n)) {
                    var o = 'load' === t || 'readystatechange' === t && 200 ===
                        a;
                    0 === r.indexOf('//') ?
                        r = window.location.protocol + r :
                        0 === r.indexOf('/') &&
                        (r = window.location.origin + r), a = (o ? 200 : 500) +
                        '|';
                    var s = this.cfgManager,
                        u = !0;
                    try {
                      var g = s.get('ignoreList').ajax;
                      if (g)
                        for (var p = 0; p < g.length; p++) {
                          var h = g[p],
                              l = new RegExp(h);
                          if (l.test(r)) return void(u = !1);
                        }
                    } catch (e) {
                      f.ignore(e);
                    }
                    if (u) {
                      var d = s.get('devMode') || s.get('resourceReg').test(r);
                      d ?
                          !s.get('ajax').flag || n < s.get('ajax').duration ?
                              this.pushApi({
                                resourceUrl: r,
                                responsetime: n,
                                responsebyte: i,
                                statusCode: a,
                                firstCategory: o ? '' : c.AJAX,
                              }) :
                              this.errManager.push({
                                name: 'TIMEOUT_AJAX',
                                msg: 'ajax请求时间超过设定' + r,
                              }, {
                                category: c.AJAX,
                              }) :
                          s.get('invalid').ajax && Math.random() < .1 &&
                          this.errManager.push({
                            name: 'INVALID_AJAX',
                            msg: r,
                          }, {
                            category: c.AJAX,
                          });
                    }
                  }
                },
              }, {
                key: 'parseRes',
                value: function() {
                  var e = this;
                  try {
                    if (h) {
                      var t = window.performance.getEntries(),
                          r = t,
                          n = [],
                          i = function(e) {
                            return e.filter(function(e) {
                              return -1 !==
                                  ['link', 'script', 'img', 'css'].indexOf(
                                      e.initiatorType);
                            });
                          },
                          a = function(e) {
                            for (var t = h.cfgManager, r = 0; r <
                            e.length; r++) {
                              var i = e[r],
                                  a = i.name,
                                  o = t.get('ignoreList').resource,
                                  s = !0;
                              try {
                                for (var u = 0; u < o.length; u++) {
                                  var g = o[u],
                                      p = new RegExp(g);
                                  if (p.test(a)) return void(s = !1);
                                }
                              } catch (h) {
                                f.ignore(h);
                              }
                              if (!s) return;
                              if (t.get('devMode') ||
                                  t.get('resourceReg').test(a)) {
                                n.push(a);
                                var l = '200|',
                                    d = t.get('image'),
                                    v = !1;
                                if (('img' === i.initiatorType || 'css' ===
                                        i.initiatorType) && d.flag) {
                                  var y = i.name,
                                      m = d.filter;
                                  if ('function' == typeof m && !m(y)) {
                                    var w = i.transferSize,
                                        k = i.duration,
                                        b = void 0;
                                    w && w > 1e3 * d.fileSize ?
                                        b = 'IMAGE_SIZE_EXCEED' :
                                        k && k > d.duration &&
                                        (b = 'IMAGE_DURATION_EXCEED'), b &&
                                    (h.errManager._pushResource({
                                      content: y,
                                      sec_category: b,
                                    }, {
                                      category: c.RESOURCE,
                                    }), v = !0);
                                  }
                                }
                                v || h.push({
                                  resourceUrl: a,
                                  responsebyte: i.transferSize,
                                  responsetime: i.duration,
                                  statusCode: l,
                                });
                              }
                            }
                            h.report();
                          };
                      a(i(t)), u.on('ajaxCall', function() {
                        setTimeout(function() {
                          var e = window.performance.getEntries();
                          if (e = i(e), e.length !== r.length &&
                              e.length > r.length) {
                            for (var t = [], o = 0; o < e.length; o++) -1 ===
                            n.indexOf(e[o].name) && t.push(e[o]);
                            r = e, a(t);
                          }
                        }, 1500);
                      });
                    }
                  } catch (e) {
                    this.errManager.reportSystemError(e);
                  }
                },
              }, {
                key: 'parseResError',
                value: function(e) {
                  var t = this,
                      r = e.target || e.srcElement,
                      n = function() {
                        var e = r.src || r.href,
                            n = r.nodeName;
                        if (n && (n = n.toLowerCase()), 0 !==
                            window.location.href.indexOf(e)) {
                          var i = e;
                          'img' === n && (i = l(e)), i && (h ? t.pushApi({
                            resourceUrl: i,
                            responsetime: 0,
                            responsebyte: 0,
                            statusCode: '500|',
                            firstCategory: c.RESOURCE,
                            secondCategory: n,
                            logContent: e,
                          }) : t.errManager._pushResource({
                            category: c.RESOURCE,
                            sec_category: n,
                            content: e,
                          }));
                        }
                      };
                  if (!(r instanceof Window || e.error)) try {
                    n();
                  } catch (e) {
                    this.errManager.reportSystemError(e);
                  }
                },
              }, {
                key: '_stringify',
                value: function() {
                  var e = this.cache;
                  if (e && e.length) {
                    var t = [],
                        r = this.cfgManager.get('ext'),
                        n = [];
                    for (var i in r) r.hasOwnProperty(i) && (n[g[i]] = r[i]);
                    r = 'S	' + n.join('	'), t.push(r);
                    for (var a = 0; a < e.length; a++) {
                      var o = e[a];
                      t.push(o.stringify());
                    }
                    return this.cache = [], t = t.join('\n');
                  }
                },
              }, {
                key: '_push',
                value: function(e) {
                  e = this.parse(e);
                  var t = new o(e);
                  this.onPush && this.onPush(t), this.cache.push(t);
                },
              }, {
                key: 'push',
                value: function(e) {
                  var t = this.cfgManager;
                  Math.random() > t.get('resource').sample ||
                  (this._push(e), this.cache.length >= p ?
                      this.report(!0) :
                      this.triggerReport());
                },
              }, {
                key: 'parse',
                value: function(e) {
                  return e.pageUrl ||
                  (e.pageUrl = this.cfgManager.get('pageUrl')), e.project ||
                  (e.project = this.cfgManager.get('project')), e;
                },
              }, {
                key: 'pushApi',
                value: function(e) {
                  var t = this.cfgManager;
                  Math.random() > t.get('resource').sampleApi ||
                  (this._push(e), this.triggerReport());
                },
              }, {
                key: 'report',
                value: function() {
                  this.triggerReport(!0);
                },
              }, {
                key: 'triggerReport',
                value: function(e) {
                  var t = this,
                      r = this.cfgManager;
                  if (this.cache.length) {
                    var n = function() {
                          clearTimeout(
                              t.comboTimeout), t.comboTimeout = 0, t.onSubmit &&
                          t.onSubmit(t.cache), t.send();
                        },
                        i = r.get('resource').delay;
                    e ?
                        this.send() :
                        this.comboTimeout || -1 === i ||
                        (this.comboTimeout = setTimeout(n, i));
                  }
                },
              }, {
                key: 'send',
                value: function() {
                  this.onSubmit && this.onSubmit(this.cache);
                  var e = this._stringify();
                  if (e) {
                    var t = this.cfgManager.url + '/api/batch?v=1&sdk=' + s;
                    a({
                      type: 'POST',
                      url: t,
                      header: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      data: 'c=' + encodeURIComponent(e),
                    }), this.cache = [];
                  }
                },
              }]), e;
          }();
      e.exports = d;
    }, function(e) {
      'use strict';

      function t(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var r = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in
                n && (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          n = [
            'resourceUrl',
            'timestamp',
            'requestbyte',
            'responsebyte',
            'responsetime',
            'project',
            'pageUrl',
            'statusCode',
            'firstCategory',
            'secondCategory',
            'logContent'],
          i = function() {
            function e(r) {
              var i = this;
              t(this, e), n.forEach(function(e) {
                i[e] = r[e];
              }), this.parse();
            }

            return r(e, [
              {
                key: 'parse',
                value: function() {
                  this.timestamp ||
                  (this.timestamp = +new Date), this.requestbyte ||
                  (this.requestbyte = 0), this.responsebyte ||
                  (this.responsebyte = 0);
                },
              }, {
                key: 'stringify',
                value: function() {
                  var e = this,
                      t = n.map(function(t) {
                        return e[t];
                      });
                  return t.join('	');
                },
              }]), e;
          }();
      e.exports = i;
    }, function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in
                n && (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          a = r(4),
          o = r(18),
          s = r(2),
          c = r(14).version,
          u = function() {
            function e(t) {
              n(this,
                  e), this.points = [], this.pointsCustom = [], this.cfgManager = t;
            }

            return i(e, [
              {
                key: 'setUserReady',
                value: function() {
                  this.cfgManager.set({
                    page: {
                      auto: !0,
                    },
                  });
                },
              }, {
                key: 'getUserReady',
                value: function() {
                  return this.cfgManager.get('page').auto;
                },
              }, {
                key: 'setReady',
                value: function() {
                  this.isReady = !0;
                },
              }, {
                key: 'getReady',
                value: function() {
                  return this.isReady;
                },
              }, {
                key: 'parsePageTime',
                value: function(e) {
                  if (!e) return this.setReady();
                  var t = e.navigationStart,
                      r = {
                        unloadEventStart: 1,
                        unloadEventEnd: 2,
                        redirectStart: 3,
                        redirectEnd: 4,
                        fetchStart: 5,
                        domainLookupStart: 6,
                        domainLookupEnd: 7,
                        connectStart: 8,
                        connectEnd: 9,
                        requestStart: 10,
                        responseStart: 11,
                        responseEnd: 12,
                        domLoading: 13,
                        domInteractive: 14,
                        domContentLoadedEventStart: 15,
                        domContentLoadedEventEnd: 16,
                        domComplete: 17,
                        loadEventStart: 18,
                        loadEventEnd: 19,
                      },
                      n = void 0;
                  for (n in e) this.points[r[n]] = 0 === e[n] ? e[n] : e[n] - t;
                  this.points[20] = e.domainLookupEnd -
                      e.domainLookupStart, this.points[21] = e.connectEnd -
                      e.connectStart, this.points[22] = e.responseEnd -
                      e.requestStart;
                  for (var i = 0; i < this.points.length; i++) isNaN(
                      this.points[i]) && (this.points[i] = 0);
                  this.setReady(), this.report();
                },
              }, {
                key: 'push',
                value: function(e) {
                  this.onPush && this.onPush(e), e &&
                  'number' == typeof e.position &&
                  (e.position < 0 || e.position > 31 ||
                      (this.pointsCustom[e.position] = e.duration));
                },
              }, {
                key: 'report',
                value: function() {
                  var e = this.cfgManager;
                  if (this.getReady() && this.getUserReady() &&
                      (this.points.length || this.pointsCustom.length) &&
                      !(Math.random() > e.get('page').sample)) {
                    this.onSubmit &&
                    this.onSubmit(this.points, this.pointsCustom);
                    var t = e.url + '/api/speed?v=1',
                        r = e.get('ext');
                    r = s({
                      project: e.get('project'),
                      pageurl: encodeURIComponent(e.get('pageUrl')),
                      speed: this.points.join('|'),
                      customspeed: this.pointsCustom.join('|'),
                      timestamp: +new Date,
                      sdk: c,
                    }, r), delete r.unionId, t = o.stringify(t, r), a({
                      method: 'GET',
                      url: t,
                    }), this.points = [], this.pointsCustom = [];
                  }
                },
              }]), e;
          }();
      e.exports = u;
    }, function(e) {
      'use strict';
      e.exports = {
        stringify: function(e, t) {
          if (!t) return e;
          var r = [];
          for (var n in t) t.hasOwnProperty(n) && r.push(n + '=' + t[n]);
          return ~e.indexOf('?') ? e + '&' + r.join('&') : e + '?' + r.join('&');
        },
      };
    }, function(e, t, r) {
      'use strict';

      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError(
            'Cannot call a class as a function');
      }

      var i = function() {
            function e(e, t) {
              for (var r = 0; r < t.length; r++) {
                var n = t[r];
                n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in
                n && (n.writable = !0), Object.defineProperty(e, n.key, n);
              }
            }

            return function(t, r, n) {
              return r && e(t.prototype, r), n && e(t, n), t;
            };
          }(),
          a = r(2),
          o = r(4),
          s = r(6),
          c = function() {
            function e(t) {
              n(this,
                  e), this.cfgManager = t, this.tags = {}, this.kvs = {}, this.random = Math.random();
            }

            return i(e, [
              {
                key: 'setTags',
                value: function(e) {
                  this.tags = a(this.tags, e);
                },
              }, {
                key: 'getTags',
                value: function(e) {
                  return e ? this.tags[e] : this.tags;
                },
              }, {
                key: 'setMetric',
                value: function(e, t) {
                  var r = this;
                  if ('string' != typeof e) return s.ignore(
                      'metric名称必须是string类型');
                  if ('number' !=
                      typeof t) return s.ignore('metric值必须是number类型,当前为' + e +
                      '-' + t);
                  this.kvs[e] || (this.kvs[e] = []), this.kvs[e].push(t);
                  try {
                    this.cfgManager.get('metric').combo && (this.timeout &&
                    (clearTimeout(
                        this.timeout), this.timeout = null), this.timeout = setTimeout(
                        function() {
                          r.report();
                        }, this.cfgManager.get('metric').delay || 1500));
                  } catch (e) {
                    throw e;
                  }
                },
              }, {
                key: 'getMetric',
                value: function(e) {
                  return e ? this.kvs[e] : this.kvs;
                },
              }, {
                key: 'clearMetric',
                value: function() {
                  this.kvs = {};
                },
              }, {
                key: '_rollbackMetric',
                value: function(e) {
                  for (var t in e) e.hasOwnProperty(t) &&
                  (this.kvs[t] = e[t].concat(this.kvs[t] || []));
                },
              }, {
                key: 'report',
                value: function() {
                  var e = this;
                  if (!(this.random > this.cfgManager.get('metric').sample)) {
                    var t = this.cfgManager,
                        r = t.get('project');
                    if (this.kvs && 0 !== Object.keys(this.kvs).length) {
                      var n = {
                            kvs: this.kvs,
                            tags: this.tags,
                            ts: parseInt(+new Date / 1e3),
                          },
                          i = this.kvs;
                      this.clearMetric(), o({
                        type: 'POST',
                        url: t.url + ('/api/metric?v=1&p=' + r),
                        header: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        data: 'data=' + encodeURIComponent(JSON.stringify(n)),
                        fail: function() {
                          e._rollbackMetric(i);
                        },
                      });
                    }
                  }
                },
              }]), e;
          }();
      e.exports = c;
    }, function(e) {
      'use strict';
      e.exports = function(e) {
        var t = window.onerror;
        if (e) {
          var r = e.cfgManager;
          if (r.get('autoCatch').js !== !1) {
            window.onerror = function() {
              e.parseWindowError.apply(e, arguments), t &&
              t.apply(window, arguments);
            };
            var n = window.addEventListener || window.attachEvent;
            n('unhandledrejection', function() {
              e.parsePromiseUnhandled.apply(e, arguments);
            });
          }
        }
      };
    }, function(e, t, r) {
      'use strict';
      var n = r(5);
      e.exports = function(e) {
        var t = e.cfgManager;
        t.get('autoCatch').ajax && n.on('ajaxCall', function() {
          e.parseAjax.apply(e, arguments);
        });
        var r = window.addEventListener || window.attachEvent;
        t.get('autoCatch').resource && (r('load', function() {
          e.parseRes.apply(e, arguments);
        }), r('error', function(t) {
          t && e.parseResError.apply(e, arguments);
        }, !0));
      };
    }, function(e) {
      'use strict';
      e.exports = function(e) {
        var t = e.cfgManager;
        if (t.get('autoCatch').page && !e.getReady()) {
          var r = window.addEventListener || window.attachEvent;
          r('load', function() {
            var t = window.performance && window.performance.timing;
            e.parsePageTime(t);
          });
        }
      };
    }, function(e, t, r) {
      'use strict';
      var n = r(24);
      e.exports = {
        getExt: function() {
          var e = n('network');
          if (!e) {
            var t = navigator.userAgent,
                r = /NetType\/([a-zA-Z0-9]+)/;
            t && r.test(t) && (e = t.match(r)[1]);
          }
          var i = n('dpid') || n('_hc.v'),
              a = {};
          return e && (a.network = e), i && (a.unionId = i), a;
        },
      };
    }, function(e) {
      'use strict';
      e.exports = function(e) {
        for (var t = e + '=', r = document.cookie.split(';'), n = 0; n <
        r.length; n++) {
          for (var i = r[n];
               " " == i.charAt(0);) i = i.substring(1, i.length);
          if (0 == i.indexOf(t)) return i.substring(t.length, i.length);
        }
        return null;
      };
    }, function(e, t, r) {
      'use strict';
      var n = r(4),
          i = r(18),
          a = r(14).version,
          o = r(6),
          s = .01;
      e.exports = function(e, t) {
        if (e && t && !(Math.random() > s)) {
          var r = function(e, t) {
            try {
              e = e.split('.').map(function(e) {
                return parseInt(e);
              }), t = t.split('.').map(function(e) {
                return parseInt(e);
              });
              var r = void 0;
              return r = e[0] !== t[0] ?
                  e[0] - t[0] :
                  e[1] !== t[1] ?
                      e[1] - t[1] :
                      e[2] - t[2], r >= 0;
            } catch (e) {
              return o.ignore(e), !1;
            }
          };
          if (!r(t.cfgManager.get('version'), a)) {
            var c = {
                  v: 1,
                  rate: s,
                  project: e,
                  version: 'v_' + a,
                  pageurl: encodeURIComponent(window.location.href),
                  count: 1,
                },
                u = t.cfgManager.url + '/api/version';
            u = i.stringify(u, c), setTimeout(function() {
              n({
                type: 'GET',
                url: u,
              });
            }, 1500);
          }
        }
      };
    }]);
});
var requirejs, require, define;
!function(e) {
  function n(e, n) {
    return y.call(e, n);
  }

  function r(e, n) {
    var r, i, t, o, f, u, l, c, s, p, a, d = n && n.split('/'),
        g = h.map,
        m = g && g['*'] || {};
    if (e && '.' === e.charAt(0))
      if (n) {
        for (d = d.slice(0, d.length - 1), e = e.split('/'), f = e.length -
            1, h.nodeIdCompat && v.test(e[f]) &&
        (e[f] = e[f].replace(v, '')), e = d.concat(e), s = 0; s <
             e.length; s += 1)
          if (a = e[s], '.' === a) e.splice(s, 1), s -= 1;
          else if ('..' === a) {
            if (1 === s && ('..' === e[2] || '..' === e[0])) break;
            s > 0 && (e.splice(s - 1, 2), s -= 2);
          }
        e = e.join('/');
      } else 0 === e.indexOf('./') && (e = e.substring(2));
    if ((d || m) && g) {
      for (r = e.split('/'), s = r.length; s > 0; s -= 1) {
        if (i = r.slice(0, s).join('/'), d)
          for (p = d.length; p > 0; p -= 1)
            if (t = g[d.slice(0, p).join('/')], t && (t = t[i])) {
              o = t, u = s;
              break;
            }
        if (o) break;
        !l && m && m[i] && (l = m[i], c = s);
      }
      !o && l && (o = l, u = c), o && (r.splice(0, u, o), e = r.join('/'));
    }
    return e;
  }

  function i(n, r) {
    return function() {
      var i = j.call(arguments, 0);
      return 'string' != typeof i[0] && 1 === i.length && i.push(null), s.apply(
          e, i.concat([n, r]));
    };
  }

  function t(e) {
    return function(n) {
      return r(n, e);
    };
  }

  function o(e) {
    return function(n) {
      d[e] = n;
    };
  }

  function f(r) {
    if (n(g, r)) {
      var i = g[r];
      delete g[r], m[r] = !0, c.apply(e, i);
    }
    if (!n(d, r) && !n(m, r)) throw new Error('No ' + r);
    return d[r];
  }

  function u(e) {
    var n, r = e ? e.indexOf('!') : -1;
    return r > -1 &&
    (n = e.substring(0, r), e = e.substring(r + 1, e.length)), [n, e];
  }

  function l(e) {
    return function() {
      return h && h.config && h.config[e] || {};
    };
  }

  var c, s, p, a, d = {},
      g = {},
      h = {},
      m = {},
      y = Object.prototype.hasOwnProperty,
      j = [].slice,
      v = /\.js$/;
  p = function(e, n) {
    var i, o = u(e),
        l = o[0];
    return e = o[1], l && (l = r(l, n), i = f(l)), l ?
        e = i && i.normalize ? i.normalize(e, t(n)) : r(e, n) :
        (e = r(e, n), o = u(e), l = o[0], e = o[1], l && (i = f(l))), {
      f: l ? l + '!' + e : e,
      n: e,
      pr: l,
      p: i,
    };
  }, a = {
    require: function(e) {
      return i(e);
    },
    exports: function(e) {
      var n = d[e];
      return 'undefined' != typeof n ? n : d[e] = {};
    },
    module: function(e) {
      return {
        id: e,
        uri: '',
        exports: d[e],
        config: l(e),
      };
    },
  }, c = function(r, t, u, l) {
    var c, s, h, y, j, v, x = [],
        q = typeof u;
    if (l = l || r, 'undefined' === q || 'function' === q) {
      for (t = !t.length && u.length ?
          [
            'require',
            'exports',
            'module'] :
          t, j = 0; j < t.length; j += 1)
        if (y = p(t[j], l), s = y.f, 'require' === s) x[j] = a.require(r);
        else if ('exports' === s) x[j] = a.exports(r), v = !0;
        else if ('module' === s) c = x[j] = a.module(r);
        else if (n(d, s) || n(g, s) || n(m, s)) x[j] = f(s);
        else {
          if (!y.p) throw new Error(r + ' missing ' + s);
          y.p.load(y.n, i(l, !0), o(s), {}), x[j] = d[s];
        }
      h = u ? u.apply(d[r], x) : void 0, r &&
      (c && c.exports !== e && c.exports !== d[r] ?
          d[r] = c.exports :
          h === e && v || (d[r] = h));
    } else r && (d[r] = u);
  }, requirejs = require = s = function(n, r, i, t, o) {
    if ('string' == typeof n) return a[n] ? a[n](r) : f(p(n, r).f);
    if (!n.splice) {
      if (h = n, h.deps && s(h.deps, h.callback), !r) return;
      r.splice ? (n = r, r = i, i = null) : n = e;
    }
    return r = r || function() {
    }, 'function' == typeof i && (i = t, t = o), t ?
        c(e, n, r, i) :
        setTimeout(function() {
          c(e, n, r, i);
        }, 4), s;
  }, s.config = function(e) {
    return s(e);
  }, requirejs._defined = d, define = function(e, r, i) {
    r.splice || (i = r, r = []), n(d, e) || n(g, e) || (g[e] = [e, r, i]);
  }, define.amd = {
    jQuery: !0,
  };
}();