// Copyright 2011 Google Inc. All rights reserved.

/**
 */

/** @suppress {extraProvide} */
goog.provide('jsaction.eventTest');
goog.setTestOnly('jsaction.eventTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('jsaction.EventType');
goog.require('jsaction.KeyCodes');
goog.require('jsaction.event');


function DivMock() {
  this.listeners = [];
}


DivMock.prototype.addEventListener = function(event, handler, capture) {
  this.listeners.push([0, event, handler, capture]);
};


DivMock.prototype.attachEvent = function(event, handler) {
  this.listeners.push([1, event, handler]);
};


var div_ = null;
var validTarget =
    goog.dom.createDom(goog.dom.TagName.DIV, {tabIndex: 0, role: 'button'});
var invalidTarget = document.createElement('div');
var roleTarget =
    goog.dom.createDom(goog.dom.TagName.DIV, {tabIndex: 0, role: 'textbox'});


function setUp() {
  div_ = new DivMock;
}


function testAddEventListenerW3C() {
  var eventInfo = jsaction.event.addEventListener(
      div_, 'click', goog.nullFunction);
  assertEquals('click', eventInfo.eventType);
  assertFalse(eventInfo.capture);
}


function testAddEventListenerIE() {
  div_.addEventListener = null;
  var handlerThis = null;
  var handler = function() {
    handlerThis = this;
  };

  var eventInfo = jsaction.event.addEventListener(div_, 'click', handler);
  assertEquals('click', eventInfo.eventType);
  assertFalse(handler == eventInfo.handler);

  eventInfo.handler();
  assertEquals(div_, handlerThis);
}


function testAddEventListenerFocusW3C() {
  var eventInfo = jsaction.event.addEventListener(
      div_, 'focus', goog.nullFunction);
  assertEquals('focus', eventInfo.eventType);
  assertTrue(eventInfo.capture);
}


function testAddEventListenerBlurW3C() {
  var eventInfo = jsaction.event.addEventListener(
      div_, 'blur', goog.nullFunction);
  assertEquals('blur', eventInfo.eventType);
  assertTrue(eventInfo.capture);
}


function testAddEventListenerErrorW3C() {
  var eventInfo = jsaction.event.addEventListener(
      div_, 'error', goog.nullFunction);
  assertEquals('error', eventInfo.eventType);
  assertTrue(eventInfo.capture);
}


function testAddEventListenerLoadW3C() {
  var eventInfo = jsaction.event.addEventListener(
      div_, 'load', goog.nullFunction);
  assertEquals('load', eventInfo.eventType);
  assertTrue(eventInfo.capture);
}


function testAddEventListenerFocusIE() {
  div_.addEventListener = null;
  var eventInfo = jsaction.event.addEventListener(
      div_, 'focus', goog.nullFunction);
  assertEquals('focusin', eventInfo.eventType);
}


function testAddEventListenerBlurIE() {
  div_.addEventListener = null;
  var eventInfo = jsaction.event.addEventListener(
      div_, 'blur', goog.nullFunction);
  assertEquals('focusout', eventInfo.eventType);
}


function testIsModifiedClickEventMacMetaKey() {
  var event = {metaKey: true};
  jsaction.event.isMac_ = true;
  assertTrue(jsaction.event.isModifiedClickEvent(event));
}


function testIsModifiedClickEventNonMacCtrlKey() {
  var event = {ctrlKey: true};
  jsaction.event.isMac_ = false;
  assertTrue(jsaction.event.isModifiedClickEvent(event));
}


function testIsModifiedClickEventMiddleClick() {
  var event = {which: 2};
  assertTrue(jsaction.event.isModifiedClickEvent(event));
}


function testIsModifiedClickEventMiddleClickIE() {
  var event = {button: 4};
  assertTrue(jsaction.event.isModifiedClickEvent(event));
}


function testIsModifiedClickEventShiftKey() {
  var event = {shiftKey: true};
  assertTrue(jsaction.event.isModifiedClickEvent(event));
}


function testIsValidActionKeyTarget() {
  var div = document.createElement('div');
  div.setAttribute('role', 'checkbox');
  var textarea = document.createElement('textarea');
  var input = document.createElement('input');
  input.type = 'password';
  assertTrue(jsaction.event.isValidActionKeyTarget_(div));
  assertFalse(jsaction.event.isValidActionKeyTarget_(textarea));
  assertFalse(jsaction.event.isValidActionKeyTarget_(input));
  input.setAttribute('role', 'combobox');
  assertEquals('combobox', input.getAttribute('role'));
  assertFalse(jsaction.event.isValidActionKeyTarget_(input));
  var search = document.createElement('search');
  search.type = 'search';
  assertEquals('search', search.type);
  assertFalse(jsaction.event.isValidActionKeyTarget_(search));
  var holder = document.createElement('div');
  holder.innerHTML = '<input type=\"number\"/>';
  var num = holder.firstChild;
  assertEquals('number', num.getAttribute('type'));
  assertFalse(jsaction.event.isValidActionKeyTarget_(num));

  var div2 = document.createElement('div');
  // contentEditable only works on non-orphaned elements.
  document.body.appendChild(div2);
  div2.contentEditable = 'true';
  div2.setAttribute('role', 'combobox');
  assertFalse(jsaction.event.isValidActionKeyTarget_(div2));
  div2.removeAttribute('role');
  assertFalse(jsaction.event.isValidActionKeyTarget_(div2));
  div.removeAttribute('role');
  assertTrue(jsaction.event.isValidActionKeyTarget_(div));
  document.body.removeChild(div2);
}


function testIsActionKeyEventFailsOnClick() {
  var event = {
    type: 'click',
    target: validTarget
  };
  assertFalse(jsaction.event.isActionKeyEvent(event));
}


function baseIsActionKeyEvent(keyCode, opt_target, opt_originalTarget) {
  var event = {
    type: jsaction.EventType.KEYDOWN,
    which: keyCode,
    target: opt_target || validTarget,
    originalTarget: opt_originalTarget || opt_target || validTarget
  };

  try {
    // isFocusable() in IE calls getBoundingClientRect(), which fails on orphans
    document.body.appendChild(event.target);
    event.target.style.height = '4px';   // Make sure we don't report as hidden.
    event.target.style.width = '4px';
    return jsaction.event.isActionKeyEvent(event);
  } finally {
    document.body.removeChild(event.target);
  }
}


function testIsActionKeyEventFailsOnInvalidKey() {
  assertFalse(baseIsActionKeyEvent(64));
}


function testIsActionKeyEventEnter() {
  assertTrue(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER));
}


