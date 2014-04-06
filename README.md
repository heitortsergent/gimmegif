# gimmegif

This is a demo application that allows the user to search for GIFs, built with Node.js, that uses both Giphy and the SendGrid API. You can use the website to search for GIFs, or you can email <gimmegif@bymail.in> with a query in the subject, to get an email response back with the GIF and also have that appear in the application using the SendGrid Inbound Parse API.

## Usage

```
cp .env.example .env
```

Edit the contents of `.env`.

```
npm install
node server.js
```
