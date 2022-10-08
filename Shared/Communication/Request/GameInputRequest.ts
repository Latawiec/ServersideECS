

export class GameInputRequest {
    // TODO: could be key-codes instead.
    // TODO: this makes it impossible to handle multiple key presses ??? Possibly.
    keyPressed: string | undefined;
    keyReleased: string | undefined;
}