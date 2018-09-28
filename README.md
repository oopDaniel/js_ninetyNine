# Ninety-nine

console-based unix-compatible interactive card game

## Game Rule

### General rules

- Ninety-nine is a turn-based card game with 4-6 players (usually 4), and we don't use Joker in this game.
- Before we started, system will do a shuffle first. Then each player will draw a card until every one have exactly 5 cards in their hands, and the rest will be our deck.
- *sum* will start from 0.
- Each turn, player will play one card. There are 2 types of card: `normal` and `functional`. Normal card will accumulate the *sum*, whereas functional card will be used for special purposes. After played one card, the player will have to **draw another card from deck**, which means during the game, players will always have exactly 5 cards in their hands.
- The *sum* cannot exceed 99. If the current *sum* is exactly 99 and the current player has no any functional card, this player loses the game, and other players continue.
- The goal is to survive!

### Functional cards

All the functional cards cannot be used to accumulate the *sum*, unless it's the function.

> 4 (All Suits)

Change the rotation. clockwise becomes counterclockwise and vice versa.

> 5 (All Suits)

Pick a player (x) to take over the current turn. The next player will be the next one of player (x).

> 10 (All Suits)

Plus or minus ten on *sum*.

> J (All Suits)

Pass the current turn (so it becomes next player's turn).

> Q (All Suits)

Plus or minus twenty on *sum*.

> K (All Suits)

Accumulate the *sum* to 99 directly. (If current *sum* happen to be 99, this card is still a valid one).

> A (SPADE ONLY)

Reset *sum* to make it zero, and shuffle the desk.

---

## Development

### Prerequisites

This repo relies on `NodeJS` (>= 8.0), so make sure you have one on your machine.

### Getting started

```bash
# Install dependencies
npm i
# Start both server and client
npm start
```