import x from './index.js'

describe('hello world', () => {
  it('recognize imported value', () => {
    expect(x).to.exist
  })
})
