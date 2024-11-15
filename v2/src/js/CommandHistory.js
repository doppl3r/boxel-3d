class Command {
  constructor(execute, undo, value) {
    this.execute = execute;
    this.undo = undo;
    this.value = value;
  }
}

class History {
  constructor() {
    this.commands = [];
    this.current = -1;
  }

  execute(command) {
    this.commands.splice(this.current + 1); // Clear redo history
    this.commands.push(command);
    command.execute();
    this.current++;
  }

  undo() {
    if (this.current >= 0) {
      this.commands[this.current].undo();
      this.current--;
    }
  }

  redo() {
    if (this.current < this.commands.length - 1) {
      this.current++;
      this.commands[this.current].execute();
    }
  }
}

export { Command, History };

// Example usage:
/* const history = new CommandHistory();

const addCommand = new Command(
  (value) => { console.log(`Adding ${value}`); },
  (value) => { console.log(`Undoing add ${value}`); },
  10
);

const multiplyCommand = new Command(
  (value) => { console.log(`Multiplying by ${value}`); },
  (value) => { console.log(`Undoing multiply by ${value}`); },
  2
);

history.execute(addCommand);
history.execute(multiplyCommand);
history.undo();
history.redo(); */