export const onlineUsers = new Map();

export const getSocketId = (userId) => {
  return onlineUsers.get(userId);
};
