const dom = {
    tweets: document.querySelector('.tweets'),
    tweetbox: document.querySelector('#tweetbox-tweet'),
    tweetboxCharlength: document.querySelector('#tweetbox-charlength'),
    tweetboxSubmit: document.querySelector('.tweetbox-submit'),
    tweetboxFullname: document.querySelector('#fullname'),
    tweetboxUsername: document.querySelector('#username')
};

const dev = {
    toggleButton: document.querySelector('.toggle-dev-tools'),
    container: document.querySelector('#dev-tools'),
    mocksOnly: document.querySelector('.dev-mocks-only'),
    randomTweet: document.querySelector('.dev-random-tweet'),
    weatherTweet: document.querySelector('.dev-weather-tweet'),
    dogTweet: document.querySelector('.dev-dog-tweet'),
    deleteAll: document.querySelector('.dev-delete-all')
};

dom.tweetboxFullname.value = localStorage.getItem('fullname');
dom.tweetboxUsername.value = localStorage.getItem('username');

// ========================= EVENT LISTENERS =========================

dom.tweetbox.addEventListener('input', e => {
    dom.tweetboxCharlength.innerText = 280 - dom.tweetbox.value.length;
});

dom.tweetboxSubmit.addEventListener('click', e => {
    if (dom.tweetbox.value.length === 0) {
        dom.tweetbox.classList.add('invalid');
        dom.tweetbox.focus();
        return;
    }

    dom.tweetbox.classList.remove('invalid');
    const toEdit = document.querySelector('[data-edit]');
    toEdit ? updateTweet(toEdit) : newTweetFromInput();
});

dom.tweetboxFullname.addEventListener('change', e => {
    localStorage.setItem('fullname', dom.tweetboxFullname.value);
});

dom.tweetboxUsername.addEventListener('change', e => {
    localStorage.setItem('username', dom.tweetboxUsername.value);
});

// Dev Listeners
dev.toggleButton.addEventListener('click', e => {
    dev.container.classList.toggle('active');
});

dev.mocksOnly.addEventListener('click', e => {
    deleteAll();
    mocks.then(m => m.forEach(createTweet));
});

dev.randomTweet.addEventListener('click', e => {
    mocks
        .then(m => m[Math.floor(Math.random() * m.length)])
        .then(createTweet);
});

dev.weatherTweet.addEventListener('click', e => {
    getWeather().then(createTweet);
});

dev.dogTweet.addEventListener('click', e => {
    getDogTweet().then(createTweet);
});

dev.deleteAll.addEventListener('click', deleteAll);

// ========================= APIs =========================

// Connect to IndexDB and show content
let indexedDB = undefined;
waitForIndexedDB.then(db => {
    indexedDB = db;
    readDataFromDatabase(db).then(data => data.forEach(tweet => tweetFactory(tweet.value, tweet.key)));
});

const mocks = fetch('assets/tweet_mocks.json')
    .then(res => res.json())
    .then(data => data.tweets);

function getWeather() {
    return fetch('https://api.open-meteo.com/v1/forecast?latitude=48.78&longitude=9.18&timezone=Europe/Berlin&hourly=temperature_2m')
        .then(res => res.json())
        .then(data => {
            return {
                fullname: 'Open Meteo',
                username: 'weather',
                tweetMessage: `In Stuttgart hat es gerade ${data.hourly.temperature_2m[0]}°C #HOT ☀️⚡️🌧️`,
                image: 'https://images.theconversation.com/files/232705/original/file-20180820-30593-1nxanpj.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=1200.0&fit=crop'
            };
        });
}

function getDogTweet() {
    return fetch('https://dog.ceo/api/breeds/image/random')
        .then(res => res.json())
        .then(data => {
            return {
                fullname: 'Dog Diggle',
                username: 'hund',
                tweetMessage: 'Ich bin ein räudiger Hund #WHOLETTHEDOGSOUT 🐶🐕🐕‍🦺🦮🦴🤩',
                image: data.message
            };
        });
}

// ========================= C R U D =========================

function createTweet(tweet) {
    addTweetToDatabase(indexedDB, tweet)
        .then(key => tweetFactory(tweet, key));
}

function updateTweet(tweetContainer) {
    const newMessage = dom.tweetbox.value;
    tweetContainer.querySelector('.tweet-text').innerText = newMessage;
    tweetContainer.removeAttribute('data-edit');
    tweetContainer.scrollIntoView();
    dom.tweetboxSubmit.innerText = 'Tweet';
    dom.tweetbox.value = '';
    dom.tweetboxCharlength.innerText = 280;

    const key = tweetContainer.getAttribute('data-dbkey');
    getTweetByKeyFromDatabase(indexedDB, key)
        .then(tweet => {
            tweet.tweetMessage = newMessage;
            updateByKeyFromDatabase(indexedDB, tweet, key);
        });
}

