const fs = require('fs/promises');

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
  await fs.writeFile('./report.html', reportContent, {encoding: 'utf8'});
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
  return `./StrykerOutput/${dir}/reports/mutation-report.json`;
}

// Get list of directories where dotnet-stryker puts data per project
async function getDirectories(source) {
  return (await fs.readdir(source, {withFileTypes: true}))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}
