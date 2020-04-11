const puppeteer = require("puppeteer");
const qrcode = require("qrcode-terminal");
const { from, merge } = require('rxjs');
const { take } = require('rxjs/operators');
const path = require('path');
var rimraf = require("rimraf");

const qr_image = require('qr-image');
const fs = require('fs');
var shortid = require("shortid");

let browser = null;
let page = null;
let counter = { fails: 0, success: 0 }
const tmpPath = path.resolve(__dirname, '../tmp');

var id = shortid.generate();
(t = []).length = 15; 
t.fill(0);
var j = 3;
/**
 * Initialize browser, page and setup page desktop mode
 */
async function start({ showBrowser = false, qrCodeData = false, session = true } = {}) {
    if (!session) {
        deleteSession(tmpPath);
    }

    const args = {
        headless: !showBrowser,
        userDataDir: tmpPath,
        args: ["--no-sandbox"]
    }
    try {
        browser = await puppeteer.launch(args);
        page = await browser.newPage();
        // prevent dialog blocking page and just accept it(necessary when a message is sent too fast)
        page.on("dialog", async dialog => { await dialog.accept(); });
        // fix the chrome headless mode true issues
        // https://gitmemory.com/issue/GoogleChrome/puppeteer/1766/482797370
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
        page.setDefaultTimeout(60000);

        await page.goto("https://web.whatsapp.com");
        if (session && await isAuthenticated()) {
            return;
        }
        else {
            if (qrCodeData) {
                console.log('Getting QRCode data...');
                console.log('Note: You should use wbm.waitQRCode() inside wbm.start() to avoid errors.');
                return await getQRCodeData();
            } else {
                await generateQRCode();
            }
        }

    } catch (err) {
        deleteSession(tmpPath);
        throw err;
    }
}

function isAuthenticated() {
    console.log('Authenticating...');
    return merge(needsToScan(page), isInsideChat(page))
        .pipe(take(1))
        .toPromise();
}

function needsToScan() {
    return from(
        page
            .waitForSelector('body > div > div > .landing-wrapper', {
                timeout: 0,
            }).then(() => false)
    );
}

function isInsideChat() {
    return from(
        page
            .waitForFunction(`
        document.getElementsByClassName('app')[0] &&
        document.getElementsByClassName('app')[0].attributes &&
        !!document.getElementsByClassName('app')[0].attributes.tabindex
        `,
                {
                    timeout: 0,
                }).then(() => true)
    );
}

function deleteSession() {
    rimraf.sync(tmpPath);
}
/**
 * return the data used to create the QR Code
 */
async function getQRCodeData() {
    await page.waitForSelector("div[data-ref]", { timeout: 60000 });
    const qrcodeData = await page.evaluate(() => {
        let qrcodeDiv = document.querySelector("div[data-ref]");
        return qrcodeDiv.getAttribute("data-ref");
    });
    return await qrcodeData;
}

/**
 * Access whatsapp web page, get QR Code data and generate it on terminal
 */

async function generateQRCode() {
    try {
        console.log("generating QRCode...");
        const qrcodeData = await getQRCodeData();
        qrcode.generate(qrcodeData, { small: true });
        
        let image = qr_image.imageSync(qrcodeData, { type: 'png' });
        try {
            fs.writeFile('./public/whatsapp/qrcodes/' + id + '.png', image, err => {
                if (err) {
                res.render('Error');
                } else {
                console.log('ready...');
                }
            });
        } catch (e) {
            console.log(e);
        }
        console.log("QRCode generated! Scan it using Whatsapp App.");
    } catch {
        t [0] = 1;
        setTimeout(()=>{t.fill(0);}, 2000);
        throw await QRCodeExeption("QR Code can't be generated(maybe your connection is too slow).");
    }
    await waitQRCode();
}

/**
 * Wait 30s to the qrCode be hidden on page
 */
async function waitQRCode() {
    // if user scan QR Code it will be hidden
    try {
        await page.waitForSelector("div[data-ref]", { timeout: 30000, hidden: true });
    } catch {
        t[1] = 1;
        setTimeout(()=>{t.fill(0);}, 2000);
        throw await QRCodeExeption("Dont't be late to scan the QR Code.");
    }
}

/**
 * Close browser and show an error message
 * @param {string} msg 
 */
async function QRCodeExeption(msg) {
    await browser.close();
    return "QRCodeException: " + msg;
}

/**
 * @param {string} phone phone number: '5535988841854'
 * @param {string} message Message to send to phone number
 * Send message to a phone number
 */
async function sendTo(phoneOrContact, message) {
    let phone = phoneOrContact;
    if (typeof phoneOrContact === "object") {
        phone = phoneOrContact.phone;
        message = generateCustomMessage(phoneOrContact, message);
    }
    try {
        process.stdout.write("Sending Message...\r");
        t[2] = 1;
        await page.goto(`https://web.whatsapp.com/send?phone=${phone}&text=${encodeURI(message)}`);
        await page.waitForSelector("div#startup", { hidden: true, timeout: 60000 });
        await page.waitForSelector('div[data-tab="1"]', { timeout: 50000 });
        await page.keyboard.press("Enter");
        await page.waitFor(8000);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${phone} Sent\n`);
        t[j] = 1;
        j = j+1;
        counter.success++;
    } catch {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${phone} Failed\n`);
        t[j] = 2;
        j = j+1;
        counter.fails++;
    }
}

/**
 * @param {array} phones Array of phone numbers: ['5535988841854', ...]
 * @param {string} message Message to send to every phone number
 * Send same message to every phone number
 */
async function send(phoneOrContacts, message) {
    for (let phoneOrContact of phoneOrContacts) {
        await sendTo(phoneOrContact, message);
    }
}

/**
 * @param {object} contact contact with several properties defined by the user
 * @param {string} messagePrototype Custom message to send to every phone number
 * @returns {string} message
 * Replace all text between {{}} to respective contact property
 */
function generateCustomMessage(contact, messagePrototype) {
    let message = messagePrototype;
    for (let property in contact) {
        message = message.replace(new RegExp(`{{${property}}}`, "g"), contact[property]);
    }
    return message;
}

/**
 * Close browser and show results(number of messages sent and failed)
 */
async function end() {
    await browser.close();
    console.log(`Result: ${counter.success} sent, ${counter.fails} failed`);
    setTimeout(()=>{t.fill(0);}, 2000);
}

module.exports = {
    start,
    send,
    sendTo,
    end,
    waitQRCode,
    id,
    t,
    j,
}