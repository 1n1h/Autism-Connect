export type MessageAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  state: string | null;
  profile_photo_url: string | null;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export type Thread = {
  otherUser: MessageAuthor;
  lastMessage: Message;
  unreadCount: number;
};
