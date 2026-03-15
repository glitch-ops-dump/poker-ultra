# Poker Ultra — State

## Overview

State lives in two places: the **server** (authoritative) and the **client** (derived/display).

---

## Server State

### `TableState` (`server/src/engine.ts`)

The canonical game state for one room. Never sent to clients directly — always sanitized first.

```ts
interface TableState {
  roomId: string;             // 6-letter room code
  state: GameState;           // 'WAITING' | 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN'
  players: (PlayerState | null)[];  // Sparse array indexed by seatIndex (length = maxPlayers)
  maxPlayers: number;         // 2 | 4 | 6
  deck: Card[];               // Remaining shuffled deck (hidden from clients)
  communityCards: Card[];     // 0–5 community cards
  pot: number;                // Total chips in pot
  currentBet: number;         // Current street's highest bet
  dealerIndex: number;        // Seat index of dealer button
  currentTurnIndex: number;   // Seat index of player to act
  minRaise: number;           // Minimum raise increment (starts at bigBlind, grows with raises)
  bigBlind: number;           // 100 (fixed)
  smallBlind: number;         // 50 (fixed)
  logs: string[];             // Capped at 50 entries; ring-buffer behaviour
}
```

### `PlayerState` (`server/src/engine.ts`)

```ts
interface PlayerState {
  id: string;                 // Socket.IO socket ID (changes on reconnect)
  name: string;
  chips: number;              // Current chip stack
  cards: [Card, Card] | null; // Hole cards (null between hands)
  currentBet: number;         // Amount bet in current street
  totalInvested: number;      // Total chips put in this hand (used for side-pot calculation)
  status: 'active' | 'folded' | 'all-in' | 'sitting-out';
  seatIndex: number;
  isBot?: boolean;
  hasActedThisRound?: boolean; // Whether player has acted since last street/raise
}
```

### `Card` (`server/src/deck.ts`)

```ts
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;   // '2'–'10', 'J', 'Q', 'K', 'A'
  rank: number;    // 0 (2) – 12 (Ace)
}
```

---

## State Sanitization

`getSanitizedState(playerId)` is called per-socket before broadcast:
- Strips `deck` (sent as empty array)
- Replaces all opponents' `cards` with `[{ suit:'hearts', value:'?', rank:0 }, ...]` **except** during `SHOWDOWN`

---

## Client State

### Zustand `AppState` (`client/src/store/gameStore.ts`)

Persistent fields (survive page reload via `localStorage`):

| Field | Storage key | Default |
|---|---|---|
| `displayName` | `poker_name` | `''` |
| `balance` | `poker_balance` | `10000` |
| `isSoundEnabled` | `poker_sound` | `true` |
| `isMusicEnabled` | `poker_music` | `true` |

Session fields (reset on disconnect/reload):

| Field | Type | Notes |
|---|---|---|
| `roomCode` | `string \| null` | Set on join, cleared on disconnect |
| `seatIndex` | `number \| null` | Assigned by server on join |
| `tableState` | `TableState \| null` | Derived from `table_state` events |
| `isConnected` | `boolean` | Socket.IO connection status |
| `socket` | `Socket` | Single shared instance, `autoConnect: false` |
| `activeRooms` | `RoomInfo[]` | Populated by `GET /api/rooms` |
| `potWinners` | `WinEvent[] \| null` | Transient — cleared after 3 s |

### Client `TableState` (`client/src/store/gameStore.ts`)

```ts
interface TableState {
  roomId: string;
  state: string;                    // Same GameState string
  players: (Player | null)[];
  maxPlayers: number;
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  currentTurnIndex: number;
  minRaise: number;
  logs: string[];
  // NOTE: smallBlind and bigBlind are NOT included
}
```

### Client `Player` (`client/src/store/gameStore.ts`)

```ts
interface Player {
  id: string;
  name: string;
  chips: number;
  isDealer?: boolean;               // Derived: seatIndex === dealerIndex
  cards: [Card, Card] | null;
  currentBet: number;
  status: 'fold' | 'check' | 'call' | 'raise' | 'all-in' | 'thinking' | null;
  // 'thinking' = active player whose turn it currently is
  // 'fold'     = folded (mapped from server 'folded')
  seatIndex: number;
  isHero?: boolean;                 // Derived: seatIndex === local seatIndex
  // NOTE: totalInvested and hasActedThisRound are NOT exposed to client
}
```

