
import SmartRobot from './smartRobot'
import R from 'ramda'
import { getValue } from '../../shared/utils'

const isK = R.compose(
  R.equals(13),
  getValue
)

// Always pick K if there's one
export default class EvilRobot extends SmartRobot {
  play (game) {
    let card = null
    if (R.any(isK, this.hands)) {
      card = this.hands[R.findIndex(isK, this.hands)]
      this.useCard(card, game)
      this.draw(game)
      game.continue()
    } else {
      super.play(game)
    }
  }

  pickFunctional (options) {
    const values = options.map(getValue)
    const priority = [13, 10, 12, 11, 5, 4, 1]
    for (let i = 0; i < priority.length; i++) {
      if (R.contains(priority[i], values)) {
        return options[R.findIndex(R.equals(priority[i]))]
      }
    }
  }
}
