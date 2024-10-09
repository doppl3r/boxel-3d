class History {
  constructor() {
    this.record = [];
    this.iterator = 0;
  }

  clear() {
    // Reset record array and iterator index
    this.record = [];
    this.iterator = 0;
    return this.record;
  }

  add(data) {
    // Add item after incremented iterator
    this.record.length = this.iterator;
    this.record[this.iterator] = data;
    this.iterator++;
    return this.record;
  }

  undo() {
    // Decrement iterator and return current item
    if (this.iterator > 1) this.iterator--;
    return this.current();
  }

  redo() {
    // Increment iterator and return current item
    if (this.iterator < this.record.length) this.iterator++;
    return this.current();
  }

  current() {
    // Return current item
    return this.get(this.iterator - 1);
  }

  pop() {
    // Remove and return last item
    return this.record.pop();
  }

  shift() {
    // Remove and return first item
    return this.record.shift();
  }

  get(index) {
    // Return item at a specific index
    return this.record[index];
  }

  getAll() {
    // Return entire record array
    return this.record;
  }

  length() {
    // Return the length of the record array
    return this.record.length;
  }
}

export { History };