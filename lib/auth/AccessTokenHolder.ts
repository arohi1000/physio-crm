/**
 * The access token's only home.
 *
 * A private field on an object the session owns — never `localStorage` or
 * `sessionStorage` (TRD §7.3), and never module-level state, so a token cannot
 * outlive the tab that earned it or leak into another component's reach. The
 * refresh cookie, which the browser holds and JavaScript cannot read, is what
 * survives a reload instead.
 */
export class AccessTokenHolder {
  #token: string | undefined;

  read(): string | undefined {
    return this.#token;
  }

  replace(token: string): void {
    this.#token = token;
  }

  clear(): void {
    this.#token = undefined;
  }
}
