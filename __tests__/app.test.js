import { promises as fs } from 'fs';
import path from 'path';
import { html } from 'js-beautify';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { waitForDomChange } from '@testing-library/dom';
import { proxifyUrl } from '../src/helpers';
import app from '../src/app';

const baseUrl = 'http://test.com';
const requestInterval = 2500;

const htmlOptions = {
  preserve_newlines: true,
  unformatted: [],
};

let form;
let input;
let feedback;
let items;

const getTree = () => html(document.body.innerHTML, htmlOptions);

beforeAll(() => {
  nock.disableNetConnect();
  nock(proxifyUrl(baseUrl))
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/404')
    .reply(404)
    .get('/503')
    .reply(503)
    .get('/rss')
    .replyWithFile(200, path.resolve(__dirname, '__fixtures__/rss1.xml'))
    .get('/rss')
    .replyWithFile(200, path.resolve(__dirname, '__fixtures__/rss2.xml'));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(async () => {
  const pathToInitHtml = path.resolve(__dirname, '__fixtures__/index.html');
  const initHtml = await fs.readFile(pathToInitHtml, 'utf8');
  document.documentElement.innerHTML = initHtml;

  form = document.getElementById('rssForm');
  input = form.querySelector('input');
  feedback = form.querySelector('.feedback');
  items = document.getElementById('items');

  app(null, requestInterval);
});

test('Should validate URL\'s', async () => {
  input.setAttribute('value', 'invalidUrl');
  await userEvent.type(input, 'invalidUrl', { allAtOnce: true });
  await waitForDomChange({ container: feedback });
  expect(getTree()).toMatchSnapshot();

  input.setAttribute('value', 'valid-url.com');
  await userEvent.type(input, 'valid-url.com', { allAtOnce: true });
  await waitForDomChange({ container: feedback });
  expect(getTree()).toMatchSnapshot();
});

test('Should handle 4xx errors', async () => {
  input.setAttribute('value', `${baseUrl}/404`);
  await form.dispatchEvent(new Event('submit'));
  await waitForDomChange({ container: feedback });
  expect(getTree()).toMatchSnapshot();
});

test('Should handle 5xx errors', async () => {
  input.setAttribute('value', `${baseUrl}/503`);
  await form.dispatchEvent(new Event('submit'));
  await waitForDomChange({ container: feedback });
  expect(getTree()).toMatchSnapshot();
});

test('App', async () => {
  input.setAttribute('value', `${baseUrl}/rss`);
  await form.dispatchEvent(new Event('submit'));
  await waitForDomChange({ container: items });
  expect(getTree()).toMatchSnapshot();

  await waitForDomChange({ container: items });
  expect(getTree()).toMatchSnapshot();
});

test('Should have immutable state', async () => {
  expect(getTree()).toMatchSnapshot();
});
