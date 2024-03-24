const { encryptSecret } = require('./util')

const core = require('@actions/core')
const github = require('@actions/github')
const { Octokit, App } = require('octokit')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        // Get the input from the action
        const environmentName = core.getInput('environment-name')
        const isSecret = core.getInput('is-secret')
        const name = core.getInput('name', { required: true })
        const value = core.getInput('value', { required: true })
        const token = core.getInput('myToken', { required: true })

        // Get context from the action
        const owner = github.context.repo.owner
        const repo = github.context.repo.repo

        // Create GitHub client
        const octokit = new Octokit({ auth: token })

        // Encrypt the value if secret
        let publicKeyValue
        let publicKeyId
        let encryptedValue
        if (isSecret) {
            const response = await octokit.request(
                'GET /repos/{owner}/{repo}/actions/secrets/public-key',
                {
                    owner: owner,
                    repo: repo,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }
            )
            const data = response.data

            publicKeyValue = data.key
            publicKeyId = data.key_id
            encryptedValue = encryptSecret(publicKeyValue, value)
        }

        if (!environmentName) {
            // Repository
            if (isSecret) {
                // Secret
                await octokit.request(
                    'PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}',
                    {
                        owner: owner,
                        repo: repo,
                        secret_name: name,
                        encrypted_value: encryptedValue,
                        key_id: publicKeyId
                    }
                )
            } else {
                // Variable
                const response = await octokit.request(
                    'GET /repos/{owner}/{repo}/actions/variables/{name}',
                    {
                        owner: owner,
                        repo: repo,
                        name: name,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    }
                )
                const status = response.status

                if (status === 200) {
                    // Update
                    await octokit.request(
                        'PATCH /repos/{owner}/{repo}/actions/variables/{name}',
                        {
                            owner: owner,
                            repo: repo,
                            name: name,
                            value: value,
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        }
                    )
                } else {
                    // Create
                    await octokit.request(
                        'POST /repos/{owner}/{repo}/actions/variables',
                        {
                            owner: owner,
                            repo: repo,
                            name: name,
                            value: value,
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        }
                    )
                }
            }
        } else {
            // Environment
            if (isSecret) {
                // Secret
                await octokit.request(
                    'PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}',
                    {
                        owner: owner,
                        repo: repo,
                        environment_name: environmentName,
                        secret_name: name,
                        encrypted_value: encryptedValue,
                        key_id: publicKeyId
                    }
                )
            } else {
                // Variable
                const response = await octokit.request(
                    'GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}',
                    {
                        owner: owner,
                        repo: repo,
                        environment_name: environmentName,
                        secret_name: name,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    }
                )
                const status = response.status

                if (status === 200) {
                    // Update
                    await octokit.request(
                        'PATCH /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}',
                        {
                            owner: owner,
                            repo: repo,
                            environment_name: environmentName,
                            secret_name: name,
                            value: value,
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        }
                    )
                } else {
                    // Create
                    await octokit.request(
                        'POST /repos/{owner}/{repo}/environments/{environment_name}/secrets',
                        {
                            owner: owner,
                            repo: repo,
                            environment_name: environmentName,
                            secret_name: name,
                            value: value,
                            headers: {
                                'X-GitHub-Api-Version': '2022-11-28'
                            }
                        }
                    )
                }
            }
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

module.exports = {
    run
}
