export const PORT = 8080

const INDISTINCT_FUNCTION_CARD_VALUES = [4, 5, 10, 11, 12, 13]
const SUIT_SIZE = 13

export const FUNCTIONAL_CARDS = [
  1, // Spade
  ...INDISTINCT_FUNCTION_CARD_VALUES, // Spade
  // Other suits don't really matter..
  ...INDISTINCT_FUNCTION_CARD_VALUES.map(x => x + SUIT_SIZE), // Heart
  ...INDISTINCT_FUNCTION_CARD_VALUES.map(x => x + SUIT_SIZE * 2), // Diamond
  ...INDISTINCT_FUNCTION_CARD_VALUES.map(x => x + SUIT_SIZE * 3) // Club
]

export const SUITS = {
  0: 'Spade',
  1: 'Heart',
  2: 'Diamond',
  3: 'Club',
  Spade: 0,
  Heart: 1,
  Diamond: 2,
  Club: 3
}
