class Fsm {
  constructor(self) {
    this.self = self
    this.currentState = null
  }

  setState(state) {
    if (state === undefined || state === null) {
      return
    }

    if (this.currentState && state.name == this.currentState.name) {
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
        x: self.gridPos.x,
        y: self.gridPos.y,
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

const states = {
  follow: {
    onExit: (self) => {
      self.controller.abort()
      self.path = []
    },
    onEnter: (self) => {
      self.controller = new AbortController()
      self.path = []
    },
    onUpdate: (self) => {
      const needUpdate =
        self.path.length == 0 ||
        self.path[self.path.length - 1].x != player.gridPos.x ||
        self.path[self.path.length - 1].y != player.gridPos.y

      const overlapPlayer = self.gridPos.x == player.gridPos.x && self.gridPos.y == player.gridPos.y

      if (needUpdate && !overlapPlayer) {
        getPath(self, player.gridPos, self.controller.signal)
      }

      self.followPath(self.followSpeed)

      const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
      if (playerCollide) {
        playerDead = true
      }
    },
    next: (self) => {
      return null
    },
  },

  inBox: {
    onExit: (self) => {
      self.respawnTimer = 0
    },
    onEnter: (self) => {
      self.moveDir.x = 0
      self.moveDir.y = Math.round(randomRange(0, 1)) == 0 ? 1 : -1
    },
    onUpdate: (self) => {
      if (self.gridPos.x == self.nextPos.x && self.gridPos.y == self.nextPos.y) {
        self.moveDir.y *= -1
      }
      self.move(self.inBoxSpeed)
      self.respawnTimer += deltaTime
    },
    next: (self) => {
      if (self.isModeDone() && self.respawnTimer >= randomRange(3, 6)) {
        return states.follow
      }

      return null
    },
  },

  scared: {
    onExit: (self) => {
      self.scaredTimer = 0
      self.img = self.imgNormal
    },
    onEnter: (self) => {
      self.img = self.imgScared

      if (Math.round(randomRange(0, 1)) == 0) {
        self.moveDir.y = 0
        self.moveDir.x = Math.sign(self.x - player.x)
        if (self.canMove(self.gridPos, self.moveDir)) {
          if (self.canMove(self.gridPos, { x: 0, y: 1 })) {
            self.moveDir.x = 0
            self.moveDir.y = 1
          } else if (self.canMove(self.gridPos, { x: 0, y: -1 })) {
            self.moveDir.x = 0
            self.moveDir.y = -1
          }
        }
      } else {
        self.moveDir.y = Math.sign(self.y - player.y)
        self.moveDir.x = 0
        if (self.canMove(self.gridPos, self.moveDir)) {
          if (self.canMove(self.gridPos, { x: 1, y: 0 })) {
            self.moveDir.x = 1
            self.moveDir.y = 0
          } else if (self.canMove(self.gridPos, { x: -1, y: 0 })) {
            self.moveDir.x = -1
            self.moveDir.y = 0
          }
        }
      }
    },
    onUpdate: (self) => {
      if (self.isModeDone()) {
        if (Math.round(randomRange(0, 1)) == 0) {
          self.moveDir.y = 0
          self.moveDir.x = Math.sign(self.x - player.x)
          if (self.canMove(self.gridPos, self.moveDir)) {
            if (self.canMove(self.gridPos, { x: 0, y: 1 })) {
              self.moveDir.x = 0
              self.moveDir.y = 1
            } else if (self.canMove(self.gridPos, { x: 0, y: -1 })) {
              self.moveDir.x = 0
              self.moveDir.y = -1
            }
          }
        } else {
          self.moveDir.y = Math.sign(self.y - player.y)
          self.moveDir.x = 0
          if (self.canMove(self.gridPos, self.moveDir)) {
            if (self.canMove(self.gridPos, { x: 1, y: 0 })) {
              self.moveDir.x = 1
              self.moveDir.y = 0
            } else if (self.canMove(self.gridPos, { x: -1, y: 0 })) {
              self.moveDir.x = -1
              self.moveDir.y = 0
            }
          }
        }
      }
      self.move(self.scaredSpeed)
      self.scaredTimer += deltaTime
    },
    next: (self) => {
      const playerCollide = Math.abs(player.x - self.x) < 10 && Math.abs(player.y - self.y) < 10
      if (playerCollide) {
        return states.eaten
      }

      if (self.isModeDone() && self.scaredTimer >= 5) {
        return states.follow
      }

      return null
    },
  },

  eaten: {
    onExit: (self) => {
      self.img = self.imgNormal
    },
    onEnter: (self) => {
      self.img = self.imgEyes
      self.path = null
      getPath(self, self.startPos)
    },
    onUpdate: (self) => {
      self.followPath(self.eatenSpeed)
    },
    next: (self) => {
      if (self.path !== null && self.path.length == 0) {
        return states.inBox
      }

      return null
    },
  },
}
