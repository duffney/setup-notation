/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 431:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(17);
const core = __nccwpck_require__(543);
const tc = __nccwpck_require__(167);
const { getDownloadObject, getDownloadPluginObject, addPluginCert } = __nccwpck_require__(778);
const { get } = __nccwpck_require__(685);
const fs = __nccwpck_require__(147);
const mv = __nccwpck_require__(333);
const execSync = (__nccwpck_require__(81).execSync);

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version'); //"0.9.0-alpha.1";
    const keyName = core.getInput('key_name');

    // Download the specific version of the tool, e.g. as a tarball/zipball
    const download = getDownloadObject(version);
    console.log(download)
    const pathToTarball = await tc.downloadTool(download.url);

    // Extract the tarball/zipball onto host runner
    const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
    const pathToCLI = await extract(pathToTarball);
    fs.mkdirSync(pathToCLI + "/" + download.binPath, { recursive: true, })

    const currentPath = path.join(pathToCLI, "notation")
    const destinationPath = path.join(pathToCLI, "/", download.binPath, "/", "notation")
    fs.rename(currentPath, destinationPath, function (err) {
      if (err) {
        throw err
      } else {
        console.log("Successfully moved the Notation binary to bin.");
      }
    });
    // Expose the tool by adding it to the PATH
    core.addPath(path.join(pathToCLI, download.binPath));

    // Install Notation plugin
    const pluginName = core.getInput('plugin_name'); // "notation-azure-kv";
    const pluginVersion = core.getInput('plugin_version'); //"0.3.1-alpha.1";

    if (pluginName) {
      setupPlugin(pluginName, pluginVersion, keyName);
    } else {
      // Generate a local signing certificate
      const output = execSync(`notation cert generate-test --default "${keyName}"`, { encoding: 'utf-8' });
      console.log('notation cert output:\n', output);
    }

  } catch (e) {
    core.setFailed(e);
  }
}

async function setupPlugin(name, version, keyName) {
  try {
    const keyId = core.getInput('certificate_key_id');
    const download = getDownloadPluginObject(name, version)
    console.log(download)

    fs.mkdirSync(download.pluginPath, { recursive: true, })

    const pathToTarball = await tc.downloadTool(download.url);
    const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
    const pathToPluginDownload = await extract(pathToTarball);

    const currentPath = path.join(pathToPluginDownload, "/", name)
    const destinationPath = path.join(download.pluginPath, "/", name)

    mv(currentPath, destinationPath, function (err) {
      if (err) {
        throw err
      } else {
        console.log("Successfully moved the plugin file!");
        fs.chmod(destinationPath, 0o755, (err) => {
          if (err) throw err;
          console.log(`The permissions for file "${destinationPath}" have been changed!`);
        });
        addPluginCert(keyName,keyId);
      }
    });
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup
module.exports = setupPlugin

if (require.main === require.cache[eval('__filename')]) {
  setup();
}

/***/ }),

/***/ 778:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { setFailed } = __nccwpck_require__(543);
const os = __nccwpck_require__(37);
const path = __nccwpck_require__(17);
const execSync = (__nccwpck_require__(81).execSync);

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
    const mappings = {
        x32: '386',
        x64: 'amd64'
    };
    return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
    const mappings = {
        darwin: 'macOS',
        win32: 'windows'
    };
    return mappings[os] || os;
}

function getDownloadObject(version) {
    const platform = os.platform();
    const filename = `notation_${version}_${mapOS(platform)}_${mapArch(os.arch())}`;
    const extension = platform === 'win32' ? 'zip' : 'tar.gz';
    const binPath = platform === 'win32' ? 'bin' : path.join(filename, 'bin');
    const url = `https://github.com/notaryproject/notation/releases/download/v${version}/${filename}.${extension}`;
    return {
        url,
        binPath,
        filename
    };
}

function getDownloadPluginObject(name, version) {
    if (name == "notation-azure-kv") {
        const platform = os.platform();
        const filename = `${name}_${version}_${mapOS(platform)}_${mapArch(os.arch())}`;
        const extension = platform === 'win32' ? 'zip' : 'tar.gz';
        const url = `https://github.com/Azure/notation-azure-kv/releases/download/v${version}/${filename}.${extension}`;
        const HOME = process.env.HOME;
        const pluginPath = HOME + "/.config/notation/plugins/azure-kv"
        return {
            url,
            filename,
            pluginPath
        };
    } else { // Add logic for additional Notation plugins here
        setFailed(`Plugin ${name} is not currently supported`)
    }
}

function addPluginCert(keyName,keyId){
    if (keyId.includes('kv.vault.azure.net')){
        const output = execSync(`notation key add --name ${keyName} --id ${keyId} --default --plugin azure-kv`, { encoding: 'utf-8' });
        console.log('notation cert output:\n', output);
    } // Add logic for additional Notation plugins here
}

module.exports = { getDownloadObject, getDownloadPluginObject, addPluginCert }

/***/ }),

/***/ 543:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 167:
/***/ ((module) => {

module.exports = eval("require")("@actions/tool-cache");


/***/ }),

/***/ 333:
/***/ ((module) => {

module.exports = eval("require")("mv");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 37:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(431);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;