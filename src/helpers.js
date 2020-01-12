import * as _normalizeUrl from 'normalize-url';

export const normalizeUrl = url => _normalizeUrl(url, {
  defaultProtocol: 'http:',
  stripProtocol: true,
  stripWWW: true,
  removeTrailingSlash: true,
  removeDirectoryIndex: true,
  sortQueryParameters: true,
});

export const proxifyUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com';
  return `${proxy}/${normalizeUrl(url)}`;
};

export const compareUrls = (u1, u2) => normalizeUrl(u1) === normalizeUrl(u2);

export const hasUrl = (urls, url) => urls.some(u => compareUrls(u, url));

const getTextContentFromAttr = (item, attrName) => {
  const attr = item.querySelector(attrName);
  return attr ? attr.textContent : null;
};

export const parseRss = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');

  const channelDOM = doc.querySelector('channel');
  if (channelDOM === null) return null;

  const channel = channelDOM && {
    title: getTextContentFromAttr(channelDOM, 'title'),
    description: getTextContentFromAttr(channelDOM, 'description'),
    link: getTextContentFromAttr(channelDOM, 'link'),
  };

  const itemsDOM = doc.querySelectorAll('item');
  const items = itemsDOM && [...itemsDOM].map(item => ({
    guid: getTextContentFromAttr(item, 'guid'),
    title: getTextContentFromAttr(item, 'title'),
    description: getTextContentFromAttr(item, 'description'),
    link: getTextContentFromAttr(item, 'link'),
  }));

  return { channel, items };
};
