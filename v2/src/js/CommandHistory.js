/*
  A command contains a "do" and "undo" function
*/

class Command {
  constructor(execute, undo) {
    this.execute = execute;
    this.undo = undo;
  }
}

/*
  History contains an array of commands that
  get executed when added. All commands can
  be done/undo at the current index
*/

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
    if (this.canUndo()) {
      this.commands[this.current].undo();
      this.current--;
    }
  }

  redo() {
    if (this.canRedo()) {
      this.current++;
      this.commands[this.current].execute();
    }
  }

  canUndo() {
    return this.current >= 0;
  }

  canRedo() {
    return this.current < this.commands.length - 1;
  }
}

export { Command, History };