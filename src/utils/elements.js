export const elementsUtils = {
  selectedElement: null,
  hoveredElement: null,
  isInspecting: false,
  originalCursor: null,

  init() {
    this.addGlobalStyles();
    this.setupEventListeners();
  },

  addGlobalStyles() {
    const style = document.createElement('style');
    style.id = 'logtohtml-elements-styles';
    style.textContent = `
      .logtohtml-element-highlight {
        outline: 2px solid #007acc !important;
        outline-offset: 2px !important;
        background-color: rgba(0, 122, 204, 0.1) !important;
        cursor: pointer !important;
      }
      
      .logtohtml-element-selected {
        outline: 2px solid #ff6b6b !important;
        outline-offset: 2px !important;
        background-color: rgba(255, 107, 107, 0.1) !important;
      }
      
      .logtohtml-inspector-mode {
        cursor: crosshair !important;
      }
      
      .logtohtml-inspector-mode * {
        cursor: crosshair !important;
      }
    `;
    document.head.appendChild(style);
  },

  setupEventListeners() {
    // Prevent default behavior when in inspector mode
    document.addEventListener('click', this.handleElementClick.bind(this), true);
    document.addEventListener('mouseover', this.handleElementHover.bind(this), true);
    document.addEventListener('mouseout', this.handleElementMouseOut.bind(this), true);
  },

  startInspecting() {
    this.isInspecting = true;
    document.body.classList.add('logtohtml-inspector-mode');
    this.originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
  },

  stopInspecting() {
    this.isInspecting = false;
    document.body.classList.remove('logtohtml-inspector-mode');
    if (this.originalCursor) {
      document.body.style.cursor = this.originalCursor;
    }
    this.clearHighlights();
  },

  handleElementClick(event) {
    if (!this.isInspecting) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.selectElement(event.target);
    this.stopInspecting();
  },

  handleElementHover(event) {
    if (!this.isInspecting) return;
    
    this.highlightElement(event.target);
  },

  handleElementMouseOut(event) {
    if (!this.isInspecting) return;
    
    this.clearHighlight(event.target);
  },

  highlightElement(element) {
    this.clearHighlights();
    element.classList.add('logtohtml-element-highlight');
    this.hoveredElement = element;
  },

  clearHighlight(element) {
    if (element && element.classList) {
      element.classList.remove('logtohtml-element-highlight');
    }
  },

  clearHighlights() {
    const highlighted = document.querySelectorAll('.logtohtml-element-highlight');
    highlighted.forEach(el => el.classList.remove('logtohtml-element-highlight'));
  },

  selectElement(element) {
    this.clearHighlights();
    this.selectedElement = element;
    element.classList.add('logtohtml-element-selected');
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('element-selected', { 
      detail: this.getElementInfo(element) 
    }));
  },

  getElementInfo(element) {
    if (!element) return null;

    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: element.className || null,
      textContent: element.textContent?.substring(0, 100) || null,
      attributes: this.getElementAttributes(element),
      styles: this.getElementStyles(element),
      computedStyles: this.getComputedStyles(element),
      dimensions: this.getElementDimensions(element),
      position: this.getElementPosition(element),
      parent: element.parentElement ? this.getElementInfo(element.parentElement) : null,
      children: Array.from(element.children).map(child => this.getElementInfo(child)),
      eventListeners: this.getElementEventListeners(element)
    };
  },

  getElementAttributes(element) {
    const attributes = {};
    for (let attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  },

  getElementStyles(element) {
    const styles = {};
    const style = element.style;
    for (let i = 0; i < style.length; i++) {
      const property = style[i];
      styles[property] = style.getPropertyValue(property);
    }
    return styles;
  },

  getComputedStyles(element) {
    const computed = window.getComputedStyle(element);
    const styles = {};
    const importantStyles = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'border', 'background', 'color', 'font-size', 'font-family',
      'z-index', 'opacity', 'visibility', 'overflow'
    ];
    
    importantStyles.forEach(prop => {
      styles[prop] = computed.getPropertyValue(prop);
    });
    
    return styles;
  },

  getElementDimensions(element) {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom
    };
  },

  getElementPosition(element) {
    return {
      offsetTop: element.offsetTop,
      offsetLeft: element.offsetLeft,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft
    };
  },

  getElementEventListeners(element) {
    // This is a simplified version - in reality, getting event listeners
    // is complex and browser-dependent
    const events = [];
    
    // Check for common event attributes
    const eventAttributes = [
      'onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup',
      'onkeydown', 'onkeyup', 'onchange', 'onsubmit', 'onload'
    ];
    
    eventAttributes.forEach(attr => {
      if (element[attr]) {
        events.push({
          type: attr.substring(2), // Remove 'on' prefix
          handler: element[attr].toString()
        });
      }
    });
    
    return events;
  },

  updateElementStyle(element, property, value) {
    if (element && element.style) {
      element.style.setProperty(property, value);
      return true;
    }
    return false;
  },

  updateElementAttribute(element, attribute, value) {
    if (element) {
      element.setAttribute(attribute, value);
      return true;
    }
    return false;
  },

  removeElementAttribute(element, attribute) {
    if (element) {
      element.removeAttribute(attribute);
      return true;
    }
    return false;
  },

  getElementSelector(element) {
    if (!element) return '';
    
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      selector = `#${element.id}`;
    } else if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    return selector;
  },

  getElementXPath(element) {
    if (!element) return '';
    
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.previousElementSibling) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
          if (sibling.nodeName === element.nodeName) {
            index++;
          }
          sibling = sibling.previousElementSibling;
        }
        selector += `[${index}]`;
      }
      path.unshift(selector);
      element = element.parentElement;
    }
    
    return '/' + path.join('/');
  },

  destroy() {
    this.stopInspecting();
    this.clearHighlights();
    this.selectedElement = null;
    this.hoveredElement = null;
    
    // Remove global styles
    const style = document.getElementById('logtohtml-elements-styles');
    if (style) {
      style.remove();
    }
  }
};
