import chalk from 'chalk'
import R from 'ramda'
import { getCard } from '../shared/utils'

const color = ({ suit, value }) => {
  if (['Spade', 'Club'].includes(suit)) {
    return chalk.black.bgWhite(`${suit === 'Spade' ? 'S' : 'C'}${value}`)
  } else {
    return chalk.red.bgWhite(`${suit === 'Heart' ? 'H' : 'D'}${value}`)
  }
}

export const render = R.compose(
  color,
  getCard
)

export const renderAll = R.compose(R.join(' '), R.map(render))