function testIsActionKeyEventSpace() {
  assertTrue(baseIsActionKeyEvent(jsaction.KeyCodes.SPACE));
}


function testIsActionKeyRealCheckBox() {
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.SPACE, checkbox));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, checkbox));
}


function testIsActionKeyFakeCheckBox() {
  var checkbox =
      goog.dom.createDom(goog.dom.TagName.DIV, {tabIndex: 0, role: 'checkbox'});
  assertTrue(baseIsActionKeyEvent(jsaction.KeyCodes.SPACE, checkbox));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, checkbox));
}


function testIsActionKeyEventMacEnter() {
  if (!jsaction.event.isWebKit_) {
    return;
  }
  assertTrue(baseIsActionKeyEvent(jsaction.KeyCodes.MAC_ENTER));
}

function testIsActionKeyNonControl() {
  var control = goog.dom.createDom(goog.dom.TagName.DIV);
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, control));
}

function testIsActionKeyDisabledControl() {
  var control = goog.dom.createDom(goog.dom.TagName.BUTTON, {disabled: true});
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, control));
}

function testIsActionKeyNonTabbableControl() {
  let control = goog.dom.createDom(goog.dom.TagName.DIV);
  // Adding role=button will make jsaction treat the div (normally not
  // interactable) as a control, although it will remain non-tabbable.
  control.setAttribute('role', 'button');
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, control));
}

