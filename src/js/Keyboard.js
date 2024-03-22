import $ from 'jquery';

class Keyboard {
    constructor() {
        this.shift = false;
        this.ctrl = false;
    }
    
    keyDown(e, a) {
        var state = a.state;

        // Only add shortcuts when not typing
        if (a.ui.dialog.isOpen() == false && $('input:focus').length <= 0) {
            switch (e.keyCode) {
                case 16: this.shift = true; break; // Shift
                case 17: this.ctrl = true; break; // Ctrl
                case 27: // Esc
                    // Add 'go back' behavior
                    e.preventDefault();
                    if (state == 'level-manager') {
                        $('[action="exit-to-home"]').click();
                    }
                    else if (state == 'level-editor') {
                        a.ui.dialog.remove(0);
                        $('[action="exit-to-level-manager"]').click();
                    }
                    else if (state == 'level-picker') {
                        $('[action="exit-to-home"]').click();
                    }
                    else if (state == 'shop') {
                        $('[action="exit-to-home"]').click();
                    }
                    else if (state == 'campaign') {
                        // Resume or pause game
                        if (a.ui.dialog.isOpen()) {
                            if (a.ui.dialog.getId() != 'finished') {
                                a.ui.dialog.remove(0);
                                a.ui.resumeCampaign();
                            }
                            else {
                                // Continue if level is finished
                                a.ui.dialog.get().find('input[type="button"]:last-of-type').click();
                            }
                        }
                        else {
                            a.pauseLevel();
                        }
                    }
                break;
                case 48: // 0 (zero)
                    if (state == 'level-editor') {
                        a.levelEditor.resetZAxis(a);
                    }
                break; // Up
                case 68: // 'd'
                    if (state == 'level-editor') {
                        a.levelEditor.duplicateSelected(a);
                    }
                break;
                case 69: // 'e'
                    if (a.play == true && state == 'campaign') {
                        a.exitCampaign();
                    }
                break;
            }
        }
    }

    keyUp(e, a) {
        switch (e.keyCode) {
            case 16: this.shift = false; break; // Shift
            case 17: this.ctrl = false; break; // Ctrl
        }
    }
}

export { Keyboard };