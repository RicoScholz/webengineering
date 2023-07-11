const openRequest = indexedDB.open('TwitterDB', 1);

const waitForIndexedDB = new Promise((resolve, reject) => {
    openRequest.onerror = e => reject(e.target.errorCode);
    openRequest.onsuccess = e => resolve(e.target.result);
    openRequest.onupgradeneeded = e => {
        e.target.result.createObjectStore('tweetStore', { autoIncrement: true });
        resolve(e.target.result);
    };
});

function readDataFromDatabase(db) {
    const data = [];

    const request = db.transaction(['tweetStore'], 'readonly')
        .objectStore('tweetStore')
        .openCursor();

    return new Promise((resolve, reject) => {
        request.onerror = e => reject(e.target.errorCode);
        request.onsuccess = e => {
            const cursor = e.target.result;

            if (cursor) {
                let key = cursor.primaryKey;
                let value = cursor.value;
                data.push({ key: key, value: value });
                cursor.continue();
            } else {
                resolve(data);
            }
        };
    });
}

function getTweetByKeyFromDatabase(db, key) {
    key = parseInt(key);
    const request = db.transaction('tweetStore', 'readonly')
        .objectStore('tweetStore')
        .get(key);

    return new Promise((resolve, reject) => {
        request.onerror = e => reject(e.target.errorCode);
        request.onsuccess = e => resolve(request.result);
    });
}

function addTweetToDatabase(db, tweet) {
    if (!tweet) return;

    const request = db.transaction(['tweetStore'], 'readwrite')
        .objectStore('tweetStore')
        .add(tweet);

    return new Promise((resolve, reject) => {
        request.onerror = e => reject(e.target.errorCode);
        request.onsuccess = e => resolve(request.result);
    });
}

function updateByKeyFromDatabase(db, tweet, key) {
    key = parseInt(key);
    const request = db.transaction('tweetStore', 'readwrite')
        .objectStore('tweetStore')
        .put(tweet, key);
}

function deleteByKeyFromDatabase(db, key) {
    key = parseInt(key);
    const request = db.transaction('tweetStore', 'readwrite')
        .objectStore('tweetStore')
        .delete(key);
}

function deleteAllFromDatabase(db) {
    const request = db.transaction(['tweetStore'], 'readwrite')
        .objectStore('tweetStore')
        .clear();
}
