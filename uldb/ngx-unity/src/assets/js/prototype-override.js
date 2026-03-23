Array.prototype.getFirst = function () {
  return this.length ? this[0] : null;
}

Array.prototype.getLast = function () {
  return this.length ? this[this.length - 1] : null;
}
