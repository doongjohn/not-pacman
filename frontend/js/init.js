let jsonMapData = null
let imgLoader = null
let backgroundGrid = null
let grid = null

let deltaTime = 0
let startTime = 0

let score = 0
let totalScore = 0
let playerDead = false

class ImageLoader {
  constructor(sources) {
    this.loaded = 0
    this.count = sources.length
    this.images = new Map()
    for (let src of sources) {
      let img = new Image()
      img.src = src.src
      img.addEventListener('load', () => {
        this.loaded += 1
      })
      this.images.set(src.name, img)
    }
  }
  isLoaded() {
    return this.loaded == this.count
  }
}

function load() {
  // fetch initial map data
  getData('/get-map-json')
    .then((response) => response.json())
    .then((json) => {
      jsonMapData = json
    })
    .catch((err) => {
      alert('failed to load initial map data!')
      console.error('/get_map_json failed')
      console.error(err)
    })

  // load images
  imgLoader = new ImageLoader([
    // pacman
    {
      name: 'pacman_r0',
      src: './assets/pacman/r1.png',
    },
    {
      name: 'pacman_r1',
      src: './assets/pacman/r2.png',
    },
    {
      name: 'pacman_r2',
      src: './assets/pacman/r3.png',
    },
    {
      name: 'pacman_l0',
      src: './assets/pacman/l1.png',
    },
    {
      name: 'pacman_l1',
      src: './assets/pacman/l2.png',
    },
    {
      name: 'pacman_l2',
      src: './assets/pacman/l3.png',
    },
    {
      name: 'pacman_u0',
      src: './assets/pacman/u1.png',
    },
    {
      name: 'pacman_u1',
      src: './assets/pacman/u2.png',
    },
    {
      name: 'pacman_u2',
      src: './assets/pacman/u3.png',
    },
    {
      name: 'pacman_d0',
      src: './assets/pacman/d1.png',
    },
    {
      name: 'pacman_d1',
      src: './assets/pacman/d2.png',
    },
    {
      name: 'pacman_d2',
      src: './assets/pacman/d3.png',
    },
    // ghost
    {
      name: 'ghost_red',
      src: './assets/ghosts/blinky.png',
    },
    {
      name: 'ghost_yellow',
      src: './assets/ghosts/clyde.png',
    },
    {
      name: 'ghost_cyan',
      src: './assets/ghosts/inky.png',
    },
    {
      name: 'ghost_pink',
      src: './assets/ghosts/pinky.png',
    },
    {
      name: 'ghost_scared',
      src: './assets/ghosts/blue_ghost.png',
    },
    {
      name: 'ghost_eyes',
      src: './assets/ghosts/eyes.png',
    },
    // others
    {
      name: 'wall',
      src: './assets/other/wall.png',
    },
    {
      name: 'gate',
      src: './assets/other/gate.png',
    },
    {
      name: 'score',
      src: './assets/other/dot.png',
    },
    {
      name: 'powerup',
      src: './assets/other/strawberry.png',
    },
  ])
}

function init() {
  if (jsonMapData == null) {
    requestAnimationFrame(init)
    return
  }

  if (!imgLoader.isLoaded()) {
    requestAnimationFrame(init)
    return
  }

  const width = jsonMapData.gridWidth
  const height = jsonMapData.gridHeight
  backgroundGrid = createBackgroundGrid(width, height)
  grid = createGrid(width, height, (...[, , tile]) => {
    switch (tile) {
      case 'wall':
        return imgLoader.images.get('wall')
      case 'gate':
        return imgLoader.images.get('gate')
      case 'score':
        return imgLoader.images.get('score')
      case 'powerup':
        return imgLoader.images.get('powerup')
      default:
        return null
    }
  })
  grid.forEach((x, y) => {
    const tileType = jsonMapData.type[y][x]
    switch (tileType) {
      case 0:
        grid.set(x, y, '')
        break
      case 1:
        grid.set(x, y, 'wall')
        break
      case 2:
        grid.set(x, y, 'gate')
        break
      case 3:
        totalScore += 1
        grid.set(x, y, 'score')
        break
      case 4:
        totalScore += 1
        grid.set(x, y, 'powerup')
        break
    }
  })

  start()
  mainLoop()
}

load()
init()
