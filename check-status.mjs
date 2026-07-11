fetch('https://gaditan.pages.dev/api/admin/status', {
    headers: {
        'Authorization': 'Bearer super-gaditan'
    }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(e => console.error(e));
