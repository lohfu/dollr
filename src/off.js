export default function off(element, eventString, listener) {
  const arr = [];

  if (eventString) {
    if (listener) {
      arr.push([eventString, listener]);
    } else {
      // eslint-disable-next-line
      for (const _listener of element.__events[eventString]) {
        arr.push([eventString, _listener]);
      }
    }
  } else {
    // eslint-disable-next-line
    for (const eventType in element.__events) {
      // eslint-disable-next-line
      for (const _listener of element.__events[eventType]) {
        arr.push([eventString, _listener]);
      }
    }
  }

  arr.forEach((item) => element.removeEventListener(item[0], item[1]));
}
