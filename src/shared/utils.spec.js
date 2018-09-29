import R from 'ramda'
import { isFunctional, getValue, getCard } from './utils'

describe('Utils', () => {
  it('test whether a card is functional', () => {
    const a = [1, 4, 5, 10, 11, 12, 13]
    const b = [2, 3, 6, 7, 8, 9]
    const isAllFunctional = R.all(isFunctional)
    expect(isAllFunctional(a)).to.be.true
    expect(isAllFunctional(b)).to.be.false
    expect(isFunctional(0)).to.be.false
    expect(isFunctional(14)).to.be.false
    expect(isFunctional(26)).to.be.true
    expect(isFunctional('26')).to.be.false
  })

  it('get value of a card', () => {
    expect(getValue(10)).to.equal(10)
    expect(getValue(13)).to.equal(13)
    expect(getValue(26)).to.equal(13)
    expect(getValue(47)).to.equal(8)
    expect(getValue(52)).to.equal(13)
  })

  it('get value and suit of a card', () => {
    const isSpade = R.propEq('suit', 'Spade')
    const isHeart = R.propEq('suit', 'Heart')
    const isDiamond = R.propEq('suit', 'Diamond')
    const isClub = R.propEq('suit', 'Club')
    const hasValue = R.propEq('value')
    expect(R.both(isSpade, hasValue(1))(getCard(1))).to.be.true
    expect(R.both(isSpade, hasValue(13))(getCard(13))).to.be.true
    expect(R.both(isHeart, hasValue(13))(getCard(26))).to.be.true
    expect(R.both(isDiamond, hasValue(12))(getCard(38))).to.be.true
    expect(R.both(isClub, hasValue(1))(getCard(40))).to.be.true
  })
})
