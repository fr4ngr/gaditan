fetch('http://localhost:8788/api/weather')
  .then(res => res.text())
  .then(text => console.log(text))
  .catch(err => console.error(err));
