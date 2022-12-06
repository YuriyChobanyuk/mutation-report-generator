const fs = require('fs/promises');
const github = require('@actions/github');
const { getActionInputs, getTemplate, getHtmlContent } = require ('./utils');

const template = getTemplate();

const getConfiguration = () => {
  const {
    payload: { repository },
    sha,
    runId
  } = github.context;

  const [owner, repo] = repository?.full_name?.split('/') || [];

  return { owner, repo, sha, runId };
}

const getMutationCheckSummaryResult = () => {

  return `### Mutation testing finished successfully

          You can find mutation result report artifact attached to this check run`;
}

const finishCheckRun = async ({octokit, checkRunId, owner, repo, name}) => {
  return await octokit.request(`PATCH /repos/${owner}/${repo}/check-runs/${checkRunId}`, {
    owner,
    repo,
    check_run_id: checkRunId,
    name,
    status: 'completed',
    conclusion: 'success',
    completed_at: new Date().toISOString(),
    output: {
      title: 'Mutation testing had been finished',
      summary: getMutationCheckSummaryResult()
    }
  });
}

const postActionResult = async () => {
  const {token, name, checkRunId} = getActionInputs();
  const octokit = github.getOctokit(token);
  const {owner, repo, runId} = getConfiguration();

  await finishCheckRun({octokit, checkRunId, owner, repo, name});
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
