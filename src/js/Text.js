import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

class Text extends CSS2DObject {
  constructor(options) {
    super();

    // Initialize options with values
    options = Object.assign({
      type: 'div',
      class: 'CSS2DObject',
      text: 'Hello, World!'
    },
    options);

    // Add CSS2DObject to group
    this.element = document.createElement(options.type);
    this.element.className = options.class;

    this.setText(options.text);

    // Ensure this text is removed after parent is removed
    this.addEventListener('added', (e) => {
        e.target.parent.addEventListener('removed', this.removeFromParent.bind(this));
      }
    );
  }

  setText(text) {
    this.element.innerHTML = text;
  }

  hideText() {
    this.visible = false;
  }

  showText() {
    this.visible = true;
  }
}

export { Text }