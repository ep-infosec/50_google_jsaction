// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utility functions for generating native browser events.
 */
goog.provide('jsaction.testing.nativeEvents');
goog.setTestOnly();

goog.require('goog.dom.NodeType');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.testing.events.Event');
goog.require('jsaction.KeyCodes');
goog.require('jsaction.createKeyboardEvent');
goog.require('jsaction.createMouseEvent');
goog.require('jsaction.createUiEvent');
goog.require('jsaction.triggerEvent');


/**
 * @typedef {{
 *   ctrlKey:(boolean|undefined),
 *   altKey:(boolean|undefined),
 *   shiftKey:(boolean|undefined),
 *   metaKey:(boolean|undefined),
 * }}
 */
jsaction.testing.nativeEvents.Modifiers;

/**
 * Simulates a blur event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
jsaction.testing.nativeEvents.fireBlurEvent = function(target) {
  const e = new goog.testing.events.Event(goog.events.EventType.BLUR, target);
  return jsaction.triggerEvent(target, jsaction.createUiEvent(e));
};


/**
 * Simulates a focus event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
jsaction.testing.nativeEvents.fireFocusEvent = function(target) {
  const e = new goog.testing.events.Event(goog.events.EventType.FOCUS, target);
  return jsaction.triggerEvent(target, jsaction.createUiEvent(e));
};


/**
 * Simulates a scroll event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
jsaction.testing.nativeEvents.fireScrollEvent = function(target) {
  const e = new goog.testing.events.Event(goog.events.EventType.SCROLL, target);
  return jsaction.triggerEvent(target, jsaction.createUiEvent(e));
};


/**
 * Simulates a customizable event on the given target.
 * @param {!goog.events.EventType} eventType The type of DOM event to fire.
 * @param {!EventTarget} target The target for the event.
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
jsaction.testing.nativeEvents.fireDomEvent = function(eventType, target) {
  const e = new goog.testing.events.Event(eventType, target);
  return jsaction.triggerEvent(target, jsaction.createUiEvent(e));
};


/**
 * Simulates a mousedown, mouseup, and then click on the given event target,
 * with the left mouse button.
 * @param {!EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button;
 *     defaults to `goog.events.BrowserEvent.MouseButton.LEFT`.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @param {?Object=} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {boolean} The returnValue of the sequence: false if preventDefault()
 *     was called on any of the events, true otherwise.
 */
jsaction.testing.nativeEvents.fireClickSequence =
    function(target, opt_button, opt_coords, opt_eventProperties) {
  return !!(
      jsaction.testing.nativeEvents.fireMouseDownEvent(
          target, opt_button, opt_coords, opt_eventProperties) &
      jsaction.testing.nativeEvents.fireMouseUpEvent(
          target, opt_button, opt_coords, opt_eventProperties) &
      jsaction.testing.nativeEvents.fireClickEvent(
          target, opt_button, opt_coords, opt_eventProperties));
};


/**
 * Simulates a mousedown event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button;
 *     defaults to `goog.events.BrowserEvent.MouseButton.LEFT`.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @param {?Object=} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {boolean} false if preventDefault() was called, true otherwise.
 */
jsaction.testing.nativeEvents.fireMouseDownEvent = function(
    target, opt_button, opt_coords, opt_eventProperties) {
  return jsaction.testing.nativeEvents.fireMouseButtonEvent_(
      goog.events.EventType.MOUSEDOWN, target, opt_button, opt_coords,
      opt_eventProperties);
};



/**
 * Simulates a mouseup event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button;
 *     defaults to `goog.events.BrowserEvent.MouseButton.LEFT`.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @param {?Object=} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {boolean} false if preventDefault() was called, true otherwise.
 */
jsaction.testing.nativeEvents.fireMouseUpEvent = function(
    target, opt_button, opt_coords, opt_eventProperties) {
  return jsaction.testing.nativeEvents.fireMouseButtonEvent_(
      goog.events.EventType.MOUSEUP, target, opt_button, opt_coords,
      opt_eventProperties);
};


/**
 * Simulates a click event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button;
 *     defaults to `goog.events.BrowserEvent.MouseButton.LEFT`.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @param {?Object=} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {boolean} false if preventDefault() was called, true otherwise.
 */
jsaction.testing.nativeEvents.fireClickEvent =
    function(target, opt_button, opt_coords, opt_eventProperties) {
  return jsaction.testing.nativeEvents.fireMouseButtonEvent_(
      goog.events.EventType.CLICK, target, opt_button, opt_coords,
      opt_eventProperties);
};


/**
 * Simulates a mouseover event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @return {boolean} false if preventDefault() was called, true otherwise.
 */
jsaction.testing.nativeEvents.fireMouseOverEvent = function(target) {
  return jsaction.testing.nativeEvents.fireMouseButtonEvent_(
      goog.events.EventType.MOUSEOVER, target);
};


/**
 * Simulates a mouseout event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @return {boolean} false if preventDefault() was called, true otherwise.
 */
jsaction.testing.nativeEvents.fireMouseOutEvent = function(target) {
  return jsaction.testing.nativeEvents.fireMouseButtonEvent_(
      goog.events.EventType.MOUSEOUT, target);
};


/**
 * Simulates a mousemove event on the given target.
 * @param {!EventTarget} target The target for the event.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @return {boolean} The returnValue of the event: false if preventDefault() was
 *     called on it, true otherwise.
 */
