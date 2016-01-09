import fetch from './fetch';

export default (callback: (error: Error, counts?: any) => any): void => {
  fetch()
  .then(tweets => {
    const p = /^\s*(\d+\.\d)\s+(\d+)$/;
    const t = tweets.filter(i => i.text.match(p) !== null);
    if (t.length === 0) return {};
    const m = t[0].text.match(/^\s*(\d+\.\d)\s+(\d+)$/);
    return {
      weight: parseFloat(m[1]),
      percent: parseInt(m[2])
    };
  })
  .then(counts => callback(null, counts), callback);
};
