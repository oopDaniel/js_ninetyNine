import chalk from 'chalk'
import R from 'ramda'
import { getCard } from '../shared/utils'

const map = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K'
}

const color = ({ suit, value }) => {
  value = map[value] || value
  if (['Spade', 'Club'].includes(suit)) {
    return chalk.black.bgWhite(`${suit === 'Spade' ? '♣' : '♠'}${value}`)
  } else {
    return chalk.red.bgWhite(`${suit === 'Heart' ? '♥' : '♦'}${value}`)
  }
}

export const render = R.compose(
  color,
  getCard
)

export const renderAll = R.compose(R.join(' '), R.map(render))
