export default () => {
  const root = document.getElementById('root');
  const jumbotron = document.createElement('div');
  jumbotron.classList.add('jumbotron');
  const form = document.createElement('form');

  const formGroup = document.createElement('div');
  formGroup.classList.add('form-group', 'mb-4');
  const input = document.createElement('input');
  input.classList.add('form-control');
  input.setAttribute('name', 'link');
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', 'Paste a link to RSS stream...');
  formGroup.appendChild(input);

  const submitButton = document.createElement('button');
  submitButton.classList.add('btn', 'btn-block', 'btn-primary');
  submitButton.setAttribute('type', 'submit');
  submitButton.setAttribute('value', 'Submit');
  submitButton.textContent = 'Submit';

  form.appendChild(formGroup);
  form.appendChild(submitButton);
  jumbotron.appendChild(form);
  root.appendChild(jumbotron);
};
