'use strict';
function e(e, t, r, o) {
  return new (r || (r = Promise))(function (n, a) {
    function i(e) {
      try {
        u(o.next(e));
      } catch (e) {
        a(e);
      }
    }
    function s(e) {
      try {
        u(o.throw(e));
      } catch (e) {
        a(e);
      }
    }
    function u(e) {
      var t;
      e.done
        ? n(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t);
              })).then(i, s);
    }
    u((o = o.apply(e, t || [])).next());
  });
}
function t(e, t) {
  var r,
    o,
    n,
    a,
    i = {
      label: 0,
      sent: function () {
        if (1 & n[0]) throw n[1];
        return n[1];
      },
      trys: [],
      ops: []
    };
  return (
    (a = { next: s(0), throw: s(1), return: s(2) }),
    'function' == typeof Symbol &&
      (a[Symbol.iterator] = function () {
        return this;
      }),
    a
  );
  function s(s) {
    return function (u) {
      return (function (s) {
        if (r) throw new TypeError('Generator is already executing.');
        for (; a && ((a = 0), s[0] && (i = 0)), i; )
          try {
            if (((r = 1), o && (n = 2 & s[0] ? o.return : s[0] ? o.throw || ((n = o.return) && n.call(o), 0) : o.next) && !(n = n.call(o, s[1])).done)) return n;
            switch (((o = 0), n && (s = [2 & s[0], n.value]), s[0])) {
              case 0:
              case 1:
                n = s;
                break;
              case 4:
                return i.label++, { value: s[1], done: !1 };
              case 5:
                i.label++, (o = s[1]), (s = [0]);
                continue;
              case 7:
                (s = i.ops.pop()), i.trys.pop();
                continue;
              default:
                if (!((n = i.trys), (n = n.length > 0 && n[n.length - 1]) || (6 !== s[0] && 2 !== s[0]))) {
                  i = 0;
                  continue;
                }
                if (3 === s[0] && (!n || (s[1] > n[0] && s[1] < n[3]))) {
                  i.label = s[1];
                  break;
                }
                if (6 === s[0] && i.label < n[1]) {
                  (i.label = n[1]), (n = s);
                  break;
                }
                if (n && i.label < n[2]) {
                  (i.label = n[2]), i.ops.push(s);
                  break;
                }
                n[2] && i.ops.pop(), i.trys.pop();
                continue;
            }
            s = t.call(e, i);
          } catch (e) {
            (s = [6, e]), (o = 0);
          } finally {
            r = n = 0;
          }
        if (5 & s[0]) throw s[1];
        return { value: s[0] ? s[1] : void 0, done: !0 };
      })([s, u]);
    };
  }
}
var r = !AudioWorkletNode;
function o() {
  var e;
  return (null === (e = navigator.mediaDevices) || void 0 === e ? void 0 : e.getUserMedia)
    ? navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 })
    : navigator.getUserMedia
      ? new Promise(function (e, t) {
          navigator.getUserMedia(
            { audio: !0, video: !1 },
            function (t) {
              e(t);
            },
            function (e) {
              t(e);
            }
          );
        })
      : Promise.reject(new Error('不支持录音'));
}
function n(o, n) {
  return e(this, void 0, void 0, function () {
    return t(this, function (e) {
      switch (e.label) {
        case 0:
          return r ? [4, o.audioWorklet.addModule(''.concat(n, '/processor.worklet.js'))] : [3, 2];
        case 1:
          return e.sent(), [2, new AudioWorkletNode(o, 'processor-worklet')];
        case 2:
          return [4, new Worker(''.concat(n, '/processor.worker.js'))];
        case 3:
          return [2, { port: e.sent() }];
      }
    });
  });
}
var a = (function () {
  function a(e) {
    (this.processorPath = e), (this.audioBuffers = []);
  }
  return (
    (a.prototype.start = function (a) {
      var i,
        s = a.sampleRate,
        u = a.frameSize,
        c = a.arrayBufferType;
      return e(this, void 0, void 0, function () {
        var e, a, d, l, f, p;
        return t(this, function (t) {
          switch (t.label) {
            case 0:
              return ((e = this).audioBuffers = []), [4, o()];
            case 1:
              return (
                (a = t.sent()),
                (this.audioTracks = a.getAudioTracks()),
                (d = (function (e, t) {
                  var r;
                  try {
                    (r = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: t })).createMediaStreamSource(e);
                  } catch (t) {
                    (r = new (window.AudioContext || window.webkitAudioContext)()).createMediaStreamSource(e);
                  }
                  return r;
                })(a, s)),
                (this.audioContext = d),
                d.createMediaStreamSource(a),
                (l = d.createMediaStreamSource(a)),
                [4, n(d, this.processorPath)]
              );
            case 2:
              return (
                (f = t.sent()),
                (this.audioWorklet = f),
                f.port.postMessage({ type: 'init', data: { frameSize: u, toSampleRate: s || d.sampleRate, fromSampleRate: d.sampleRate, arrayBufferType: c || 'short16' } }),
                (f.port.onmessage = function (t) {
                  u && e.onFrameRecorded && e.onFrameRecorded(t.data),
                    e.onStop && (t.data.frameBuffer && e.audioBuffers.push(t.data.frameBuffer), t.data.isLastFrame && !r && (null == f ? void 0 : f.port).terminate(), t.data.isLastFrame && e.onStop(e.audioBuffers));
                }),
                r
                  ? l.connect(f)
                  : (((p = d.createScriptProcessor(0, 1, 1)).onaudioprocess = function (e) {
                      f.port.postMessage({ type: 'message', data: e.inputBuffer.getChannelData(0) });
                    }),
                    l.connect(p),
                    p.connect(d.destination)),
                d.resume(),
                null === (i = this.onStart) || void 0 === i || i.call(this),
                [2]
              );
          }
        });
      });
    }),
    (a.prototype.stop = function () {
      var e, t, r;
      null === (e = this.audioWorklet) || void 0 === e || e.port.postMessage({ type: 'stop' }), null === (t = this.audioTracks) || void 0 === t || t[0].stop(), null === (r = this.audioContext) || void 0 === r || r.suspend();
    }),
    a
  );
})();
module.exports = a;
