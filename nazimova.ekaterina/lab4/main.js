import {
  User,
  groupUsersByFriendCount,
  getUniqueFriends,
  findUsersWithFriend,
  findUsersAboveFriendCount,
  findUsersWithoutFriends,
} from './model.js';

const STORAGE_KEY = 'users_lab4_storage';

let users = [];

function showError(message) {
  const label = document.getElementById('analytics-result');
  if (label) {
    label.textContent = message;
  }
}

function asyncAddUser(id, name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = users.some((u) => u.id === id);
      if (exists) {
        reject(new Error(`Пользователь с ID ${id} уже существует`));
        return;
      }
      try {
        const newUser = new User(id, name, []);
        users.push(newUser);
        resolve(newUser);
      } catch (err) {
        reject(err);
      }
    }, 50);
  });
}

function asyncRemoveUser(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      users = users.filter((u) => u.id !== userId);
      users.forEach((u) => {
        u.removeFriend(userId);
      });
      resolve();
    }, 50);
  });
}

function asyncAddFriend(userId, friendId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        reject(new Error('Пользователь не найден'));
        return;
      }
      try {
        user.addFriend(friendId);
        resolve(user);
      } catch (err) {
        reject(err);
      }
    }, 50);
  });
}

function asyncRemoveFriend(userId, friendId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        reject(new Error('Пользователь не найден'));
        return;
      }
      user.removeFriend(friendId);
      resolve(user);
    }, 50);
  });
}

function saveToStorage() {
  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    friends: u.friends,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  localStorage.setItem('users', JSON.stringify(serialized));
  localStorage.setItem('entities', JSON.stringify(serialized));
}

function loadFromStorage() {
  const saved =
    localStorage.getItem(STORAGE_KEY) ||
    localStorage.getItem('users') ||
    localStorage.getItem('entities');

  if (!saved) {
    return [
      new User(1, 'Алиса', [2, 3]),
      new User(2, 'Борис', [1]),
      new User(3, 'Виктория', [1]),
      new User(4, 'Григорий', []),
    ];
  }
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(
      (item) =>
        new User(Number(item.id), String(item.name), item.friends || []),
    );
  } catch {
    return [];
  }
}

function renderSelectOptions() {
  const select = document.getElementById('user-select-id');
  if (!select) {
    return;
  }
  select.innerHTML = '';
  users.forEach((u) => {
    const opt = document.createElement('option');
    opt.value = String(u.id);
    opt.textContent = `${u.name} (ID: ${u.id})`;
    select.appendChild(opt);
  });
}

function renderUserList(listToRender = users) {
  const container =
    document.querySelector('[data-testid="entity-list"]') ||
    document.getElementById('entity-list-container');
  if (!container) {
    return;
  }
  container.innerHTML = '';

  if (listToRender.length === 0) {
    const emptyNotice = document.createElement('p');
    emptyNotice.textContent = 'Пользователи не найдены.';
    container.appendChild(emptyNotice);
    return;
  }

  listToRender.forEach((user) => {
    const card = document.createElement('article');
    card.className = 'user-card';
    card.setAttribute('data-testid', 'entity-card');

    const title = document.createElement('h3');
    title.textContent = user.name;

    const idMeta = document.createElement('p');
    idMeta.className = 'user-meta';
    idMeta.textContent = `ID: ${user.id} | Друзей: ${user.friendCount}`;

    const friendsBlock = document.createElement('div');
    friendsBlock.className = 'user-friends';

    const friendsLabel = document.createElement('strong');
    friendsLabel.textContent = 'Друзья: ';
    friendsBlock.appendChild(friendsLabel);

    if (user.friends.length === 0) {
      const noFriends = document.createElement('span');
      noFriends.textContent = 'нет';
      friendsBlock.appendChild(noFriends);
    } else {
      user.friends.forEach((fId) => {
        const tag = document.createElement('span');
        tag.className = 'friend-tag';
        tag.textContent = `ID ${fId} `;

        const btnRemoveF = document.createElement('span');
        btnRemoveF.className = 'btn-delete-friend';
        btnRemoveF.textContent = '×';
        btnRemoveF.setAttribute('aria-label', `Удалить связь с ${fId}`);
        btnRemoveF.addEventListener('click', async () => {
          await asyncRemoveFriend(user.id, fId);
          saveToStorage();
          updateUI();
        });

        tag.appendChild(btnRemoveF);
        friendsBlock.appendChild(tag);
      });
    }

    const btnDeleteUser = document.createElement('button');
    btnDeleteUser.type = 'button';
    btnDeleteUser.className = 'btn-danger delete-btn';
    btnDeleteUser.setAttribute('data-testid', 'delete-entity');
    btnDeleteUser.textContent = 'Удалить пользователя';
    btnDeleteUser.addEventListener('click', async () => {
      await asyncRemoveUser(user.id);
      saveToStorage();
      updateUI();
    });

    card.appendChild(title);
    card.appendChild(idMeta);
    card.appendChild(friendsBlock);
    card.appendChild(btnDeleteUser);

    container.appendChild(card);
  });
}

