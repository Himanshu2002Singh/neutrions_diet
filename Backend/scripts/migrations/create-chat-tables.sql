-- Create chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  memberId INTEGER NOT NULL,
  lastMessage TEXT,
  lastMessageAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE(userId, memberId)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversationId INTEGER NOT NULL,
  senderId INTEGER NOT NULL,
  senderType TEXT NOT NULL CHECK(senderType IN ('user', 'member')),
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(senderId);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(userId);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_member ON chat_conversations(memberId);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(lastMessageAt DESC);

