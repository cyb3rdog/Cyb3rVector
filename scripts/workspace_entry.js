function Injector(fileName, callback) {
  var script = document.createElement("script");
  script.onload = function () {
    callback();
  };
  script.type = "text/javascript";
  script.src = fileName;
  document.body.appendChild(script);
}

Injector('data/toolbox_default.xml.js', () => {
    initBlockly('thrasos', btoa(toolboxXml));

    Injector('data/workspace.xml.js', () => {
        loadCode(btoa(workspaceXml));
    });
});


function evalProgram() {
  setOutput("");
  var xml = Blockly.Xml.workspaceToDom(workspace);
  var xmlText = new XMLSerializer().serializeToString(xml);
  send(xmlText, setOutput)
}

function setOutput(value) {
  document.getElementById("output").innerText = value;
}

async function send(payload, cb) {
  await DotNet.invokeMethodAsync('Cyb3rBlock.Blazor', 'Evaluate', payload)
    .then(cb)
    .catch(err => console.error(err))
}

async function fetchBlocks(payload, cb) {
  await DotNet.invokeMethodAsync('Cyb3rBlock.Blazor', 'GetGeneraterBlocks', payload)
    .then(cb)
    .catch(err => console.error(err))
}

function parseFetchedBlocks(blocks) {
  if (!blocks) return;
  for (var i = 0, block; block = blocks[i]; i++) {
    json = JSON.parse(atob(block));
    //importBlocks(json.categoryName, json.translationKey, btoa(JSON.stringify(json.blocksData)), json.categoryColour);
    importBlocks(json.categoryName, json.categoryName, btoa(JSON.stringify(json.blocksData)), json.categoryColour);
  }
  document.getElementById("loading").style="visibility:hidden;"
}

var initializer = setTimeout(() => {
  if (!DotNet) return;
  fetchBlocks(true, parseFetchedBlocks);
  fetchBlocks(false, parseFetchedBlocks);
}, 4000);