---

## State Mutations

### Server-side mutations

All state changes go through `TexasHoldemEngine` methods:

| Method | State changes |
|---|---|
| `addPlayer` | Inserts `PlayerState` at seatIndex |
| `removePlayer` | Nulls out seat; folds if mid-hand |
| `startHand` | Resets all player fields, deals cards, posts blinds, sets `currentTurnIndex` |
| `fold` | `player.status = 'folded'`, `hasActedThisRound = true` |
| `check` | `hasActedThisRound = true` |
| `call` | Moves chips from player to `currentBet`; may set `all-in` |
| `raise` | Updates `currentBet`, `minRaise`; resets `hasActedThisRound` for all other active players |
| `collectBets` | Moves all `currentBet` values to `pot`; resets `currentBet` to 0 |
| `advanceGameState` | Deals community cards; advances `state` enum |
| `handleShowdown` | Evaluates hands, distributes pot, resets to `WAITING`, schedules next hand |
| `scheduleNextHand` | `setTimeout 6000ms` → reloads busted players → `startHand` |

### Client-side mutations (Zustand actions)

| Action | What it does |
|---|---|
| `createRoom(maxPlayers, withBots)` | Connects socket, emits `create_room`, then calls `joinRoom` on callback |
| `joinRoom(code)` | Emits `join_room`; on success sets `roomCode` and `seatIndex` |
| `leaveRoom()` | Disconnects socket; persists balance to localStorage; clears session state |
| `sendAction(action, amount?)` | `socket.emit('action', ...)` — no local optimistic update |
| `sendChat(msg)` | `socket.emit('chat_message', msg)` |
| `sendThrow(type, toSeat)` | `socket.emit('throw_item', ...)` |
| `fetchRooms()` | `GET /api/rooms` → sets `activeRooms` |
| `toggleSound/Music()` | Flips boolean + persists to localStorage |

---

## Real-time State Sync Flow

```
Server engine mutates TableState
  → onStateChange callback fires
    → broadcastState(roomId)
      → for each socket in room:
          engine.getSanitizedState(socketId)
            → socket.emit('table_state', sanitized)
              → client socket.on('table_state', handler)
                → mapStatus() transforms server statuses to UI statuses
                → injects isHero, isDealer flags
                → syncs hero balance from server chips value
                → Zustand set({ tableState })
                  → React re-renders all subscribers
```

---

## Transient UI State (React local state in `TableView`)

| State | Type | Purpose |
|---|---|---|
| `throwTarget` | `number \| null` | Seat being targeted for throwable |
| `showSettings` | `boolean` | Settings modal visibility |
| `isFullscreen` | `boolean` | Tracks browser fullscreen state |
| `showChat` | `boolean` | Chat panel visibility toggle |
| `autoFold` | `boolean` | Pre-select fold for next turn |
| `autoCheck` | `boolean` | Pre-select check/fold for next turn |
| `actionTimer` | `number \| null` | Seconds elapsed since turn started (max 60) |

---

## Known State Gaps

| Gap | Impact |
|---|---|
| Client `TableState` omits `smallBlind` / `bigBlind` | Blinds display in TopBar is hard-coded to "₹50/₹100" rather than reading from state |
| No reconnection — socket ID is the player ID | Refreshing the page mid-game loses seat permanently |
| `totalInvested` not exposed to client | Client cannot reconstruct side-pot display |
| `hasActedThisRound` not exposed to client | Client cannot show "acted" indicator per player |
| `potWinners` auto-cleared after 3 s regardless of acknowledgement | Win overlay may disappear before user reads it |
| `balance` in localStorage is client-authoritative | Mismatch possible between localStorage balance and server chip count |
| Server `logs` capped at 50 but client hand history has no equivalent cap | UI history grows unbounded |
| Server `GameState` never includes `'ACTIVE'` | `TableView.tsx` condition `tableState.state === 'ACTIVE'` for auto-action panel is unreachable |
