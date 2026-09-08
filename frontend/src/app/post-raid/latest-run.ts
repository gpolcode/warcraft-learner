export class LatestRun {
  private token = 0;

  begin(): number {
    return ++this.token;
  }

  cancel(): void {
    this.token++;
  }

  isCurrent(token: number): boolean {
    return token === this.token;
  }
}
