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
    await page.goto(`${url}`, {waitUntil: ['load', 'networkidle2']});
    await page.type('#emailOrNickname', `mykola.sirko@workgmail.com`);
    await page.type('#password', `Starapps123@`);
    const element = await page.$('[class="signInButton-3250695435');
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
