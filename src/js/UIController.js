import $ from 'jquery';
import { Dialog } from './Dialog.js';

class UIController {
  constructor(app) {
    this.dialog = new Dialog();
    this.updateSelectors();
    this.updateCanvas();
    this.bindActions();
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

  bindActions() {
    // Bind button actions
    this.controller.on('click', '[action]', function(event) {
      event.preventDefault();
      var action = $(this).attr('action');

      // Object options listener
      if (action == 'pin') {
        app.selectedObject.toggleStatic();
        app.selectedObject = app.level.refreshObject(app.selectedObject, app);
        app.selectedObject.select(true);
        app.levelEditor.controlsTransform.attach(app.selectedObject);
        app.levelHistory.save('Updated object state', app);
        app.ui.updateObjectOptions();
      }
      else if (action == 'translate') { app.levelEditor.setMode('translate'); app.ui.updateEditorTransformUI(); }
      else if (action == 'rotate') { app.levelEditor.setMode('rotate'); app.ui.updateEditorTransformUI(); }
      else if (action == 'scale') { app.levelEditor.setMode('scale'); app.ui.updateEditorTransformUI(); }
      else if (action == 'friction') {
        app.ui.objectOptions.find('[name="friction"]').focus();
      }
      else if (action == 'text') {
        app.ui.dialog.add({
          text: 'Share a tip!',
          inputs: [
            { attributes: { value: app.selectedObject.text, type: 'text' } },
            { attributes: { value: 'Cancel', type: 'button' } },
            { attributes: { value: 'Accept', type: 'button' }, function: app.ui.updateTip },
          ]
        });
      }
      else if (action == 'duplicate') {
        app.selectedObject.select(false);
        app.selectedObject = app.level.duplicateObject(app.selectedObject, app);
        app.selectedObject.position.y += 16;
        app.selectedObject.select(true);
        app.levelEditor.controlsTransform.attach(app.selectedObject);
        app.levelEditor.setMode('translate');
        app.ui.updateEditorTransformUI();
        app.levelHistory.save('Duplicated object', app);
      }
      else if (action == 'accept') {
        app.level.deselectLevel(app);
        window.dispatchEvent(new CustomEvent('updateObjectOptions'));
      }
      else if (action == 'trash') {
        app.level.removeObject(app.selectedObject, app);
        app.levelEditor.controlsTransform.detach();
        app.levelHistory.save('Deleted object', app);
        window.dispatchEvent(new CustomEvent('updateObjectOptions'));
      }
    });

    // Add object range input listeners
    this.controller.on('input', '.slider input', function(event){
      event.preventDefault();
      var name = $(this).attr('name');
      var val = $(this).val();
      if (name == 'rotate') { app.selectedObject.setRotation(-val * Math.PI / 180); }
      else if (name == 'scale-x') { app.selectedObject.setScale({ x: val, y: null, z: null }); }
      else if (name == 'scale-y') { app.selectedObject.setScale({ x: null, y: val, z: null }); }
      else if (name == 'scale-z') { app.selectedObject.setScale({ x: null, y: null, z: val }); }
      else if (name == 'friction') { app.selectedObject.setFriction(val); }
    });

    // Save level history when input slider is updated
    this.controller.on('mouseup', '.slider input', function(event){
      event.preventDefault();
      app.levelHistory.save('Updated object properties', app);
    });
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

  updateObjectOptions() {
    // Check if selected object exists
    if (app.selectedObject != null) {
      var isStatic = app.selectedObject.isStatic();
      var pinIcon = this.objectOptions.find('[action="pin"]');
      var frictionIcon = this.objectOptions.find('[action="friction"]');
      var textIcon = this.objectOptions.find('[action="text"]');
      var duplicateIcon = this.objectOptions.find('[action="duplicate"]');
      var trashIcon = this.objectOptions.find('[action="trash"]');
      var rotation = -app.selectedObject.getRotation('degrees');
      var scaleX = app.selectedObject.scale.x;
      var scaleY = app.selectedObject.scale.y;
      var scaleZ = app.selectedObject.scale.z;
      var isPlayer = (app.selectedObject.getClass() == 'player');
      var friction = app.selectedObject.getFriction();
      var isTip = (app.selectedObject.getClass() == 'tip');
      var isGravity = (app.selectedObject.getClass() == 'gravity');
      this.objectOptions.find('[action*="rotate"] ~ .slider input').val(rotation);
      this.objectOptions.find('[action*="scale-x"] ~ .slider input').val(scaleX);
      this.objectOptions.find('[action*="scale-y"] ~ .slider input').val(scaleY);
      this.objectOptions.find('[action*="scale-z"] ~ .slider input').val(scaleZ);
      this.objectOptions.find('[action*="friction"] ~ .slider input').val(friction);

      // Update editor transform UI
      this.updateEditorTransformUI();
      
      // Enable/Disable the icons for player
      if (isPlayer == true) {
        pinIcon.addClass('disabled');
        trashIcon.addClass('disabled');
        duplicateIcon.addClass('disabled');
      }
      else {
        pinIcon.removeClass('disabled');
        trashIcon.removeClass('disabled');
        duplicateIcon.removeClass('disabled');
      }
      
      // Enable/Disable the tip icon for tip block
      if (isTip == true) {
        pinIcon.addClass('disabled');
        textIcon.removeClass('disabled');
      }
      else {
        pinIcon.removeClass('disabled');
        textIcon.addClass('disabled');
      }

      // Enable/Disable the gravity icon for tip block
      if (isGravity == true) {
        pinIcon.addClass('disabled');
      }
      else {
        pinIcon.removeClass('disabled');
      }
      
      // Update selected pin status
      if (isStatic == true) {
        pinIcon.addClass('selected');
        frictionIcon.addClass('disabled');
      }
      else {
        pinIcon.removeClass('selected');
        frictionIcon.removeClass('disabled');
      }
    }
  }

  updateEditorTransformUI() {
    var transformMode = app.levelEditor.controlsTransform.mode;
    this.objectOptions.find('[action="translate"]').removeClass('selected');
    this.objectOptions.find('[action="scale"]').removeClass('selected');
    this.objectOptions.find('[action="rotate"]').removeClass('selected');
    this.objectOptions.find('[action*="' + transformMode + '"]').addClass('selected');
  }

  updateCanvas() {
    if (this.canvas == null || this.canvas.length <= 0) {
      this.canvas = $('canvas');
    }
  }

  updateTip() {
    var dialog = app.ui.dialog.get();
    var input = dialog.find('input[type="text"]');
    app.selectedObject.text = input.val();
    app.levelHistory.save('Updated tip', app);
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
    window.dispatchEvent(new CustomEvent('updateObjectOptions'));
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