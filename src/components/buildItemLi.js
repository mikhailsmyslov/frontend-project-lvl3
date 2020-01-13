
export default (title, description, link, t) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.textContent = title;
  const btn = document.createElement('button');
  btn.classList.add('btn', 'btn-primary', 'btn-sm');
  btn.dataset.toggle = 'modal';
  btn.dataset.target = '#modal';
  btn.dataset.title = title;
  btn.dataset.body = description;
  btn.textContent = t('more');
  li.appendChild(a);
  li.appendChild(btn);
  return li;
};
