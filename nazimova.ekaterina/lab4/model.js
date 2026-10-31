class User {
  constructor(id, name, friends = []) {
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      throw new TypeError('id must be an integer');
    }
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('name must be a non-empty string');
    }
    if (!Array.isArray(friends)) {
      throw new TypeError('friends must be an array');
    }

    this.id = id;
    this.name = name;
    this.friends = [...new Set(friends)];
  }

  addFriend(friendId) {
    if (typeof friendId !== 'number' || !Number.isInteger(friendId)) {
      throw new TypeError('friendId must be an integer');
    }
    if (friendId === this.id) {
      return;
    }
    if (!this.friends.includes(friendId)) {
      this.friends.push(friendId);
    }
  }

  removeFriend(friendId) {
    if (typeof friendId !== 'number' || !Number.isInteger(friendId)) {
      throw new TypeError('friendId must be an integer');
    }
    this.friends = this.friends.filter((id) => id !== friendId);
  }

  get friendCount() {
    return this.friends.length;
  }
}

function groupUsersByFriendCount(users) {
  if (!Array.isArray(users)) {
    throw new TypeError('users must be an array');
  }
  return users.reduce((acc, user) => {
    const count = user.friendCount;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(user);
    return acc;
  }, {});
}

function getUniqueFriends(users) {
  if (!Array.isArray(users)) {
    throw new TypeError('users must be an array');
  }
  const allFriends = users.flatMap((user) => user.friends);
  return [...new Set(allFriends)];
}

function findUsersWithFriend(users, friendId) {
  if (!Array.isArray(users)) {
    throw new TypeError('users must be an array');
  }
  if (typeof friendId !== 'number' || !Number.isInteger(friendId)) {
    throw new TypeError('friendId must be an integer');
  }
  return users.filter((user) => user.friends.includes(friendId));
}

function findUsersAboveFriendCount(users, minCount) {
  if (!Array.isArray(users)) {
    throw new TypeError('users must be an array');
  }
  if (typeof minCount !== 'number' || !Number.isInteger(minCount)) {
    throw new TypeError('minCount must be an integer');
  }
  return users.filter((user) => user.friendCount > minCount);
}

function findUsersWithoutFriends(users) {
  if (!Array.isArray(users)) {
    throw new TypeError('users must be an array');
  }
  return users.filter((user) => user.friendCount === 0);
}

export {
  User,
  groupUsersByFriendCount,
  getUniqueFriends,
  findUsersWithFriend,
  findUsersWithFriend as getUsersWithCommonFriend,
  findUsersAboveFriendCount,
  findUsersAboveFriendCount as getUsersWithFriendsMoreThan,
  findUsersWithoutFriends,
  findUsersWithoutFriends as getUsersWithoutFriends,
};
