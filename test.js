const express = require('express');
const app = express()
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');


const url = 'https://www.kijiji.ca/t-login.html'


const sender = async (email, subject) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `userMail@gmail.com`,
                pass: `passwordToMail`
            }
        });

        const mailOptions = {
            from: 'testMail',
            to: email,
            attachments: [{
                filename: 'screenshot.png',
                path: './',
                cid: 'unique@kreata.ee' //same cid value as in the html img src
            }]
        };

        await transporter.sendMail(mailOptions);

        return {status: {success: true, message: 'An email was sent'}};
    } catch (e) {
        return {e};
    }
}

app.get('/send', async function main() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);

    if (/HeadlessChrome/.test(navigator.userAgent)) {
        throw new Error(`invalid data`);
    }

    if (navigator.webdriver) {
        throw new Error(`invalid data`);
    }

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    if (!window.chrome) {
        throw new Error(`invalid data`);
    }

    await page.evaluateOnNewDocument(() => {
        window.navigator.chrome = {
            runtime: {},
        };
    });

    if (!window.chrome || !window.chrome.runtime) {
        throw new Error(`invalid data`);
    }

    await page.evaluateOnNewDocument(() => {
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({state: Notification.permission}) :
                originalQuery(parameters)
        );
    });


    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });
    });


    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    });

    await page.goto(`${url}`, {waitUntil: ['load', 'networkidle2']});
    await page.type('#emailOrNickname', `mykola.sirko@workgmail.com`);
    await page.type('#password', `Starapps123@`);

    const element = await page.$('[class="signInButton-3250695435 button-1997310527 button__futurePrimary-3327793552 button__medium-1066667140"]');
    await element.click();

    await page.goto(`${url}`, {waitUntil: 'networkidle0'});
    await page.type('#ProfileName', `Mykola`);

    const checkBox = await page.$('[for="sendFeatureNotificationEmail');
    await checkBox.click();

    const submitChanges = await page.$('[class="button-task"');
    await submitChanges.click();

    await page.reload({waitUntil: ["networkidle0", "domcontentloaded"]});
    await page.screenshot({path: 'screenshot.png'});

    await sender('alex@myadcenter.com', `screenshot`);

})


app.all('*', (req, res) => {
    res.status(400).end();
});


app.listen(3000, (err) => {
    if (err) console.log(err);
    console.log('listen 3000...');
});
