import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { devtoolsStore } from "../store/devtoolsStore.js";

export default function ElementsTab() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [domTree, setDomTree] = useState(null);
  const [activePanel, setActivePanel] = useState('styles');
  const [hoveredElement, setHoveredElement] = useState(null);

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribeSelected = devtoolsStore.subscribe('selectedElement', setSelectedElement);
    const unsubscribeInspecting = devtoolsStore.subscribe('isInspecting', setIsInspecting);

    // Initialize DOM inspection
    initializeDOMInspection();

    // Generate initial DOM tree
    setDomTree(generateDomTree(document.body));

    return () => {
      unsubscribeSelected();
      unsubscribeInspecting();
      cleanupDOMInspection();
    };
  }, []);

  const initializeDOMInspection = () => {
    // Add global styles for element highlighting
    addInspectionStyles();
    
    // Set up event listeners
    document.addEventListener('click', handleElementClick, true);
    document.addEventListener('mouseover', handleElementHover, true);
    document.addEventListener('mouseout', handleElementMouseOut, true);
  };

  const cleanupDOMInspection = () => {
    document.removeEventListener('click', handleElementClick, true);
    document.removeEventListener('mouseover', handleElementHover, true);
    document.removeEventListener('mouseout', handleElementMouseOut, true);
    removeInspectionStyles();
  };

  const generateDomTree = (element, maxDepth = 3, currentDepth = 0) => {
    if (!element || currentDepth >= maxDepth) return null;

    const info = {
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: element.className || null,
      textContent: element.textContent?.substring(0, 50) || null,
      children: []
    };

    // Limit children to avoid performance issues
    const children = Array.from(element.children).slice(0, 10);
    children.forEach(child => {
      const childInfo = generateDomTree(child, maxDepth, currentDepth + 1);
      if (childInfo) {
        info.children.push(childInfo);
      }
    });

    return info;
  };

  // DOM inspection methods
  const addInspectionStyles = () => {
    if (document.getElementById('logtohtml-inspection-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'logtohtml-inspection-styles';
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
  };

  const removeInspectionStyles = () => {
    const style = document.getElementById('logtohtml-inspection-styles');
    if (style) style.remove();
  };

  const handleElementClick = (event) => {
    if (!isInspecting) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const elementInfo = getElementInfo(event.target);
    devtoolsStore.setState({ 
      selectedElement: elementInfo,
      isInspecting: false 
    });
    
    // Clear highlights
    clearHighlights();
    event.target.classList.add('logtohtml-element-selected');
  };

  const handleElementHover = (event) => {
    if (!isInspecting) return;
    
    clearHighlights();
    event.target.classList.add('logtohtml-element-highlight');
    setHoveredElement(event.target);
  };

  const handleElementMouseOut = (event) => {
    if (!isInspecting) return;
    
    event.target.classList.remove('logtohtml-element-highlight');
  };

  const clearHighlights = () => {
    document.querySelectorAll('.logtohtml-element-highlight, .logtohtml-element-selected')
      .forEach(el => {
        el.classList.remove('logtohtml-element-highlight', 'logtohtml-element-selected');
      });
  };

  const startInspecting = () => {
    devtoolsStore.setState({ isInspecting: true });
    document.body.classList.add('logtohtml-inspector-mode');
  };

  const stopInspecting = () => {
    devtoolsStore.setState({ isInspecting: false });
    document.body.classList.remove('logtohtml-inspector-mode');
    clearHighlights();
  };

  const getElementInfo = (element) => {
    if (!element) return null;

    return {
      element: element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: element.className || null,
      textContent: element.textContent?.substring(0, 100) || null,
      attributes: getElementAttributes(element),
      styles: getElementStyles(element),
      computedStyles: getComputedStyles(element),
      dimensions: getElementDimensions(element),
      position: getElementPosition(element),
      eventListeners: getElementEventListeners(element)
    };
  };

  const getElementAttributes = (element) => {
    const attributes = {};
    for (let attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  };

  const getElementStyles = (element) => {
    const styles = {};
    const style = element.style;
    for (let i = 0; i < style.length; i++) {
      const property = style[i];
      styles[property] = style.getPropertyValue(property);
    }
    return styles;
  };

  const getComputedStyles = (element) => {
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
  };

  const getElementDimensions = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom
    };
  };

  const getElementPosition = (element) => {
    return {
      offsetTop: element.offsetTop,
      offsetLeft: element.offsetLeft,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft
    };
  };

  const getElementEventListeners = (element) => {
    const events = [];
    const eventAttributes = [
      'onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup',
      'onkeydown', 'onkeyup', 'onchange', 'onsubmit', 'onload'
    ];
    
    eventAttributes.forEach(attr => {
      if (element[attr]) {
        events.push({
          type: attr.substring(2),
          handler: element[attr].toString()
        });
      }
    });
    
    return events;
  };

  const updateStyle = (property, value) => {
    if (selectedElement?.element) {
      selectedElement.element.style.setProperty(property, value);
      // Update store with new element info
      const updatedInfo = getElementInfo(selectedElement.element);
      devtoolsStore.setState({ selectedElement: updatedInfo });
    }
  };

  const updateAttribute = (attribute, value) => {
    if (selectedElement?.element) {
      selectedElement.element.setAttribute(attribute, value);
      const updatedInfo = getElementInfo(selectedElement.element);
      devtoolsStore.setState({ selectedElement: updatedInfo });
    }
  };

  const removeAttribute = (attribute) => {
    if (selectedElement?.element) {
      selectedElement.element.removeAttribute(attribute);
      const updatedInfo = getElementInfo(selectedElement.element);
      devtoolsStore.setState({ selectedElement: updatedInfo });
    }
  };

  const renderDomTree = (node, level = 0) => {
    if (!node) return null;

    return (
      <div key={`${node.tagName}-${level}`} style={{ marginLeft: `${level * 20}px` }}>
        <div 
          class="dom-node"
          style={{
            padding: '4px 8px',
            cursor: 'pointer',
            backgroundColor: level % 2 === 0 ? '#2a2a2a' : '#1e1e1e',
            borderLeft: '2px solid #007acc',
            marginBottom: '2px'
          }}
          onClick={() => selectElementFromTree(node)}
        >
          <span style={{ color: '#007acc', fontWeight: 'bold' }}>
            &lt;{node.tagName}&gt;
          </span>
          {node.id && (
            <span style={{ color: '#ff6b6b', marginLeft: '8px' }}>
              #{node.id}
            </span>
          )}
          {node.className && (
            <span style={{ color: '#4caf50', marginLeft: '8px' }}>
              .{node.className.split(' ').join('.')}
            </span>
          )}
          {node.textContent && (
            <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
              "{node.textContent}..."
            </span>
          )}
        </div>
        {node.children.map((child, index) => 
          renderDomTree(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <div id="elements-tab" class="elements-tab">
      <div class="elements-header">
        <h3>Elements Inspector</h3>
        <div class="elements-controls">
          <button 
            class={`inspect-button ${isInspecting ? 'active' : ''}`}
            onClick={isInspecting ? stopInspecting : startInspecting}
          >
            {isInspecting ? 'Stop Inspecting' : 'Inspect Element'}
          </button>
        </div>
      </div>

      <div class="elements-content">
        <div class="elements-panels">
          <div class="panel-tabs">
            <button 
              class={`panel-tab ${activePanel === 'dom' ? 'active' : ''}`}
              onClick={() => setActivePanel('dom')}
            >
              DOM Tree
            </button>
            <button 
              class={`panel-tab ${activePanel === 'styles' ? 'active' : ''}`}
              onClick={() => setActivePanel('styles')}
            >
              Styles
            </button>
            <button 
              class={`panel-tab ${activePanel === 'attributes' ? 'active' : ''}`}
              onClick={() => setActivePanel('attributes')}
            >
              Attributes
            </button>
            <button 
              class={`panel-tab ${activePanel === 'events' ? 'active' : ''}`}
              onClick={() => setActivePanel('events')}
            >
              Events
            </button>
          </div>

          <div class="panel-content">
            {activePanel === 'dom' && (
              <div class="dom-tree">
                <h4>DOM Tree</h4>
                <div class="dom-tree-content">
                  {domTree ? renderDomTree(domTree) : <div>Loading DOM tree...</div>}
                </div>
              </div>
            )}

            {activePanel === 'styles' && (
              <div class="styles-panel">
                <h4>Styles</h4>
                {selectedElement ? (
                  <div class="styles-content">
                    <div class="computed-styles">
                      <h5>Computed Styles</h5>
                      {Object.entries(selectedElement.computedStyles || {}).map(([property, value]) => (
                        <div key={property} class="style-item">
                          <span class="property">{property}:</span>
                          <input 
                            type="text" 
                            value={value}
                            onChange={(e) => updateStyle(property, e.target.value)}
                            class="style-input"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div class="inline-styles">
                      <h5>Inline Styles</h5>
                      {Object.entries(selectedElement.styles || {}).map(([property, value]) => (
                        <div key={property} class="style-item">
                          <span class="property">{property}:</span>
                          <input 
                            type="text" 
                            value={value}
                            onChange={(e) => updateStyle(property, e.target.value)}
                            class="style-input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div class="no-selection">Select an element to view its styles</div>
                )}
              </div>
            )}

            {activePanel === 'attributes' && (
              <div class="attributes-panel">
                <h4>Attributes</h4>
                {selectedElement ? (
                  <div class="attributes-content">
                    {Object.entries(selectedElement.attributes || {}).map(([name, value]) => (
                      <div key={name} class="attribute-item">
                        <span class="attribute-name">{name}:</span>
                        <input 
                          type="text" 
                          value={value}
                          onChange={(e) => updateAttribute(name, e.target.value)}
                          class="attribute-input"
                        />
                        <button 
                          onClick={() => removeAttribute(name)}
                          class="remove-attribute"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div class="no-selection">Select an element to view its attributes</div>
                )}
              </div>
            )}

            {activePanel === 'events' && (
              <div class="events-panel">
                <h4>Event Listeners</h4>
                {selectedElement ? (
                  <div class="events-content">
                    {selectedElement.eventListeners && selectedElement.eventListeners.length > 0 ? (
                      selectedElement.eventListeners.map((event, index) => (
                        <div key={index} class="event-item">
                          <span class="event-type">{event.type}</span>
                          <span class="event-handler">{event.handler}</span>
                        </div>
                      ))
                    ) : (
                      <div class="no-events">No event listeners found</div>
                    )}
                  </div>
                ) : (
                  <div class="no-selection">Select an element to view its event listeners</div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedElement && (
          <div class="element-info">
            <h4>Selected Element</h4>
            <div class="element-details">
              <div class="element-basic">
                <strong>Tag:</strong> {selectedElement.tagName}
                {selectedElement.id && <span> | <strong>ID:</strong> {selectedElement.id}</span>}
                {selectedElement.className && <span> | <strong>Class:</strong> {selectedElement.className}</span>}
              </div>
              <div class="element-dimensions">
                <strong>Dimensions:</strong> {selectedElement.dimensions?.width} × {selectedElement.dimensions?.height}
              </div>
              <div class="element-position">
                <strong>Position:</strong> ({selectedElement.dimensions?.left}, {selectedElement.dimensions?.top})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
