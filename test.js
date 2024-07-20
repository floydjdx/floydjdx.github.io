document.write("Hello world");

fetch('http://dummyjson.com/test')
.then(res => res.json())
.then(data => document.body.append(data))
.catch(err => document.body.append(err.message));

function makeRequestWithForm(url, method, data) {
  const form = document.createElement('form');
  form.method = method;
  form.action = url;
  form.style.display = 'none';

  for (const key in data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

makeRequestWithForm('http://dummyjson.com/test', "POST")
