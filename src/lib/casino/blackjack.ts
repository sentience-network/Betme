import { randomInt } from "crypto";
import { CASINO } from "../constants";

export type Suit = "S" | "H" | "D" | "C";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Card = { rank: Rank; suit: Suit };

export type BlackjackHandState = {
  player: Card[];
  dealer: Card[];
  dealerHidden: boolean;
  status: "player_turn" | "dealer_turn" | "settled";
  outcome?: "blackjack" | "win" | "lose" | "push";
  message?: string;
};

const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS: Suit[] = ["S", "H", "D", "C"];

export function createShoe(decks = 4): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ rank, suit });
      }
    }
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shoe[i], shoe[j]] = [shoe[j]!, shoe[i]!];
  }
  return shoe;
}

export function draw(shoe: Card[]): Card {
  const card = shoe.pop();
  if (!card) throw new Error("Shoe empty");
  return card;
}

export function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      aces += 1;
      total += 11;
    } else if (["K", "Q", "J"].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export function dealBlackjack(): { shoe: Card[]; state: BlackjackHandState } {
  const shoe = createShoe();
  const player = [draw(shoe), draw(shoe)];
  const dealer = [draw(shoe), draw(shoe)];
  const state: BlackjackHandState = {
    player,
    dealer,
    dealerHidden: true,
    status: "player_turn",
  };

  if (isBlackjack(player) || isBlackjack(dealer)) {
    return { shoe, state: settleImmediate(state) };
  }
  return { shoe, state };
}

function settleImmediate(state: BlackjackHandState): BlackjackHandState {
  const playerBj = isBlackjack(state.player);
  const dealerBj = isBlackjack(state.dealer);
  let outcome: BlackjackHandState["outcome"] = "lose";
  let message = "Dealer blackjack";
  if (playerBj && dealerBj) {
    outcome = "push";
    message = "Double blackjack — push";
  } else if (playerBj) {
    outcome = "blackjack";
    message = "Blackjack!";
  }
  return {
    ...state,
    dealerHidden: false,
    status: "settled",
    outcome,
    message,
  };
}

export function hitBlackjack(
  shoe: Card[],
  state: BlackjackHandState
): { shoe: Card[]; state: BlackjackHandState } {
  if (state.status !== "player_turn") throw new Error("Not your turn");
  const nextShoe = [...shoe];
  const player = [...state.player, draw(nextShoe)];
  const value = handValue(player);
  if (value > 21) {
    return {
      shoe: nextShoe,
      state: {
        ...state,
        player,
        dealerHidden: false,
        status: "settled",
        outcome: "lose",
        message: "Bust",
      },
    };
  }
  return {
    shoe: nextShoe,
    state: { ...state, player, status: "player_turn" },
  };
}

export function standBlackjack(
  shoe: Card[],
  state: BlackjackHandState
): { shoe: Card[]; state: BlackjackHandState } {
  if (state.status !== "player_turn") throw new Error("Not your turn");
  const nextShoe = [...shoe];
  const dealer = [...state.dealer];
  while (handValue(dealer) < 17) {
    dealer.push(draw(nextShoe));
  }

  const p = handValue(state.player);
  const d = handValue(dealer);
  let outcome: BlackjackHandState["outcome"] = "lose";
  let message = "Dealer wins";
  if (d > 21) {
    outcome = "win";
    message = "Dealer bust — you win";
  } else if (p > d) {
    outcome = "win";
    message = "You win";
  } else if (p === d) {
    outcome = "push";
    message = "Push";
  }

  return {
    shoe: nextShoe,
    state: {
      ...state,
      dealer,
      dealerHidden: false,
      status: "settled",
      outcome,
      message,
    },
  };
}

export function payoutForOutcome(stake: number, outcome: BlackjackHandState["outcome"]): number {
  switch (outcome) {
    case "blackjack":
      return Math.floor(stake * CASINO.blackjack.blackjackMultiplier);
    case "win":
      return Math.floor(stake * CASINO.blackjack.winMultiplier);
    case "push":
      return stake;
    default:
      return 0;
  }
}

export function cardLabel(card: Card): string {
  const suit = { S: "♠", H: "♥", D: "♦", C: "♣" }[card.suit];
  return `${card.rank}${suit}`;
}

export type PersistedBlackjack = {
  shoe: Card[];
  state: BlackjackHandState;
};
