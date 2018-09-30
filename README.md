# Ninety-nine

console-based unix-compatible interactive card game

## Game Rule

### General rules

- Ninety-nine is a turn-based card game with 4-6 players (usually 4), and we don't use Joker in this game.
- Before we started, we will shuffle first. Then each player will draw a card until every one have exactly 5 cards in their hands. All others will become our deck.
- *sum* starts from 0.
- Each turn, player will play one card either `normal` or `functional`. Normal card will accumulate the *sum*, whereas functional card will be used for special purposes. After played one card, player will have to **draw another card from deck**, which means during the game, players will always keep exactly 5 cards in their hands.
- The *sum* cannot exceed 99. If the current *sum* is exactly 99 and the current player has no any functional card, this player loses the game, and other players continue until there's only 1 player.
- The goal is to survive until the end!

### Functional cards

All the functional cards cannot be used to accumulate the *sum*, unless it's the function.

> 4 (All Suits)

Change the rotating direction, so *clockwise* becomes *counterclockwise* and vice versa.

> 5 (All Suits)

Pick any player (x) to take over the next turn, and the one next to player x will be the next next one according to rotating direction.

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

---

## Design Choices

### Dependencies

- `socket.io` & `socket.io-client`: we need web-socket for realtime communication between client and server
- `ramda`: a handy functional library
- `chalk`: make UI in console looks much better, though we may want to pick any client other than console in the first place ;|
- `readline`: make accessing stdin simpler for NodeJs

### Tooling

Use as many tool as possible if it facilitates your development. But given that it's a small project, I just pick the necessary tools at this point. Here are some tools in this repo and their main purpose:

- `babel` family: so developers can use ES6+ and happy coding :)
- `mocha`, `chai`, `sinon` and `karma`: testing framework and test runner
- `eslint`: ensure basic quality of code
- `nodemon`: similar to HMR(Hot Module Replacement) for NodeJS, which facilitate developing a lot

### Data Structure

In 99, value of a card is the only thing matters, and almost all suits don't matter at all except for spade A. Therefore, just use an array of number will simplify things a lot. Also, it's a turn-based system. If we break it down, we'll notice that in each round, we'll need to ascertain who's the next player, which is how this repo implemented it.