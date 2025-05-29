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
  tooltip.textContent = 'このアカウントで大丈夫？';
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
  
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const accountName = getAccountName();
      chrome.storage.sync.get(['targetAccounts'], (result) => {
        const targetAccounts = result.targetAccounts || [];
        if (accountName && targetAccounts.some(targetAccount => 
          accountName.includes(targetAccount)
        )) {
          const shortcut = e.metaKey ? 'Cmd + Enter' : 'Ctrl + Enter';
          alert(`このアカウントでは、${shortcut}での送信はできません`);
        }
      });
      return false;
    }
  }
  
  document.addEventListener('keydown', handleKeyDown, true);
}

function setupAccountMonitoring() {
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
  
  setupWatchWordMonitoring();
  
  waitForElement(accountSelector, () => {
    setupAccountMonitoring();
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

function setupWatchWordMonitoring() {
  let watchWords = [];
  
  chrome.storage.sync.get(['watchWords'], (result) => {
    watchWords = result.watchWords || [];
  });
  
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.watchWords) {
      watchWords = changes.watchWords.newValue || [];
      // 設定変更時に既存のテキストエリアを再チェック
      recheckAllTextareas();
    }
  });
  
  function checkWatchWords(text) {
    if (!text) return false;
    if (watchWords.length === 0) return false;
    
    const lowerText = text.toLowerCase();
    
    for (const word of watchWords) {
      if (!word) continue;
      
      const lowerWord = word.toLowerCase();
      const regex = new RegExp(lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = lowerText.match(regex);
      
      if (matches && matches.length >= 2) {
        return true;
      }
    }
    
    return false;
  }
  
  function updateTextareaBackground(textarea) {
    const text = textarea.value || textarea.textContent || textarea.innerText || '';
    const hasWatchWords = checkWatchWords(text);
    const targetSelector = '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-14lw9ot.r-jxzhtn.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div.css-175oi2r.r-14lw9ot.r-184en5c.TweetBox > div > div.css-175oi2r.r-1h8ys4a > div:nth-child(1) > div > div > div';
    const targetElement = document.querySelector(targetSelector);
    
    if (targetElement) {
      // 現在の背景色状態を確認
      const currentBgColor = targetElement.style.backgroundColor;
      const isCurrentlyRed = currentBgColor === 'rgb(255, 187, 187)' || currentBgColor === '#ffbbbb';
      
      if (hasWatchWords && !isCurrentlyRed) {
        // 監視ワード2回以上検出 & 現在赤くない → 赤くする
        targetElement.style.backgroundColor = '#ffbbbb';
      } else if (!hasWatchWords && isCurrentlyRed) {
        // 監視ワード2回未満 & 現在赤い → リセット
        targetElement.style.backgroundColor = '';
        targetElement.style.removeProperty('background-color');
      }
    }
  }
  
  function recheckAllTextareas() {
    const textareas = document.querySelectorAll('[data-testid^="tweetTextarea"]');
    textareas.forEach(textarea => {
      if (textarea.dataset.watchWordListener) {
        updateTextareaBackground(textarea);
      }
    });
  }
  
  const observer = new MutationObserver(() => {
    const textareas = document.querySelectorAll('[data-testid^="tweetTextarea"]');
    
    textareas.forEach(textarea => {
      if (!textarea.dataset.watchWordListener) {
        textarea.dataset.watchWordListener = 'true';
        
        updateTextareaBackground(textarea);
        
        // inputイベント（文字入力・削除）
        textarea.addEventListener('input', () => {
          updateTextareaBackground(textarea);
        });
        
        // keydownイベント（削除キー検知）
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' || e.key === 'Delete') {
            // 削除操作の場合、少し遅延をかけて処理
            setTimeout(() => {
              updateTextareaBackground(textarea);
            }, 10);
          }
        });
        
        // keyupイベント（キー離した時）
        textarea.addEventListener('keyup', () => {
          updateTextareaBackground(textarea);
        });
        
        // changeイベント（内容変更）
        textarea.addEventListener('change', () => {
          updateTextareaBackground(textarea);
        });
        
        // ペーストイベント
        textarea.addEventListener('paste', () => {
          setTimeout(() => {
            updateTextareaBackground(textarea);
          }, 100);
        });
        
        // cut イベント（切り取り）
        textarea.addEventListener('cut', () => {
          setTimeout(() => {
            updateTextareaBackground(textarea);
          }, 10);
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
} 