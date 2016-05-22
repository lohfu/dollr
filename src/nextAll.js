'use strict';

const $$ = require('./dollr').$$;

module.exports = function (element, selector) {
  const siblings = $$(element.parentNode.children);

  let next = siblings.slice(siblings.indexOf(element) + 1);

  if (selector)
    next = next.filter(function (el) {
      return el.matches(selector);
    });

  return next;
};
