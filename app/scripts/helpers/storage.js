export default {
  get: (key) => new Promise((resolve, reject) =>
    chrome.storage.local.get(key, (items) => {
      if (!items[key]) return reject();
      return resolve(items[key]);
    })),

  set: (items) => new Promise((resolve, reject) =>
    chrome.storage.local.set(items, () =>
      resolve()
    )),

  clear: () => chrome.storage.local.clear(),
};
