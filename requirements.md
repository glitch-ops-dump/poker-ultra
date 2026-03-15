# Poker Ultra — Requirements

All requirements are drawn from the implemented codebase, commit history, and documentation (`UPDATED_UI_SUMMARY.md`, `DEPLOYMENT_GUIDE.md`, `RENDER_DEPLOYMENT.md`).

---

## Functional Requirements

### Lobby

- **R-L1** A player must be able to set a display name before entering any table.
- **R-L2** The lobby must list all active rooms with: room ID, table name, human player count, max players, blind level, and game state.
- **R-L3** A player must be able to create a new room, selecting table size (2, 4, or 6 players).
- **R-L4** When creating a room the player must be able to toggle "Fill with Bots" (default: on).
- **R-L5** A player must be able to join an existing room by typing its 6-letter room code.
- **R-L6** The lobby must refresh the room list on load and when rooms change.

### Game Setup

- **R-GS1** A table must support 2, 4, or 6 players.
- **R-GS2** Bot players must be assigned to all seats not taken by humans when "Fill with Bots" is enabled.
- **R-GS3** A hand must start automatically 2 seconds after the second player (human or bot) joins.
- **R-GS4** Bot players must have unique names from the set: Astro, BluffKing, ChipLord, DealerD, Eva.
- **R-GS5** Each bot starts with ₹50,000; human players start with their lobby balance (capped at ₹50,000).

### Texas Hold'em Rules

- **R-TH1** The game must implement standard Texas Hold'em hand stages: PRE_FLOP → FLOP → TURN → RIVER → SHOWDOWN.
- **R-TH2** Small blind must be ₹50; big blind must be ₹100.
- **R-TH3** The dealer button must advance clockwise each hand.
- **R-TH4** In heads-up play the dealer must act as small blind.
- **R-TH5** Pre-flop, the first player to act must be the seat after the big blind (UTG).
- **R-TH6** Post-flop, the first player to act must be the first active seat after the dealer.
- **R-TH7** Supported actions: Fold, Check, Call, Raise, All-In.
- **R-TH8** Raise must set the table's `currentBet`; all other active players must re-act.
- **R-TH9** Minimum raise must equal the previous raise increment (no less than big blind).
- **R-TH10** A call that would exceed a player's stack must cap at an all-in.
- **R-TH11** Side pots must be calculated correctly for all-in scenarios.
- **R-TH12** At showdown the best 5-card hand from 7 cards must be evaluated for each player.
- **R-TH13** Hand ranks (high to low): Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.
- **R-TH14** If multiple players tie a pot slice the chips must be split; the odd chip must go to the first winner.
- **R-TH15** When only one player remains (all others folded), that player wins the pot uncontested without a showdown.
- **R-TH16** When all remaining players are all-in (0 or 1 active decision-makers), remaining community cards must be run out immediately.
- **R-TH17** Busted human players must be automatically reloaded with ₹10,000 before the next hand.
- **R-TH18** Busted bots must be reloaded with ₹50,000 (effectively infinite chips).
- **R-TH19** The next hand must start automatically 6 seconds after each hand concludes.
- **R-TH20** Hole cards of non-hero players must be hidden from the client except at showdown.

### Bot AI

- **R-BA1** Bots must wait 1–2.5 seconds before acting to simulate thinking.
- **R-BA2** Bot decisions must be based on hand strength (0–9 rank) and pot odds.
- **R-BA3** Pre-flop strength must be approximated from hole card ranks (paired = 2, high cards sum > 18 = 1, else 0).
- **R-BA4** Bots must not act twice in a single turn (duplicate-action guard required).

### Turn Timer and Auto-Actions

- **R-TA1** When it is the hero's turn a countdown timer must start from 60 seconds.
- **R-TA2** At 30 seconds remaining a warning beep sound must play.
- **R-TA3** At 0 seconds the client must auto-check (if possible) or auto-fold.
- **R-TA4** The player must be able to pre-select "Auto Fold" or "Auto Check/Fold" while waiting for their turn.
- **R-TA5** The timer must reset when the turn changes.

### Chat and Social

- **R-CS1** Players must be able to send text chat messages visible to all players in the room.
- **R-CS2** Chat messages must include sender name and a color identifier.
- **R-CS3** Players must be able to throw one of five emoji items (snowball ❄️, fireworks 🎆, laughing 😂, thumbsup 👍, tomato 🍅) at any other player.
- **R-CS4** Throwable animations must arc from the sender's seat position to the target's seat position.
- **R-CS5** The chat panel must include a hand history tab showing results of past hands.
- **R-CS6** Hand history entries must be collapsible.

