import R from 'ramda'
import { isFunctional } from './utils'

describe('Utils', () => {
  it('isFunctional', () => {
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
})
