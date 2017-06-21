/* eslint-env browser */
var ExecutionEnvironment = require('exenv');
var canUseDOM = ExecutionEnvironment.canUseDOM;
import config from '../api/config';

let cookie = {
  set({ name, value = '', path = '/', domain = '', expires = '' }) {
    if (!canUseDOM) { return; }

    if (expires instanceof Date) {
      expires = expires.toUTCString();
    }

    document.cookie = [
      `${name}=${value}`,
      `path=${path}`,
      `domain=${domain}`,
      `expires=${expires}`
    ].join(';');
  },

  unset(name) {
    cookie.set({ name, expires: new Date(0) });
  },

  get(name) {
    if (!canUseDOM) { return; }
    var re = new RegExp(['(?:^|; )',
      name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1'),
      '=([^;]*)'
    ].join(''));

    var matches = document.cookie.match(re);

    return matches ? decodeURIComponent(matches[1]) : undefined;
  },
  setToken(token,domain='bandaid.com'){
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    this.set({
      name: 'token',
      value: token,
      domain: domain,
      expires
    });
  }
};

export default cookie;
