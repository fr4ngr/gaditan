const https = require('https');
const fs = require('fs');

const url = "https://lottiefiles.com/free-animation/calendar-5ysE5sPoN1";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        // search for .json links
        const matches = data.match(/https:\/\/[^"']+\.json/g);
        if (matches) {
            console.log("Found JSON links:");
            const unique = [...new Set(matches)];
            console.log(unique);
        } else {
            console.log("No JSON links found.");
            // write out a piece of the html so we can inspect
            fs.writeFileSync('scratch/lottiefiles.html', data);
            console.log("Saved HTML to scratch/lottiefiles.html");
        }
    });
}).on('error', (e) => {
    console.error(e);
});
