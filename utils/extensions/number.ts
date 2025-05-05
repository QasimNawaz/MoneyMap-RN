declare global {
  interface Number {
    formatAmount(this: number, maxChars?: number): string;
  }
}

Number.prototype.formatAmount = function (
  this: number,
  maxChars?: number
): string {
  const numStr = this.toString();
  if (maxChars && numStr.length > maxChars) {
    return new Intl.NumberFormat("en-US").format(
      Number(numStr.slice(0, maxChars))
    );
  }
  return new Intl.NumberFormat("en-US").format(this);
};

Object.defineProperty(Number.prototype, "formatAmount", {
  enumerable: false,
  writable: false,
  configurable: false,
});

export {};
