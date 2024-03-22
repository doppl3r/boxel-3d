import $ from 'jquery';
import { Dialog } from './Dialog.js';

class UIController {
  constructor(app) {
    this.dialog = new Dialog();
    this.updateSelectors();
    this.updateCanvas();
    this.updateUI('home', app);
  }

  updateSelectors() {
    this.controller = $('.ui-origin');
    this.home = this.controller.find('.home');
    this.campaign = this.controller.find('.campaign');
    this.levelManager = this.controller.find('.level-manager');
    this.levelEditor = this.controller.find('.level-editor');
    this.levelList = this.levelManager.find('.list');
    this.levelOptions = this.levelEditor.find('.options-level');
    this.objectType = this.levelEditor.find('.object-type');
    this.objectOptions = this.levelEditor.find('.object-options');
  }

  updateUI(state, app) {
    // Update theme
    if (app != null) {
      var settings = app.storage.getSettings(app);
      this.toggleTheme(settings.theme);
      app.state = state;
    }

    this.updateCanvas();
    this.canvas.addClass('hidden'); // Default hide canvas
    this.controller.find('[action]').removeClass('selected'); // Default remove all selected
  }

  toggleObjectOptions() {
    this.objectOptions.toggleClass('hidden');
  }

  updateLevelOptions() {
    var mode = 'draw';
    var play = 'pause';
    if (app != null) {
      mode = app.mouse.mode;
      play = app.play == true ? 'play' : 'pause';
      this.updateObjectType();
    }

    this.levelOptions.find('[action="pause"], [action="pause"]').removeClass('selected');
    this.levelOptions.find('[action="draw"], [action="erase"]').removeClass('selected');
    this.levelOptions.find('[action="' + mode + '"]').addClass('selected');
    this.levelOptions.find('[action="' + play + '"]').addClass('selected');
  }

  updateObjectType() {
    var mode = app.mouse.mode;
    var play = app.play == true ? 'play' : 'pause';
    this.objectType.removeClass('hidden');
    if (mode == 'erase' || play == 'play') this.objectType.addClass('hidden');
  }

  updateCanvas() {
    if (this.canvas == null || this.canvas.length <= 0) {
      this.canvas = $('canvas');
    }
  }

  play() {
    app.play = true;
    app.timer.start();
    app.level.deselectLevel(app);
    app.ui.levelOptions.find('[action="pause"]').removeClass('selected');
    app.ui.levelOptions.find('[action="play"]').addClass('selected');
    app.levelEditor.controlsOrbit.enabled = false;
    app.levelEditor.controlsOrbit.reset();
    app.levelEditor.controlsTransform.detach();
    app.background.visible = true;
    if (app.player.jump == true) app.player.jump = false; // Prevent jump in the beginning
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  toggleTheme(themeID) {
    var themes = ['dark', 'light'];
    var newTheme = $('.ui-origin').hasClass('dark') ? themes[1] : themes[0];
    if (themeID != null) newTheme = themes[themeID];
    $('.ui-origin').removeClass(themes);
    $('.ui-origin').addClass(newTheme);
  }

  resumeCampaign() {
    if (app.state == 'campaign') {
      app.timer.start();
      app.play = true;
    }
  }
}

export { UIController };