fetch('https://cadiz-taxi.pages.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'hola' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
