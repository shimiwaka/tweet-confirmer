document.addEventListener('DOMContentLoaded', () => {
  const accountList = document.getElementById('accountList');
  const addButton = document.getElementById('addAccount');
  const saveButton = document.getElementById('save');

  function createAccountInput(value = '') {
    const div = document.createElement('div');
    div.className = 'account-item';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'アカウント名を入力';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.onclick = () => div.remove();
    
    div.appendChild(input);
    div.appendChild(deleteButton);
    return div;
  }

  addButton.onclick = () => {
    accountList.appendChild(createAccountInput());
  };

  saveButton.onclick = () => {
    const accounts = Array.from(accountList.getElementsByTagName('input'))
      .map(input => input.value.trim())
      .filter(value => value !== '');
    
    chrome.storage.sync.set({ targetAccounts: accounts }, () => {
      alert('設定を保存しました');
    });
  };

  chrome.storage.sync.get(['targetAccounts'], (result) => {
    const accounts = result.targetAccounts || [];
    accounts.forEach(account => {
      accountList.appendChild(createAccountInput(account));
    });
  });
}); 