function testIsActionKeyNativelyActivatableControl() {
  var control = goog.dom.createDom(goog.dom.TagName.BUTTON);
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.SPACE, control));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, control));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.MAC_ENTER, control));
}

function testIsActionKeyFileInput() {
  var control = goog.dom.createDom(goog.dom.TagName.INPUT, {type: 'file'});
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.SPACE, control));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, control));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.MAC_ENTER, control));
}

function testIsActionKeyEventNotInMap() {
  var control = goog.dom.createDom(goog.dom.TagName.DIV, {tabIndex: 0});
  assertTrue(baseIsActionKeyEvent(jsaction.KeyCodes.ENTER, control));
  assertFalse(baseIsActionKeyEvent(jsaction.KeyCodes.SPACE, control));
}

function testIsMouseSpecialEventMouseenter() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);

  var event = {
    relatedTarget: root,
    type: jsaction.EventType.MOUSEOVER,
    target: child
  };

  assertTrue(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSEENTER, child));
}

function testIsMouseSpecialEventNotMouseenter() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);

  var event = {
    relatedTarget: child,
    type: jsaction.EventType.MOUSEOVER,
    target: root
  };

  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSEENTER, root));
  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSEENTER, child));
}

function testIsMouseSpecialEventMouseover() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);
  var subchild = document.createElement('div');
  child.appendChild(subchild);

  var event = {
    relatedTarget: child,
    type: jsaction.EventType.MOUSEOVER,
    target: subchild
  };

  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSEENTER, root));
  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSEENTER, child));
  assertTrue(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSEENTER, subchild));
}

function testIsMouseSpecialEventMouseleave() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);

  var event = {
    relatedTarget: root,
    type: jsaction.EventType.MOUSEOUT,
    target: child
  };

  assertTrue(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, child));
}

function testIsMouseSpecialEventNotMouseleave() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);

  var event = {
    relatedTarget: child,
    type: jsaction.EventType.MOUSEOUT,
    target: root
  };

  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, root));
  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, child));
}

function testIsMouseSpecialEventMouseout() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);
  var subchild = document.createElement('div');
  child.appendChild(subchild);

  var event = {
    relatedTarget: child,
    type: jsaction.EventType.MOUSEOUT,
    target: subchild
  };

  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, root));
  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, child));
  assertTrue(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, subchild));
}

function testIsMouseSpecialEventNotMouse() {
  var root = document.createElement('div');
  var child = document.createElement('div');
  root.appendChild(child);

  var event = {
    relatedTarget: root,
    type: jsaction.EventType.CLICK,
    target: child
  };

  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, child));
  assertFalse(jsaction.event.isMouseSpecialEvent(event,
      jsaction.EventType.MOUSELEAVE, child));
}

function testCreateMouseSpecialEventMouseenter() {
  var div = document.createElement('div');
  var event = new goog.testing.events.Event(jsaction.EventType.MOUSEOVER, div);
  var copiedEvent = jsaction.event.createMouseSpecialEvent(event, div);
  assertEquals(jsaction.EventType.MOUSEENTER, copiedEvent['type']);
  assertEquals(div, copiedEvent['target']);
  assertEquals(false, copiedEvent['bubbles']);
}

function testCreateMouseSpecialEventMouseleave() {
  var div = document.createElement('div');
  var event = new goog.testing.events.Event(jsaction.EventType.MOUSEOUT, div);
  var copiedEvent = jsaction.event.createMouseSpecialEvent(event, div);
  assertEquals(jsaction.EventType.MOUSELEAVE, copiedEvent['type']);
  assertEquals(div, copiedEvent['target']);
  assertEquals(false, copiedEvent['bubbles']);
}

