
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
  btn.textContent = t('more');
  btn.addEventListener('click', () => {
    const modal = document.getElementById('modal');
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = description;
  });
  li.appendChild(a);
  li.appendChild(btn);
  return li;
};
