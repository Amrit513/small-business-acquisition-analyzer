export class LatestOperation {
  private sequence = 0;

  begin() {
    const operation = ++this.sequence;
    return () => operation === this.sequence;
  }

  invalidate() {
    this.sequence++;
  }
}