function updateUI() {
  renderUserList();
  renderSelectOptions();
}

function setupListeners() {
  const createForm =
    document.querySelector('[data-testid="entity-form"]') ||
    document.getElementById('create-user-form');

  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idInput =
        createForm.querySelector('input[name="id"]') ||
        document.getElementById('new-user-id');
      const nameInput =
        createForm.querySelector('input[name="name"]') ||
        document.getElementById('new-user-name');

      const idVal = Number.parseInt(idInput.value, 10);
      const nameVal = nameInput.value.trim();

      try {
        await asyncAddUser(idVal, nameVal);
        saveToStorage();
        updateUI();
        idInput.value = '';
        nameInput.value = '';
        showError('');
      } catch (err) {
        showError(err.message);
      }
    });
  }

  const addFriendForm = document.getElementById('add-friend-form');
  if (addFriendForm) {
    addFriendForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const select = document.getElementById('user-select-id');
      const friendInput = document.getElementById('friend-input-id');
      const userId = Number.parseInt(select.value, 10);
      const friendId = Number.parseInt(friendInput.value, 10);

      try {
        await asyncAddFriend(userId, friendId);
        saveToStorage();
        updateUI();
        friendInput.value = '';
        showError('');
      } catch (err) {
        showError(err.message);
      }
    });
  }

  const resultLabel = document.getElementById('analytics-result');

  const btnGroupByFriends = document.getElementById('btn-group-by-friends');
  if (btnGroupByFriends) {
    btnGroupByFriends.addEventListener('click', () => {
      const groups = groupUsersByFriendCount(users);
      const textParts = Object.entries(groups).map(
        ([count, list]) =>
          `Друзей ${count}: ${list.map((u) => u.name).join(', ')}`,
      );
      if (resultLabel) {
        resultLabel.textContent = textParts.join(' | ') || 'Список пуст';
      }
    });
  }

  const btnShowUnique = document.getElementById('btn-show-unique-friends');
  if (btnShowUnique) {
    btnShowUnique.addEventListener('click', () => {
      const unique = getUniqueFriends(users);
      if (resultLabel) {
        resultLabel.textContent = `Уникальные ID друзей: [ ${unique.join(', ')} ]`;
      }
    });
  }

  const btnFilterNoFriends = document.getElementById('btn-filter-no-friends');
  if (btnFilterNoFriends) {
    btnFilterNoFriends.addEventListener('click', () => {
      const lonely = findUsersWithoutFriends(users);
      renderUserList(lonely);
      if (resultLabel) {
        resultLabel.textContent = `Пользователи без друзей (найдено: ${lonely.length})`;
      }
    });
  }

  const btnFilterCommon = document.getElementById('btn-filter-common-friend');
  if (btnFilterCommon) {
    btnFilterCommon.addEventListener('click', () => {
      const input = document.getElementById('filter-common-friend-id');
      const friendId = Number.parseInt(input.value, 10);
      if (Number.isNaN(friendId)) {
        showError('Введите корректный ID друга');
        return;
      }
      const withFriend = findUsersWithFriend(users, friendId);
      renderUserList(withFriend);
      if (resultLabel) {
        resultLabel.textContent = `Пользователи с общим другом ID ${friendId} (найдено: ${withFriend.length})`;
      }
    });
  }

  const btnFilterMoreThan = document.getElementById('btn-filter-more-than');
  if (btnFilterMoreThan) {
    btnFilterMoreThan.addEventListener('click', () => {
      const input = document.getElementById('filter-min-friends-count');
      const minCount = Number.parseInt(input.value, 10);
      if (Number.isNaN(minCount)) {
        showError('Введите число');
        return;
      }
      const filtered = findUsersAboveFriendCount(users, minCount);
      renderUserList(filtered);
      if (resultLabel) {
        resultLabel.textContent = `Пользователи с количеством друзей > ${minCount} (найдено: ${filtered.length})`;
      }
    });
  }

  const btnReset = document.getElementById('btn-reset-filters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      updateUI();
      if (resultLabel) {
        resultLabel.textContent = '';
      }
      const commonInput = document.getElementById('filter-common-friend-id');
      if (commonInput) {
        commonInput.value = '';
      }
      const minInput = document.getElementById('filter-min-friends-count');
      if (minInput) {
        minInput.value = '';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  users = loadFromStorage();
  updateUI();
  setupListeners();
});
