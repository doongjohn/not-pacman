class State {
  constructor() {
    this.onEnter = function() {}
    this.onExit = function() {}
    this.onUpdate = function() {}
    this.next = function() {
      return null
    }
  }
}

class Fsm {
  constructor(self) {
    this.self = self
    this.currentState = null
  }

  setState(state) {
    if (state === undefined || state === null) {
      return
    }

    if (this.currentState == state) {
      return
    }

    this.currentState?.onExit(this.self)
    this.currentState = state
    this.currentState.onEnter(this.self)
  }

  update() {
    const next = this.currentState?.next(this.self)
    next && this.setState(next)
    this.currentState?.onUpdate(this.self)
  }
}

function getPath(self, dest, signal = null) {
  postData(
    '/get-path-json',
    {
      start: {
        x: self.pos.x,
        y: self.pos.y,
      },
      dest: dest,
    },
    signal
  )
    .then((response) => response.json())
    .then((json) => {
      self.path = json
      if (self.path.length > 1) {
        self.path.splice(0, 1) // remove starting position
      }
    })
    .catch((err) => {
      if (err.name == 'AbortError') {
        console.log('fetch aborted')
        return
      }
      console.error('/get-path-json')
      console.error(err)
    })
}

function sortByDist(self) {
  return function(a, b) {
    const distA =
      (player.pos.x - (self.pos.x + a.x)) ** 2 + (player.pos.y - (self.pos.y + a.y)) ** 2
    const distB =
      (player.pos.x - (self.pos.x + b.x)) ** 2 + (player.pos.y - (self.pos.y + b.y)) ** 2
    if (distA > distB) {
      return -1
    }
    if (distA > distB) {
      return 1
    }
    if (distA == distB) {
      return randomRange(0, 2) == 0 ? -1 : 1
    }
  }
}

const stateFollow = new State()
stateFollow.onExit = (self) => {
  self.controller.abort()
  self.path = null
}
stateFollow.onEnter = (self) => {
  self.controller = new AbortController()
  self.path = null
}
stateFollow.onUpdate = (self) => {
  const needUpdate =
    self.path === null ||
    self.path.length == 0 ||
    self.path[self.path.length - 1].x != player.pos.x ||
    self.path[self.path.length - 1].y != player.pos.y

  const overlapPlayer = self.pos.x == player.pos.x && self.pos.y == player.pos.y

  if (needUpdate && !overlapPlayer) {
    getPath(self, player.pos, self.controller.signal)
  }

  self.followPath(self.followSpeed)

  const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
  if (playerCollide) {
    playerDead = true
  }
}

const stateInBox = new State()
stateInBox.onExit = (self) => {
  self.respawnTimer = 0
}
stateInBox.onEnter = (self) => {
  self.moveDir.x = 0
  self.moveDir.y = Math.round(randomRange(0, 1)) == 0 ? 1 : -1
}
stateInBox.onUpdate = (self) => {
  if (self.pos.x == self.nextPos.x && self.pos.y == self.nextPos.y) {
    self.moveDir.y *= -1
  }
  self.move(self.inBoxSpeed)
  self.respawnTimer += deltaTime
}
stateInBox.next = (self) => {
  if (self.isMoveDone() && self.respawnTimer >= randomRange(3, 6)) {
    return states.follow
  }

  return null
}

const stateScared = new State()
stateScared.onExit = (self) => {
  self.scaredTimer = 0
  self.img = self.imgNormal
}
stateScared.onEnter = (self) => {
  self.img = self.imgScared
  self.moveDir = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ]
    .filter((value) => {
      if (!self.canMove(self.pos, value)) {
        return false
      }
      return true
    })
    .sort(sortByDist(self))[0]
}
stateScared.onUpdate = (self) => {
  if (self.isMoveDone()) {
    self.moveDir = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ]
      .filter((value) => {
        if (!self.canMove(self.pos, value)) {
          return false
        }
        if (self.moveDir.x != 0) {
          return -self.moveDir.x != value.x
        }
        if (self.moveDir.y != 0) {
          return -self.moveDir.y != value.y
        }
        return true
      })
      .sort(sortByDist(self))[0]
  }
  self.move(self.scaredSpeed)
  self.scaredTimer += deltaTime
}
stateScared.next = (self) => {
  const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
  if (playerCollide) {
    return states.eaten
  }

  if (self.isMoveDone() && self.scaredTimer >= 5) {
    return states.follow
  }

  return null
}

const stateEaten = new State()
stateEaten.onExit = (self) => {
  self.img = self.imgNormal
}
stateEaten.onEnter = (self) => {
  self.img = self.imgEyes
  self.path = null
  getPath(self, self.startPos)
}
stateEaten.onUpdate = (self) => {
  self.followPath(self.eatenSpeed)
}
stateEaten.next = (self) => {
  if (self.path !== null && self.path.length == 0) {
    return states.inBox
  }

  return null
}
