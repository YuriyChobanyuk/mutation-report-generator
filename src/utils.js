const core = require('@actions/core');

const inputs = {
  token: 'github-token'
}

module.exports.getActionInputs = () => {
  const token = core.getInput(inputs.token) || process.env['GITHUB_TOKEN'] || '';

  return {token};
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
}

module.exports.getTemplate = () => {
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
