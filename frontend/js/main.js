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

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  drawText(20, 70, 60, 'SCORE: ' + score)

  if (playerDead) {
    ctx.fillStyle = '#fff700'
    ctx.textAlign = 'center'
    drawText(canvas.width / 2, canvas.height / 2, 100, 'YOU DIED!')
  }

  if (score == totalScore) {
    ctx.fillStyle = '#fff700'
    ctx.textAlign = 'center'
    drawText(canvas.width / 2, canvas.height / 2, 100, 'YOU WIN!')
  }

  requestAnimationFrame(mainLoop)
}
