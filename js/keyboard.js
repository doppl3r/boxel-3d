class Keyboard {
    constructor() {
        
    }
    
    keyDown(e, a) {
        var state = a.ui.state;
        switch (e.keyCode) {
            case 16: break; //  Shift
            case 17: break; // Ctrl
            case 27: // Esc
                // Add 'go back' behavior
                if (state == 'level-manager') {
                    $('[action="exit-to-home"]').click();
                }
                else if (state == 'level-editor') {
                    a.ui.removeDialog(0);
                    $('[action="exit-to-level-manager"]').click();
                }
                else if (state == 'level-picker') {
                    $('[action="exit-to-home"]').click();
                }
                else if (state == 'play') {
                    // Resume or pause game
                    if (a.ui.dialogIsOpen()) {
                        a.ui.removeDialog(0);
                        a.ui.resumeCampaign();
                    }
                    else {
                        a.ui.pause();
                    }
                }
            break;
            case 32: 
                a.player.jump();
            break; // Space
            case 38: break; // Up
            case 82: // 'r'
                if (a.ui.state == 'play' || a.ui.state == 'level-editor') a.level.retryLevel(a);
            break;
        }
    }

    keyUp(e, a) {

    }
}