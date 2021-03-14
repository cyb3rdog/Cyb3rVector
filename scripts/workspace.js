var factory = null;
var toolbox= null;
var workspace = null;
var vectorAPI = null;

var themeFontSize = 12;
var themeFontName = 'calibri';
var themePadding = 4;

CustomConstantsProvider = function () {
  // Set up all of the constants from the base provider.
  CustomConstantsProvider.superClass_.constructor.call(this);

  // Override a few properties.
  this.ADD_START_HATS = true;
  this.START_HAT_HEIGHT = 15;
  this.START_HAT_WIDTH = 100;
  this.TAB_WIDTH = 12;
  this.TAB_HEIGHT = 16;
  //this.TAB_OFFSET_FROM_TOP = 5;
  this.NOTCH_WIDTH = 22;
  this.NOTCH_HEIGHT = 5;
  this.NOTCH_OFFSET_LEFT = 13;
  //this.CORNER_RADIUS = 10;
  this.FIELD_TEXT_FONTSIZE = themeFontSize;
  this.FIELD_TEXT_FONTFAMILY = themeFontName;
  this.FIELD_TEXT_FONTWEIGHT = 'normal';
  this.FIELD_BORDER_RECT_COLOUR = '#eee';

  /*this.MIN_BLOCK_HEIGHT = 30;*/
  this.TOP_ROW_MIN_HEIGHT = themePadding;
  this.BOTTOM_ROW_MIN_HEIGHT = themePadding;
};

function initLanguage(language) {

  var scripts = document.head.getElementsByTagName('script');
  for (var i = 0, old_script; old_script = scripts[i]; i++) {
    source = old_script.getAttribute("src");
    if (source && source.lastIndexOf('blockly/msg/js', 0) === 0)
      document.head.removeChild(old_script);
    if (source && source.lastIndexOf('data/msg/js', 0) === 0)
      document.head.removeChild(old_script);
  }

  if (!language || language == '') language = 'en';
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", "blockly/msg/js/" + language + ".js");
  document.head.appendChild(script);

  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", "data/msg/js/" + language + ".js");
  document.head.appendChild(script);
}

function initTheme(fontName, fontSize, padding) {
  if (fontName) themeFontName = fontName;
  if (fontSize) themeFontSize = fontSize;
  if (padding) themePadding = padding;
}

/* functions */
function initBlockly(renderer, toolboxXML) {

  Blockly.utils.object.inherits(CustomConstantsProvider, Blockly.blockRendering.ConstantProvider);
  Blockly.blockRendering.Renderer.prototype.makeConstants_ = function () { return new CustomConstantsProvider(); };

  if (renderer == 'zelos') {
    Blockly.utils.object.inherits(CustomConstantsProvider, Blockly.zelos.ConstantProvider);
    Blockly.zelos.Renderer.prototype.makeConstants_ = function () { return new CustomConstantsProvider(); };
  };
  if (renderer == 'geras') {
    Blockly.utils.object.inherits(CustomConstantsProvider, Blockly.geras.ConstantProvider);
    Blockly.geras.Renderer.prototype.makeConstants_ = function () { return new CustomConstantsProvider(); };
  };
  if (!renderer || renderer == '') renderer = 'thrasos';

  if (workspace)
    workspace.dispose();

  toolbox = Blockly.Xml.textToDom(atob(toolboxXML));
  workspace = Blockly.inject('blocklyDiv', {
    /*
    plugins: {
       'toolbox': ContinuousToolbox,
       'flyoutsVerticalToolbox': ContinuousFlyout,
    },
    */
    toolbox: toolbox,
    collapse: true,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: 'blockly/media/',
    rtl: false,
    scrollbars: true,
    sounds: true,
    zoom: {
      controls: true,
      wheel: false,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
      pinch: true
    },
    grid: {
      /*
      spacing: 20,
      length: 1,
      colour: '#ccc',
      snap: true
      */
    },
    renderer: renderer, /* 'zelos','thrasos', 'geras' */
    oneBasedIndex: true
  });
  workspace.addChangeListener(updateCode);

  factory = new WorkspaceFactoryController(toolbox, workspace);
}


function setCodeText(code_text) {
  var codeDiv = document.getElementById('codeDiv');
  var codeHolder = document.createElement('pre');
  codeHolder.className = 'prettyprint but-not-that-pretty';
  var code = document.createTextNode(atob(code_text));
  codeHolder.appendChild(code);
  codeDiv.replaceChild(codeHolder, codeDiv.lastElementChild);
  prettyPrint();
}

function importBlocks(categoryName, translationKey, blocksData, colour) {
  jsonData = atob(blocksData);
  var newToolbox = factory.importBlocksData(translationKey, jsonData, 'JSON', colour);
  var newToolboxXml = Blockly.Xml.domToText(newToolbox);
  if (vectorAPI) vectorAPI.onBlocksImported(categoryName, newToolboxXml);
}

function getBlocklyVersion() {
  return Blockly.VERSION;
}

function clearCode() {
  workspace.clear();
}

function loadCode(workspaceXML) {
  var xml_code = Blockly.Xml.textToDom(atob(workspaceXML));
  Blockly.Xml.domToWorkspace(xml_code, workspace);
}

function saveCode() {
  var xml_code = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToText(xml_code);
}

function updateCode() {
  if (vectorAPI) {
    xml_text = saveCode();
    vectorAPI.updateCode(xml_text);
  }
}

function runCode() {
  if (vectorAPI) { runCode_EventAPI(); }
  else {
    window.LoopTrap = 1000;
    Blockly.JavaScript.INFINITE_LOOP_TRAP =
      'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    try { eval(code); } catch (e) { alert(e); }
  }
}

function runCode_EventAPI() {
  if (vectorAPI) {
    var xml = Blockly.Xml.workspaceToDom(workspace);
    // Find and remove all top blocks.
    var topBlocks = [];
      for (var i = xml.childNodes.length - 1, block; block = xml.childNodes[i]; i--) {
      if (block.tagName == 'block') {
        xml.removeChild(block);
        topBlocks.unshift(block);
      }
    }
    // Add each top block one by one and generate code.
    var allCode = [];
    for (var i = 0, block; block = topBlocks[i]; i++) {
      xml.appendChild(block);
      var headless = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(xml, headless);
      var xml_code = Blockly.Xml.workspaceToDom(headless);
      var xml_text = Blockly.Xml.domToText(xml_code);
      allCode.push(xml_text);
      headless.dispose();
      xml.removeChild(block);
    }
    vectorAPI.runCode(allCode);
  }
}