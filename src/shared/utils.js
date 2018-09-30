import R from 'ramda'
import { FUNCTIONAL_CARDS, SUITS, MAX_SUM } from './constants'

export const shuffle = cards => {
  const res = [...cards]
  let index
  let total = cards.length
  while (total !== 0) {
    index = ~~(Math.random() * total--);
    [res[index], res[total]] = [res[total], res[index]]
  }
  return res
}

// `%` only deals unsigned int
export const mod = (n, m) => ((n % m) + m) % m

export const isFunctional = card => FUNCTIONAL_CARDS.includes(card)
export const isFunctionalWithInstruction = card => [5, 10, 12].includes(getValue(card))
export const getValue = num => num % 13 === 0 ? 13 : num % 13
export const getCard = num => {
  const suit = ~~((num - 1) / 13)
  return {
    value: getValue(num),
    suit: SUITS[suit]
  }
}

export const hasValue = R.complement(R.isEmpty)
export const sample = (options = []) => options[~~(Math.random() * options.length)]
export const isMoreThanSum = sum => num => R.gt(sum + num, MAX_SUM)
export const maxNum = R.reduce(R.max, 0)