function testRecreateTouchEventAsClick() {
  var div = document.createElement('div');
  var origEvent = new goog.testing.events.Event('touchend', div);
  origEvent.touches = [{
    clientX: 1,
    clientY: 2,
    screenX: 3,
    screenY: 4,
    pageX: 5,
    pageY: 6
  }, {}];
  var event = jsaction.event.recreateTouchEventAsClick(origEvent);
  assertEquals('click', event.type);
  assertEquals(1, event.clientX);
  assertEquals(2, event.clientY);
  assertEquals(3, event.screenX);
  assertEquals(4, event.screenY);

  origEvent = new goog.testing.events.Event('touchend', div);
  origEvent.changedTouches = [{
    clientX: 'other',
    clientY: 2,
    screenX: 3,
    screenY: 4,
    pageX: 5,
    pageY: 6
  }];
  assertEquals('touchend', origEvent.type);
  event = jsaction.event.recreateTouchEventAsClick(origEvent);
  assertEquals('click', event.type);
  assertEquals('other', event.clientX);
  assertEquals(2, event.clientY);
  assertEquals(3, event.screenX);
  assertEquals(4, event.screenY);
  assertEquals('touchend', event.originalEventType);

  origEvent = new goog.testing.events.Event('touchend', div);
  origEvent.changedTouches = [];
  origEvent.touches = [{
    clientX: 1
  }, {}];
  event = jsaction.event.recreateTouchEventAsClick(origEvent);
  assertEquals('click', event.type);
  assertEquals(1, event.clientX);
}

function testRecreateTouchEventAsClick_hasTouchData() {
  var div = document.createElement('div');
  var event = new goog.testing.events.Event(jsaction.EventType.TOUCHEND, div);
  event['touches'] = [{
    'clientX': 101,
    'clientY': 102,
    'screenX': 201,
    'screenY': 202
  }];
  var copiedEvent = jsaction.event.recreateTouchEventAsClick(event);
  assertEquals(jsaction.EventType.CLICK, copiedEvent['type']);
  assertEquals(jsaction.EventType.TOUCHEND, copiedEvent['originalEventType']);
  assertEquals(div, copiedEvent['target']);
  assertEquals(101, copiedEvent['clientX']);
  assertEquals(102, copiedEvent['clientY']);
  assertEquals(201, copiedEvent['screenX']);
  assertEquals(202, copiedEvent['screenY']);
}

function testRecreateTouchEventAsClick_noTouchData() {
  var div = document.createElement('div');
  var event = new goog.testing.events.Event(jsaction.EventType.TOUCHEND, div);
  var copiedEvent = jsaction.event.recreateTouchEventAsClick(event);
  assertEquals(jsaction.EventType.CLICK, copiedEvent['type']);
  assertEquals(jsaction.EventType.TOUCHEND, copiedEvent['originalEventType']);
  assertEquals(div, copiedEvent['target']);
  assertUndefined(copiedEvent['clientX']);
  assertUndefined(copiedEvent['clientY']);
  assertUndefined(copiedEvent['screenX']);
  assertUndefined(copiedEvent['screenY']);
}

function testRecreateTouchEventAsClick_behavior() {
  var div = document.createElement('div');
  var origEvent = new goog.testing.events.Event('touchend', div);
  origEvent.touches = [{
    clientX: 1,
    clientY: 2,
    screenX: 3,
    screenY: 4,
    pageX: 5,
    pageY: 6
  }, {}];
  var event = jsaction.event.recreateTouchEventAsClick(origEvent);
  assertEquals('click', event.type);

  assertFalse(event.defaultPrevented);
  event.preventDefault();
  assertTrue(event.defaultPrevented);

  assertFalse(event['_propagationStopped']);
  event.stopPropagation();
  assertTrue(event['_propagationStopped']);
}

function testRecreateTouchEventAsClick_timeStamp() {
  var div = document.createElement('div');
  var origEvent = new goog.testing.events.Event('touchend', div);
  origEvent.touches = [{
    clientX: 1,
    clientY: 2,
    screenX: 3,
    screenY: 4,
    pageX: 5,
    pageY: 6
  }, {}];
  var event = jsaction.event.recreateTouchEventAsClick(origEvent);
  assertEquals('click', event.type);
  assertTrue(event.timeStamp >= goog.now() - 500);
}