### UI / UX

- **R-UI1** The poker table must be displayed at 75vw width (max 950px) with a 950:520 aspect ratio.
- **R-UI2** Player pods must be positioned close to the table edge (top/bottom: −50px, sides: −100px).
- **R-UI3** Action controls must float in the bottom-right corner (not consume table space).
- **R-UI4** The chat panel must float in the bottom-left corner (not consume table space).
- **R-UI5** The top bar must show: app logo, room code, blind level, player count, hero balance, fullscreen button, settings button, leave button.
- **R-UI6** Pressing `F` must toggle fullscreen mode.
- **R-UI7** Sound effects must play for: fold, check, chips (call/raise), all-in, beep (timer warning), throw.
- **R-UI8** Background ambient music must be synthesized via Web Audio API and togglable.
- **R-UI9** A win announcement overlay must appear when a player wins a pot, showing name, amount, and hand rank.
- **R-UI10** The overlay must clear automatically after 3 seconds.
- **R-UI11** The hero's current best hand description must be displayed on the table.
- **R-UI12** Face cards (K, Q, J) must render as SVG artwork.
- **R-UI13** Pot must be displayed with chip denomination visualization.
- **R-UI14** Cards must animate when dealt (fly from deck to seat).
- **R-UI15** Community cards must flip face-up when revealed.
- **R-UI16** The "thinking" player's pod must be visually highlighted during their turn.
- **R-UI17** Players must be rotated so the hero always appears at the bottom-center seat.
- **R-UI18** Sound and music preferences must persist across sessions (localStorage).

### Room Lifecycle

- **R-RL1** When all human players disconnect, the room must be destroyed and the bot loop stopped.
- **R-RL2** Room codes must be 6 random uppercase letters, unique across active rooms.
- **R-RL3** If a human player disconnects mid-hand their seat must be folded immediately.

---

## Non-Functional Requirements

### Performance

- **R-NF1** The gzipped production bundle must not exceed 150 kB.
- **R-NF2** Bot AI must not block the event loop (all decisions must be asynchronous).
- **R-NF3** Server log ring-buffer must be capped at 50 entries per room.

### Security

- **R-NF4** Hole cards of other players must never be sent in plaintext (server-side sanitization required).
- **R-NF5** Actions from a player who is not the current-turn player must be silently ignored by the server.

### Deployment

- **R-NF6** The application must be deployable as a single process (Express serves both API and static files).
- **R-NF7** The server must bind to `0.0.0.0` and respect the `PORT` environment variable.
- **R-NF8** A Docker 3-stage build must produce a self-contained image.
- **R-NF9** A `render.yaml` must configure one-click deployment on Render.com.
- **R-NF10** A `vercel.json` must allow deployment on Vercel.

---

## Identified Gaps (Requirements Stated but Not Fully Implemented)

| ID | Requirement | Gap |
|---|---|---|
| R-TA4 | Auto-check/fold waiting panel | `TableView.tsx` shows it only when `state === 'ACTIVE'`, which is never a valid `GameState`. The panel never renders. |
| R-UI17 | Hero always at bottom seat | `alignPlayersHeroBottom` correctly handles 6-player and 2-player, but for 4-player tables always fills a 6-slot array, leaving 2 empty visual seats. |
| R-NF4 | Hole cards sanitized | Implemented, but the sanitization check uses `state !== 'SHOWDOWN'` — bots' cards are also revealed at showdown even though clients cannot act on that information (minor over-exposure, not a security risk). |
| R-CS2 | Per-player chat color | Server always broadcasts `color: '#3b82f6'` for every message regardless of sender. |
| R-RL3 | Disconnected player folded | Implemented via `removePlayer`, but there is no reconnection path — a refreshing player cannot reclaim their seat. |
| — | Balance integrity | Client balance in `localStorage` is sent to the server as `chips` on join; there is no server-side validation that the amount is legitimate. |
| — | No dedicated `allin` engine method | `action: 'allin'` in `index.ts` constructs a raise amount and calls `engine.raise()`. If the computed amount is invalid the action is silently dropped. |
| — | Dead `botEngine.ts` | File exports `attachBotLogic` which is never imported. Contains an incompatible bot implementation (uses `score` thresholds vs the active code's `rank` 0–9 scale). Should be removed or consolidated. |
| — | Inactive room cleanup | Rooms created but never joined by a human have no timeout and will accumulate in memory until server restart. |
