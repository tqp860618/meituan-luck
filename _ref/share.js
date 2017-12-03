define('fe_common/module/dialog/simpledialog', [], function() {
  var e = BaseClass.extend({
    _content: '',
    _width: null,
    _height: null,
    _fixed: !1,
    _id: null,
    _classes: 'simpledialog',
    _showOnBuild: !0,
    _$wrapper: null,
    _$content: null,
    _$mask: null,
    _autoPosition: !0,
    init: function(e) {
      this._content = e.content, this._width = e.width, this._height = e.height, this._fixed = e.fixed ||
          !1, this._id = e.id || 'dialog' +
          (new Date).valueOf(), this._classes = e.class ||
          'simpledialog', this._showOnBuild = null != e.show ?
          e.show :
          !0, this._$wrapper = $('<div id="' + this._id + '" class="' +
          this._classes + '" style="display:none;"></div>'), this._$content = $(
          this._content), this._$mask = e.mask === !1 ?
          null :
          $('<div class="mask" style="display:none"></div>'), this._autoPosition = e.autoPosition !==
          !1, this._build(), this._showOnBuild && this.show();
    },
    _build: function() {
      this._updateContent();
      var e = {};
      null != this._width && (e.width = this._width + 'px'), null !=
      this._height && (e.height = this._height + 'px'), this._fixed &&
      (e.position = 'fixed');
      for (var t in e) {
        this._$wrapper.css(e);
        break;
      }
      this._$wrapper.appendTo('body'), this._$mask &&
      this._$mask.appendTo('body');
    },
    _updateContent: function() {
      this._$wrapper.empty().append(this._$content);
    },
    getJElem: function() {
      return this._$wrapper;
    },
    getJContent: function() {
      return this._$content;
    },
    show: function() {
      this.trigger('show'), this._$wrapper.show(), this._autoPosition &&
      this.adjust(), this._$mask && this._$mask.show(), this.trigger('showed');
    },
    hide: function() {
      this.trigger('hide'), this._$wrapper.hide(), this._$mask &&
      this._$mask.hide(), this.trigger('hided');
    },
    close: function() {
      this.trigger('close'), this._$wrapper.remove(), this._$mask &&
      this._$mask.remove(), this.trigger('closed');
    },
    setContent: function(e) {
      this._content = e, this._$content = $(
          this._content), this._updateContent();
    },
    adjust: function() {
      var e = this._$wrapper.height(),
          t = this._$wrapper.width(),
          n = $(window),
          r = n.height(),
          i = n.width(),
          s = (r - e) / 2 + document.body.scrollTop,
          o = (i - t) / 2;
      this._$wrapper.css({
        top: s + 'px',
        left: o + 'px',
      });
    },
  });
  return e;
}), define('fe_common/module/dialog/tipdialog',
    ['fe_common/module/dialog/simpledialog'], function(e) {
      var t = e.extend({
        _type: null,
        _hideDelay: 2e3,
        _animationTime: 300,
        init: function(e) {
          e = e || {}, this._type = e.type ?
              e.type :
              this._type, this._hideDelay = 'number' == typeof e.hideDelay ?
              e.hideDelay :
              this._hideDelay, this._showOnce = 'boolean' == typeof e.showOnce ?
              e.showOnce :
              !1, e = $.extend({
            mask: !1,
            'class': 'tipdialog',
          }, e), e.content = this._getContent(e.content), this._super(e);
        },
        _getContent: function(e) {
          var t = '<div class="tipdialog-content">';
          switch (this._type) {
            case 'success':
              t += '<i class="icon-tick"></i>';
              break;
            case 'fail':
              t += '<i class="icon-cross"></i>';
          }
          return t += '<span>' + e + '</span></div>';
        },
        show: function() {
          var e = this;
          this._super(), this._$wrapper.css('opacity', '1'), this._showOnce &&
          this.on('hided', function() {
            e.close();
          }), 0 != this._hideDelay && setTimeout(function() {
            e.hide();
          }, this._hideDelay);
        },
        hide: function() {
          var e = this;
          this.trigger('hide'), this._$wrapper.css('opacity',
              '0'), this._$mask && this._$mask.hide(), setTimeout(function() {
            e._$wrapper.hide(), e.trigger('hided');
          }, this._animationTime);
        },
        adjust: function() {
          var e = this._$wrapper.height(),
              t = (this._$wrapper.width(), $(window)),
              n = t.height(),
              r = (t.width(), (n - e) / 2 + document.body.scrollTop);
          this._$wrapper.css({
            top: r + 'px',
            left: '50%',
            transform: 'translate(-50%,0)',
          }), this._$wrapper[0].style.webkitTransform = 'translate(-50%,0)';
        },
      });
      return t;
    }), define('fe_common/module/browser', [], function() {
  return {
    versions: function() {
      var e = navigator.userAgent;
      return navigator.appVersion, {
        trident: e.indexOf('Trident') > -1,
        presto: e.indexOf('Presto') > -1,
        webKit: e.indexOf('AppleWebKit') > -1,
        gecko: e.indexOf('Gecko') > -1 && -1 == e.indexOf('KHTML'),
        mobile: !!e.match(/AppleWebKit.*Mobile.*/) || !!e.match(/AppleWebKit/),
        ios: !!e.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        android: e.indexOf('Android') > -1 || e.indexOf('Linux') > -1,
        iPhone: e.indexOf('iPhone') > -1 || e.indexOf('Mac') > -1,
        iPad: e.indexOf('iPad') > -1,
        QQBrowser: e.indexOf('QQBrowser') > -1,
        QQWebview: -1 == e.indexOf('QQBrowser') && e.indexOf('QQ') > -1,
        webApp: -1 == e.indexOf('Safari'),
        weixin: e.toLowerCase().indexOf('micromessenger') > -1,
        chrome: e.indexOf('Chrome') > -1 || e.indexOf('CriOS') > -1,
      };
    }(),
    isPC: function() {
      var e = {
            win: !1,
            mac: !1,
            xll: !1,
          },
          t = navigator.platform;
      return e.win = 0 == t.indexOf('Win'), e.mac = 0 ==
          t.indexOf('Mac'), e.xll = 'X11' == t || 0 ==
          t.indexOf('Linux'), e.win || e.mac || e.xll ? !0 : !1;
    }(),
  };
}), define('module/appDownload', ['fe_common/module/browser'], function(e) {
  return {
    go: function(t) {
      t = t || {};
      var n = t.channel || 1033;
      delayGo(e.versions.ios && !e.versions.weixin ?
          'https://itunes.apple.com/cn/app/mei-tuan-wai-mai/id737310995' :
          e.versions.android && !e.versions.weixin ?
              'http://waimai.meituan.com/download?channel=' + n :
              'http://waimai.meituan.com/getapp/' + n + '?position=1');
    },
  };
}), define('fe_common/module/StatusButton', [], function() {
  var e = function(e) {
    var t = $(e),
        n = 0;
    return t.enable = function() {
      return n = 0, t.removeAttr('disabled').removeClass('btn-invalid');
    }, t.disable = function() {
      return n = 1, t.attr('disabled', 'disabled').addClass('btn-invalid');
    }, t;
  };
  return e;
}), define('module/captcha/CaptchaLogicBase', [], function() {
  return BaseClass.extend({
    _lastCaptcha: '',
    _status: !1,
    checkCaptcha: function() {
      var e = this;
      this.trigger('beforeCheck');
      var t = this.getCaptcha(),
          n = this.getPhone();
      '' != t ?
          this.postCaptchaCheck(n, t, function(t) {
            e._captchaRight({
              response: t,
            });
          }, function(t) {
            e._captchaWrong({
              response: t,
            });
          }) :
          this._status ?
              this._captchaRight({}) :
              this._captchaWrong({}), this._lastCaptcha = t, this.trigger(
          'afterCheck');
    },
    sendSms: function() {
      var e = this.getPhone();
      this.clear(), /1\d{10}/.test(e) &&
      (this.postSmsSend(e), this.trigger('afterSendSms'));
    },
    sendVoice: function() {
      var e = this.getPhone();
      this.clear(), /1\d{10}/.test(e) &&
      (this.postVoiceSend(e), this.trigger('afterSendVoice'));
    },
    isVerified: function() {
      return 1 == this._status;
    },
    clear: function() {
      this._status = !1, this._lastCaptcha = '', this.setCaptcha(
          ''), this.trigger('clear');
    },
    _captchaRight: function(e) {
      this._status = !0, this.trigger('captchaRight', e);
    },
    _captchaWrong: function(e) {
      this._status = !1, this.trigger('captchaWrong', e);
    },
    postCaptchaCheck: function() {
    },
    postSmsSend: function() {
    },
    postVoiceSend: function() {
    },
    getCaptcha: function() {
      return '';
    },
    setCaptcha: function() {
    },
    getPhone: function() {
      return '';
    },
  });
}), define('fe_common/module/dialog/simpledialog', [], function() {
  var e = BaseClass.extend({
    _content: '',
    _width: null,
    _height: null,
    _fixed: !1,
    _id: null,
    _classes: 'simpledialog',
    _showOnBuild: !0,
    _$wrapper: null,
    _$content: null,
    _$mask: null,
    _autoPosition: !0,
    init: function(e) {
      this._content = e.content, this._width = e.width, this._height = e.height, this._fixed = e.fixed ||
          !1, this._id = e.id || 'dialog' +
          (new Date).valueOf(), this._classes = e.class ||
          'simpledialog', this._showOnBuild = null != e.show ?
          e.show :
          !0, this._$wrapper = $('<div id="' + this._id + '" class="' +
          this._classes + '" style="display:none;"></div>'), this._$content = $(
          this._content), this._$mask = e.mask === !1 ?
          null :
          $('<div class="mask" style="display:none"></div>'), this._autoPosition = e.autoPosition !==
          !1, this._build(), this._showOnBuild && this.show();
    },
    _build: function() {
      this._updateContent();
      var e = {};
      null != this._width && (e.width = this._width + 'px'), null !=
      this._height && (e.height = this._height + 'px'), this._fixed &&
      (e.position = 'fixed');
      for (var t in e) {
        this._$wrapper.css(e);
        break;
      }
      this._$wrapper.appendTo('body'), this._$mask &&
      this._$mask.appendTo('body');
    },
    _updateContent: function() {
      this._$wrapper.empty().append(this._$content);
    },
    getJElem: function() {
      return this._$wrapper;
    },
    getJContent: function() {
      return this._$content;
    },
    show: function() {
      this.trigger('show'), this._$wrapper.show(), this._autoPosition &&
      this.adjust(), this._$mask && this._$mask.show(), this.trigger('showed');
    },
    hide: function() {
      this.trigger('hide'), this._$wrapper.hide(), this._$mask &&
      this._$mask.hide(), this.trigger('hided');
    },
    close: function() {
      this.trigger('close'), this._$wrapper.remove(), this._$mask &&
      this._$mask.remove(), this.trigger('closed');
    },
    setContent: function(e) {
      this._content = e, this._$content = $(
          this._content), this._updateContent();
    },
    adjust: function() {
      var e = this._$wrapper.height(),
          t = this._$wrapper.width(),
          n = $(window),
          r = n.height(),
          i = n.width(),
          s = (r - e) / 2 + document.body.scrollTop,
          o = (i - t) / 2;
      this._$wrapper.css({
        top: s + 'px',
        left: o + 'px',
      });
    },
  });
  return e;
}), define('fe_common/module/dialog/inlinedialog',
    ['fe_common/module/dialog/simpledialog'], function(e) {
      var t = e.extend({
        init: function(e) {
          this._content = e.content, this._width = e.width, this._height = e.height, this._fixed = e.fixed ||
              !1, this._id = e.id || 'dialog' +
              (new Date).valueOf(), this._classes = e.class ||
              'simpledialog', this._showOnBuild = null != e.show ?
              e.show :
              !0, this._$wrapper = $('<div id="' + this._id +
              '" style="display:none;"></div>'), this._appendTo = $(e.dom) ||
              'body', this._$content = $(
              this._content), this._autoPosition = e.autoPosition !==
              !1, this._build(), this._showOnBuild && this.show();
        },
        _build: function() {
          this._updateContent(), this._$wrapper.appendTo(
              this._appendTo), window.setTimeout(function() {
            $('.phoneverifier-animateShow').css({
              opacity: 1,
            });
          }, 100);
        },
        adjust: function() {
        },
      });
      return t;
    }), define('module/captcha/CountDownButton',
    ['fe_common/module/StatusButton'], function(e) {
      return BaseClass.extend({
        _statusBtn: null,
        _normalWord: '',
        _countDownWord: '',
        _interval: 60,
        _timer: null,
        _callback: null,
        init: function(t) {
          this._interval = t.interval || 60, this._statusBtn = new e(
              t.jQbtn), this._normalWord = this._statusBtn.text(), this._countDownWord = this._statusBtn.data(
              'countdown-word') || '重新获取({#})', this._callback = t.callback;
        },
        beginCountDown: function() {
          var e = this,
              t = this._interval,
              n = this._statusBtn;
          n.disable().text(e._countDownWord.replace('{#}', t)), this._timer &&
          this.endCountDown(), e.trigger(
              'beginCountDown'), this._timer = setInterval(function() {
            --t <= 0 ?
                (e._callback && e._callback(e._statusBtn), e.endCountDown()) :
                n.text(e._countDownWord.replace('{#}', t));
          }, 1e3);
        },
        endCountDown: function() {
          this._timer && (clearInterval(
              this._timer), this._timer = null, this._statusBtn.enable().
              text(this._normalWord), this.trigger('endCountDown'));
        },
        getJElement: function() {
          return this._statusBtn;
        },
      });
    }), define('module/captcha/InlineCaptchaDialog', [
  'fe_common/module/dialog/inlinedialog',
  'module/captcha/CountDownButton',
  'fe_common/module/StatusButton'], function(e, t, n) {
  return e.extend({
    _submitBtn: null,
    _type: 'sms',
    _canVoice: !1,
    _userPhone: null,
    _jQwrap: null,
    _jQtip: null,
    _jQvoiceSendLink: null,
    _jQcaptchaInput: null,
    _jQsendBtn: null,
    _jQrightIcon: null,
    _jQwrongIcon: null,
    _countDownBtn: null,
    _captchaLogic: null,
    _tpl: null,
    _interval: 60,
    init: function(e) {
      this._type = e.type || this._type, this._canVoice = e.canVoice ||
          this._canVoice, this._userPhone = e.userPhone, this._captchaLogic = e.captchaLogic, this._tpl = e.tpl, this._interval = e.interval ||
          this._interval, this._super({
        dom: e.dom,
        content: this.getHtml(),
      });
      var r = this._jQwrap = this.getJContent();
      this._jQtip = r.find(
          '.j-phoneverifier-dialingtip'), this._jQvoiceSendLink = 'sms' ==
      this._type ? r.find('.j-voice') : null, this._submitBtn = new n(
          r.find('.j-submit')), this._jQcaptchaInput = r.find(
          '.j-captcha-input'), this._jQsendBtn = r.find(
          '.j-captcha-sendbtn'), this._jQrightIcon = r.find(
          '.j-captcha-rightico'), this._jQwrongIcon = r.find(
          '.j-captcha-wrongico'), this._countDownBtn = new t({
        jQbtn: this._jQsendBtn,
        interval: this._interval,
      }), this._initCaptchaLogic(), this._initSendBtn(), this._initEvents();
    },
    _initCaptchaLogic: function() {
      var e = this,
          t = this._captchaLogic;
      t.getCaptcha = function() {
        return e._jQcaptchaInput.val();
      }, t.setCaptcha = function(t) {
        return e._jQcaptchaInput.val(t);
      }, t.getPhone = function() {
        return e._userPhone;
      }, t.on('beforeCheck', function() {
        e._clear();
      }), t.on('afterSendSms', function() {
        e._clear();
      }), t.on('afterSendVoice', function() {
        e._clear();
      }), t.on('captchaRight', function() {
        e._jQrightIcon.show(), e._jQwrongIcon.hide();
      }), t.on('captchaWrong', function() {
        e._jQrightIcon.hide(), e._jQwrongIcon.show();
      });
    },
    _initSendBtn: function() {
      var e = this;
      this._jQsendBtn.click(function() {
        'voice' == e._type ?
            e._captchaLogic.sendVoice() :
            'sms' == e._type && e._captchaLogic.sendSms();
      }), 'voice' == this._type ?
          this._captchaLogic.on('afterSendVoice', function() {
            e._countDownBtn.beginCountDown();
          }) :
          'sms' == this._type &&
          this._captchaLogic.on('afterSendSms', function() {
            e._countDownBtn.beginCountDown();
          });
    },
    _clear: function() {
      this._jQrightIcon.hide(), this._jQwrongIcon.hide();
    },
    _initEvents: function() {
      var e = this,
          t = this._submitBtn,
          n = this._jQvoiceSendLink;
      t.click(function() {
        t.disable(), e.trigger('submit');
      }), n && n.click($.proxy(this._clickVoiceSendLink, this));
    },
    enableSubmit: function() {
      this._submitBtn.enable();
    },
    voiceSentSuccess: function(e) {
      var t = this;
      this._jQtip.show().find('.j-server').text(e), setTimeout(function() {
        t._jQtip.hide(), t._enableVoiceSendLink();
      }, 1e3 * t._interval);
    },
    getHtml: function() {
      return this._tpl.getHtml();
    },
    _clickVoiceSendLink: function() {
      this._jQvoiceSendLink.hasClass('phoneverifier-voice-disable') ||
      (this._disableVoiceSendLink(), this._captchaLogic.sendVoice());
    },
    _disableVoiceSendLink: function() {
      this._jQvoiceSendLink &&
      this._jQvoiceSendLink.addClass('phoneverifier-voice-disable');
    },
    _enableVoiceSendLink: function() {
      this._jQvoiceSendLink &&
      this._jQvoiceSendLink.removeClass('phoneverifier-voice-disable');
    },
  });
}), define('module/captcha/InlineCaptchaDialogTpl', [], function() {
  return BaseClass.extend({
    _submitText: '提交订单',
    _desc: '为保证送餐员能联系到您，请验证您的手机号码',
    _canVoice: !0,
    _type: 'sms',
    init: function(e, t, n) {
      n && (this._submitText = n.submitText ||
          this._submitText, this._desc = n.desc ||
          this._desc), this._type = e, this._canVoice = t;
    },
    getHtml: function() {
      var e = 'voice' == this._type ?
          '<button class="combtn phoneverifier-codesend phoneverifier-codesend-red j-captcha-sendbtn" data-countdown-word="({#}s)重新接听">接听语音验证码</button>' :
          '<button class="combtn phoneverifier-codesend phoneverifier-codesend-red j-captcha-sendbtn">获取验证码</button>',
          t = '';
      'sms' == this._type && this._canVoice &&
      (t = '<div class="phoneverifier-animateShow"><p class="phoneverifier-sub" style="text-align:center;margin:.3rem auto 0;">收不到短信？使用<a class="phoneverifier-voice phoneverifier-voice-red j-voice" href="javascript:;">语音验证码</a></p></div>');
      var n = '<div class="phoneverifier"><div class="phoneverifier-codewrap phoneverifier-codewrap-inline phoneverifier-animateShow"> <input class="phoneverifier-codeinput j-captcha-input" type="tel"  style="width:68%;" placeholder="请输入验证码">' +
          e +
          '</div><button class="combtn phoneverifier-btn phoneverifier-btn-red j-submit" style="margin:.3rem auto;">' +
          this._submitText + '</button>' + t +
          '<div class="phoneverifier-animateShow"><p class="j-phoneverifier-dialingtip phoneverifier-dialingtip" style="display:none;">电话拨打中...请留意以下来电:<em class="j-server"></em></p><p class="phoneverifier-protocol phoneverifier-protocol-inline" style="text-align:center;">&nbsp;&nbsp;<i><em></em></i>已同意《<a target="_blank" href="https://i.meituan.com/about/terms">美团网用户协议</a>》</p></div></div>';
      return n;
    },
  });
}), define('fe_common/module/dialog/tipdialog',
    ['fe_common/module/dialog/simpledialog'], function(e) {
      var t = e.extend({
        _type: null,
        _hideDelay: 2e3,
        _animationTime: 300,
        init: function(e) {
          e = e || {}, this._type = e.type ?
              e.type :
              this._type, this._hideDelay = 'number' == typeof e.hideDelay ?
              e.hideDelay :
              this._hideDelay, this._showOnce = 'boolean' == typeof e.showOnce ?
              e.showOnce :
              !1, e = $.extend({
            mask: !1,
            'class': 'tipdialog',
          }, e), e.content = this._getContent(e.content), this._super(e);
        },
        _getContent: function(e) {
          var t = '<div class="tipdialog-content">';
          switch (this._type) {
            case 'success':
              t += '<i class="icon-tick"></i>';
              break;
            case 'fail':
              t += '<i class="icon-cross"></i>';
          }
          return t += '<span>' + e + '</span></div>';
        },
        show: function() {
          var e = this;
          this._super(), this._$wrapper.css('opacity', '1'), this._showOnce &&
          this.on('hided', function() {
            e.close();
          }), 0 != this._hideDelay && setTimeout(function() {
            e.hide();
          }, this._hideDelay);
        },
        hide: function() {
          var e = this;
          this.trigger('hide'), this._$wrapper.css('opacity',
              '0'), this._$mask && this._$mask.hide(), setTimeout(function() {
            e._$wrapper.hide(), e.trigger('hided');
          }, this._animationTime);
        },
        adjust: function() {
          var e = this._$wrapper.height(),
              t = (this._$wrapper.width(), $(window)),
              n = t.height(),
              r = (t.width(), (n - e) / 2 + document.body.scrollTop);
          this._$wrapper.css({
            top: r + 'px',
            left: '50%',
            transform: 'translate(-50%,0)',
          }), this._$wrapper[0].style.webkitTransform = 'translate(-50%,0)';
        },
      });
      return t;
    }), define('page/uploadData/uploadData', [], function() {
  return function(e, t, n) {
    function r(e, t) {
      t != undefined ? o += e + '=' + t + '&' : o += e + '=&';
    }

    var i = {
      channelId: e,
    };
    if (n)
      for (var s in n) 'dim_cached' == s &&
      (n[s] ? n[s] = 1 : n[s] = 0), n[s] = n[s];
    var o = '';
    r('code', t), r('ua', navigator.userAgent), r('referer_page_url',
        document.referrer), r('wm_uuid', $.cookie('h_w_uuid')), n ?
        (n.channelId = e, r('result', JSON.stringify(n))) :
        r('result', JSON.stringify(i));
    var u = document.createElement('iframe');
    u.style.display = 'none', document.getElementsByTagName(
        'head')[0].appendChild(u), /beta|test/.test(location.host) ?
        u.src = 'http://log.c.waimai.test.sankuai.com/i/ilog?' + o :
        u.src = 'https://log.waimai.meituan.com/i/ilog?' +
            o, u.onload = function() {
      document.getElementsByTagName('head')[0].removeChild(u);
    };
  };
}), define('module/mtsi', [], function() {
  function e(e, t) {
    return Rohr_Opt && Rohr_Opt.reload &&
    (t._token = Rohr_Opt.reload(e + '?' + $.param(t))), t;
  }

  function t(e, t) {
    return Rohr_Opt && Rohr_Opt.reload ?
        e + '?_token=' + Rohr_Opt.reload(e + '?' + $.param(t)) :
        e;
  }

  return {
    getDataInMTSI: e,
    getUrlInMTSI: t,
  };
}), define('module/SmsCaptcha', [
  'module/captcha/CaptchaLogicBase',
  'module/captcha/InlineCaptchaDialog',
  'module/captcha/InlineCaptchaDialogTpl',
  'fe_common/module/dialog/simpledialog',
  'fe_common/module/dialog/tipdialog',
  'page/uploadData/uploadData',
  'module/mtsi'], function(e, t, n, r, i, s, o) {
  var u = BaseClass.extend({
    _dlg: null,
    _captchaObj: null,
    init: function(u) {
      var a, f = u.baseurl,
          l = u.type || 'sms',
          c = u.captchaCheck,
          h = u.onSuccess,
          p = u.phone,
          d = this,
          v = u.couponType,
          m = function() {
            var e = $('#changepic').css('background-image'),
                t = e.substring(4, e.length - 1);
            if (t.split('&').length > 1) var n = 1e3 * Math.random() + 1,
                r = e.split('&')[0] + '&r=' + n;
            else var n = 1e3 * Math.random() + 1,
                r = t + '&r=' + n;
            $('#changepic').css('background-image', r);
          },
          g = this._captchaObj = new e;
      'SHARE_COUPON' == v ?
          (g.channelId = u.channelId, g.dim_ui_id = u.dim_ui_id) :
          (g._urlKey = u._urlKey, g.dim_ui_id = u.dim_ui_id), g.postCaptchaCheck = function(
          e, t, n, r) {
        c(e, t, n, r);
      }, g.remake = function() {
        var e = this;
        e.cancelrefundDlg &&
        e.cancelrefundDlg.close(), a.close(), g.makeSmsDlg(), a.on('submit',
            function() {
              'SHARE_COUPON' == v ? (s(g.channelId, 20090004, {
                dim_type: 2,
                dim_ui_id: g.dim_ui_id,
              }), LXAnalytics('moduleClick', 'b_czc746z3', {
                custom: {
                  channelId: g.channelId,
                  stat_code: '20090004',
                  dim_type: 2,
                  dim_ui_id: g.dim_ui_id,
                },
              })) : (s(g._urlKey, 20090004, {
                dim_type: 2,
              }), LXAnalytics('moduleClick', 'b_czc746z3', {
                custom: {
                  channelId: g._urlKey,
                  stat_code: '20090004',
                  dim_type: 2,
                  dim_ui_id: g.dim_ui_id,
                },
              })), '' == e.getCaptcha() && new i({
                content: '请填写验证码',
              }), e.checkCaptcha();
            });
      }, g.postSmsSend = function(e, t, n) {
        n || ('SHARE_COUPON' == v ?
            (s(g.channelId, 20090006, {
              dim_ui_id: g.dim_ui_id,
            }), LXAnalytics('moduleClick', 'b_2gdvu9vn', {
              custom: {
                channelId: g.channelId,
                stat_code: '20090006',
                dim_ui_id: g.dim_ui_id,
              },
            })) :
            (s(g._urlKey, 20090006), LXAnalytics('moduleClick', 'b_2gdvu9vn', {
              custom: {
                channelId: g._urlKey,
                stat_code: '20090006',
                dim_ui_id: g.dim_ui_id,
              },
            })));
        var u = this,
            a = $('#phone-input').val().trim();
        if ('' == a || !/^(13|14|15|18|17)\d{9}$/.test(a)) return new i({
          content: '请输入正确的手机号',
        }), void onError();
        e = a;
        var l = f + '/coupon/user/getSmsCode',
            c = {
              userPhone: e,
              captcha: t ? t : '',
            };
        $.post(l, o.getDataInMTSI(l, c), function(n) {
          if (102005 == n.code) {
            'SHARE_COUPON' == v ? s(g.channelId, 20090008, {
              dim_ui_id: g.dim_ui_id,
            }) : s(g._urlKey, 20090008);
            var o = n.data.captcha_url;
            $('.simpledialog').size() > 0 &&
            (u.jQoldDlg = $('.simpledialog').eq(0).hide(), u.jQoldMsk = $(
                '.mask').hide());
            var a = new r({
              content: '<div class="picyzm-title">图片验证</div><div class="picyzm-close">×</div><div class="picyzm-tip">为保障您的账户安全，请填写图片验证码</div><div class="picyzm clearfix"><div class="picyzm-pic" id="changepic" style="background-image: url(' +
              o +
              ')"></div><input class="picyzm-contect" type="text" style=""></div><div class="picyzm-error"></div><div class="picyzm-submit">提交</div>',
            });
            u.cancelrefundDlg = a, $('.picyzm-close').click(function() {
              g.remake();
            }), $('.picyzm-submit').click(function() {
              var t = $('.picyzm-contect').val();
              return '' == t ?
                  ($('.picyzm-error').text('请填写验证码'), !1) :
                  ('SHARE_COUPON' == v ? s(g.channelId, 20090009, {
                    dim_ui_id: g.dim_ui_id,
                  }) : s(g._urlKey, 20090009), void u.postSmsSend(e, t, !0));
            }), $('#changepic').click(function() {
              m();
            });
          } else 102006 == n.code || 102007 == n.code ?
              new i({
                content: '获取验证码过于频繁，请稍后重试',
              }) :
              2 == n.code ?
                  $('.picyzm-error').text('验证码输入有误') :
                  -40 == n.code ?
                      (new i({
                        content: n.msg,
                      }), m()) :
                      1 == n.code && t && u.cancelrefundDlg.close();
        });
      }, g.postVoiceSend = function() {
        'SHARE_COUPON' == v ?
            (s(g.channelId, 20090007, {
              dim_ui_id: g.dim_ui_id,
            }), LXAnalytics('moduleClick', 'b_17zovm29', {
              custom: {
                channelId: g.channelIdchannelId,
                stat_code: '20090007',
                dim_ui_id: g.dim_ui_id,
              },
            })) :
            (s(g._urlKey, 20090007), LXAnalytics('moduleClick', 'b_17zovm29', {
              custom: {
                channelId: g._urlKey,
                stat_code: '20090007',
                dim_ui_id: g.dim_ui_id,
              },
            })), $('.phoneverifier-sub').hide();
        var e = f + '/coupon/user/sendVoiceCode',
            t = {
              userPhone: p,
            };
        $.post(e, o.getDataInMTSI(e, t), function(e) {
          1 == e.code ? a.voiceSentSuccess(e.data) : new i({
            content: e.data.msg,
          });
        });
      }, g.on('captchaRight', function(e) {
        h(e.response);
      }), g.on('captchaWrong', function() {
        a.enableSubmit();
      }), $('#phone-input').val(), g.makeSmsDlg = function() {
        a = d._dlg = new t({
          type: l,
          canVoice: u.canVoice,
          captchaLogic: d._captchaObj,
          dom: $('#j-fetch-inner'),
          userPhone: p,
          tpl: new n(l, u.canVoice, {
            submitText: '立即领取',
          }),
        });
      }, g.makeSmsDlg(), a.on('submit', function() {
        '' == d.getCaptcha() && new i({
          content: '请填写验证码',
        }), d.checkCaptcha();
      }), a.on('close', function() {
        d.destroy(!0);
      });
    },
    isVerified: function() {
      return this._captchaObj.isVerified();
    },
    getCaptcha: function() {
      return this._captchaObj.getCaptcha();
    },
    checkCaptcha: function() {
      return this._captchaObj.checkCaptcha();
    },
    destroy: function(e) {
      null != this._dlg &&
      (e || this._dlg.close(), this._dlg = null), this.trigger('destroy');
    },
    remake: function() {
      return this._captchaObj.remake();
    },
  });
  return u;
}), define('module/callApp',
    ['fe_common/module/browser', 'fe_common/module/dialog/tipdialog'],
    function(e) {
      var t = function(t) {
        function n(e, t) {
          setTimeout(function() {
            'string' == typeof e ? location = e : 'function' == typeof e && e();
          }, null == t ? 300 : t);
        }

        var r = t.terminal || '',
            i = t.channel || 1033,
            s = t.scheme || 'meituanwaimai://waimai.meituan.com/' +
                (e.versions.android ? 'welcome' : 'pois'),
            o = t.intentScheme ||
                'intent://waimai.meituan.com/welcome#Intent;package=com.sankuai.meituan.takeoutnew;scheme=meituanwaimai;end;',
            u = t.mtScheme || 'imeituan://www.meituan.com/takeout/homepage',
            a = t.settingScheme || '',
            f = t.wxDelayGo ||
                'http://waimai.meituan.com/getapp/1052?position=1',
            l = t.h5DelayGo,
            c = navigator.userAgent.toLowerCase(),
            h = location.href,
            p = /wm_ctype/.test(h),
            d = /wm_ctype=mt/.test(h),
            v = /utm_campaign/.test(h) && /utm_content/.test(h) &&
                /utm_medium/.test(h) && /utm_source/.test(h) &&
                /utm_term/.test(h),
            m = d || v && !p,
            g = p && !d,
            y = !t.notDelayGo,
            b = 0;
        if (e.versions.ios) {
          var w = c.match(/os [\d._]*/gi);
          b = String(w).replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.');
        }
        if ('mtapp' == r || m) location.href = u;
        else if ('app' == r || g) location.href = s;
        else if (a && (s = a), e.versions.weixin) {
          var E = s && /^imeituan:\/\//g.test(s) ?
              'wxa552e31d6839de85' :
              'wx9f6523d23a33a5b3';
          wx.invoke('launch3rdApp', {
            appID: E,
            messageExt: s,
            extInfo: s,
          }, function() {
          }), y && setTimeout(function() {
            n(l ? l : f);
          }, 1e3);
        } else if (e.versions.android && /xm/.test(c)) {
          var S = '<div id="wx-tip-wrap"><div class="mask"></div><div class="wx-tip"></div></div>';
          $('#wx-tip-wrap').length || $('body').append(S), $('#wx-tip-wrap').
              on('click', '.wx-tip', function() {
                $('#wx-tip-wrap').remove();
              });
        } else {
          var x = /chrome|samsung/.test(c) &&
              !/safari/.test(navigator.userAgent.toLowerCase()),
              T = e.versions.android && x;
          if (T) {
            var N = document.getElementById('openIntentLink');
            N || (N = document.createElement(
                'a'), N.id = 'openIntentLink', N.style.display = 'none', document.body.appendChild(
                N)), N.href = o, $(N).click();
          } else if (c.indexOf('qq/') > -1 ||
              e.versions.ios && b.split('.')[0] > 8) {
            var C = document.getElementById('openSchemeLink');
            C || (C = document.createElement(
                'a'), C.id = 'openSchemeLink', C.style.display = 'none', document.body.appendChild(
                C)), C.href = s, $(C).click();
          } else {
            var k = document.createElement('iframe');
            k.src = s, k.style.display = 'none', document.body.appendChild(k);
          }
          y && setTimeout(function() {
            n(l ?
                l :
                e.versions.ios ?
                    'https://itunes.apple.com/cn/app/mei-tuan-wai-mai/id737310995' :
                    'http://waimai.meituan.com/download?channel=' + i);
          }, 1e3);
        }
      };
      return t;
    }), define('module/WebviewJsBridge', [], function() {
  function e(e) {
    window.WebViewJavascriptBridge ?
        e(window.WebViewJavascriptBridge) :
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
          window.WebViewJavascriptBridge ?
              e(window.WebViewJavascriptBridge) :
              window.Raven && Raven.captureMessage(
              'WebViewJavascriptBridgeReady occurs but window.WebViewJavascriptBridge is also undefined');
        }, !1);
  }

  var t = 'unInit';
  return {
    init: function() {
      function n(e) {
        e.init();
      }

      'inited' !== t && (t = 'inited', e(n));
    },
    callHandler: function(t, n, r) {
      e(function(e) {
        e.callHandler(t, n || {}, r);
      });
    },
    callNativeHandler: function(e, t) {
      function n(e) {
        'function' == typeof t.response && t.response.call(this, e);
      }

      var r = {
        moduleName: t ? t.moduleName || 'platform' : 'platform',
        methodName: t ? t.methodName || '' : '',
        data: t ? t.data || {} : {},
      };
      this.callHandler(e, r, n);
    },
    registerHandler: function(t, n) {
      function r(e) {
        e.registerHandler(t, n);
      }

      t && n && e(r);
    },
  };
}), define('module/WebviewShare', ['module/WebviewJsBridge'], function(e) {
  return {
    close: function() {
      e.callNativeHandler('closeWebViewHandler');
    },
    setShare: function(t) {
      e.init(), e.callNativeHandler('callNativeMethod', {
        moduleName: 'platform',
        methodName: 'shareCommon',
        data: t,
      });
    },
  };
}), define('fe_common/module/dialog/simpledialog', [], function() {
  var e = BaseClass.extend({
    _content: '',
    _width: null,
    _height: null,
    _fixed: !1,
    _id: null,
    _classes: 'simpledialog',
    _showOnBuild: !0,
    _$wrapper: null,
    _$content: null,
    _$mask: null,
    _autoPosition: !0,
    init: function(e) {
      this._content = e.content, this._width = e.width, this._height = e.height, this._fixed = e.fixed ||
          !1, this._id = e.id || 'dialog' +
          (new Date).valueOf(), this._classes = e.class ||
          'simpledialog', this._showOnBuild = null != e.show ?
          e.show :
          !0, this._$wrapper = $('<div id="' + this._id + '" class="' +
          this._classes + '" style="display:none;"></div>'), this._$content = $(
          this._content), this._$mask = e.mask === !1 ?
          null :
          $('<div class="mask" style="display:none"></div>'), this._autoPosition = e.autoPosition !==
          !1, this._build(), this._showOnBuild && this.show();
    },
    _build: function() {
      this._updateContent();
      var e = {};
      null != this._width && (e.width = this._width + 'px'), null !=
      this._height && (e.height = this._height + 'px'), this._fixed &&
      (e.position = 'fixed');
      for (var t in e) {
        this._$wrapper.css(e);
        break;
      }
      this._$wrapper.appendTo('body'), this._$mask &&
      this._$mask.appendTo('body');
    },
    _updateContent: function() {
      this._$wrapper.empty().append(this._$content);
    },
    getJElem: function() {
      return this._$wrapper;
    },
    getJContent: function() {
      return this._$content;
    },
    show: function() {
      this.trigger('show'), this._$wrapper.show(), this._autoPosition &&
      this.adjust(), this._$mask && this._$mask.show(), this.trigger('showed');
    },
    hide: function() {
      this.trigger('hide'), this._$wrapper.hide(), this._$mask &&
      this._$mask.hide(), this.trigger('hided');
    },
    close: function() {
      this.trigger('close'), this._$wrapper.remove(), this._$mask &&
      this._$mask.remove(), this.trigger('closed');
    },
    setContent: function(e) {
      this._content = e, this._$content = $(
          this._content), this._updateContent();
    },
    adjust: function() {
      var e = this._$wrapper.height(),
          t = this._$wrapper.width(),
          n = $(window),
          r = n.height(),
          i = n.width(),
          s = (r - e) / 2 + document.body.scrollTop,
          o = (i - t) / 2;
      this._$wrapper.css({
        top: s + 'px',
        left: o + 'px',
      });
    },
  });
  return e;
}), define('fe_common/module/dialog/tipdialog',
    ['fe_common/module/dialog/simpledialog'], function(e) {
      var t = e.extend({
        _type: null,
        _hideDelay: 2e3,
        _animationTime: 300,
        init: function(e) {
          e = e || {}, this._type = e.type ?
              e.type :
              this._type, this._hideDelay = 'number' == typeof e.hideDelay ?
              e.hideDelay :
              this._hideDelay, this._showOnce = 'boolean' == typeof e.showOnce ?
              e.showOnce :
              !1, e = $.extend({
            mask: !1,
            'class': 'tipdialog',
          }, e), e.content = this._getContent(e.content), this._super(e);
        },
        _getContent: function(e) {
          var t = '<div class="tipdialog-content">';
          switch (this._type) {
            case 'success':
              t += '<i class="icon-tick"></i>';
              break;
            case 'fail':
              t += '<i class="icon-cross"></i>';
          }
          return t += '<span>' + e + '</span></div>';
        },
        show: function() {
          var e = this;
          this._super(), this._$wrapper.css('opacity', '1'), this._showOnce &&
          this.on('hided', function() {
            e.close();
          }), 0 != this._hideDelay && setTimeout(function() {
            e.hide();
          }, this._hideDelay);
        },
        hide: function() {
          var e = this;
          this.trigger('hide'), this._$wrapper.css('opacity',
              '0'), this._$mask && this._$mask.hide(), setTimeout(function() {
            e._$wrapper.hide(), e.trigger('hided');
          }, this._animationTime);
        },
        adjust: function() {
          var e = this._$wrapper.height(),
              t = (this._$wrapper.width(), $(window)),
              n = t.height(),
              r = (t.width(), (n - e) / 2 + document.body.scrollTop);
          this._$wrapper.css({
            top: r + 'px',
            left: '50%',
            transform: 'translate(-50%,0)',
          }), this._$wrapper[0].style.webkitTransform = 'translate(-50%,0)';
        },
      });
      return t;
    }), define('page/activity/getGeoLocation',
    ['fe_common/module/dialog/tipdialog'], function(e) {
      return {
        key: 'DZYBZ-73WWI-FG6GZ-5JRFR-PNVIE-4OFUL',
        name: 'waimaiapp',
        location: null,
        getLocation: function(t) {
          function n(n) {
            new e({
              content: '定位成功',
            });
            var r = Math.pow(10, 6),
                i = {
                  longitude: n.lng * r,
                  latitude: n.lat * r,
                };
            t && t(i);
          }

          function r(n) {
            new e({
              content: '获取定位失败',
            }), t();
          }

          var i = {
            timeout: 3e3,
          };
          this.location || (this.location = new qq.maps.Geolocation(this.key,
              this.name)), this.location.getLocation(n, r, i);
        },
      };
    }), !function() {
  function e(e) {
    if (e) c[0] = c[16] = c[1] = c[2] = c[3] = c[4] = c[5] = c[6] = c[7] = c[8] = c[9] = c[10] = c[11] = c[12] = c[13] = c[14] = c[15] = 0, this.blocks = c, this.buffer8 = r;
    else if (o) {
      var t = new ArrayBuffer(68);
      this.buffer8 = new Uint8Array(t), this.blocks = new Uint32Array(t);
    } else this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = 0, this.finalized = this.hashed = !1, this.first = !0;
  }

  var t = 'object' == typeof window ? window : {},
      n = !t.JS_MD5_NO_NODE_JS && 'object' == typeof process &&
          process.versions && process.versions.node;
  n && (t = global);
  var r,
      i = !t.JS_MD5_NO_COMMON_JS && 'object' == typeof module && module.exports,
      s = 'function' == typeof define && define.amd,
      o = !t.JS_MD5_NO_ARRAY_BUFFER && 'undefined' != typeof ArrayBuffer,
      u = '0123456789abcdef'.split(''),
      a = [128, 32768, 8388608, -2147483648],
      f = [0, 8, 16, 24],
      l = ['hex', 'array', 'digest', 'buffer', 'arrayBuffer'],
      c = [];
  if (o) {
    var h = new ArrayBuffer(68);
    r = new Uint8Array(h), c = new Uint32Array(h);
  }
  var p = function(t) {
        return function(n) {
          return (new e(!0)).update(n)[t]();
        };
      },
      d = function() {
        var t = p('hex');
        n && (t = v(t)), t.create = function() {
          return new e;
        }, t.update = function(e) {
          return t.create().update(e);
        };
        for (var r = 0; r < l.length; ++r) {
          var i = l[r];
          t[i] = p(i);
        }
        return t;
      },
      v = function(e) {
        var t = require('crypto'),
            n = require('buffer').Buffer,
            r = function(r) {
              if ('string' == typeof r) return t.createHash('md5').
                  update(r, 'utf8').
                  digest('hex');
              if (r.constructor === ArrayBuffer) r = new Uint8Array(r);
              else if (void 0 === r.length) return e(r);
              return t.createHash('md5').update(new n(r)).digest('hex');
            };
        return r;
      };
  e.prototype.update = function(e) {
    if (!this.finalized) {
      var n = 'string' != typeof e;
      n && e.constructor == t.ArrayBuffer && (e = new Uint8Array(e));
      for (var r, i, s = 0, u = e.length ||
          0, a = this.blocks, l = this.buffer8; u > s;) {
        if (this.hashed &&
            (this.hashed = !1, a[0] = a[16], a[16] = a[1] = a[2] = a[3] = a[4] = a[5] = a[6] = a[7] = a[8] = a[9] = a[10] = a[11] = a[12] = a[13] = a[14] = a[15] = 0), n)
          if (o)
            for (i = this.start; u > s && 64 > i; ++s) l[i++] = e[s];
          else
            for (i = this.start; u > s && 64 > i; ++s) a[i >> 2] |= e[s] <<
                f[3 & i++];
        else if (o)
          for (i = this.start; u > s && 64 > i; ++s) r = e.charCodeAt(s), 128 >
          r ?
              l[i++] = r :
              2048 > r ?
                  (l[i++] = 192 | r >> 6, l[i++] = 128 | 63 & r) :
                  55296 > r || r >= 57344 ?
                      (l[i++] = 224 | r >> 12, l[i++] = 128 | r >> 6 &
                          63, l[i++] = 128 | 63 & r) :
                      (r = 65536 + ((1023 & r) << 10 | 1023 &
                          e.charCodeAt(++s)), l[i++] = 240 | r >>
                          18, l[i++] = 128 | r >> 12 & 63, l[i++] = 128 | r >>
                          6 & 63, l[i++] = 128 | 63 & r);
        else
          for (i = this.start; u > s && 64 > i; ++s) r = e.charCodeAt(s), 128 >
          r ?
              a[i >> 2] |= r << f[3 & i++] :
              2048 > r ?
                  (a[i >> 2] |= (192 | r >> 6) << f[3 & i++], a[i >>
                  2] |= (128 | 63 & r) << f[3 & i++]) :
                  55296 > r || r >= 57344 ?
                      (a[i >> 2] |= (224 | r >> 12) << f[3 & i++], a[i >>
                      2] |= (128 | r >> 6 & 63) << f[3 & i++], a[i >>
                      2] |= (128 | 63 & r) << f[3 & i++]) :
                      (r = 65536 +
                          ((1023 & r) << 10 | 1023 & e.charCodeAt(++s)), a[i >>
                      2] |= (240 | r >> 18) << f[3 & i++], a[i >> 2] |= (128 |
                          r >> 12 & 63) << f[3 & i++], a[i >> 2] |= (128 | r >>
                          6 & 63) << f[3 & i++], a[i >> 2] |= (128 | 63 & r) <<
                          f[3 & i++]);
        this.lastByteIndex = i, this.bytes += i - this.start, i >= 64 ?
            (this.start = i - 64, this.hash(), this.hashed = !0) :
            this.start = i;
      }
      return this;
    }
  }, e.prototype.finalize = function() {
    if (!this.finalized) {
      this.finalized = !0;
      var e = this.blocks,
          t = this.lastByteIndex;
      e[t >> 2] |= a[3 & t], t >= 56 && (this.hashed ||
      this.hash(), e[0] = e[16], e[16] = e[1] = e[2] = e[3] = e[4] = e[5] = e[6] = e[7] = e[8] = e[9] = e[10] = e[11] = e[12] = e[13] = e[14] = e[15] = 0), e[14] = this.bytes <<
          3, this.hash();
    }
  }, e.prototype.hash = function() {
    var e, t, n, r, i, s, o = this.blocks;
    this.first ?
        (e = o[0] - 680876937, e = (e << 7 | e >>> 25) - 271733879 <<
            0, r = (-1732584194 ^ 2004318071 & e) + o[1] - 117830708, r = (r <<
            12 | r >>> 20) + e << 0, n = (-271733879 ^ r & (-271733879 ^ e)) +
            o[2] - 1126478375, n = (n << 17 | n >>> 15) + r << 0, t = (e ^ n &
            (r ^ e)) + o[3] - 1316259209, t = (t << 22 | t >>> 10) + n << 0) :
        (e = this.h0, t = this.h1, n = this.h2, r = this.h3, e += (r ^ t &
            (n ^ r)) + o[0] - 680876936, e = (e << 7 | e >>> 25) + t <<
            0, r += (n ^ e & (t ^ n)) + o[1] - 389564586, r = (r << 12 | r >>>
            20) + e << 0, n += (t ^ r & (e ^ t)) + o[2] + 606105819, n = (n <<
            17 | n >>> 15) + r << 0, t += (e ^ n & (r ^ e)) + o[3] -
            1044525330, t = (t << 22 | t >>> 10) + n << 0), e += (r ^ t &
        (n ^ r)) + o[4] - 176418897, e = (e << 7 | e >>> 25) + t << 0, r += (n ^
        e & (t ^ n)) + o[5] + 1200080426, r = (r << 12 | r >>> 20) + e <<
        0, n += (t ^ r & (e ^ t)) + o[6] - 1473231341, n = (n << 17 | n >>>
        15) + r << 0, t += (e ^ n & (r ^ e)) + o[7] - 45705983, t = (t << 22 |
        t >>> 10) + n << 0, e += (r ^ t & (n ^ r)) + o[8] +
        1770035416, e = (e << 7 | e >>> 25) + t << 0, r += (n ^ e & (t ^ n)) +
        o[9] - 1958414417, r = (r << 12 | r >>> 20) + e << 0, n += (t ^ r &
        (e ^ t)) + o[10] - 42063, n = (n << 17 | n >>> 15) + r << 0, t += (e ^
        n & (r ^ e)) + o[11] - 1990404162, t = (t << 22 | t >>> 10) + n <<
        0, e += (r ^ t & (n ^ r)) + o[12] + 1804603682, e = (e << 7 | e >>>
        25) + t << 0, r += (n ^ e & (t ^ n)) + o[13] - 40341101, r = (r << 12 |
        r >>> 20) + e << 0, n += (t ^ r & (e ^ t)) + o[14] -
        1502002290, n = (n << 17 | n >>> 15) + r << 0, t += (e ^ n & (r ^ e)) +
        o[15] + 1236535329, t = (t << 22 | t >>> 10) + n << 0, e += (n ^ r &
        (t ^ n)) + o[1] - 165796510, e = (e << 5 | e >>> 27) + t << 0, r += (t ^
        n & (e ^ t)) + o[6] - 1069501632, r = (r << 9 | r >>> 23) + e <<
        0, n += (e ^ t & (r ^ e)) + o[11] + 643717713, n = (n << 14 | n >>>
        18) + r << 0, t += (r ^ e & (n ^ r)) + o[0] - 373897302, t = (t << 20 |
        t >>> 12) + n << 0, e += (n ^ r & (t ^ n)) + o[5] - 701558691, e = (e <<
        5 | e >>> 27) + t << 0, r += (t ^ n & (e ^ t)) + o[10] +
        38016083, r = (r << 9 | r >>> 23) + e << 0, n += (e ^ t & (r ^ e)) +
        o[15] - 660478335, n = (n << 14 | n >>> 18) + r << 0, t += (r ^ e &
        (n ^ r)) + o[4] - 405537848, t = (t << 20 | t >>> 12) + n <<
        0, e += (n ^ r & (t ^ n)) + o[9] + 568446438, e = (e << 5 | e >>> 27) +
        t << 0, r += (t ^ n & (e ^ t)) + o[14] - 1019803690, r = (r << 9 | r >>>
        23) + e << 0, n += (e ^ t & (r ^ e)) + o[3] - 187363961, n = (n << 14 |
        n >>> 18) + r << 0, t += (r ^ e & (n ^ r)) + o[8] +
        1163531501, t = (t << 20 | t >>> 12) + n << 0, e += (n ^ r & (t ^ n)) +
        o[13] - 1444681467, e = (e << 5 | e >>> 27) + t << 0, r += (t ^ n &
        (e ^ t)) + o[2] - 51403784, r = (r << 9 | r >>> 23) + e << 0, n += (e ^
        t & (r ^ e)) + o[7] + 1735328473, n = (n << 14 | n >>> 18) + r <<
        0, t += (r ^ e & (n ^ r)) + o[12] - 1926607734, t = (t << 20 | t >>>
        12) + n << 0, i = t ^ n, e += (i ^ r) + o[5] - 378558, e = (e << 4 |
        e >>> 28) + t << 0, r += (i ^ e) + o[8] - 2022574463, r = (r << 11 |
        r >>> 21) + e << 0, s = r ^ e, n += (s ^ t) + o[11] +
        1839030562, n = (n << 16 | n >>> 16) + r << 0, t += (s ^ n) + o[14] -
        35309556, t = (t << 23 | t >>> 9) + n << 0, i = t ^ n, e += (i ^ r) +
        o[1] - 1530992060, e = (e << 4 | e >>> 28) + t << 0, r += (i ^ e) +
        o[4] + 1272893353, r = (r << 11 | r >>> 21) + e << 0, s = r ^
        e, n += (s ^ t) + o[7] - 155497632, n = (n << 16 | n >>> 16) + r <<
        0, t += (s ^ n) + o[10] - 1094730640, t = (t << 23 | t >>> 9) + n <<
        0, i = t ^ n, e += (i ^ r) + o[13] + 681279174, e = (e << 4 | e >>>
        28) + t << 0, r += (i ^ e) + o[0] - 358537222, r = (r << 11 | r >>>
        21) + e << 0, s = r ^ e, n += (s ^ t) + o[3] - 722521979, n = (n << 16 |
        n >>> 16) + r << 0, t += (s ^ n) + o[6] + 76029189, t = (t << 23 | t >>>
        9) + n << 0, i = t ^ n, e += (i ^ r) + o[9] - 640364487, e = (e << 4 |
        e >>> 28) + t << 0, r += (i ^ e) + o[12] - 421815835, r = (r << 11 |
        r >>> 21) + e << 0, s = r ^ e, n += (s ^ t) + o[15] +
        530742520, n = (n << 16 | n >>> 16) + r << 0, t += (s ^ n) + o[2] -
        995338651, t = (t << 23 | t >>> 9) + n << 0, e += (n ^ (t | ~r)) +
        o[0] - 198630844, e = (e << 6 | e >>> 26) + t << 0, r += (t ^
        (e | ~n)) + o[7] + 1126891415, r = (r << 10 | r >>> 22) + e <<
        0, n += (e ^ (r | ~t)) + o[14] - 1416354905, n = (n << 15 | n >>> 17) +
        r << 0, t += (r ^ (n | ~e)) + o[5] - 57434055, t = (t << 21 | t >>>
        11) + n << 0, e += (n ^ (t | ~r)) + o[12] + 1700485571, e = (e << 6 |
        e >>> 26) + t << 0, r += (t ^ (e | ~n)) + o[3] - 1894986606, r = (r <<
        10 | r >>> 22) + e << 0, n += (e ^ (r | ~t)) + o[10] -
        1051523, n = (n << 15 | n >>> 17) + r << 0, t += (r ^ (n | ~e)) + o[1] -
        2054922799, t = (t << 21 | t >>> 11) + n << 0, e += (n ^ (t | ~r)) +
        o[8] + 1873313359, e = (e << 6 | e >>> 26) + t << 0, r += (t ^
        (e | ~n)) + o[15] - 30611744, r = (r << 10 | r >>> 22) + e <<
        0, n += (e ^ (r | ~t)) + o[6] - 1560198380, n = (n << 15 | n >>> 17) +
        r << 0, t += (r ^ (n | ~e)) + o[13] + 1309151649, t = (t << 21 | t >>>
        11) + n << 0, e += (n ^ (t | ~r)) + o[4] - 145523070, e = (e << 6 |
        e >>> 26) + t << 0, r += (t ^ (e | ~n)) + o[11] - 1120210379, r = (r <<
        10 | r >>> 22) + e << 0, n += (e ^ (r | ~t)) + o[2] +
        718787259, n = (n << 15 | n >>> 17) + r << 0, t += (r ^ (n | ~e)) +
        o[9] - 343485551, t = (t << 21 | t >>> 11) + n << 0, this.first ?
        (this.h0 = e + 1732584193 << 0, this.h1 = t - 271733879 <<
            0, this.h2 = n - 1732584194 << 0, this.h3 = r + 271733878 <<
            0, this.first = !1) :
        (this.h0 = this.h0 + e << 0, this.h1 = this.h1 + t <<
            0, this.h2 = this.h2 + n << 0, this.h3 = this.h3 + r << 0);
  }, e.prototype.hex = function() {
    this.finalize();
    var e = this.h0,
        t = this.h1,
        n = this.h2,
        r = this.h3;
    return u[e >> 4 & 15] + u[15 & e] + u[e >> 12 & 15] + u[e >> 8 & 15] +
        u[e >> 20 & 15] + u[e >> 16 & 15] + u[e >> 28 & 15] + u[e >> 24 & 15] +
        u[t >> 4 & 15] + u[15 & t] + u[t >> 12 & 15] + u[t >> 8 & 15] +
        u[t >> 20 & 15] + u[t >> 16 & 15] + u[t >> 28 & 15] + u[t >> 24 & 15] +
        u[n >> 4 & 15] + u[15 & n] + u[n >> 12 & 15] + u[n >> 8 & 15] +
        u[n >> 20 & 15] + u[n >> 16 & 15] + u[n >> 28 & 15] + u[n >> 24 & 15] +
        u[r >> 4 & 15] + u[15 & r] + u[r >> 12 & 15] + u[r >> 8 & 15] +
        u[r >> 20 & 15] + u[r >> 16 & 15] + u[r >> 28 & 15] + u[r >> 24 & 15];
  }, e.prototype.toString = e.prototype.hex, e.prototype.digest = function() {
    this.finalize();
    var e = this.h0,
        t = this.h1,
        n = this.h2,
        r = this.h3;
    return [
      255 & e,
      e >> 8 & 255,
      e >> 16 & 255,
      e >> 24 & 255,
      255 & t,
      t >> 8 & 255,
      t >> 16 & 255,
      t >> 24 & 255,
      255 & n,
      n >> 8 & 255,
      n >> 16 & 255,
      n >> 24 & 255,
      255 & r,
      r >> 8 & 255,
      r >> 16 & 255,
      r >> 24 & 255];
  }, e.prototype.array = e.prototype.digest, e.prototype.arrayBuffer = function() {
    this.finalize();
    var e = new ArrayBuffer(16),
        t = new Uint32Array(e);
    return t[0] = this.h0, t[1] = this.h1, t[2] = this.h2, t[3] = this.h3, e;
  }, e.prototype.buffer = e.prototype.arrayBuffer;
  var m = d();
  i ?
      module.exports = m :
      (t.md5 = m, s && define('module/md5', [], function() {
        return m;
      }));
}();
var CryptoJS = CryptoJS || function(e, t) {
  var n = {},
      r = n.lib = {},
      i = function() {
      },
      s = r.Base = {
        extend: function(e) {
          i.prototype = this;
          var t = new i;
          return e && t.mixIn(e), t.hasOwnProperty('init') ||
          (t.init = function() {
            t.$super.init.apply(this, arguments);
          }), t.init.prototype = t, t.$super = this, t;
        },
        create: function() {
          var e = this.extend();
          return e.init.apply(e, arguments), e;
        },
        init: function() {
        },
        mixIn: function(e) {
          for (var t in e) e.hasOwnProperty(t) && (this[t] = e[t]);
          e.hasOwnProperty('toString') && (this.toString = e.toString);
        },
        clone: function() {
          return this.init.prototype.extend(this);
        },
      },
      o = r.WordArray = s.extend({
        init: function(e, n) {
          e = this.words = e || [], this.sigBytes = n != t ? n : 4 * e.length;
        },
        toString: function(e) {
          return (e || a).stringify(this);
        },
        concat: function(e) {
          var t = this.words,
              n = e.words,
              r = this.sigBytes;
          if (e = e.sigBytes, this.clamp(), r % 4)
            for (var i = 0; e > i; i++) t[r + i >>> 2] |= (n[i >>> 2] >>> 24 -
                8 * (i % 4) & 255) << 24 - 8 * ((r + i) % 4);
          else if (65535 < n.length)
            for (i = 0; e > i; i += 4) t[r + i >>> 2] = n[i >>> 2];
          else t.push.apply(t, n);
          return this.sigBytes += e, this;
        },
        clamp: function() {
          var t = this.words,
              n = this.sigBytes;
          t[n >>> 2] &= 4294967295 << 32 - 8 * (n % 4), t.length = e.ceil(n / 4);
        },
        clone: function() {
          var e = s.clone.call(this);
          return e.words = this.words.slice(0), e;
        },
        random: function(t) {
          for (var n = [], r = 0; t > r; r += 4) n.push(4294967296 *
              e.random() | 0);
          return new o.init(n, t);
        },
      }),
      u = n.enc = {},
      a = u.Hex = {
        stringify: function(e) {
          var t = e.words;
          e = e.sigBytes;
          for (var n = [], r = 0; e > r; r++) {
            var i = t[r >>> 2] >>> 24 - 8 * (r % 4) & 255;
            n.push((i >>> 4).toString(16)), n.push((15 & i).toString(16));
          }
          return n.join('');
        },
        parse: function(e) {
          for (var t = e.length, n = [], r = 0; t > r; r += 2) n[r >>>
          3] |= parseInt(e.substr(r, 2), 16) << 24 - 4 * (r % 8);
          return new o.init(n, t / 2);
        },
      },
      f = u.Latin1 = {
        stringify: function(e) {
          var t = e.words;
          e = e.sigBytes;
          for (var n = [], r = 0; e > r; r++) n.push(
              String.fromCharCode(t[r >>> 2] >>> 24 - 8 * (r % 4) & 255));
          return n.join('');
        },
        parse: function(e) {
          for (var t = e.length, n = [], r = 0; t > r; r++) n[r >>> 2] |= (255 &
              e.charCodeAt(r)) << 24 - 8 * (r % 4);
          return new o.init(n, t);
        },
      },
      l = u.Utf8 = {
        stringify: function(e) {
          try {
            return decodeURIComponent(escape(f.stringify(e)));
          } catch (t) {
            throw Error('Malformed UTF-8 data');
          }
        },
        parse: function(e) {
          return f.parse(unescape(encodeURIComponent(e)));
        },
      },
      c = r.BufferedBlockAlgorithm = s.extend({
        reset: function() {
          this._data = new o.init, this._nDataBytes = 0;
        },
        _append: function(e) {
          'string' == typeof e && (e = l.parse(e)), this._data.concat(
              e), this._nDataBytes += e.sigBytes;
        },
        _process: function(t) {
          var n = this._data,
              r = n.words,
              i = n.sigBytes,
              s = this.blockSize,
              u = i / (4 * s),
              u = t ? e.ceil(u) : e.max((0 | u) - this._minBufferSize, 0);
          if (t = u * s, i = e.min(4 * t, i), t) {
            for (var a = 0; t > a; a += s) this._doProcessBlock(r, a);
            a = r.splice(0, t), n.sigBytes -= i;
          }
          return new o.init(a, i);
        },
        clone: function() {
          var e = s.clone.call(this);
          return e._data = this._data.clone(), e;
        },
        _minBufferSize: 0,
      });
  r.Hasher = c.extend({
    cfg: s.extend(),
    init: function(e) {
      this.cfg = this.cfg.extend(e), this.reset();
    },
    reset: function() {
      c.reset.call(this), this._doReset();
    },
    update: function(e) {
      return this._append(e), this._process(), this;
    },
    finalize: function(e) {
      return e && this._append(e), this._doFinalize();
    },
    blockSize: 16,
    _createHelper: function(e) {
      return function(t, n) {
        return (new e.init(n)).finalize(t);
      };
    },
    _createHmacHelper: function(e) {
      return function(t, n) {
        return (new h.HMAC.init(e, n)).finalize(t);
      };
    },
  });
  var h = n.algo = {};
  return n;
}(Math);
!function() {
  var e = CryptoJS,
      t = e.lib.WordArray;
  e.enc.Base64 = {
    stringify: function(e) {
      var t = e.words,
          n = e.sigBytes,
          r = this._map;
      e.clamp(), e = [];
      for (var i = 0; n > i; i += 3)
        for (var s = (t[i >>> 2] >>> 24 - 8 * (i % 4) & 255) << 16 |
            (t[i + 1 >>> 2] >>> 24 - 8 * ((i + 1) % 4) & 255) << 8 |
            t[i + 2 >>> 2] >>> 24 - 8 * ((i + 2) % 4) & 255, o = 0; 4 > o &&
             n > i + .75 * o; o++) e.push(r.charAt(s >>> 6 * (3 - o) & 63));
      if (t = r.charAt(64))
        for (; e.length % 4;) e.push(t);
      return e.join('');
    },
    parse: function(e) {
      var n = e.length,
          r = this._map,
          i = r.charAt(64);
      i && (i = e.indexOf(i), -1 != i && (n = i));
      for (var i = [], s = 0, o = 0; n > o; o++)
        if (o % 4) {
          var u = r.indexOf(e.charAt(o - 1)) << 2 * (o % 4),
              a = r.indexOf(e.charAt(o)) >>> 6 - 2 * (o % 4);
          i[s >>> 2] |= (u | a) << 24 - 8 * (s % 4), s++;
        }
      return t.create(i, s);
    },
    _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  };
}(),
    function(e) {
      function t(e, t, n, r, i, s, o) {
        return e = e + (t & n | ~t & r) + i + o, (e << s | e >>> 32 - s) + t;
      }

      function n(e, t, n, r, i, s, o) {
        return e = e + (t & r | n & ~r) + i + o, (e << s | e >>> 32 - s) + t;
      }

      function r(e, t, n, r, i, s, o) {
        return e = e + (t ^ n ^ r) + i + o, (e << s | e >>> 32 - s) + t;
      }

      function i(e, t, n, r, i, s, o) {
        return e = e + (n ^ (t | ~r)) + i + o, (e << s | e >>> 32 - s) + t;
      }

      for (var s = CryptoJS, o = s.lib, u = o.WordArray, a = o.Hasher, o = s.algo, f = [], l = 0; 64 >
      l; l++) f[l] = 4294967296 * e.abs(e.sin(l + 1)) | 0;
      o = o.MD5 = a.extend({
        _doReset: function() {
          this._hash = new u.init(
              [1732584193, 4023233417, 2562383102, 271733878]);
        },
        _doProcessBlock: function(e, s) {
          for (var o = 0; 16 > o; o++) {
            var u = s + o,
                a = e[u];
            e[u] = 16711935 & (a << 8 | a >>> 24) | 4278255360 &
                (a << 24 | a >>> 8);
          }
          var o = this._hash.words,
              u = e[s + 0],
              a = e[s + 1],
              l = e[s + 2],
              c = e[s + 3],
              h = e[s + 4],
              p = e[s + 5],
              d = e[s + 6],
              v = e[s + 7],
              m = e[s + 8],
              g = e[s + 9],
              y = e[s + 10],
              b = e[s + 11],
              w = e[s + 12],
              E = e[s + 13],
              S = e[s + 14],
              x = e[s + 15],
              T = o[0],
              N = o[1],
              C = o[2],
              k = o[3],
              T = t(T, N, C, k, u, 7, f[0]),
              k = t(k, T, N, C, a, 12, f[1]),
              C = t(C, k, T, N, l, 17, f[2]),
              N = t(N, C, k, T, c, 22, f[3]),
              T = t(T, N, C, k, h, 7, f[4]),
              k = t(k, T, N, C, p, 12, f[5]),
              C = t(C, k, T, N, d, 17, f[6]),
              N = t(N, C, k, T, v, 22, f[7]),
              T = t(T, N, C, k, m, 7, f[8]),
              k = t(k, T, N, C, g, 12, f[9]),
              C = t(C, k, T, N, y, 17, f[10]),
              N = t(N, C, k, T, b, 22, f[11]),
              T = t(T, N, C, k, w, 7, f[12]),
              k = t(k, T, N, C, E, 12, f[13]),
              C = t(C, k, T, N, S, 17, f[14]),
              N = t(N, C, k, T, x, 22, f[15]),
              T = n(T, N, C, k, a, 5, f[16]),
              k = n(k, T, N, C, d, 9, f[17]),
              C = n(C, k, T, N, b, 14, f[18]),
              N = n(N, C, k, T, u, 20, f[19]),
              T = n(T, N, C, k, p, 5, f[20]),
              k = n(k, T, N, C, y, 9, f[21]),
              C = n(C, k, T, N, x, 14, f[22]),
              N = n(N, C, k, T, h, 20, f[23]),
              T = n(T, N, C, k, g, 5, f[24]),
              k = n(k, T, N, C, S, 9, f[25]),
              C = n(C, k, T, N, c, 14, f[26]),
              N = n(N, C, k, T, m, 20, f[27]),
              T = n(T, N, C, k, E, 5, f[28]),
              k = n(k, T, N, C, l, 9, f[29]),
              C = n(C, k, T, N, v, 14, f[30]),
              N = n(N, C, k, T, w, 20, f[31]),
              T = r(T, N, C, k, p, 4, f[32]),
              k = r(k, T, N, C, m, 11, f[33]),
              C = r(C, k, T, N, b, 16, f[34]),
              N = r(N, C, k, T, S, 23, f[35]),
              T = r(T, N, C, k, a, 4, f[36]),
              k = r(k, T, N, C, h, 11, f[37]),
              C = r(C, k, T, N, v, 16, f[38]),
              N = r(N, C, k, T, y, 23, f[39]),
              T = r(T, N, C, k, E, 4, f[40]),
              k = r(k, T, N, C, u, 11, f[41]),
              C = r(C, k, T, N, c, 16, f[42]),
              N = r(N, C, k, T, d, 23, f[43]),
              T = r(T, N, C, k, g, 4, f[44]),
              k = r(k, T, N, C, w, 11, f[45]),
              C = r(C, k, T, N, x, 16, f[46]),
              N = r(N, C, k, T, l, 23, f[47]),
              T = i(T, N, C, k, u, 6, f[48]),
              k = i(k, T, N, C, v, 10, f[49]),
              C = i(C, k, T, N, S, 15, f[50]),
              N = i(N, C, k, T, p, 21, f[51]),
              T = i(T, N, C, k, w, 6, f[52]),
              k = i(k, T, N, C, c, 10, f[53]),
              C = i(C, k, T, N, y, 15, f[54]),
              N = i(N, C, k, T, a, 21, f[55]),
              T = i(T, N, C, k, m, 6, f[56]),
              k = i(k, T, N, C, x, 10, f[57]),
              C = i(C, k, T, N, d, 15, f[58]),
              N = i(N, C, k, T, E, 21, f[59]),
              T = i(T, N, C, k, h, 6, f[60]),
              k = i(k, T, N, C, b, 10, f[61]),
              C = i(C, k, T, N, l, 15, f[62]),
              N = i(N, C, k, T, g, 21, f[63]);
          o[0] = o[0] + T | 0, o[1] = o[1] + N | 0, o[2] = o[2] + C |
              0, o[3] = o[3] + k | 0;
        },
        _doFinalize: function() {
          var t = this._data,
              n = t.words,
              r = 8 * this._nDataBytes,
              i = 8 * t.sigBytes;
          n[i >>> 5] |= 128 << 24 - i % 32;
          var s = e.floor(r / 4294967296);
          for (n[(i + 64 >>> 9 << 4) + 15] = 16711935 & (s << 8 | s >>> 24) |
              4278255360 & (s << 24 | s >>> 8), n[(i + 64 >>> 9 << 4) +
          14] = 16711935 & (r << 8 | r >>> 24) | 4278255360 &
              (r << 24 | r >>> 8), t.sigBytes = 4 * (n.length +
              1), this._process(), t = this._hash, n = t.words, r = 0; 4 >
               r; r++) i = n[r], n[r] = 16711935 & (i << 8 | i >>> 24) |
              4278255360 & (i << 24 | i >>> 8);
          return t;
        },
        clone: function() {
          var e = a.clone.call(this);
          return e._hash = this._hash.clone(), e;
        },
      }), s.MD5 = a._createHelper(o), s.HmacMD5 = a._createHmacHelper(o);
    }(Math),
    function() {
      var e = CryptoJS,
          t = e.lib,
          n = t.Base,
          r = t.WordArray,
          t = e.algo,
          i = t.EvpKDF = n.extend({
            cfg: n.extend({
              keySize: 4,
              hasher: t.MD5,
              iterations: 1,
            }),
            init: function(e) {
              this.cfg = this.cfg.extend(e);
            },
            compute: function(e, t) {
              for (var n = this.cfg, i = n.hasher.create(), s = r.create(), o = s.words, u = n.keySize, n = n.iterations; o.length <
              u;) {
                a && i.update(a);
                var a = i.update(e).finalize(t);
                i.reset();
                for (var f = 1; n > f; f++) a = i.finalize(a), i.reset();
                s.concat(a);
              }
              return s.sigBytes = 4 * u, s;
            },
          });
      e.EvpKDF = function(e, t, n) {
        return i.create(n).compute(e, t);
      };
    }(), CryptoJS.lib.Cipher || function(e) {
  var t = CryptoJS,
      n = t.lib,
      r = n.Base,
      i = n.WordArray,
      s = n.BufferedBlockAlgorithm,
      o = t.enc.Base64,
      u = t.algo.EvpKDF,
      a = n.Cipher = s.extend({
        cfg: r.extend(),
        createEncryptor: function(e, t) {
          return this.create(this._ENC_XFORM_MODE, e, t);
        },
        createDecryptor: function(e, t) {
          return this.create(this._DEC_XFORM_MODE, e, t);
        },
        init: function(e, t, n) {
          this.cfg = this.cfg.extend(
              n), this._xformMode = e, this._key = t, this.reset();
        },
        reset: function() {
          s.reset.call(this), this._doReset();
        },
        process: function(e) {
          return this._append(e), this._process();
        },
        finalize: function(e) {
          return e && this._append(e), this._doFinalize();
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function(e) {
          return {
            encrypt: function(t, n, r) {
              return ('string' == typeof n ? d : p).encrypt(e, t, n, r);
            },
            decrypt: function(t, n, r) {
              return ('string' == typeof n ? d : p).decrypt(e, t, n, r);
            },
          };
        },
      });
  n.StreamCipher = a.extend({
    _doFinalize: function() {
      return this._process(!0);
    },
    blockSize: 1,
  });
  var f = t.mode = {},
      l = function(t, n, r) {
        var i = this._iv;
        i ? this._iv = e : i = this._prevBlock;
        for (var s = 0; r > s; s++) t[n + s] ^= i[s];
      },
      c = (n.BlockCipherMode = r.extend({
        createEncryptor: function(e, t) {
          return this.Encryptor.create(e, t);
        },
        createDecryptor: function(e, t) {
          return this.Decryptor.create(e, t);
        },
        init: function(e, t) {
          this._cipher = e, this._iv = t;
        },
      })).extend();
  c.Encryptor = c.extend({
    processBlock: function(e, t) {
      var n = this._cipher,
          r = n.blockSize;
      l.call(this, e, t, r), n.encryptBlock(e, t), this._prevBlock = e.slice(
          t, t + r);
    },
  }), c.Decryptor = c.extend({
    processBlock: function(e, t) {
      var n = this._cipher,
          r = n.blockSize,
          i = e.slice(t, t + r);
      n.decryptBlock(e, t), l.call(this, e, t, r), this._prevBlock = i;
    },
  }), f = f.CBC = c, c = (t.pad = {}).Pkcs7 = {
    pad: function(e, t) {
      for (var n = 4 * t, n = n - e.sigBytes % n, r = n << 24 | n << 16 | n <<
          8 | n, s = [], o = 0; n > o; o += 4) s.push(r);
      n = i.create(s, n), e.concat(n);
    },
    unpad: function(e) {
      e.sigBytes -= 255 & e.words[e.sigBytes - 1 >>> 2];
    },
  }, n.BlockCipher = a.extend({
    cfg: a.cfg.extend({
      mode: f,
      padding: c,
    }),
    reset: function() {
      a.reset.call(this);
      var e = this.cfg,
          t = e.iv,
          e = e.mode;
      if (this._xformMode == this._ENC_XFORM_MODE) var n = e.createEncryptor;
      else n = e.createDecryptor, this._minBufferSize = 1;
      this._mode = n.call(e, this, t && t.words);
    },
    _doProcessBlock: function(e, t) {
      this._mode.processBlock(e, t);
    },
    _doFinalize: function() {
      var e = this.cfg.padding;
      if (this._xformMode == this._ENC_XFORM_MODE) {
        e.pad(this._data, this.blockSize);
        var t = this._process(!0);
      } else t = this._process(!0), e.unpad(t);
      return t;
    },
    blockSize: 4,
  });
  var h = n.CipherParams = r.extend({
        init: function(e) {
          this.mixIn(e);
        },
        toString: function(e) {
          return (e || this.formatter).stringify(this);
        },
      }),
      f = (t.format = {}).OpenSSL = {
        stringify: function(e) {
          var t = e.ciphertext;
          return e = e.salt, (e ?
              i.create([1398893684, 1701076831]).concat(e).concat(t) :
              t).toString(o);
        },
        parse: function(e) {
          e = o.parse(e);
          var t = e.words;
          if (1398893684 == t[0] && 1701076831 == t[1]) {
            var n = i.create(t.slice(2, 4));
            t.splice(0, 4), e.sigBytes -= 16;
          }
          return h.create({
            ciphertext: e,
            salt: n,
          });
        },
      },
      p = n.SerializableCipher = r.extend({
        cfg: r.extend({
          format: f,
        }),
        encrypt: function(e, t, n, r) {
          r = this.cfg.extend(r);
          var i = e.createEncryptor(n, r);
          return t = i.finalize(t), i = i.cfg, h.create({
            ciphertext: t,
            key: n,
            iv: i.iv,
            algorithm: e,
            mode: i.mode,
            padding: i.padding,
            blockSize: e.blockSize,
            formatter: r.format,
          });
        },
        decrypt: function(e, t, n, r) {
          return r = this.cfg.extend(r), t = this._parse(t,
              r.format), e.createDecryptor(n, r).finalize(t.ciphertext);
        },
        _parse: function(e, t) {
          return 'string' == typeof e ? t.parse(e, this) : e;
        },
      }),
      t = (t.kdf = {}).OpenSSL = {
        execute: function(e, t, n, r) {
          return r || (r = i.random(8)), e = u.create({
            keySize: t + n,
          }).compute(e, r), n = i.create(e.words.slice(t), 4 *
              n), e.sigBytes = 4 * t, h.create({
            key: e,
            iv: n,
            salt: r,
          });
        },
      },
      d = n.PasswordBasedCipher = p.extend({
        cfg: p.cfg.extend({
          kdf: t,
        }),
        encrypt: function(e, t, n, r) {
          return r = this.cfg.extend(r), n = r.kdf.execute(n, e.keySize,
              e.ivSize), r.iv = n.iv, e = p.encrypt.call(this, e, t, n.key,
              r), e.mixIn(n), e;
        },
        decrypt: function(e, t, n, r) {
          return r = this.cfg.extend(r), t = this._parse(t,
              r.format), n = r.kdf.execute(n, e.keySize, e.ivSize,
              t.salt), r.iv = n.iv, p.decrypt.call(this, e, t, n.key, r);
        },
      });
}(),
    function() {
      for (var e = CryptoJS, t = e.lib.BlockCipher, n = e.algo, r = [], i = [], s = [], o = [], u = [], a = [], f = [], l = [], c = [], h = [], p = [], d = 0; 256 >
      d; d++) p[d] = 128 > d ? d << 1 : d << 1 ^ 283;
      for (var v = 0, m = 0, d = 0; 256 > d; d++) {
        var g = m ^ m << 1 ^ m << 2 ^ m << 3 ^ m << 4,
            g = g >>> 8 ^ 255 & g ^ 99;
        r[v] = g, i[g] = v;
        var y = p[v],
            b = p[y],
            w = p[b],
            E = 257 * p[g] ^ 16843008 * g;
        s[v] = E << 24 | E >>> 8, o[v] = E << 16 | E >>> 16, u[v] = E << 8 |
            E >>> 24, a[v] = E, E = 16843009 * w ^ 65537 * b ^ 257 * y ^
            16843008 * v, f[g] = E << 24 | E >>> 8, l[g] = E << 16 | E >>>
            16, c[g] = E << 8 | E >>> 24, h[g] = E, v ?
            (v = y ^ p[p[p[w ^ y]]], m ^= p[p[m]]) :
            v = m = 1;
      }
      var S = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
          n = n.AES = t.extend({
            _doReset: function() {
              for (var e = this._key, t = e.words, n = e.sigBytes / 4, e = 4 *
                  ((this._nRounds = n + 6) +
                      1), i = this._keySchedule = [], s = 0; e > s; s++)
                if (n > s) i[s] = t[s];
                else {
                  var o = i[s - 1];
                  s % n ?
                      n > 6 && 4 == s % n &&
                      (o = r[o >>> 24] << 24 | r[o >>> 16 & 255] << 16 |
                          r[o >>> 8 & 255] << 8 | r[255 & o]) :
                      (o = o << 8 | o >>> 24, o = r[o >>> 24] << 24 |
                          r[o >>> 16 & 255] << 16 | r[o >>> 8 & 255] << 8 |
                          r[255 & o], o ^= S[s / n | 0] << 24), i[s] = i[s -
                  n] ^ o;
                }
              for (t = this._invKeySchedule = [], n = 0; e > n; n++) s = e -
                  n, o = n % 4 ? i[s] : i[s - 4], t[n] = 4 > n || 4 >= s ?
                  o :
                  f[r[o >>> 24]] ^ l[r[o >>> 16 & 255]] ^ c[r[o >>> 8 & 255]] ^
                  h[r[255 & o]];
            },
            encryptBlock: function(e, t) {
              this._doCryptBlock(e, t, this._keySchedule, s, o, u, a, r);
            },
            decryptBlock: function(e, t) {
              var n = e[t + 1];
              e[t + 1] = e[t + 3], e[t + 3] = n, this._doCryptBlock(e, t,
                  this._invKeySchedule, f, l, c, h, i), n = e[t + 1], e[t +
              1] = e[t + 3], e[t + 3] = n;
            },
            _doCryptBlock: function(e, t, n, r, i, s, o, u) {
              for (var a = this._nRounds, f = e[t] ^ n[0], l = e[t + 1] ^
                  n[1], c = e[t + 2] ^ n[2], h = e[t + 3] ^
                  n[3], p = 4, d = 1; a > d; d++) var v = r[f >>> 24] ^
                  i[l >>> 16 & 255] ^ s[c >>> 8 & 255] ^ o[255 & h] ^ n[p++],
                       m = r[l >>> 24] ^ i[c >>> 16 & 255] ^ s[h >>> 8 & 255] ^
                           o[255 & f] ^ n[p++],
                       g = r[c >>> 24] ^ i[h >>> 16 & 255] ^ s[f >>> 8 & 255] ^
                           o[255 & l] ^ n[p++],
                       h = r[h >>> 24] ^ i[f >>> 16 & 255] ^ s[l >>> 8 & 255] ^
                           o[255 & c] ^ n[p++],
                       f = v,
                       l = m,
                       c = g;
              v = (u[f >>> 24] << 24 | u[l >>> 16 & 255] << 16 |
                  u[c >>> 8 & 255] << 8 | u[255 & h]) ^ n[p++], m = (u[l >>>
                  24] << 24 | u[c >>> 16 & 255] << 16 | u[h >>> 8 & 255] << 8 |
                  u[255 & f]) ^ n[p++], g = (u[c >>> 24] << 24 |
                  u[h >>> 16 & 255] << 16 | u[f >>> 8 & 255] << 8 |
                  u[255 & l]) ^ n[p++], h = (u[h >>> 24] << 24 |
                  u[f >>> 16 & 255] << 16 | u[l >>> 8 & 255] << 8 |
                  u[255 & c]) ^ n[p++], e[t] = v, e[t + 1] = m, e[t +
              2] = g, e[t + 3] = h;
            },
            keySize: 8,
          });
      e.AES = t._createHelper(n);
    }(), define('module/aes', [], function() {
}), define('module/aesCrypto', ['module/md5', 'module/aes'], function(e) {
  const t = '240789B06A4D4FAG',
      n = '1513D520B9C1459C',
      r = 'sxaa1k89dc';
  return {
    validate: function(e) {
      var t = this;
      if (e.length < 32) return !1;
      var n = e.slice(0, 32),
          r = e.slice(32),
          i = this.decrypto(r);
      return n == t.md5(i) ? i : !1;
    },
    md5: function(t) {
      return e(t + r).toLocaleUpperCase();
    },
    decrypto: function(e) {
      var r = CryptoJS.enc.Utf8.parse(t),
          i = CryptoJS.enc.Utf8.parse(n),
          s = CryptoJS.AES.decrypt(e, r, {
            iv: i,
            mode: CryptoJS.mode.CBC,
          }),
          o = CryptoJS.enc.Utf8.stringify(s).toString();
      try {
        location.href.indexOf('debug') > -1 &&
        console.log(JSON.parse(o || '{}'));
      } catch (u) {
      }
      return o;
    },
  };
}), define('page/activity/shareCoupon', [
  'fe_common/module/browser',
  'module/appDownload',
  'fe_common/module/StatusButton',
  'module/SmsCaptcha',
  'module/callApp',
  'module/WebviewShare',
  'fe_common/module/dialog/tipdialog',
  'page/uploadData/uploadData',
  'page/activity/getGeoLocation',
  'module/mtsi',
  'module/aesCrypto'], function(e, t, n, r, i, s, o, u, a, f, l) {
  return {
    baseurl: '',
    channel: '',
    terminal: '',
    logData: '',
    originUrl: location.href,
    _urlKey: null,
    captureBtn: new n('#capture-btn'),
    init: function(t) {
      var n = this;
      e.versions.android &&
      $('html').css('font-size', $(window).width() / 12 + 'px'), !t.toast ||
      new o({
        content: t.toast,
      }), n.logData = t.logData;
      try {
        n._ADUpload(t.ADUpload);
      } catch (r) {
        console.log(r), Owl.addError({
          name: 'statisticsError',
          msg: '广告上报异常',
        }, {
          combo: !0,
          level: 'warn',
        });
      }
      if (t) {
        n.baseurl = t.baseurl, n.channel = t.channel, n.terminal = t.terminal, n._urlKey = t.urlKey ||
            '', n.channelId = t.channelId, n.channel = t.channel, n.channelUrlKey = t.channelUrlKey, n.dim_ui_id = t.dim_ui_id, n.bNeedPhone = t.bNeedPhone ==
            'true', n.adUploadData = t.ADUpload, n.dparam = t.dparam, n.defaultBtnInfo = {
          default_bt_text_success: t.defaultBtnInfo.default_bt_text_success ||
          '立即使用',
          default_bt_url_success: t.defaultBtnInfo.default_bt_url_success ||
          'https://activity.waimai.meituan.com/static/html/landing.html?from=coupon',
          default_bt_app_success: t.defaultBtnInfo.default_bt_app_success ||
          '2',
          default_bt_text_fail: t.defaultBtnInfo.default_bt_text_fail ||
          '看看其他活动',
          default_bt_url_fail: t.defaultBtnInfo.default_bt_url_fail ||
          'https://activity.waimai.meituan.com/static/html/landing.html?from=coupon',
          default_bt_app_fail: t.defaultBtnInfo.default_bt_app_fail || '2',
        };
        var i = t.shareInfo;
        LXAnalytics('pageView', {
          custom: {
            channelId: n.channelId,
            dim_ui_id: n.dim_ui_id,
          },
        }, {
          os: 'html',
          lch: 'i',
        }, 'c_iigtgnqg');
      }
      FastClick.attach(document.body), n._urlKey ==
      '62032F0CD0BB121316E3F4DBDF95C4A6' &&
      (n.channel = 1611), n.touchEffect(), n._initCaptureEnvelope(), t.ADUpload.adType ==
      '1' && n._initVideo(), n._urlKey == 'D25D6BA8BF8A785D91994C17B03FC208' &&
      $('#capture-btn').click(), i.imageURL = i.imageURL ?
          i.imageURL :
          'https://xs01.meituan.net/waimai_c_activity_web/img/resource/weixinshare1.png';
      try {
        s.setShare(i);
      } catch (r) {
        console.log(r);
      }
      window.wx && wx.ready(function() {
        wx.onMenuShareTimeline({
          title: i.title,
          link: i.detailURL ? i.detailURL : location.href,
          imgUrl: i.imageURL,
        }), wx.onMenuShareAppMessage({
          title: i.title,
          desc: i.content,
          link: i.detailURL ? i.detailURL : location.href,
          imgUrl: i.imageURL,
        }), wx.onMenuShareQQ({
          title: i.title,
          desc: i.content,
          link: i.detailURL ? i.detailURL : location.href,
          imgUrl: i.imageURL,
        });
      }), t && t.bNeedPhone == 'true' ?
          ($('#j-fetch').show(), LXAnalytics('moduleView', 'b_paprqj80', {
            custom: {
              channelId: n.channelId,
              stat_code: '20090003',
              dim_cached: $.cookie('h_cookie_phone'),
              dim_ui_id: n.dim_ui_id,
            },
          }), u(n.channelId, 20090003, {
            dim_cached: $.cookie('h_cookie_phone'),
            dim_ui_id: n.dim_ui_id,
          })) :
          t.code == '1' ?
              $('#j-result').ready(function() {
                n._grabCoupon();
              }) :
              n._grabCouponResult(t);
    },
    touchEffect: function() {
      $('.combtn').on('touchstart', function() {
        $(this).addClass('combtn-hover');
      }).on('click', function() {
        $(this).removeClass('combtn-hover');
      });
    },
    _callApp: function(t) {
      var n = t && t.couponUrl,
          r = t && t.routItem,
          s = t && t.scheme,
          o = t && t.h5DelayGoUrl,
          u = {
            action: 'click',
            src_page: 'p_outer',
            src_block: 'b_coupon',
            req_time: parseInt((new Date).getTime() / 1e3),
          },
          a = {
            terminal: self.terminal,
            channel: self.channel,
            scheme: (s || 'meituanwaimai://waimai.meituan.com/' +
                (e.versions.android ? 'welcome' : 'pois')) + '?trace_tag=' +
            encodeURI(JSON.stringify(u)),
          },
          f = location.href.toLowerCase().indexOf('https') === 0;
      if (r ===
          'browser') a.scheme = 'meituanwaimai://waimai.meituan.com/browser?inner_url=' +
          n + '&trace_tag=' + encodeURI(JSON.stringify(
              u)), a.intentScheme = 'intent://waimai.meituan.com/browser?inner_url=' +
          n +
          '#Intent;package=com.sankuai.meituan.takeoutnew;scheme=meituanwaimai;end;', a.wxDelayGo = n, a.h5DelayGo = a.wxDelayGo;
      else if (n != null && n.length > 0) {
        var l = n.lastIndexOf('/'),
            c = l > 0 ? n.substring(l + 1) : '';
        a.scheme = 'meituanwaimai://waimai.meituan.com/menu?restaurant_id=' +
            c + '&trace_tag=' + encodeURI(JSON.stringify(
                u)), a.intentScheme = 'intent://waimai.meituan.com/menu?restaurant_id=' +
            c +
            '#Intent;package=com.sankuai.meituan.takeoutnew;scheme=meituanwaimai;end;', a.wxDelayGo = (f ?
            'https' :
            'http') + '://i.waimai.meituan.com/restaurant/' +
            c, a.h5DelayGo = a.wxDelayGo;
      } else o != null && o.length > 0 &&
      (a.wxDelayGo = o, a.h5DelayGo = a.wxDelayGo);
      i(a);
    },
    _changeHref: function(e, t) {
      e && (t ? setTimeout(function() {
        window.location.href = e;
      }, 500) : window.location.href = e);
    },
    _initDefBtnJump: function(t, n) {
      var r = this,
          i = '';
      n.data && (i = n.data.userId || n.data.coupons && n.data.coupons[0] &&
          n.data.coupons[0].userId), $('#enveuse-btn').on('click', function() {
        var n = {
          h5DelayGoUrl: '',
          scheme: '',
        };
        if (t) {
          i ?
              n.h5DelayGoUrl = r.defaultBtnInfo.default_bt_url_success.replace(
                  /\#\{user_id\}/g, i) :
              n.h5DelayGoUrl = r.defaultBtnInfo.default_bt_url_success.replace(
                  /user_id=\#\{user_id\}/g, '');
          switch (+r.defaultBtnInfo.default_bt_app_success) {
            case 1:
              n.scheme = 'imeituan://www.meituan.com/takeout/homepage', r._callApp(
                  n);
              break;
            case 2:
              n.scheme = 'meituanwaimai://waimai.meituan.com/' +
                  (e.versions.android ? 'welcome' : 'pois'), r._callApp(n);
              break;
            case 3:
              delayGo(n.h5DelayGoUrl);
          }
        } else {
          i ?
              n.h5DelayGoUrl = r.defaultBtnInfo.default_bt_url_fail.replace(
                  /\#\{user_id\}/g, i) :
              n.h5DelayGoUrl = r.defaultBtnInfo.default_bt_url_fail.replace(
                  /user_id=\#\{user_id\}/g, '');
          switch (+r.defaultBtnInfo.default_bt_app_fail) {
            case 1:
              n.scheme = 'imeituan://www.meituan.com/takeout/homepage', r._callApp(
                  n);
              break;
            case 2:
              n.scheme = 'meituanwaimai://waimai.meituan.com/' +
                  (e.versions.android ? 'welcome' : 'pois'), r._callApp(n);
              break;
            case 3:
              delayGo(n.h5DelayGoUrl);
          }
        }
      });
    },
    _initVideo: function() {
      var e = this;
      $('.ad-video-img,.ad-video-play').click(function() {
        var t = $('.ad-video');
        if (t.length === 1) {
          t.show(), $('.ad-flag,.ad-video-img,.ad-video-play').hide(), t.css(
              'display', 'block');
          try {
            t[0].play();
          } catch (n) {
            console.error(n);
          }
          u(e.channelId, 20090016, {
            dim_ui_id: e.dim_ui_id,
          }), e._ADUpload(e.adUploadData, {
            type: 'click',
            source: 'playBtn',
          }), LXAnalytics('moduleClick', 'b_jizbdwpk', {
            custom: {
              channelId: e.channelId,
              stat_code: '20090016',
              dim_ui_id: e.dim_ui_id,
            },
          });
        }
      }), $('.ad-video-text').click(function() {
        e._ADUpload(e.adUploadData, {
          type: 'click',
          source: 'gotoText',
        }), e._changeHref($(this).attr('href'), !0);
      });
    },
    _every: function() {
      var e = this;
      $('#rst-success .result-inner').on('click', function() {
        var t = $(this),
            n = t.data('type'),
            r = t.data('id'),
            i = t.attr('data-configId'),
            s = t.data('channel'),
            o = t.data('position'),
            a = [
              {
                dim_coupon_type: n,
                dim_coupon_channel: s,
                dim_coupon_id: i,
                dim_coupon_position: o,
              }];
        LXAnalytics('moduleClick', 'b_55eodl8h', {
          custom: {
            channelId: e.channelId,
            stat_code: '20090015',
            dim_ui_id: e.dim_ui_id,
            coupon_infos: a,
          },
        }), u(e.channelId, 20090015, {
          dim_coupon_type: n,
          dim_coupon_channel: s,
          dim_coupon_id: i,
          dim_ui_id: e.dim_ui_id,
          dim_coupon_position: o,
        });
      });
    },
    _ADUpload: function(e, t) {
      var n = 3;
      /iPhone/.test(window.navigator.userAgent) ?
          n = 1 :
          /Android/.test(window.navigator.userAgent) ?
              n = 0 :
              /Windows Phone/.test(window.navigator.userAgent) && (n = 2);
      var r, i;
      if (!t || t.type != 'click') r = e.impUrl, i = e.monitorImpUrl;
      else {
        var s;
        !e.adType || !t.source || !e.clickUrl ?
            r = e.clickUrl :
            (s = '&module=', t.source == 'gotoBtn' ?
                s += '1' :
                t.source == 'gotoText' ?
                    s += '2' :
                    t.source == 'playBtn' && (s += '3'), r = e.clickUrl +
                s), i = e.monitorClickUrl;
      }
      !r || (r = r.replace('__OS__', n), (new Image).src = r);
      var o = 0;
      i = JSON.parse(i || '{}');
      if (typeof i != 'object') return;
      for (var u in i) {
        o++;
        if (o > 5) return;
        i[u] = i[u].replace('__OS__', n), (new Image).src = i[u];
      }
    },
    _initCoupons: function() {
      var e = this;
      $('.poi-coupons').on('click', function() {
        e._callApp({
          couponUrl: $(this).find('a').text(),
        });
      }), $('.normal-coupons').on('click', function() {
        e._callApp();
      }), $('#rst-success .surprise-coupons').on('click', function() {
        e._callApp();
      });
    },
    _initCaptureEnvelope: function() {
      var e = this.channelId,
          t = $('#phone-input'),
          n = $('#capture-tip'),
          r = this,
          i = $.cookie('h_cookie_phone');
      i && $('#phone-input').val(i), r.captureBtn.click(function() {
        u(r.channelId, 20090004, {
          dim_type: r.bNeedPhone ? 2 : 1,
          dim_ui_id: r.dim_ui_id,
        }), LXAnalytics('moduleClick', 'b_czc746z3', {
          custom: {
            channelId: r.channelId,
            stat_code: '20090004',
            dim_type: r.bNeedPhone ? 2 : 1,
            dim_ui_id: r.dim_ui_id,
          },
        });
        var e = $('#phone-input').val().trim();
        if (e == '' || !/^(13|14|15|18|17)\d{9}$/.test(e)) {
          new o({
            content: '请输入正确的手机号',
          });
          return;
        }
        r.captureBtn.disable(), n.hide();
        var t = document.domain.match(/(meituan|sankuai){1}\S*/g);
        $.cookie('h_cookie_phone', e, {
          path: '/',
          domain: t,
          expires: (new Date).setTime((new Date).getTime() + 2592e6).toGMTString,
        }), r._grabCoupon();
      }), $('.banner-img').click(function() {
        u(r.channelId, 20090016, {
          dim_ui_id: r.dim_ui_id,
        }), r._ADUpload(r.adUploadData, {
          type: 'click',
        }), LXAnalytics('moduleClick', 'b_jizbdwpk', {
          custom: {
            channelId: r.channelId,
            stat_code: '20090016',
            dim_ui_id: r.dim_ui_id,
          },
        });
      });
    },
    _grabCoupon: function(t) {
      var n = this,
          r = $.cookie('h_cookie_phone'),
          i = $.cookie('coupon_uuid');
      t = $.extend({
        userPhone: r,
        channelUrlKey: n.channelUrlKey,
        urlKey: n._urlKey,
        dparam: n.dparam,
        uuid: i,
        originUrl: n.originUrl,
        platform: e.isPC ? 1 : 11,
        partner: 162,
        riskLevel: 71,
      }, t);
      var s = n.baseurl + '/coupon/grabShareCoupon',
          u = f.getDataInMTSI(s, t);
      $.post(s, u, function(e) {
        try {
          var t = typeof e == 'string' ? JSON.parse(e) : e;
          if (t.code == 406) location.href = t.customData.verifyPageUrl +
              '&theme=waimai&succCallbackUrl=' + n.originUrl +
              '&failCallbackUrl=' + n.originUrl;
          else {
            try {
              e.data = decodeURIComponent(
                  e.data), e.data = JSON.parse(l.validate(e.data) || '{}');
            } catch (r) {
              Owl.addError({
                name: 'apiError',
                msg: '券数据解析出错',
              }, {
                combo: !0,
                level: 'error',
                tags: {
                  ajaxUrl: s,
                  postData: u,
                },
              }), new o({
                content: '数据解析出错,' + r,
              });
              return;
            }
            n._grabCouponResult(e);
          }
        } catch (r) {
          new o({
            content: '数据解析出错,' + r,
          });

        }
      });
    },
    _grabCouponResult: function(e, t) {
      function n() {
        var t = e.data.thirdCoupns && e.data.thirdCoupns.length > 0,
            n = e.data.poiCoupons && e.data.poiCoupons.length > 0,
            r = e.data.outCoupon;
        e.data.otherCoupon &&
        (e.data.otherCoupon.coupon_position = 3, e.data.otherCoupon.coupon_source ==
        2 ?
            (n = !0, e.data.poiCoupons = [e.data.otherCoupon]) :
            (t = !0, e.data.thirdCoupns = [e.data.otherCoupon])), e.data.outCoupon &&
        (e.data.outCoupon.coupon_position = 4, r = !0, e.data.outCoupon = [e.data.outCoupon]);
        if (n) {
          var i = '<h6 class="sec-sub-title youhui" >其他福利</h6>';
          $('#rst-success .poi').append(i);
          for (var s in e.data.poiCoupons) {
            var o = e.data.poiCoupons[s];
            if (o.couponType == 1) {
              o.logoUrl = d(o.logoUrl), o.couponAmountInt = (o.couponAmount /
                  100 + '').split('.')[0], (o.couponAmount / 100 + '').split(
                  '.')[1] &&
              (o.couponAmountFloat = ((o.couponAmount / 100).toFixed(1) +
                  '').split('.')[1]);
              var u = doT.template(
                  $('#rst-success-poi script[data-id="card_tpl-poi"]').text());
              $('#rst-success .poi').append(u(o));
            }
          }
        }
        if (t) {
          var i = '<h6 class="sec-sub-title youhui" >其他福利</h6>';
          $('#rst-success .third').append(i);
          for (var s in e.data.thirdCoupns) {
            var a = e.data.thirdCoupns[s];
            if (a.couponType == 2 || a.couponType == 1) {
              a.logoUrl = d(a.logoUrl);
              var f = a.couponType == 2 ? 1e3 : 100;
              a.couponAmountInt = (a.couponAmount / f + '').split(
                  '.')[0], (a.couponAmount / f + '').split('.')[1] &&
              (a.couponAmountFloat = ((a.couponAmount / f).toFixed(1) +
                  '').split('.')[1]);
              var u = doT.template(
                  $('#rst-success-san script[data-id="card_tpl-san"]').text());
              $('#rst-success .third').append(u(a));
            }
          }
        }
        if (r) {
          var i = '<h6 class="sec-sub-title youhui" >其他福利</h6>';
          !n && !t && $('#rst-success .outCompany').append(i);
          for (var s in e.data.outCoupon) {
            var a = e.data.outCoupon[s];
            if (a.couponType == 2 || a.couponType == 1) {
              a.logoUrl = d(a.logoUrl);
              var f = a.couponType == 2 ? 1e3 : 100;
              a.couponAmountInt = (a.couponAmount / f + '').split(
                  '.')[0], (a.couponAmount / f + '').split('.')[1] &&
              (a.couponAmountFloat = ((a.couponAmount / f).toFixed(1) +
                  '').split('.')[1]);
              var u = doT.template(
                  $('#rst-success-outCompany script[data-id="card_tpl-outCompany"]').
                      text());
              $('#rst-success .outCompany').append(u(a));
            }
          }
        }
        $('#rst-success').show();
      }

      var r = this,
          i;
      try {
        i = e.data.userId || e.data.coupons && e.data.coupons[0] &&
            e.data.coupons[0].userId;
      } catch (s) {
        i = '';
      }
      r.captureBtn.enable(), r.captureBtn.show(), $(
          '#rst-error, #rst-notopen, #rst-getted, #rst-success, #friend_luck_list').
          hide(), !e.toast || new o({
        content: e.toast,
      });
      var f = function(e) {
            e ?
                r._grabCoupon(e) :
                $('#rst-error .result-inner').on('click', function() {
                  a.getLocation(f), $('#rst-error .result-inner').off('click');
                });
          },
          l = function(e) {
            var t = $.cookie('h_cookie_phone');
            if (!!t) {
              $('#rst-success-tip .user-phone').text(t);
              var n = e ? '红包已放入账号:' : '领券手机号:';
              $('#rst-success-tip .user-tip').text(n), $('#rst-success-tip').
                  on('click', function() {
                    localStorage &&
                    (localStorage.backUrl = location.href), location.href = '/coupon/changePhone';
                  }).
                  show();
            }
          },
          c = function(t) {
            if (!t instanceof Array) return;
            $('#friend_list .comment_ul').html('');
            var n = doT.template(
                $('#friend_list script[data-id="card_tpl"]').text());
            if (!!t && t.length > 0) {
              var r = !1;
              for (var i in t) {
                var s = t[i].head_img_url;
                !!s && s[s.length - 1] == '0' &&
                (t[i].head_img_url = s.substr(0, s.length - 1) +
                    '132'), t[i].coupon_price = (t[i].coupon_price /
                    100).toFixed(1), r = r || t[i].bestLuck, $(
                    '#friend_list .comment_ul').append(n(t[i]));
              }
              !r && e.data && e.data.newShare && $('#friend_list .comment_ul').
                  append(
                      '<li class="comment_li clearfix"><div class="comment_best_tip">最佳手气尚未出现，稍后揭晓~</div></li>'), $(
                  '#friend_luck_list').show(), $('.comment_usr_pic').lazyload({
                data_attribute: 'src-retina',
              });
            }
          },
          h = function(e, t, n) {
            $('#enveuse-btn').
                off('click.uploadData').
                on('click.uploadData', function() {
                  u(e, t, n);
                });
          },
          p = function(e, t) {
            $('#enveuse-btn').
                off('click.uploadLXData').
                on('click.uploadLXData', function() {
                  LXAnalytics('moduleClick', e, {
                    custom: t,
                  });
                });
          },
          d = function(e) {
            var t = e;
            return !!e && e.length > 7 &&
            (t = e.replace('//p0.meituan.net', '//p0.meituan.net/184.184.100').
                replace('//p1.meituan.net', '//p1.meituan.net/184.184.100')), t;
          };
      l(e.code == 1 || e.code == 4002);
      var v = r.bNeedPhone ? 2 : 1;
      e.code != 4201 && $('#goto-btn').css('display', 'block');
      if ($('#goto-btn').length > 0 &&
          /\#\{user_id\}/g.test($('#goto-btn').attr('href')) && !!e.data) {
        var m = $('#goto-btn').attr('href');
        i ?
            (m = m.replace(/\#\{user_id\}/g, i), $('#goto-btn').
                css('display', 'block')) :
            $('#goto-btn').hide(), m = m.replace(/\#\{open_id\}/g,
            $.cookie('open_id')), m = m.replace(/\#\{nickname\}/g,
            $.cookie('nickname')), m = m.replace(/\#\{head_imgurl\}/g,
            $.cookie('head_imgurl')), $('#goto-btn').attr('href', m);
      }
      if (e.code == 1 || e.code == 4002) {
        var g = e.data.coupons && e.data.coupons.length > 0;
        e.data.luckyCoupon &&
        (e.data.luckyCoupon.coupon_position = 1), e.data.surpriseCoupon &&
        (e.data.surpriseCoupon.coupon_position = 2);
        var y = e.data.surpriseCoupon;
        e.data.luckyCoupon && (g = !0, e.data.coupons = [e.data.luckyCoupon]);
        if (g)
          for (var b in e.data.coupons) {
            var w = e.data.coupons[b];
            if (w.couponType == 2 || w.couponType == 1) {
              w.logoUrl = d(w.logoUrl);
              var E = w.couponType == 2 ? 1e3 : 100;
              w.couponAmountInt = (w.couponAmount / E + '').split(
                  '.')[0], (w.couponAmount / E + '').split('.')[1] &&
              (w.couponAmountFloat = ((w.couponAmount / E).toFixed(1) +
                  '').split('.')[1]);
              var S = doT.template(
                  $('#rst-success-coupon script[data-id="card_tpl-coupon"]').
                      text());
              $('#rst-success .other').append(S(w));
            }
          } else Owl.addError({
          name: 'apiError',
          msg: '普通券返回空',
        }, {
          combo: !0,
          level: 'warn',
          tags: {
            ajaxUrl: r.baseurl + '/coupon/grabShareCoupon',
            postData: t,
            userId: i,
          },
        });
        if (y) {
          var w = e.data.surpriseCoupon;
          if (w.couponType == 2 || w.couponType == 1) {
            w.logoUrl = d(w.logoUrl);
            var E = w.couponType == 2 ? 1e3 : 100;
            w.couponAmountInt = (w.couponAmount / E + '').split(
                '.')[0], (w.couponAmount / E + '').split('.')[1] &&
            (w.couponAmountFloat = ((w.couponAmount / E).toFixed(1) + '').split(
                '.')[1]), w.surprise = !0;
            var S = doT.template(
                $('#rst-success-surprise script[data-id="card_tpl-surprise"]').
                    text());
            $('#rst-success .surprise').append(S(w));
            if (e.code == 4002) $('#rst-success .surprise').show();
            else {
              $('#rst-success .surprise').addClass('hide-height');
              var x = S(w);
              $('.surprise-dialog .coupon-surprise').
                  html(x).
                  find('.coupons-link').
                  hide(), setTimeout(function() {
                var e = $('.surprise-dialog');
                e.parent().show(), e.addClass('start');
                var t = setTimeout(function() {
                  T();
                }, 2500);
                e.on('click', function() {
                  T(), e.off('click');
                });
              }, 1500);

              function T() {
                $('.dialog').addClass('end'), $('.result .surprise').
                    addClass('show-height').
                    show(), setTimeout(function() {
                  window.scrollTo(0, 0);
                }, 1e3), setTimeout(function() {
                  $('.dialog').remove();
                }, 5e3);
              }
            }
          }
        }
        n(), $('.user-phone').text($.cookie('h_cookie_phone')), $('#j-fetch').
            hide(), $('#enveuse-btn, #rst-success, #j-result').show(), $(
            '#enveuse-btn').val(r.defaultBtnInfo.default_bt_text_success), h(
            r.channelId, 20090010, {
              dim_type: v,
              dim_ui_id: r.dim_ui_id,
            }), p('b_rz8wvdi4', {
          channelId: r.channelId,
          stat_code: '20090010',
          dim_type: v,
          dim_ui_id: r.dim_ui_id,
        }), r._initCoupons(), r._initDefBtnJump(!0, e), r._every();
      } else if (e.code == 1003 || e.code == 2001) {
        n(), $('#j-fetch').hide();
        var S = doT.template(
            $('#rst-notopen script[data-id="card_tpl"]').text());
        $('#rst-notopen span').html(''), $('#rst-notopen span').html(S(e)), $(
            '#enveuse-btn, #rst-notopen, #j-result').show(), $('#enveuse-btn').
            val(r.defaultBtnInfo.default_bt_text_fail), r._initDefBtnJump(!1,
            e), p('b_brvgmuox', {
          channelId: r.channelId,
          stat_code: '20090012',
          dim_type: v,
          dim_ui_id: r.dim_ui_id,
        }), h(r.channelId, 20090012, {
          dim_type: v,
          dim_ui_id: r.dim_ui_id,
        });
      } else {
        if (e.code == 4201) {
          $('#j-fetch').show(), r._goCheck('sms', !0);
          return;
        }
        n(), $('#j-fetch').hide();
        var S = doT.template($('#rst-error script[data-id="card_tpl"]').text());
        $('#rst-error span').html(''), $('#rst-error span').html(S(e)), $(
            '#enveuse-btn, #rst-error, #j-result').show(), $('#enveuse-btn').
            val(r.defaultBtnInfo.default_bt_text_fail), $('#enveuse-btn').
            addClass('margin-gap'), r._initDefBtnJump(!1, e), p('b_brvgmuox', {
          channelId: r.channelId,
          stat_code: '20090012',
          dim_type: v,
          dim_ui_id: r.dim_ui_id,
        }), h(r.channelId, 20090012, {
          dim_type: v,
          dim_ui_id: r.dim_ui_id,
        }), e.code == 1006 && ($('#geo-location-btn').show(), f());
      }
      !!e.data && !!e.data.wxCoupons && c(e.data.wxCoupons), r.smsCaptcha !=
      null && r.smsCaptcha.destroy();
      var N = [],
          C = [],
          k;
      e.data.coupons && (N = N.concat(e.data.coupons)), e.data.surpriseCoupon &&
      (N = N.concat(e.data.surpriseCoupon)), e.data.poiCoupons &&
      (N = N.concat(e.data.poiCoupons)), e.data.thirdCoupns &&
      (N = N.concat(e.data.thirdCoupns)), e.data.outCoupon &&
      (N = N.concat(e.data.outCoupon));
      for (var b = 0; b < N.length; b++) k = N[b], C.push({
        dim_coupon_channel: k.coupon_source,
        dim_coupon_id: k.couponConfigId,
        dim_coupon_type: k.coupon_first_source,
        dim_coupon_position: k.coupon_position || 0,
      });
      e.code == 1 ?
          (u(r.channelId, 20090001, {
            dim_type: v,
            dim_ui_id: r.dim_ui_id,
            coupon_infos: C,
          }), LXAnalytics('moduleView', 'b_g1n6ahsm', {
            custom: {
              channelId: r.channelId,
              stat_code: '20090001',
              dim_type: v,
              dim_ui_id: r.dim_ui_id,
              coupon_infos: C,
            },
          })) :
          [
            1001, 1002, 1003, 2001, 2002, 1006, 2007, 2008, 3e3, 4e3, 4002,
            4003,
            4005].indexOf(e.code) && (u(r.channelId, 20090002, {
            dim_type: v,
            reason: e.code,
            dim_ui_id: r.dim_ui_id,
            coupon_infos: C,
          }), LXAnalytics('moduleView', 'b_9fxmrnro', {
            custom: {
              channelId: r.channelId,
              stat_code: '20090002',
              dim_type: v,
              reason: e.code,
              dim_ui_id: r.dim_ui_id,
              coupon_infos: C,
            },
          })), $('#goto-btn').
          off('click.uploadData').
          on('click.uploadData', function() {
            var t = e.code == 1 ? 1 : 2;
            return u(r.channelId, 20090011, {
              dim_type: v,
              dim_status: t,
              dim_ui_id: r.dim_ui_id,
            }), r._ADUpload(r.adUploadData, {
              type: 'click',
              source: 'gotoBtn',
            }), r._changeHref($(this).attr('href'), !0), LXAnalytics(
                'moduleClick', 'b_tutqpkfa', {
                  custom: {
                    channelId: r.channelId,
                    stat_code: '20090011',
                    dim_type: v,
                    dim_status: t,
                    dim_ui_id: r.dim_ui_id,
                  },
                }), !1;
          });
    },
    _goCheck: function(e, t) {
      var n = this,
          i = $('#phone-input').val().trim();
      u(n.channelId, 20090005, {
        dim_ui_id: n.dim_ui_id,
      }), LXAnalytics('moduleView', 'b_kc00yfmw', {
        custom: {
          channelId: n.channelId,
          stat_code: '20090005',
          dim_ui_id: n.dim_ui_id,
        },
      }), n.captureBtn.hide(), n.smsCaptcha != null ?
          n.smsCaptcha.remake() :
          n.smsCaptcha = new r({
            baseurl: n.baseurl,
            type: e,
            _urlKey: n._urlKey,
            dom: $('#j-fetch'),
            couponType: 'SHARE_COUPON',
            channelId: n.channelId,
            dim_ui_id: n.dim_ui_id,
            captchaCheck: function(e, t, r, s) {
              u(n.channelId, 20090004, {
                dim_type: 2,
                dim_ui_id: n.dim_ui_id,
              }), LXAnalytics('moduleClick', 'b_czc746z3', {
                custom: {
                  channelId: n.channelId,
                  stat_code: '20090004',
                  dim_type: 2,
                  dim_ui_id: n.dim_ui_id,
                },
              });
              if (i == '' || !/^(13|14|15|18|17)\d{9}$/.test(i)) {
                new o({
                  content: '请输入正确的手机号',
                }), s();
                return;
              }
              e = i;
              var a = n.baseurl + '/coupon/user/verifySmsCode',
                  l = {
                    smsCode: t,
                    userPhone: e,
                  };
              $.post(a, f.getDataInMTSI(a, l), function(e) {
                e.code == 1 ? r(e) : (s(), new o({
                  content: '验证码不正确',
                }));
              });
            },
            onSuccess: function(e) {
              n._grabCoupon();
            },
            canVoice: t,
            phone: i,
          });
    },
  };
}), define('module/supportWebp', [], function() {
  function e(e) {
    return e && (e = e.replace(/@!style1$/g, '')), n && t.test(e) &&
    (e += '.webp'), e;
  }

  var t = /(p0|p1)\.meituan\.net\/(.*)\.(jpg|jpeg|png)$/,
      n = void 0,
      r = document.cookie.match(/webp=(\d)/);
  return null == r ? !function() {
    var e = new Image;
    e.onload = e.onerror = function() {
      n = 2 === e.height;
      var t = new Date;
      t.setTime(t.getTime() + 432e5), document.cookie = 'webp=' + (n ? 1 : 0) +
          ';expires=' + t.toGMTString(), e.onload = e.onerror = null, e = null;
    }, e.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }() : n = 1 == +r[1] ? !0 : !1, {
    optimizeImg: e,
  };
}), define('fe_common/module/checkPageStyle', [], function() {
  setTimeout(function() {
    var e = parseInt(
        document.defaultView.getComputedStyle(document.body).fontSize),
        t = document.defaultView.getComputedStyle(document.body).display;
    (1 > e || e > 60) && Owl.addError({
      name: 'styleError',
      msg: 'body字体异常, fontSize: ' + e,
    }, {
      combo: !0,
      level: 'error',
    }), 'block' != t && Owl.addError({
      name: 'styleError',
      msg: 'body展示异常, display: ' + t,
    }, {
      combo: !0,
      level: 'error',
    });
  }, 8e3);
}), define('page/activity/shareCouponSeed', [
  'fe_common/module/dialog/tipdialog',
  'page/activity/shareCoupon',
  'module/aesCrypto',
  'module/supportWebp',
  'module/mtsi',
  'fe_common/module/checkPageStyle'], function(e, t, n, r, i) {
  var s = location.pathname.slice(location.pathname.lastIndexOf('/') + 1),
      o = location.search.slice(1).split('&'),
      u = {
        channelUrlKey: s,
      };
  return o.length > 0 && o.map(function(e) {
    var t = e.split('=');
    u[t[0]] = t[1];
  }), {
    init: function(t) {
      var r = this,
          s;
      Owl.start({
        project: 'waimai_c_activity_web',
        pageUrl: 'sharechannel',
      }), t.share_info_share_url || Owl.addError({
        name: 'apiError',
        msg: '分享链接出错',
      }, {
        combo: !0,
        level: 'error',
      });
      switch (t.url_type) {
        case 'sharechannelredirect':
          s = '/async/coupon/sharechannelredirect';
          break;
        case 'shareweixin':
          s = '/async/coupon/shareweixin';
          break;
        default:
          s = '/async/coupon/sharechannel';
      }
      $.ajax({
        url: s,
        type: 'post',
        data: i.getDataInMTSI(s, u),
        success: function(o) {
          if (o.code != -1) {
            o.data = decodeURIComponent(o.data);
            var a = n.validate(o.data);
            a || new e({
              content: '获取数据出错',
            });
          } else Owl.addError({
            name: 'apiError',
            msg: '分享红包初始接口数据出错',
          }, {
            combo: !0,
            level: 'error',
            tags: {
              ajaxUrl: s,
              postData: i.getDataInMTSI(s, u),
            },
          }), new e({
            content: '获取数据出错',
          });
          r.initData(a, t);
        },
        error: function() {
          new e({
            content: '获取数据出错了',
          }), r.initData('', t);
        },
      });
    },
    initData: function(e, n) {
      var r = this,
          i = JSON.parse(e || '{}');
      i.share_info_share_url = n.share_info_share_url, i.channelUrlKey = u.channelUrlKey ||
          i.channelUrlKey, i.urlKey = u.urlKey ||
          i.urlKey, i.channelId = u.channelId || i.channelId;
      var s = r.makeStruct(i);
      document.title = i.page_title || '美团外卖', s.styleParams &&
      r.initStyle(s.styleParams), s.ad_info &&
      r.initAd(s.ad_info, s.styleParams), s.act_content &&
      r.initRule(s.act_content), r.initShowBtns(s.styleParams,
          s.js_info), t.init(s.js_info);
    },
    makeStruct: function(e) {
      var t = {
        act_content: e.act_content ||
        '1.红包新老用户同享\n2.红包可与其他优惠叠加使用，首单支付红包不可叠加\n3.红包仅限在美团外卖最新版客户端下单且选择在线支付时使用\n4.使用红包时下单手机号码必须为抢红包时手机号码\n5.其他未尽事宜，请咨询客服',
        styleParams: {
          bodyBackgroundColor: e.back_color || '#ff3333',
          bodyBackgroundImage: r.optimizeImg(e.head_icon) ||
          'https://xs01.meituan.net/waimai_c_activity_web/img/resource/red-enve-bg.a2118fec.png',
          buttonText2: e.coo_bt_content,
          button2Url: e.coo_bt_link,
          coo_bt_color: e.coo_bt_color,
          default_bt_color: e.default_bt_color,
          head_link: e.head_link || 'javascript:;',
        },
        ad_info: {
          ad_type: e.ad_type || 0,
          video_jump_text: e.video_jump_text || '',
          video_jump_link: e.video_jump_link || '',
          video_head_pic: r.optimizeImg(e.video_head_pic) ||
          'https://xs01.meituan.net/waimai_c_activity_web/img/resource/red-enve-bg.a2118fec.png',
          video_link: e.video_link || '',
          video_duration: e.video_duration || '6',
        },
        js_info: {
          logData: e.log_data,
          baseurl: '',
          channel: e.global_channel_id,
          dim_ui_id: e.uiId || '0',
          channelId: e.channelId || '',
          channelUrlKey: e.channelUrlKey || '',
          urlKey: e.urlKey || '',
          dparam: e.dparam || '',
          bNeedPhone: (e.bNeedPhone || !1).toString() || '',
          code: e.code || '',
          msg: e.msg || '领完了',
          data: e.data || '',
          toast: e.toast || '',
          shareInfo: {
            title: e.share_title || '美团外卖 送啥都快',
            content: (e.share_content || '这是一张来自美团外卖的红包，请查收~').replace('\r\n',
                ''),
            detailURL: e.share_info_share_url,
            imageURL: e.share_icon,
            channel: '384',
          },
          defaultBtnInfo: {
            default_bt_text_success: e.default_bt_text_success || '',
            default_bt_url_success: e.default_bt_url_success || '',
            default_bt_app_success: e.default_bt_app_success || '',
            default_bt_text_fail: e.default_bt_text_fail || '',
            default_bt_url_fail: e.default_bt_url_fail || '',
            default_bt_app_fail: e.default_bt_app_fail || '',
          },
          ADUpload: {
            adType: e.ad_type || 0,
            impUrl: e.impUrl,
            clickUrl: e.clickUrl,
            monitorImpUrl: e.monitorImpUrl,
            monitorClickUrl: e.monitorClickUrl,
          },
        },
      };
      return t;
    },
    initStyle: function(e) {
      $('body').css('background', e.bodyBackgroundColor);
    },
    initAd: function(e, t) {
      var n = '';
      e.ad_type == 1 ?
          (e.video_jump_link && e.video_jump_link &&
          (n += '<p class="ad-video-text" href="' + e.video_jump_link +
              '">                              <span>' + e.video_jump_text +
              '</span>                            </p>'), n += '<div class="ad-video-img">                              <img src="' +
              (e.video_head_pic ?
                  e.video_head_pic :
                  'https://xs01.meituan.net/waimai_c_activity_web/img/resource/red-enve-bg.a2118fec.png') +
              '" alt="美团外卖"/>                            </div>', e.video_link &&
          (n += '<video class="ad-video" controls webkit-playsinline="true" playsinline="true" x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-orientation="landscape|portrait" style="object-fit:fill">                              <source src="' +
              e.video_link +
              '" type="video/mp4">                          </video>                          <div class="ad-flag ad-video-duration">', e.video_duration ?
              n += '<p class="ad-text">' + (e.video_duration.length > 1 ?
                  '00:' + e.video_duration :
                  '00:0' + e.video_duration) + '</p>' :
              n += '<p class="ad-text">00:06</p>', n += '</div><img class="ad-video-play" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAMAAADypuvZAAAAjVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAADj4+MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD9/f0zMzMAAACSkpJ4eHhZWVkbGxv6+vr29vbr6+vU1NTNzc3Gxsa6urqdnZ1BQUENDQ3x8fHm5ubg4ODZ2dm/v7+vr6+mpqaIiIiBgYFpaWlPT08pKSn///8q/IZFAAAALnRSTlOAAGAUfW9H5Xp3clZLNBwYCvyOI7Ommob59uza1dDIuJKD8efj3szCva2qoJeKpkBEOQAAAVBJREFUSMed1tl2gyAQgOEJAzTumq1p9u677/94pWl6ojCAzn//nUQUGJi4YZELlUiZKJEXOHFzUKVT6JXqKoJKAUSiDCDMwFOGPqQleJOaRLWAYKJ2ESqIpNBG8ylEm877CB1DKuyiWsGgVN1BAgYmrkjD4PQ/QjkcSbygDEaU/aESRlWekRiHxC+qwG71PgupyiBn6ZZt2+5PfqQNSsFq15qaF++vpRNAsLtpzzWHb49CKAh0af16SxlDchJdunsjmCEihAw73ruLDiqITA8LmylIIsi0WUE3Q2Qctev+k0kSOc0slMRRs7D/noqhZj9zFkJE0O5ELHkeRNsv8uUWAfS88nxG6EVPn0CHxNbYnsnjEjyl1CY8GrL5AG+a3O6LwxICVZyDhXWEcQ5L1rHMuQA4Vw3rUuNcn5yLmjMScIYPxpjDG6j4oxt/SGSNoz8O6i6Jmj6s7gAAAABJRU5ErkJggg=="/>')) :
          n = '<a class="banner-img" href="' +
              (t.head_link ? t.head_link : 'javascript:;') +
              '">                          <img src="' +
              (t.bodyBackgroundImage ?
                  t.bodyBackgroundImage :
                  'https://xs01.meituan.net/waimai_c_activity_web/img/resource/red-enve-bg.a2118fec.png') +
              '" alt=""/>                      </a>', e.ad_type &&
      (n += '<div class="ad-flag ad-flag-text">                          <p class="ad-text">广告</p>                        </div>'), $(
          '.t-banner').html(n);
    },
    initRule: function(e) {
      var t = e.split('\n').map(function(e) {
        return '<li>' + e + '<li>';
      }).join('');
      $('.act-rules').html(t).parents('.content-bg').show();
    },
    initShowBtns: function(e, t) {
      var n = '<input id="enveuse-btn" ';
      e.default_bt_color ?
          n += 'style="background:' + e.default_bt_color + ';display: none;"' :
          n += 'style="display: none;"', n += ' class="combtn downloadbtn needsclick" type="button" value="' +
          (t.code == 1 ? '立即使用' : '看看其他活动') + '"/>', e.buttonText2 &&
      e.button2Url && e.coo_bt_color &&
      (n += '<a id="goto-btn" href="' + e.button2Url + '"', e.coo_bt_color &&
      (n += ' style="background:' + e.coo_bt_color +
          '"'), n += ' class="combtn gotobtn">' + e.buttonText2 + '</a>'), $(
          '.btns-section').html(n), t.bNeedPhone == 'true' &&
      $('#capture-btn').css('background', e.default_bt_color);
    },
  };
});