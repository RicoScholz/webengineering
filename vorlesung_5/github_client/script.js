// 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

const form = document.querySelector('#login-form');
const message = document.querySelector('#message');
const reposList = document.querySelector('#repos-list');
let octokit = undefined;

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
                if (!res.ok) throw ('Unable to fetch Data');
                return res;
            })
            .then(res => res.json())
            .then(repos => {
                showSuccess('Success!');
                showRepos(repos);
            })
            .catch(showError);
    }, 800);
});

function getRepos(apiToken) {
    return fetch('https://api.github.com/user/repos', {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${apiToken}`
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