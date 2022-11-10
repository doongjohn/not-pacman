let ghosts = null

function start() {
  player.init(12, 22)
  ghosts = [
    new Ghost('red', 12, 14),
    new Ghost('pink', 13, 14),
    new Ghost('cyan', 14, 14),
    new Ghost('yellow', 15, 14),
  ]
}

function mainLoop() {
  // calculate delta time
  deltaTime = (performance.now() - startTime) / 1000
  startTime = performance.now()

  // clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (playerDead || score == totalScore) {
    deltaTime = 0
  }

  backgroundGrid.draw()
  grid.draw()

  player.move()
  player.draw()

  for (let ghost of ghosts) {
    ghost.update()
    ghost.draw()
  }

  // score text
  ctx.fillStyle = '#ffffff'
  ctx.font = '60px "Hunter"'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE: ' + score, 20, 70)

  if (playerDead) {
    ctx.fillStyle = '#fff700'
    ctx.font = '100px "Hunter"'
    ctx.textAlign = 'center'
    ctx.fillText('YOU DIED!', canvas.width / 2, canvas.height / 2)
  }

  if (score == totalScore) {
    ctx.fillStyle = '#fff700'
    ctx.font = '100px "Hunter"'
    ctx.textAlign = 'center'
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2)
  }

  requestAnimationFrame(mainLoop)
}
