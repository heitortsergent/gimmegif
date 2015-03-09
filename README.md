<p align="center">
<img align="center" src="omg.gif" width="330" alt="OMG GIF"/>
</p>


# gimmegif

This is a demo application that allows the user to search for GIFs, built with Node.js, that uses both Giphy and the SendGrid API. You can use the website to search for GIFs, or you can email <gif@heitortsergent.bymail.in> with a query in the subject, to get an email response back with the GIF and also have that appear in the application using the SendGrid Inbound Parse API.

## Live Example

Head over to [https://rocky-reaches-6505.herokuapp.com/](https://rocky-reaches-6505.herokuapp.com/) to see the app running. You can search inside the app for a GIF, or by sending an email to [gif@heitortsergent.bymail.in](mailto:gif@heitortsergent.bymail.in) . Anyone with the web page open will see the GIF that was requested.

## Usage

Create a [free SendGrid account](http://sendgrid.com/user/signup).

Clone the repository by running:

```
git clone https://github.com/heitortsergent/gimmegif.git
```

Create your local copy of the .env.example file by running:

```
cp .env.example .env
```

We're using the [dotenv](https://github.com/scottmotte/dotenv) library to handle env variables. Edit the contents of `.env`, changing the variables `SENDGRID_USER` and `SENDGRID_PASSWORD` to your SendGrid credentials. The `GIPHY_API_KEY` is a public key they have available over at their [repository](https://github.com/giphy/GiphyAPI). They have instructions for getting a private key for production in there.

```
SENDGRID_USER=your_sendgrid_username
SENDGRID_PASSWORD=your_sendgrid_password
GIPHY_API_KEY="dc6zaTOxFJmzC"
```

After making the changes, to test the app just run:

```
npm install
node server.js
```

### Testing locally with azk

If you have [azk](http://www.azk.io/) installed, just run:

```
$ azk start
```

And that will also setup ngrok for you. ;)

##SendGrid Inbound Parse Webhook

[Follow this tutorial](http://sendgrid.com/blog/parse-webhook-tutorial/) by [scottmotte](https://github.com/scottmotte/) for help setting up the SendGrid Inbound Parse Webhook. What you'll have to do is basically:

+ Point your domain's MX record to `mx.sendgrid.net`
+ Add an entry for the domain in [your parse API settings](http://sendgrid.com/developer/reply)

You'll have to change the `applicationReplyUrl` variable inside `server.js` for the user to receive back the email with the GIF.

```
var applicationReplyUrl = "http://yourappurl.jit.su/reply";
```

You can easily test the inbound webhook using ngrok by running:

```
node server.js
```

Open a new terminal window and run:

```
ngrok 3000
```

ngrok should give you a url similar to this:

```
http://1884d72b.ngrok.com
```

That's the URL you should set up inside [your SendGrid parse API settings](http://sendgrid.com/developer/reply).

## Deploy

You can easily deploy the app by using [Nodejitsu](https://www.nodejitsu.com/). 

First of all, open `package.json` and change the `domains` and `subdomains` to the URL you want to use.

```
"subdomain": "yoururl",
"domains": [
"yoururl.com",
"www.yoururl.com"
],
```

After that, create a Nodejitsu account, install the [jitsu CLI](https://github.com/nodejitsu/jitsu) and log in. For the SendGrid email to be sent back, after the user requests it through the Inbound Parse Webhook, you need to set the env variables inside nodejitsu:

```
jitsu env set SENDGRID_USER your_sendgrid_username
jitsu env set SENDGRID_USER your_sendgrid_password
jitsu env set GIPHY_API_KEY your_giphy_api_key
```

And finally run:

```
jitsu deploy
```
