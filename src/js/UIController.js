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
      
      // Home page actions
      if (action == 'level-picker') {
        app.ui.updateUI('level-picker');
      }
      else if (action == 'level-manager') {
        app.ui.updateUI('level-manager');
      }
      else if (action == 'shop') {
        app.ui.updateUI('shop');
      }

      // Main game UI
      if (action == 'pause-campaign') {
        app.pause();
      }

      // Level manager actions
      if (action == 'add-level') {
        var levelData = {};
        var key = null;
        app.level.createNewLevel(app);
        levelData = app.level.exportToJSON(app); // Init default data
        key = app.storage.setLevelData(null, levelData); // Store data and generate new key
        app.ui.appendEditorLevel({ key: key, level: levelData });
      }
      else if (action == 'download') {
        app.level.clearLevel(app);
        app.level.key = null; // Reset key to generate new save key
        app.background.visible = false;
        app.storage.loadLevelFromFile();
        app.ui.updateUI('level-editor');
        app.levelHistory.save('Downloaded level', app);
        app.levelHistory.save('Loaded level', app); // Force dialog check to save
        app.resetScene(app);
        app.levelEditor.controlsOrbit.enabled = true;
        app.levelEditor.controlsOrbit.reset();
      }
      else if (action == 'share') {
        if ($(this).parent().hasClass('item')) app.ui.loadEditorLevel($(this));
        app.resetScene(app);
        app.storage.saveLevelToFile();
      }
      else if (action == 'edit-level') {
        app.ui.loadEditorLevel($(this));
        app.ui.updateUI('level-editor');
        app.background.visible = false;
        app.levelHistory.save('Edited level', app);
        app.resetScene(app);
        app.levelEditor.controlsOrbit.enabled = true;
        app.levelEditor.controlsOrbit.reset();
      }
      else if (action == 'delete-level') {
        app.ui.dialog.add({
          text: 'Are you sure you want to <em>delete</em> this level?',
          inputs: [
            { attributes: { value: 'Yes', type: 'button' }, function: app.ui.removeEditorLevel, parameter: $(this) },
            { attributes: { value: 'No', type: 'button' } }
          ]
        });
      }

      // Level editor - level options
      if (action == 'draw') {
        app.mouse.setMode('draw');
        app.ui.updateLevelOptions();
      }
      else if (action == 'erase') {
        app.mouse.setMode('erase');
        app.ui.updateLevelOptions();
      }
      else if (action == 'exit-to-level-manager') {
        app.levelEditor.controlsOrbit.enabled = false;
        app.levelEditor.controlsOrbit.reset();
        app.levelEditor.controlsTransform.detach();
        if (app.levelHistory.history.length > 2) {
          app.ui.dialog.add({
            text: 'Would you like to <em>save</em> your level?',
            inputs: [
              { attributes: { value: 'No', type: 'button' }, function: app.ui.saveAndExitLevelEditor, parameter: false },
              { attributes: { value: 'Yes', type: 'button' }, function: app.ui.saveAndExitLevelEditor, parameter: true },
            ]
          });
        }
        else app.ui.saveAndExitLevelEditor(false);
      }
      else if (action == 'save') {
        app.resetScene(app);
        app.level.deselectLevel(app);
        app.level.saveLevelData(app);
      }
      else if (action == 'undo') {
        app.levelEditor.controlsTransform.detach();
        app.levelHistory.undo(app);
        app.ui.showObjectOptions(false);
      }
      else if (action == 'redo') {
        app.levelHistory.redo(app);
        app.ui.showObjectOptions(false);
      }
      else if (action == 'rewind') {
        app.level.retryLevel(app);
        app.level.deselectLevel(app);
        app.pause();
        app.ui.updateLevelOptions();
        app.ui.showObjectOptions(false);
      }
      else if (action == 'pause') {
        app.pause();
      }
      else if (action == 'toggle-theme') {
        app.ui.toggleTheme();
      }
      
      // Object type listener
      if (action == 'cube') { app.ui.selectObjectType(action); }
      else if (action == 'tip') { app.ui.selectObjectType(action); }
      else if (action == 'bounce') { app.ui.selectObjectType(action); }
      else if (action == 'checkpoint') { app.ui.selectObjectType(action); }
      else if (action == 'spike') { app.ui.selectObjectType(action); }
      else if (action == 'shrink') { app.ui.selectObjectType(action); }
      else if (action == 'grow') { app.ui.selectObjectType(action); }
      else if (action == 'resize') { app.ui.selectObjectType(action); }
      else if (action == 'direction') { app.ui.selectObjectType(action); }
      else if (action == 'gravity') { app.ui.selectObjectType(action); }
      else if (action == 'grapple') { app.ui.selectObjectType(action); }
      else if (action == 'finish') { app.ui.selectObjectType(action); }
      else if (action == 'reset') { app.ui.selectObjectType(action); }

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
        app.ui.showObjectOptions(false);
      }
      else if (action == 'trash') {
        app.level.removeObject(app.selectedObject, app);
        app.levelEditor.controlsTransform.detach();
        app.levelHistory.save('Deleted object', app);
        app.ui.showObjectOptions(false);
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

    // Add level name change listener
    this.controller.on('focusout', '.list input', function(event) {
      event.preventDefault();
      app.ui.updateEditorLevelName($(this));
    })
  }

  selectObjectType(type, checkNull = true) {
    // Swap object by type
    if (app.selectedObject != null && checkNull == true) {
      app.selectedObject = app.level.changeObjectType(app.selectedObject, type, app);
      app.selectedObject.select(true);
      app.ui.updateObjectOptions();
      app.levelEditor.controlsTransform.attach(app.selectedObject);
      app.levelHistory.save('Changed object to ' + type, app);
    }

    app.ui.objectType.find('[action]').removeClass('selected');
    app.ui.objectType.find('[action=' + type + ']').addClass('selected');
  }

  getSelectedObjectType() {
    return app.ui.objectType.find('.selected').attr('action');
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

  showObjectOptions(state) {
    if (state == true) this.objectOptions.removeClass('hidden');
    else this.objectOptions.addClass('hidden');
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

  removeListOfLevels() {
    this.levelList.empty();
  }

  appendEditorLevels(a) {
    var list = a.storage.getListOfLevels(); // return format = [{ key: '', level: '' }, ...]
    var levelData = {};
    var key = null;

    // Add empty level if none exist
    if (list.length < 1) {
      a.level.createNewLevel(a);
      levelData = a.level.exportToJSON(a);
      key = a.storage.setLevelData(null, levelData);
      list.push({ key: key, level: levelData });
    }

    // Append each list item
    this.removeListOfLevels(); // Empty list HTML before populating
    for (var i = 0; i < list.length; i++) {
      a.ui.appendEditorLevel(list[i]);
    }
  }

  appendEditorLevel(listItem) { // listItem = [{ key: '', level: '' }, ...]
    this.levelList.append(
      '<div class="item">' +
        '<input type="text" key="' + listItem.key + '" value="' + listItem.level.name + '">' +
        '<a action="edit-level" title="Edit level"><img src="/img/svg/pencil.svg"></a>' +
        '<a action="share" title="Share level"><img src="/img/svg/upload.svg"></a>' +
        '<a action="delete-level" title="Delete level"><img src="/img/svg/trash.svg"></a>' +
      '</div>'
    );
  }

  removeEditorLevel(button) {
    var item = button.parent();
    var key = item.find('input').attr('key');
    app.storage.removeLevelData(key);
    item.remove();
  }

  loadEditorLevel(button) {
    // Select level details from HTML input attributes & values
    var item = button.parent();
    var key = item.find('input').attr('key');
    var name = item.find('input').val();
    var levelData = app.storage.getLevelData(key);
    var settings = app.storage.getSettings(app);

    // Update current level with selected attributes
    levelData.name = name;
    app.level.clearLevel(app);
    app.level.importFromJSON(levelData, app);
    app.level.key = key; // Update key value for saving the level
    app.updateSettings(settings, app);
  }
  
  updateEditorLevelName(input) {
    var key = input.attr('key');
    var name = input.val();
    app.storage.updateLevelDataName(key, name);
  }

  updateCanvas() {
    if (this.canvas == null || this.canvas.length <= 0) {
      this.canvas = $('canvas');
    }
  }

  saveAndExitLevelEditor(saveLevel = true) {
    app.play = false;
    app.resetScene(app);
    app.level.deselectLevel(app);
    if (saveLevel == true) app.level.saveLevelData(app);
    app.level.clearLevel(app);
    app.levelHistory.clear();
    app.player.removeCheckpoint();
    app.player.setPosition({ x: 0, y: 0, z: 0 });
    app.ui.updateUI('level-manager');
    app.levelEditor.controlsOrbit.enabled = false;
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
    app.ui.showObjectOptions(false);
    app.ui.levelOptions.find('[action="pause"]').removeClass('selected');
    app.ui.levelOptions.find('[action="play"]').addClass('selected');
    app.levelEditor.controlsOrbit.enabled = false;
    app.levelEditor.controlsOrbit.reset();
    app.levelEditor.controlsTransform.detach();
    app.background.visible = true;
    if (app.player.jump == true) app.player.jump = false; // Prevent jump in the beginning
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