function testPreventMouseEvents() {
  var div = document.createElement('div');
  var event = new goog.testing.events.Event('touchend', div);

  assertFalse(jsaction.event.isMouseEventsPrevented(event));

  jsaction.event.preventMouseEvents(event);
  assertTrue(jsaction.event.isMouseEventsPrevented(event));
}

function testAddPreventMouseEventsSupport() {
  var div = document.createElement('div');
  var event = new goog.testing.events.Event('touchend', div);
  jsaction.event.addPreventMouseEventsSupport(event);

  assertFalse(jsaction.event.isMouseEventsPrevented(event));

  event['_preventMouseEvents']();
  assertTrue(jsaction.event.isMouseEventsPrevented(event));
}

function testMaybeCopyEvent() {
  var div = document.createElement('div');
  document.body.appendChild(div);
  var event;
  var maybeCopy;
  div.onclick = function(e) {
    event = e || window.event;
    maybeCopy = jsaction.event.maybeCopyEvent(event);
  };
  if (document.createEvent) {  // All browsers except older IEs.
    var toDispatch = document.createEvent('HTMLEvents');
    toDispatch.initEvent('click', true, true);
    div.dispatchEvent(toDispatch);
  } else {
    div.click();
  }
  assertNotNullNorUndefined(event);
  if (document.createEvent) {
    assertEquals(event, maybeCopy);
  } else {
    assertNotEquals(event, maybeCopy);
  }
  if (maybeCopy.target) {
    assertEquals(div, maybeCopy.target);
  } else {
    assertEquals(div, maybeCopy.srcElement);
  }
}


function testMaybeCopyEventDoesNotCopyNonBrowserEvent() {
  var event = {};
  var maybeCopy = jsaction.event.maybeCopyEvent(event);
  assertEquals(event, maybeCopy);
  // More browser like:
  var node = document.createElement('div');
  event = {
    type: 'click',
    target: node,
    srcElement: node
  };
  maybeCopy = jsaction.event.maybeCopyEvent(event);
  assertEquals(event, maybeCopy);
}


function testIsSpaceKeyEvent() {
  var ev = {
    target: validTarget,
    keyCode: jsaction.KeyCodes.SPACE
  };
  assertTrue(jsaction.event.isSpaceKeyEvent(ev));
  var input = goog.dom.createDom(goog.dom.TagName.INPUT);
  input.type = 'checkbox';
  ev = {
    target: input,
    keyCode: jsaction.KeyCodes.SPACE
  };
  assertFalse(jsaction.event.isSpaceKeyEvent(ev));
}


function testShouldCallPreventDefaultOnNativeHtmlControl() {
  var ev = {
    target: validTarget
  };
  assertTrue(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  ev = {
    target: invalidTarget
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  ev = {
    target: roleTarget
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var button = document.createElement('button');
  ev = {
    target: button
  };
  assertTrue(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var divWithButtonRole = document.createElement('div');
  divWithButtonRole.setAttribute('role', 'button');
  ev = {
    target: divWithButtonRole
  };
  assertTrue(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var input = document.createElement('input');
  input.type = 'button';
  ev = {
    target: input
  };
  assertTrue(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  ev = {
    target: checkbox
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var radio = document.createElement('input');
  radio.type = 'radio';
  ev = {
    target: radio
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var select = document.createElement('select');
  ev = {
    target: select
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var option = document.createElement('option');
  ev = {
    target: option
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var link = document.createElement('a');
  link.setAttribute('href', 'http://www.google.com');
  ev = {
    target: link
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
  var linkWithRole = document.createElement('a');
  linkWithRole.setAttribute('href', 'http://www.google.com');
  linkWithRole.setAttribute('role', 'menuitem');
  ev = {
    target: linkWithRole
  };
  assertFalse(jsaction.event.shouldCallPreventDefaultOnNativeHtmlControl(ev));
}
