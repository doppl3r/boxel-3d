class Keyboard {
    constructor() {
        
    }
    
    keyDown(e, a) {
        var state = a.ui.state;
        switch (e.keyCode) {
            case 13: a.keyboard.spaceBarDown(a); break; // Enter (same as space)
            case 16: break; //  Shift
            case 17: break; // Ctrl
            case 27: // Esc
                // Add 'go back' behavior
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
                else if (state == 'play') {
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
                        a.ui.pause();
                    }
                }
            break;
            case 32: a.keyboard.spaceBarDown(a); break; // Space
            case 38: a.keyboard.spaceBarDown(a); break; // Up
            case 69: // 'e'
                if (a.play == true && (a.ui.state == 'play')) {
                    a.ui.exitCampaign();
                }
            break;
            case 82: // 'r'
                if (a.play == true && (a.ui.state == 'play' || a.ui.state == 'level-editor')) {
                    a.level.retryLevel(a);
                }
            break;
            case 87: a.keyboard.spaceBarDown(a); break; // 'w'
        }
    }

    spaceBarDown(a) {
        if (a.ui.state == 'play' || a.ui.state == 'level-editor') {
            if (a.play == true) {
                a.player.jump();
            }
        }
        else {
            $(':focus').click();
        }
    }

    keyUp(e, a) {

    }
}