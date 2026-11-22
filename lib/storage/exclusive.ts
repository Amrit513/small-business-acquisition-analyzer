/** Allows one local storage mutation at a time and returns an idempotent release. */
export class ExclusiveOperation {
  private active = false;

  begin(): (() => void) | null {
    if (this.active) return null;
    this.active = true;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active = false;
    };
  }
}
