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
    if (state == null) {
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
    // state transition
    const next = this.currentState?.next(this.self)
    if (next) {
      this.setState(next)
    }

    // state update
    this.currentState?.onUpdate(this.self)
  }
}

// TODO: every 10 score every ghosts enter follow state
// TODO: ghost will roam for x sec when player is x distance away

// ghost states
const stateRoam = new State() // TODO: make this
const stateFollow = new State()
const stateInBox = new State()
const stateFrightened = new State()
const stateEaten = new State()

stateFollow.onEnter = (self) => {
  self.controller = new AbortController()
  self.path = null
}
stateFollow.onExit = (self) => {
  self.controller.abort()
  self.path = null
}
stateFollow.onUpdate = (self) => {
  const needUpdate =
    self.path == null ||
    self.path.length == 0 ||
    self.path[self.path.length - 1].x != player.pos.x ||
    self.path[self.path.length - 1].y != player.pos.y

  const overlapPlayer = self.pos.x == player.pos.x && self.pos.y == player.pos.y

  if (needUpdate && !overlapPlayer) {
    self.getPath(player.pos, self.controller.signal)
  }

  self.followPath(self.followSpeed)

  const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
  if (playerCollide) {
    playerDead = true
  }
}

stateInBox.onEnter = (self) => {
  self.moveDir.x = 0
  self.moveDir.y = Math.round(randomRange(0, 1)) == 0 ? 1 : -1
}
stateInBox.onExit = (self) => {
  self.respawnTimer = 0
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
    return stateFollow
  }

  return null
}

stateFrightened.onEnter = (self) => {
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
    .sort(self.cmpByDistFar())[0]
}
stateFrightened.onExit = (self) => {
  self.scaredTimer = 0
  self.img = self.imgNormal
}
stateFrightened.onUpdate = (self) => {
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
      .sort(self.cmpByDistFar())[0]
  }
  self.move(self.scaredSpeed)
  self.scaredTimer += deltaTime
}
stateFrightened.next = (self) => {
  const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
  if (playerCollide) {
    return stateEaten
  }

  if (self.isMoveDone() && self.scaredTimer >= 5) {
    return stateFollow
  }

  return null
}

stateEaten.onEnter = (self) => {
  self.img = self.imgEaten
  self.path = null
  self.getPath(self.startPos)
}
stateEaten.onExit = (self) => {
  self.img = self.imgNormal
}
stateEaten.onUpdate = (self) => {
  self.followPath(self.eatenSpeed)
}
stateEaten.next = (self) => {
  if (self.path !== null && self.path.length == 0) {
    return stateInBox
  }

  return null
}
