import $ from 'jquery';

class UIController {
  constructor(app) {
    this.updateSelectors();
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
  }

  toggleObjectOptions() {
    this.objectOptions.toggleClass('hidden');
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
}

export { UIController };