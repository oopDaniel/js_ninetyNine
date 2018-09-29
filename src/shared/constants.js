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
