/**
 * Method to
 *
 * @module descendants
 */

/**
 * Uses TreeWalker to traverse `element`s DOM subtree and collect all descendants
 * that match different filters
 *
 * @param {Element} element - Root element to whos descenants we want to collect
 * @param {Object} [opts] -
 * @param {number} [opts.levels] - How many levels of descendants should be
 * collected. If `levels` is not set, all levels will be traversed
 * @param {number} [opts.nodeType] - How many levels of descendants should be
 * collected. If `levels` is not set, all levels will be traversed
 * @param {string} [opts.selector] - How many levels of descendants should be
 * collected. If `levels` is not set, all levels will be traversed
 * @param {Function|Function[]} [opts.filter] - Boolean to determine whether
 * only deepest level of nodes should be collected, ie reject all nodes
 * ancestor nodes.
 * @param {boolean} [opts.onlyDeepest] - Boolean to determine whether only
 * deepest level of nodes should be collected, ie reject all nodes ancestor
 * nodes.
 * @return {Node[]} An array containing all matched descendants
 */

import without from './_without';
import ancestors from './ancestors';
import is from './is';

export default function descendants(element, opts) {
  opts = opts || {};

  const nodeType = opts.selector ? 1 : opts.nodeType;

  let filters = [];
  let whatToShow;

  switch (nodeType) {
    case 1:
      // only traverse Element nodes
      whatToShow = NodeFilter.SHOW_ELEMENT;
      break;
    case 3:
      // only traverse textNodes
      whatToShow = NodeFilter.SHOW_TEXT;
      break;
    default:
      // No nodeType has been set, traverse all nodes
      whatToShow = NodeFilter.SHOW_ALL;
      // TODO hmmm do we need to filter out SCRIPT and STYLE tags here?
      break;
  }

  if (opts.levels) {
    // TODO should probably be a more effecient way of doing this
    // add default filter for ensuring we only traverse
    // the correct number of levels
    filters.push((node) => {
      // count number of steps it takes to
      // go up the DOM to reach `element`
      for (let i = 0; i < opts.levels; i++) {
        node = node.parentNode;
        if (node === element) {
          return NodeFilter.FILTER_ACCEPT;
        }
      }

      // return false if `levels` is set and we have
      // made it through entire loop
      return NodeFilter.FILTER_REJECT;
    });
  }

  // NOTE filter order is of importance, due to difference in REJECT and SKIP
  // NodeFilters...
  if (opts.filter) {
    filters = filters.concat(opts.filter);
  }

  if (opts.selector) {
    // add selector filter
    filters.push((node) => is(node, opts.selector));
  }

  let filter = null;

  if (filters.length > 0) {
    filter = function (node) {
      // since we will always return the first non-acceptable
      // filter (FILTER_REJECT or FILTER_SKIP), we need
      // must ensure filter functions that might REJECT a node
      // needs to be placed before any filters that might only SKIP...
      return filters.reduce((result, fnc) => {
        if (result !== NodeFilter.FILTER_ACCEPT) {
          // we have already gotten a failing filter, skip any more processing
          // and return previous result!
          return result;
        }

        // fetch result of next filter
        const newResult = fnc(node);

        if (newResult instanceof Boolean) {
          // filter result is a boolean, translate to ACCEPT or SKIP filter
          return newResult ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }

        // we now assume the result is a NodeFilter. return it.
        return newResult;
      }, NodeFilter.FILTER_ACCEPT);
    };

    // IE fix... IE will try to call filter property directly,
    // while good browsers (correctly) tries to call filter.acceptNode
    filter.acceptNode = filter;
  }

  const ni = document.createNodeIterator(element, whatToShow, filter, false);

  let nodes = [];
  let node;

  while ((node = ni.nextNode())) {
    if ((!opts.levels || opts.levels > 1) && opts.onlyDeepest) {
      // we are traversing more than one level, and only want the deepest nodes
      // to be returned so remove all ancestor nodes to `node` from `nodes`
      // TODO remove lodash and jQuery use
      nodes = without(nodes, ...ancestors(node, opts.selector, element));
    }
    nodes.push(node);
  }

  return nodes;
}
