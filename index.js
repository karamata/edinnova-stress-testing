const puppeter = require('puppeteer');
let startIndex = null;
let lastIndex = null;

if (process.argv.length === 3) {
  startIndex = parseInt(process.argv[2], 10);
  lastIndex = parseInt(process.argv[2], 10);
} else if (process.argv.length === 4) {
  startIndex = parseInt(process.argv[2], 10);
  lastIndex = parseInt(process.argv[3], 10);
} else {
  throw new Error('invalid argument');
}

const sleep = async (time = 3000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  })
}

const startBrowser = async email => {
  const browser = await puppeter.launch({
    headless: false,
    args: [`--window-size=1380,820`, '--use-fake-ui-for-media-stream']
  });

  let pages = await browser.pages();

  const page = pages.length === 0 ? await browser.newPage() : pages[0];

  await page.setViewport({
    width: 1280,
    height: 720,
  });

  try {
    console.log('goto https://dev.edinnova.com/course-online/performance-test-demo/');
    await Promise.all([
      page.waitForNavigation({
        timeout: 120000,
        waitUntil: 'domcontentloaded',
      }),
      page.goto('https://dev.edinnova.com/course-online/performance-test-demo/')
    ]);

    await sleep(5000);

    console.log('click .edinnova-login');
    await page.evaluate(() => {
      document.querySelector('.edinnova-login').click();
    });

    await Promise.all([
      page.waitForNavigation({
        timeout: 120000,
        waitUntil: 'domcontentloaded',
      }),
      sleep(5000)
    ]);

    await page.evaluate((params) => {
      document.querySelector('#username').value = params.email;
      document.querySelector('#password').value = 'abc@123456';
      document.querySelector('#kc-login').click();
    }, {
      email,
    });

    await Promise.all([
      page.waitForNavigation({
        timeout: 120000,
        waitUntil: 'domcontentloaded',
      }),
      await sleep(10000)
    ]);

    await page.evaluate(() => {
      document.querySelector('.course-nav-tab-curriculum > a:nth-child(1)').click();

      document.querySelector('.lesson-title').click();
    });

    await sleep(10000);

    pages = await browser.pages();

    const classroomPage = pages[1];

    classroomPage.setViewport({
      width: 1280,
      height: 720,
    });
    
    await classroomPage.evaluate(async () => {
      const sleep = async (time = 3000) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, time);
        })
      }

      await sleep(5000);

      document.querySelector('.modal-dialog.wizard-dialog button.btn:nth-child(1)').click();

      await sleep(5000);

      document.querySelector('.modal-dialog.wizard-dialog button.btn:nth-child(1)').click();

      await sleep(5000);

      document.querySelector('.modal-dialog.wizard-dialog button.btn:nth-child(1)').click();
    });
  } catch (error) {
    page.close();
    browser.close();
    return [];
  }

  return pages;
};

const startTesting = async () => {
  const pages = [];
  for (let idx = startIndex; idx <= lastIndex; idx++) {
    let results = await startBrowser(`student.${idx}@edinnova.com`);

    while(results.length === 0) {
      results = await startBrowser(`student.${idx}@edinnova.com`);
    }

    pages.push(results);
  }
}

startTesting();