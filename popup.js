document.addEventListener('DOMContentLoaded', () => {
  const accountList = document.getElementById('accountList');
  const addButton = document.getElementById('addAccount');
  const saveButton = document.getElementById('save');
  const messageDiv = document.getElementById('message');
  const watchWordsTextarea = document.getElementById('watchWords');

  function showMessage(text, isSuccess = true) {
    messageDiv.textContent = text;
    messageDiv.className = isSuccess ? 'message success' : 'message error';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 2000);
  }

  function createAccountInput(value = '') {
    const div = document.createElement('div');
    div.className = 'account-item';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'アカウント名';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = () => div.remove();
    
    div.appendChild(input);
    div.appendChild(deleteButton);
    return div;
  }

  addButton.onclick = () => {
    const newInput = createAccountInput();
    accountList.appendChild(newInput);
    newInput.querySelector('input').focus();
  };

  saveButton.onclick = () => {
    const accounts = Array.from(accountList.getElementsByTagName('input'))
      .map(input => input.value.trim())
      .filter(value => value !== '');
    
    const watchWords = watchWordsTextarea.value
      .split('\n')
      .map(word => word.trim())
      .filter(word => word !== '');
    
    chrome.storage.sync.set({ 
      targetAccounts: accounts,
      watchWords: watchWords
    }, () => {
      showMessage('設定を保存しました');
    });
  };

  chrome.storage.sync.get(['targetAccounts', 'watchWords'], (result) => {
    const accounts = result.targetAccounts || [];
    const watchWords = result.watchWords || [];
    
    if (accounts.length === 0) {
      accountList.appendChild(createAccountInput());
    } else {
      accounts.forEach(account => {
        accountList.appendChild(createAccountInput(account));
      });
    }
    
    watchWordsTextarea.value = watchWords.join('\n');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      saveButton.click();
    }
  });
}); 