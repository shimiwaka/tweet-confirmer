const targetUrls = [
  'https://twitter.com/*',
  'https://x.com/*'
];

function getAccountName() {
  const selector = '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > header > div > div > div > div.css-175oi2r.r-184id4b > div > button';
  const element = document.querySelector(selector);
  return element ? element.textContent.trim() : null;
}

function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    background-color: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 9999;
    display: none;
    pointer-events: none;
  `;
  tooltip.textContent = '鍵垢じゃないけど大丈夫？';
  document.body.appendChild(tooltip);
  return tooltip;
}

function setupTweetButtonTooltip() {
  const tweetButtonSelectors = [
    '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-14lw9ot.r-jxzhtn.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div.css-175oi2r.r-14lw9ot.r-184en5c.TweetBox > div > div.css-175oi2r.r-1h8ys4a > div:nth-child(1) > div > div > div > div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-1h8ys4a.r-1bylmt5.r-13tjlyg.r-7qyjyx.r-1ftll1t > div.css-175oi2r.r-14lw9ot.r-jumn1c.r-xd6kpl.r-gtdqiz.r-ipm5af.r-184en5c > div:nth-child(2) > div > div > div > button',
    '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-14lw9ot.r-jxzhtn.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div.css-175oi2r.r-14lw9ot.r-184en5c > div > div.css-175oi2r.r-1h8ys4a > div:nth-child(1) > div > div > div > div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-1h8ys4a.r-1bylmt5.r-13tjlyg.r-7qyjyx.r-1ftll1t > div.css-175oi2r.r-14lw9ot.r-jumn1c.r-xd6kpl.r-gtdqiz.r-ipm5af.r-184en5c > div:nth-child(2) > div > div > div > button > div > span > span'
  ];
  
  const tooltip = createTooltip();
  
  function showTooltip(e) {
    tooltip.style.display = 'block';
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';
  }
  
  function hideTooltip() {
    tooltip.style.display = 'none';
  }
  
  function updateTooltipPosition(e) {
    if (tooltip.style.display === 'block') {
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY + 10 + 'px';
    }
  }
  
  const observer = new MutationObserver((mutations) => {
    for (const selector of tweetButtonSelectors) {
      const tweetButton = document.querySelector(selector);
      if (tweetButton) {
        tweetButton.addEventListener('mouseenter', showTooltip);
        tweetButton.addEventListener('mouseleave', hideTooltip);
        tweetButton.addEventListener('mousemove', updateTooltipPosition);
        break;
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function setupKeyboardShortcut() {
  const tweetBoxSelector = '[data-testid="tweetTextarea_0"]';
  let isAlertShown = false;
  
  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      const accountName = getAccountName();
      chrome.storage.sync.get(['targetAccounts'], (result) => {
        const targetAccounts = result.targetAccounts || [];
        if (accountName && targetAccounts.some(targetAccount => 
          accountName.includes(targetAccount)
        ) && !isAlertShown) {
          isAlertShown = true;
          setTimeout(() => {
            alert('これは鍵垢じゃありません');
          }, 0);
        }
      });
    }
  }
  
  document.addEventListener('keydown', handleKeyDown, true);
}

function changeBackgroundColor() {
  const currentUrl = window.location.href;
  
  if (targetUrls.some(url => {
    const pattern = new RegExp('^' + url.replace(/\*/g, '.*') + '$');
    return pattern.test(currentUrl);
  })) {
    chrome.storage.sync.get(['targetAccounts'], (result) => {
      const targetAccounts = result.targetAccounts || [];
      const accountName = getAccountName();
      
      if (accountName && targetAccounts.some(targetAccount => 
        accountName.includes(targetAccount)
      )) {
        document.body.style.backgroundColor = '#fff0f0';
        setupTweetButtonTooltip();
        setupKeyboardShortcut();
      }
    });
  }
}

function waitForElement(selector, callback, maxAttempts = 50) {
  let attempts = 0;
  
  function checkElement() {
    const element = document.querySelector(selector);
    if (element) {
      callback();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkElement, 100);
    }
  }
  
  checkElement();
}

function initialize() {
  const accountSelector = '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > header > div > div > div > div.css-175oi2r.r-184id4b > div > button';
  
  waitForElement(accountSelector, () => {
    changeBackgroundColor();
  });
}

// ページ読み込み完了時に初期化
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

// URL変更時にも初期化
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    initialize();
  }
}).observe(document, { subtree: true, childList: true }); 