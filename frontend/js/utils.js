async function postData(url = '', data = {}, signal = null) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    signal: signal,
    body: JSON.stringify(data),
  })
  return response
}

async function getData(url = '', signal = null) {
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    signal: signal,
  })
  return response
}

class GameEvent {
  constructor() {
    // Create a DOM EventTarget object
    var target = document.createTextNode(null)

    // Pass EventTarget interface calls to DOM EventTarget object
    this.addEventListener = target.addEventListener.bind(target)
    this.removeEventListener = target.removeEventListener.bind(target)
    this.dispatchEvent = target.dispatchEvent.bind(target)
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function moveTowards(current, target, maxDelta) {
  if (Math.abs(target - current) <= maxDelta) {
    return target
  }
  return current + Math.sign(target - current) * maxDelta
}
