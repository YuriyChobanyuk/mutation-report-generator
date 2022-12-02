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

const startCheckRun = async ({octokit, owner, repo, sha}) => {
    return await octokit.request(`POST /repos/${owner}/${repo}/check-runs`, {
      owner,
      repo,
      name: 'Mutation testing is running',
      head_sha: sha,
      status: 'queued',
      output: {
        title: 'Mutation testing',
        summary: 'Mutation testing is still in progress...',
      }
    });
}

const getMutationCheckSummaryResult = (runId) => {
  const workflowRunUrl = `https://github.com/stratadecision/planning-capitaloptimization/actions/runs/${runId}`;

  return `### Mutation testing finished successfully

          Archive with a report was attached to the artifacts section on the [corresponding workflow run page](${workflowRunUrl});`
}

const finishCheckRun = async ({octokit, checkRunId, owner, repo, runId}) => {
  return await octokit.request(`PATCH /repos/${owner}/${repo}/check-runs/${checkRunId}`, {
    owner,
    repo,
    check_run_id: checkRunId,
    name: 'Mutation result notification',
    status: 'completed',
    conclusion: 'success',
    completed_at: new Date().toISOString(),
    output: {
      title: 'Mutation testing had been finished',
      summary: getMutationCheckSummaryResult(runId)
    }
  });
}

const postActionResult = async () => {
  const {token} = getActionInputs();
  const octokit = github.getOctokit(token);
  const {owner, repo, sha, runId} = getConfiguration();

  const response = await startCheckRun({octokit, owner, repo, sha});
  const checkRunId = response.data.id;
  await finishCheckRun({octokit, checkRunId, owner, repo, runId});
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
