const fs = require('fs/promises');
const github = require('@actions/github');
const { getActionInputs, getTemplate, getHtmlContent } = require ('./utils');

const template = getTemplate();

const getConfiguration = () => {
  const {
    payload: { repository },
    sha
  } = github.context;

  const [owner, repo] = repository?.full_name?.split('/') || [];

  return { owner, repo, sha };
}

const postActionResult = async () => {
  const {token} = getActionInputs();
  const octokit = github.getOctokit(token);
  const {owner, repo, sha} = getConfiguration();

  await octokit.request(`POST /repos/${owner}/${repo}/check-runs`, {
    owner,
    repo,
    name: 'Mutation result notification',
    head_sha: sha,
    status: 'completed',
    output: {
      title: 'Mutation result notification',
      summary: 'Some test summary',
      text: 'Some test text'
    }
  });
}

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
  .then(() => postActionResult())
  .catch(e => console.log(e));

function getMutationResultPath(dir) {
  return `./StrykerOutput/${dir}/reports/mutation-report.json`;
}

// Get list of directories where dotnet-stryker puts data per project
async function getDirectories(source) {
  return (await fs.readdir(source, {withFileTypes: true}))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}
