const core = require("@actions/core");

const inputKeys = {
  token: "github-token",
  name: "name",
  checkRunId: "check-run-id",
};

module.exports.getActionInputs = () => {
  const token =
    core.getInput(inputKeys.token) || process.env["GITHUB_TOKEN"] || "";
  const name = core.getInput(inputKeys.name);
  const checkRunId = core.getInput(inputKeys.checkRunId);

  return { token, name, checkRunId };
};

module.exports.getHtmlContent = (reportData) => {
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
};

module.exports.getTemplate = (
  thresholds = {
    high: 80,
    low: 60,
  }
) => {
  return {
    schemaVersion: "1",
    thresholds,
    projectRoot: "",
    files: {},
  };
};
