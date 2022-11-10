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

// Pac-Man Ghost AI Explained
// https://www.youtube.com/watch?v=ataGotQ7ir8

// ghost states
const stateRoam = new State()
const stateFollow = new State()
const stateInBox = new State()
const stateFrightened = new State()
const stateEaten = new State()

stateRoam.onEnter = (self) => {
  self.roamTime = randomRange(2, 4)
}
stateRoam.onExit = (self) => {
  self.roamTimer = 0
}
stateRoam.onUpdate = (self) => {
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
      .sort(() => randomRange(-1, 1))[0]
  }

  self.move(self.followSpeed)
}
stateRoam.next = (self) => {
  self.roamTimer += deltaTime

  if (self.roamTimer >= self.roamTime) {
    return stateFollow
  }
}

stateFollow.onEnter = (self) => {
  self.followTime = randomRange(7, 9)
  self.controller = new AbortController()
  self.path = null
}
stateFollow.onExit = (self) => {
  self.followTimer = 0
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
stateFollow.next = (self) => {
  self.followTimer += deltaTime

  if (self.followTimer >= self.followTime) {
    return stateRoam
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
}
stateInBox.next = (self) => {
  self.respawnTimer += deltaTime

  if (self.isMoveDone() && self.respawnTimer >= randomRange(3, 6)) {
    return stateFollow
  }
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
  self.frightenedTimer = 0
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
  self.move(self.frightenedSpeed)
}
stateFrightened.next = (self) => {
  self.frightenedTimer += deltaTime

  const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
  if (playerCollide) {
    return stateEaten
  }

  if (self.isMoveDone() && self.frightenedTimer >= 5) {
    return stateFollow
  }
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
}
