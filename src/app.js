import isURL from 'validator/lib/isURL';
import axios from 'axios';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import { proxifyUrl, parse } from './helpers';
import buildItemLi from './components/buildItemLi';
import buildChannelLi from './components/buildChannelLi';

const updateRss = (url, state, interval) => axios
  .get(proxifyUrl(url))
  .then((res) => {
    const parsed = parse(res.data);
    if (res.status === 200 && parsed === null) throw new Error('notRss');
    const { channel, items } = parsed;
    const newItems = items.map(item => ({ ...item, channelUrl: url }));
    const { channels, items: oldItems } = state;

    const urls = channels.map(c => c.url);
    if (!urls.includes(url)) channels.push({ ...channel, url });

    state.items = _.unionBy(newItems, oldItems, ({ guid }) => guid);

    setTimeout(() => updateRss(url, state, interval), interval);
  });

const handleInput = (state, t) => ({ target }) => {
  const { value } = target;
  const urls = state.channels.map(({ url }) => url);
  state.errMsgs = [];
  switch (true) {
    case !value:
      state.formState = 'empty';
      break;
    case value && !isURL(value):
      state.formState = 'invalid';
      state.errMsgs.push(t('invalidUrl'));
      break;
    case urls.includes(value):
      state.formState = 'invalid';
      state.errMsgs.push(t('urlAlreadyExist'));
      break;
    default:
      state.formState = 'valid';
  }
};

const handleSubmit = (state, t) => (event) => {
  event.preventDefault();
  const { target } = event;

  const formData = new FormData(target);
  const url = formData.get('rssUrl');

  state.formState = 'sending';

  updateRss(url, state, 5000, t)
    .catch(err => state.errMsgs.push(t(err.message)))
    .finally(() => {
      state.formState = _.isEmpty(state.errMsgs) ? 'empty' : 'invalid';
    });
};


export default (t) => {
  if (t) {
    const i18nElements = document.querySelectorAll('*[data-i18n]');
    [...i18nElements].forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
  }

  const state = {
    channels: [],
    items: [],
    formState: 'empty',
    errMsgs: [],
  };

  const rssForm = document.getElementById('rssForm');
  const rssInput = rssForm.querySelector('input');
  const formFeedBack = rssForm.querySelector('.feedback');
  const submitButton = rssForm.querySelector('*[type=submit]');

  rssInput.addEventListener('input', handleInput(state, t));
  rssForm.addEventListener('submit', handleSubmit(state, t));

  watch(state, 'formState', () => {
    const { formState, errMsgs } = state;
    switch (formState) {
      case 'empty':
        rssInput.classList.remove('is-invalid', 'is-valid');
        formFeedBack.textContent = '';
        rssForm.reset();
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
    state.channels.forEach(({ title, description, link }) => {
      const li = buildChannelLi(title, description, link, t);
      ul.appendChild(li);
    });
  });

  watch(state, 'items', () => {
    const ul = document.getElementById('items');
    ul.innerHTML = '';
    state.items.forEach(({ title, description, link }) => {
      const li = buildItemLi(title, description, link, t);
      ul.appendChild(li);
    });
  });
};