function onTweetDelete(el) {
    const tweetContainer = el.closest('.tweet');
    const key = tweetContainer.getAttribute('data-dbkey');
    tweetContainer.remove();
    deleteByKeyFromDatabase(indexedDB, key);
}

function deleteAll() {
    dom.tweets.innerHTML = '';
    deleteAllFromDatabase(indexedDB);
}

// ========================= DOM / UTILS =========================

function newTweetFromInput() {
    let tweet = {
        fullname: localStorage.getItem('fullname'),
        username: localStorage.getItem('username'),
        tweetMessage: ''
    };

    if (!tweet.username) {
        dom.tweetboxUsername.classList.add('invalid');
        dom.tweetboxUsername.focus();
    };

    if (!tweet.fullname) {
        dom.tweetboxFullname.classList.add('invalid');
        dom.tweetboxFullname.focus();
    };

    if (!tweet.username || !tweet.fullname) return;

    tweet.tweetMessage = dom.tweetbox.value;
    dom.tweetboxUsername.classList.remove('invalid');
    dom.tweetboxFullname.classList.remove('invalid');
    dom.tweetboxCharlength.innerText = 280;
    dom.tweetbox.value = '';

    createTweet(tweet);
}

function onTweetEdit(el) {
    const tweet = el.closest('.tweet');
    dom.tweetbox.focus();
    dom.tweetbox.value = tweet.querySelector('.tweet-text').innerText;
    dom.tweetboxFullname.value = tweet.querySelector('.tweet-name').innerText;
    dom.tweetboxUsername.value = tweet.querySelector('.tweet-username').innerText.slice(1);
    tweet.setAttribute('data-edit', "");
    dom.tweetboxSubmit.innerText = 'Update';
    dom.tweetboxCharlength.innerText = 280 - tweet.querySelector('.tweet-text').innerText.length;
}

function tweetFactory(tweet, key) {
    if (!tweet.fullname || !tweet.username || !tweet.tweetMessage) return;
    if (!tweet.timestamp) tweet.timestamp = `${Math.floor(Math.random() * 100) % 60} Min.`;

    // create elements
    const tweet_div = document.createElement('div');
    const tweet_caption = document.createElement('div');
    const tweet_name = document.createElement('span');
    const tweet_username = document.createElement('span');
    const tweet_time = document.createElement('span');
    const tweet_buttons = document.createElement('div');
    const tweet_edit_button = document.createElement('button');
    const tweet_edit_img = document.createElement('img');
    const tweet_delete_button = document.createElement('button');
    const tweet_delete_img = document.createElement('img');
    const tweet_content = document.createElement('div');
    const tweet_text = document.createElement('span');

    // add classes
    tweet_div.setAttribute('data-dbkey', key);
    tweet_div.classList = 'tweet';
    tweet_caption.classList = 'tweet-caption';
    tweet_name.classList = 'tweet-name';
    tweet_username.classList = 'tweet-username';
    tweet_time.classList = 'tweet-time';
    tweet_buttons.classList = 'tweet-buttons';
    tweet_edit_img.classList = 'tweet-edit';
    tweet_delete_img.classList = 'tweet-delete';
    tweet_text.classList = 'tweet-text';
    tweet_content.classList = 'tweet-content';

    // edit button
    tweet_edit_img.src = 'assets/edit.svg';
    tweet_edit_img.alt = 'Edit';
    tweet_edit_img.width = 22;
    tweet_edit_img.height = 22;
    tweet_edit_img.addEventListener('click', e => onTweetEdit(tweet_edit_img));

    // delete button
    tweet_delete_img.src = 'assets/delete.svg';
    tweet_delete_img.alt = 'Delete';
    tweet_delete_img.width = 22;
    tweet_delete_img.height = 22;
    tweet_delete_img.addEventListener('click', e => onTweetDelete(tweet_delete_img));

    // tweet content
    tweet_name.innerText = tweet.fullname;
    tweet_username.innerText = `@${tweet.username}`;
    tweet_time.innerText = tweet.timestamp;
    tweet_text.innerText = tweet.tweetMessage;

    // append to dom
    tweet_caption.append(tweet_name);
    tweet_caption.append(tweet_username);
    tweet_caption.append(tweet_time);
    tweet_edit_button.append(tweet_edit_img);
    tweet_delete_button.append(tweet_delete_img);
    tweet_buttons.append(tweet_edit_button);
    tweet_buttons.append(tweet_delete_button);
    tweet_caption.append(tweet_buttons);
    tweet_content.append(tweet_text);

    if (tweet.image) {
        const tweet_image = document.createElement('img');
        tweet_image.classList = 'tweet-image';
        tweet_image.src = tweet.image;
        tweet_image.alt = "Cute Dog";
        tweet_image.width = 400;
        tweet_image.height = 400;
        tweet_content.append(tweet_image);
    }

    tweet_div.append(tweet_caption);
    tweet_div.append(tweet_content);
    dom.tweets.prepend(tweet_div);
}
