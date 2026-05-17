const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079';

export interface ChatMsgDto {
  msgId: number;
  senderId: number;
  senderName: string;
  recipientId?: number | null;
  msgTxt: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationUserDto {
  userId: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('authToken');
  return null;
}

function headers(): HeadersInit {
  const token = getAuthToken();
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function getConversation(userId: number): Promise<ChatMsgDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/ChatMessages/conversation/${userId}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
}

export async function getConversationUsers(): Promise<ConversationUserDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/ChatMessages/conversation-users`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function markMessagesRead(fromUserId: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/ChatMessages/mark-read/${fromUserId}`, {
    method: 'PUT',
    headers: headers(),
  });
}

export async function getDirectPartners(userId: number): Promise<ConversationUserDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/ChatMessages/direct-partners/${userId}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch direct partners');
  return res.json();
}

export async function markDirectMessagesRead(fromUserId: number, toUserId: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/ChatMessages/direct-mark-read/${fromUserId}/${toUserId}`, {
    method: 'PUT',
    headers: headers(),
  });
}

export async function getDirectConversation(user1Id: number, user2Id: number): Promise<ChatMsgDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/ChatMessages/direct/${user1Id}/${user2Id}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch direct conversation');
  return res.json();
}

export async function sendMessage(senderId: number, msgTxt: string, recipientId?: number): Promise<ChatMsgDto> {
  const res = await fetch(`${API_BASE_URL}/api/ChatMessages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ senderId, msgTxt, recipientId: recipientId ?? null }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

