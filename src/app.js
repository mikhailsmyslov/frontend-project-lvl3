import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';

const proxy = 'https://cors-anywhere.herokuapp.com';

const state = {
  channels: [],
  news: [],
  formState: 'empty',
  errMsgs: [],
};

const handleInput = t => ({ target }) => {
  const { value } = target;
  const { channels } = state;
  const urls = channels.map(({ url }) => url);
  if (!value) {
    state.formState = 'empty';
    state.errMsgs = [];
    return;
  }
  if (value && !isURL(value)) {
    state.formState = 'invalid';
    state.errMsgs.push(t('invalidUrl'));
    return;
  }
  if (urls.includes(value)) {
    state.formState = 'invalid';
    state.errMsgs.push(t('urlAlreadyExist'));
    return;
  }
  state.formState = 'valid';
  state.errMsgs = [];
};

// eslint-disable-next-line no-unused-vars
const handleSubmit = t => (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('rssUrl');
  state.formState = 'sending';
  axios.get(`${proxy}/${url}`)
    .then((res) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/xml');

      const channel = doc.querySelector('channel');
      const title = channel.querySelector('title').textContent;
      const description = channel.querySelector('description').textContent;
      const link = channel.querySelector('link').textContent;

      const channelId = _.uniqueId();

      state.channels.push({
        id: channelId,
        title,
        description,
        link,
        url,
      });

      const items = channel.querySelectorAll('item');
      [...items].forEach((item) => {
        const postTitle = item.querySelector('title').textContent;
        const postDescription = item.querySelector('description').textContent;
        const postLink = item.querySelector('link').textContent;
        state.news.push({
          id: _.uniqueId(),
          channelId,
          title: postTitle,
          description: postDescription,
          link: postLink,
        });
      });
      e.target.reset();
      state.formState = 'empty';
    })
    .catch((err) => {
      state.formState = 'invalid';
      state.errMsgs.push(err.message);
    });
};

export default (t) => {
  const i18nElements = document.querySelectorAll('*[data-i18n]');
  [...i18nElements].forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  const rssForm = document.getElementById('rssForm');
  const rssInput = rssForm.querySelector('input');
  const formFeedBack = rssForm.querySelector('.feedback');
  const submitButton = rssForm.querySelector('*[type=submit]');

  rssInput.addEventListener('input', handleInput(t));
  rssForm.addEventListener('submit', handleSubmit(t));

  watch(state, 'formState', () => {
    const { formState, errMsgs } = state;
    switch (formState) {
      case 'empty':
        rssInput.classList.remove('is-invalid', 'is-valid');
        formFeedBack.textContent = '';
        rssInput.removeAttribute('disabled', '');
        submitButton.setAttribute('disabled', '');
        break;
      case 'valid':
        rssInput.classList.remove('is-invalid');
        rssInput.classList.add('is-valid');
        formFeedBack.textContent = t('formValid');
        rssInput.removeAttribute('disabled', '');
        submitButton.removeAttribute('disabled', '');
        break;
      case 'invalid':
        rssInput.classList.remove('is-valid');
        rssInput.classList.add('is-invalid');
        formFeedBack.textContent = errMsgs.join('. ');
        rssInput.removeAttribute('disabled', '');
        submitButton.setAttribute('disabled', '');
        break;
      case 'sending':
        formFeedBack.textContent = t('loading');
        rssInput.setAttribute('disabled', '');
        submitButton.setAttribute('disabled', '');
        break;
      default:
        break;
    }
  });

  watch(state, 'channels', () => {
    const ul = document.getElementById('channels');
    ul.innerHTML = '';
    state.channels.forEach((channel) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      const a = document.createElement('a');
      a.setAttribute('href', channel.link);
      a.textContent = channel.title;
      const p = document.createElement('p');
      p.textContent = channel.description;
      li.appendChild(a);
      li.appendChild(p);
      ul.appendChild(li);
    });
  });

  watch(state, 'news', () => {
    const ul = document.getElementById('news');
    ul.innerHTML = '';
    state.news.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      const a = document.createElement('a');
      a.setAttribute('href', post.link);
      a.textContent = post.title;
      const p = document.createElement('p');
      p.textContent = post.description;
      li.appendChild(a);
      li.appendChild(p);
      ul.appendChild(li);
    });
  });
};
