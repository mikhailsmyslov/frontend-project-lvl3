import isURL from 'validator/lib/isURL';
import axios from 'axios';
import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import {
  proxifyUrl, parseRss, hasUrl, normalizeUrl,
} from './helpers';
import buildItemLi from './components/buildItemLi';
import buildChannelLi from './components/buildChannelLi';

const handleInput = (state, t) => ({ target }) => {
  const { value } = target;
  const urls = state.channels.map(({ url }) => url);
  state.input = value;
  state.errMsgs = [];
  switch (true) {
    case !value:
      state.formState = 'empty';
      break;
    case value && !isURL(value):
      state.formState = 'invalid';
      state.errMsgs.push(t('invalidUrl'));
      break;
    case hasUrl(urls, value):
      state.formState = 'invalid';
      state.errMsgs.push(t('urlAlreadyExist'));
      break;
    default:
      state.formState = 'valid';
  }
};

const runPeriodiсRssUpdate = (url, state, interval, t) => axios
  .get(proxifyUrl(url))
  .then(({ status, data }) => {
    const parsed = parseRss(data);
    if (status === 200 && parsed === null) {
      throw new Error(t('notRss'));
    }

    const normalizedUrl = normalizeUrl(url);
    const newChannel = { ...parsed.channel, url: normalizedUrl };
    const newItems = parsed.items.map(item => ({ ...item, channelUrl: normalizedUrl }));
    const { channels, items } = state;
    const urls = channels.map(c => c.url);

    if (!hasUrl(urls, url)) channels.push(newChannel);
    state.items.unshift(..._.differenceBy(newItems, items, ({ guid }) => guid));

    setTimeout(() => runPeriodiсRssUpdate(url, state, interval, t), interval);
  });

const handleSubmit = (state, period, t) => (event) => {
  event.preventDefault();
  const { target } = event;

  const formData = new FormData(target);
  const url = formData.get('rssUrl');

  state.formState = 'sending';

  runPeriodiсRssUpdate(url, state, period, t)
    .catch((err) => {
      state.errMsgs.push(err.message);
      console.error(err);
    })
    .finally(() => {
      state.formState = _.isEmpty(state.errMsgs) ? 'empty' : 'invalid';
    });
};


export default (translate, period = 5000) => {
  const t = translate || _.identity;
  if (translate) {
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
    input: '',
  };

  const rssForm = document.getElementById('rssForm');
  const rssInput = rssForm.querySelector('input');
  const formFeedBack = rssForm.querySelector('.feedback');
  const submitButton = rssForm.querySelector('*[type=submit]');
  const channelsUl = document.getElementById('channels');
  const itemsUl = document.getElementById('items');

  rssInput.addEventListener('input', handleInput(state, t));
  rssForm.addEventListener('submit', handleSubmit(state, period, t));

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
    channelsUl.innerHTML = '';
    state.channels.forEach(({ title, description, link }) => {
      const li = buildChannelLi(title, description, link, t);
      channelsUl.appendChild(li);
    });
  });

  watch(state, 'items', () => {
    itemsUl.innerHTML = '';
    state.items.forEach(({ title, description, link }) => {
      const li = buildItemLi(title, description, link, t);
      itemsUl.appendChild(li);
    });
  });

  watch(state, 'input', () => {
    rssInput.value = state.input.toString().trim().toLowerCase();
  });

  $('#modal').on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const title = button.data('title');
    const body = button.data('body');
    const modal = $(event.target);
    modal.find('.modal-title').text(title);
    modal.find('.modal-body').html(body);
  });
};
