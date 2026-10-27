/* 全局 API 封装与共享状态 */
(function () {
  'use strict';
  var TOKEN_KEY = 'cm_token';

  function fail(msg) {
    ElementPlus.ElMessage.error(msg);
    var e = new Error(msg);
    e.__shown = true;
    throw e;
  }

  function request(method, url, data, isForm) {
    var opts = { method: method, headers: {} };
    var token = localStorage.getItem(TOKEN_KEY);
    if (token) opts.headers['Authorization'] = token;
    if (data !== undefined && data !== null) {
      if (isForm) {
        opts.body = data;
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(data);
      }
    }
    return fetch(url, opts).then(function (res) {
      return res.json().catch(function () {
        return { code: res.status || -1, msg: '请求失败' };
      }).then(function (body) {
        if (res.status === 401 || body.code === 401) {
          localStorage.removeItem(TOKEN_KEY);
          store.token = null;
          store.user = null;
          store.unread = 0;
          if (location.hash !== '#/login') location.hash = '#/login';
          return fail(body.msg || '请先登录');
        }
        if (body.code !== 0) return fail(body.msg || '请求失败');
        return body.data;
      });
    }).catch(function (err) {
      if (!err || !err.__shown) {
        ElementPlus.ElMessage.error('网络异常，请稍后重试');
      }
      throw err;
    });
  }

  var api = {
    get: function (url, params) {
      if (params) {
        var qs = Object.keys(params)
          .filter(function (k) { return params[k] !== undefined && params[k] !== null && params[k] !== ''; })
          .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
          .join('&');
        if (qs) url += (url.indexOf('?') >= 0 ? '&' : '?') + qs;
      }
      return request('GET', url);
    },
    post: function (url, data) { return request('POST', url, data || {}); },
    put: function (url, data) { return request('PUT', url, data || {}); },
    del: function (url) { return request('DELETE', url); },
    upload: function (file) {
      var fd = new FormData();
      fd.append('file', file);
      return request('POST', '/api/upload', fd, true);
    }
  };
  window.api = api;

  var store = Vue.reactive({
    user: null,
    token: localStorage.getItem(TOKEN_KEY) || null,
    unread: 0,
    setAuth: function (token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem(TOKEN_KEY, token);
    },
    loadUser: function () {
      if (!this.token) return Promise.resolve(null);
      var self = this;
      return api.get('/api/auth/me').then(function (u) {
        self.user = u;
        return u;
      }).catch(function () { return null; });
    },
    logout: function () {
      api.post('/api/auth/logout').catch(function () {});
      localStorage.removeItem(TOKEN_KEY);
      this.token = null;
      this.user = null;
      this.unread = 0;
      location.hash = '#/login';
    }
  });
  window.store = store;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var util = {
    fmt: function (v) {
      if (!v) return '';
      var d = new Date(v);
      if (isNaN(d.getTime())) return '';
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    },
    money: function (v) {
      var n = Number(v);
      return isNaN(n) ? '0.00' : n.toFixed(2);
    },
    cover: function (images) {
      return images ? images.split(',')[0] : '/img/seed/book.svg';
    }
  };
  window.util = util;
})();
