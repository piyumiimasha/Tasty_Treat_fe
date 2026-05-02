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
  if (typeof window !== 'undefined') return localStorage.getItem('token');
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

export async function sendMessage(senderId: number, msgTxt: string, recipientId?: number): Promise<ChatMsgDto> {
  const res = await fetch(`${API_BASE_URL}/api/ChatMessages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ senderId, msgTxt, recipientId: recipientId ?? null }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
