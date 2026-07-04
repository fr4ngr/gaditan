const apiKey = process.env.AEMET_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJBQk1FVCIsInN1YiI6InBydWViYUBhZW1ldC5lcyIsImF1ZCI6IkFCTUVUIiwiaWF0IjoxNzEzMTk2NTQ4LCJleHAiOjE4NzA2MDA1NDgsImp0aSI6ImIzZTVmNDM3LTVmZDMtNDM4NC04Yjg4LTcwMmIwYmVmZDlhOSJ9.c-Xz_n8qUaNfO-6q8yO2kI1Y1n0cZqB3j8Ym2b2zTGE"; // dummy key or maybe it doesn't work, let's use a real one if I can
const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/11012';

// Let's just fetch without API key to see if we get 401 or something, wait I don't have the API key in the script!
// Let's read the worker's .env file if it exists, or just grep it from wrangler.toml
