export default (title, description, link) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.textContent = title;
  const p = document.createElement('p');
  p.textContent = description;
  li.appendChild(a);
  li.appendChild(p);
  return li;
};