jsaction.testing.nativeEvents.fireMouseMoveEvent = function(
    target, opt_coords) {
  const e = new goog.testing.events.Event(
      goog.events.EventType.MOUSEMOVE, target);
  jsaction.testing.nativeEvents.setEventClientXY_(e, opt_coords);
  return jsaction.triggerEvent(target, jsaction.createMouseEvent(e));
};


/**
 * Creates a mouse button event.
 * @param {string} type The event type.
 * @param {!EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button;
 *     defaults to `goog.events.BrowserEvent.MouseButton.LEFT`.
 * @param {boolean=} opt_modifierKey Create the event with the modifier key
 *     registered as down.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @param {?Object=} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {!Event} The created event.
 */
jsaction.testing.nativeEvents.createMouseButtonEvent = function(
    type, target, opt_button, opt_modifierKey, opt_coords,
    opt_eventProperties) {
  const e = new goog.testing.events.Event(type, target);
  e.button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  jsaction.testing.nativeEvents.setEventClientXY_(e, opt_coords);
  if (opt_eventProperties) {
    goog.object.extend(e, opt_eventProperties);
  }
  if (opt_modifierKey) {
    e.ctrlKey = true;
    e.metaKey = true;
  }
  return jsaction.createMouseEvent(e);
};


/**
 * A static helper function that sets the mouse position to the event.
 * @param {!Event} event A simulated native event.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @private
 */
jsaction.testing.nativeEvents.setEventClientXY_ = function(event, opt_coords) {
  if (!opt_coords && event.target &&
      event.target.nodeType == goog.dom.NodeType.ELEMENT) {
    try {
      opt_coords =
          goog.style.getClientPosition(/** @type {!Element} **/ (event.target));
    } catch (ex) {
      // IE sometimes throws if it can't get the position.
    }
  }
  event.clientX = opt_coords ? opt_coords.x : 0;
  event.clientY = opt_coords ? opt_coords.y : 0;

  // Pretend the browser window is at (0, 0).
  event.screenX = event.clientX;
  event.screenY = event.clientY;
};


/**
 * Helper function to fire a mouse event with a mouse button. IE < 9 only allows
 * firing events using the left mouse button.
 * @param {string} type The event type.
 * @param {!EventTarget} target The target for the event.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button;
 *     defaults to `goog.events.BrowserEvent.MouseButton.LEFT`.
 * @param {?goog.math.Coordinate=} opt_coords Mouse position. Defaults to
 *     event's target's position (if available), otherwise (0, 0).
 * @param {?Object=} opt_eventProperties Event properties to be mixed into the
 *     BrowserEvent.
 * @return {boolean} The value returned by the browser event,
 *     which returns false iff 'preventDefault' was invoked.
 * @private
 */
jsaction.testing.nativeEvents.fireMouseButtonEvent_ = function(
    type, target, opt_button, opt_coords, opt_eventProperties) {
  const e = jsaction.testing.nativeEvents.createMouseButtonEvent(
      type, target, opt_button, undefined, opt_coords, opt_eventProperties);
  return jsaction.triggerEvent(target, e);
};


/**
 * Creates and initializes a key event.
 * @param {string} eventType The type of event to create ("keydown", "keyup",
 *     or "keypress").
 * @param {!EventTarget} target The event target.
 * @param {number} keyCode The key code.
 * @param {number} charCode The character code produced by the key.
 * @param {!jsaction.testing.nativeEvents.Modifiers=} modifiers
 * @return {boolean} The value returned by the browser event,
 *     which returns false iff 'preventDefault' was invoked.
 */
jsaction.testing.nativeEvents.fireKeyEvent = function(
    eventType, target, keyCode, charCode, modifiers = {}) {
  const e = new goog.testing.events.Event(eventType, target);
  e.charCode = charCode;
  e.keyCode = keyCode;
  goog.object.extend(e, modifiers);
  return jsaction.triggerEvent(target, jsaction.createKeyboardEvent(e));
};


/**
 * Generates a series of events simulating a key press on the given element.
 * @param {!EventTarget} target The event target.
 * @param {number} keyCode The key code.
 * @param {number=} charCode The character code produced by the key.
 * @param {!jsaction.testing.nativeEvents.Modifiers=} modifiers
 * @return {boolean} False if preventDefault() was called by any of the handlers
 */
jsaction.testing.nativeEvents.simulateKeyPress = function(
    target, keyCode, charCode = keyCode, modifiers = {}) {
  let e;
  e = jsaction.testing.nativeEvents.fireKeyEvent(
      goog.events.EventType.KEYDOWN, target, keyCode, charCode, modifiers);
  e = jsaction.testing.nativeEvents.fireKeyEvent(
          goog.events.EventType.KEYPRESS, target, keyCode, charCode,
          modifiers) &&
      e;

  // A click event is fired by browsers when pressing Enter on <button>
  // elements, for a11y.
  if ((keyCode == jsaction.KeyCodes.ENTER ||
       keyCode == jsaction.KeyCodes.MAC_ENTER) &&
      target.nodeName == 'BUTTON') {
    e = jsaction.testing.nativeEvents.fireClickEvent(
            target, undefined, undefined, modifiers) &&
        e;
  }

  e = jsaction.testing.nativeEvents.fireKeyEvent(
          goog.events.EventType.KEYUP, target, keyCode, charCode, modifiers) &&
      e;
  // Same as the Enter "click", but for Space it happens after keyup.
  if ((keyCode == jsaction.KeyCodes.SPACE) && target.nodeName == 'BUTTON') {
    e = jsaction.testing.nativeEvents.fireClickEvent(
            target, undefined, undefined, modifiers) &&
        e;
  }
  return e;
};
