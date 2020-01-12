const proxy = 'https://cors-anywhere.herokuapp.com';
export const proxifyUrl = url => `${proxy}/${url}`;

export const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');

  const channelDOM = doc.querySelector('channel');
  if (channelDOM === null) return null;

  const channel = channelDOM && {
    title: channelDOM.querySelector('title').textContent,
    description: channelDOM.querySelector('description').textContent,
    link: channelDOM.querySelector('link').textContent,
  };

  const itemsDOM = doc.querySelectorAll('item');
  const items = itemsDOM && [...itemsDOM].map(item => ({
    guid: item.querySelector('guid').textContent,
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));

  return { channel, items };
};
