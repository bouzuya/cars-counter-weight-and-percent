import Twitter from 'twitter';
import moment from 'moment';

const getUserTimeline = (
  twitter: Twitter,
  options: { userId: string, maxId: number }
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const params: {
      user_id: string,
      count: number,
      include_rts: boolean,
      exclude_replies: boolean,
      max_id?: number
    } = {
      user_id: options.userId,
      count: 200,
      include_rts: false,
      exclude_replies: true
    };
    if (options.maxId) params.max_id = options.maxId;
    twitter.get('statuses/user_timeline', params, (error, timeline) => {
      if (error) {
        reject(error);
      } else {
        resolve(timeline);
      }
    });
  });
};

const getUserTimelineRecursive = (
  twitter: Twitter,
  userId: string,
  until: moment.Moment,
  result: Array<any>,
  maxId?: number
): Promise<any> => {
  return getUserTimeline(twitter, { userId, maxId })
  .then((tweets: Array<any>) => {
    const d = (s) => moment(Date.parse(s));
    const since = moment(until).startOf('day');
    const m = tweets.filter(i => d(i.created_at).isBetween(since, until));
    const r = result.concat(m);
    if (
      tweets.length === 0 ||
      tweets.some(i => d(i.created_at).isAfter(until))
    ) return r;
    const newMaxId: number = tweets[tweets.length - 1].id;
    return getUserTimelineRecursive(twitter, userId, until, r, newMaxId);
  });
}

const fetch = (): Promise<any> => {
  const twitter = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
  const userId = '125962981'; // bouzuya
  const until = moment().subtract(1, 'day').endOf('day');
  return getUserTimelineRecursive(twitter, userId, until, []);
};

export default (callback: (error: Error, counts?: any) => any): void => {
  fetch()
  .then(tweets => {
    const p = /^\s*(\d+\.\d)\s+(\d+)$/;
    const t = tweets.filter(i => i.text.match(p));
    if (t.length === 0) return {};
    const m = t[0].text.match(/^\s*(\d+\.\d)\s+(\d+)$/);
    return {
      weight: parseFloat(m[1]),
      percent: parseInt(m[2])
    };
  })
  .then(counts => callback(null, counts), callback);
};
