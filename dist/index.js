/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 292:
/***/ ((module) => {

"use strict";
module.exports = require("fs/promises");

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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const fs = __nccwpck_require__(292);
const path = __nccwpck_require__(17);

const template = getTemplate();

const aggregateMutationResults = async () => {
  const directories = await getDirectories('./StrykerOutput');

  for (let i = 0; i < directories.length; i++) {
    const data = JSON.parse(await fs.readFile(getMutationResultPath(directories[i]), {encoding: 'utf8'}));

    template.files = {
      ...template.files,
      ...data.files,
    }
  }

  const reportContent = getHtmlContent(JSON.stringify(template));
  await fs.writeFile(path.join(__dirname, './report.html'), reportContent, {encoding: 'utf8'});
}

aggregateMutationResults()
  .catch(e => console.log(e));

function getHtmlContent(reportData) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Mutation resutls</title>
  </head>
  <body>
  <script src="https://www.unpkg.com/mutation-testing-elements@1.7.12/dist/mutation-test-elements.js"></script>
    <mutation-test-report-app src="mutation-report.json">
      Your browser does not support custom elements. Please use a modern browser.
    </mutation-test-report-app>
    <script>
      document.querySelector('mutation-test-report-app').report = ${reportData};
    </script>
  </body>
</html>
`;
}

function getTemplate() {
  return {
    schemaVersion: "1",
    thresholds: {
      high: 80,
      low: 60
    },
    projectRoot: "",
    files: {}
  }
}

function getMutationResultPath(dir) {
  return path.join(__dirname, `./StrykerOutput/${dir}/reports/mutation-report.json`);
}

// Get list of directories where dotnet-stryker puts data per project
async function getDirectories(source) {
  return (await fs.readdir(path.join(__dirname, source), {withFileTypes: true}))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;