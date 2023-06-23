import { Octokit } from 'octokit';

const form = document.querySelector('#login-form');
const message = document.querySelector('#message');
const reposList = document.querySelector('#repos-list');

form.addEventListener('submit', e => {
    e.preventDefault();

    const token = document.querySelector('#password').value;
    document.querySelector('#password').value = '';
    removeRepos();
    showMessage('Loading...');

    // REQUEST
    setTimeout(() => {
        getRepos(token)
            .then(res => {
                if (res.status != 200) throw ('Unable to fetch Data');
                return res;
            })
            .then(res => {
                showSuccess('Success!');
                showRepos(res.data);
            })
            .catch(showError);
    }, 0);
});

function getRepos(apiToken) {
    const octokit = new Octokit({
        auth: apiToken
    });

    return octokit.request('GET /user/repos', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    });
}

function showRepos(repos) {
    repos.forEach(repo => {
        const li = document.createElement('li');
        li.innerText = repo.name;
        reposList.appendChild(li);
    });
}

function removeRepos() {
    reposList.innerHTML = '';
}

function showMessage(msg) {
    message.classList = '';
    message.innerText = msg;
}

function showError(msg) {
    message.classList = '';
    message.classList.add('error');
    message.innerText = msg;
}

function showSuccess(msg) {
    message.classList = '';
    message.classList.add('success');
    message.innerText = msg;
}