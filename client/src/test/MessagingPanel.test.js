import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

describe('Messaging Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const MockMessagingPanel = ({
    conversations = [],
    messages = [],
    loading = false,
    error = false,
    currentUserId = 'shelter1',
    shelterId = 'shelter1',
    onSendMessage
  }) => {
    const [selectedUserId, setSelectedUserId] = React.useState('');
    const [messageInput, setMessageInput] = React.useState('');

    const formatTime = (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) return <p data-testid="loading">Loading...</p>;
    if (error) return <p data-testid="error">Error loading messages</p>;

    return (
      <div data-testid="messaging-panel">
        <h3 data-testid="title">Messages</h3>
        <div data-testid="conversations-list">
          {conversations.length === 0 ? (
            <p data-testid="empty-conversations">No conversations yet.</p>
          ) : (
            conversations.map((msg) => {
              const otherId = msg.senderId === shelterId ? msg.recipientId : msg.senderId;
              const isUnread = !msg.read && msg.recipientId === currentUserId;
              return (
                <button
                  key={msg._id}
                  data-testid={`conversation-${otherId}`}
                  className={selectedUserId === otherId ? 'selected' : ''}
                  onClick={() => setSelectedUserId(otherId)}
                >
                  <span data-testid={`conv-user-${otherId}`}>{otherId.substring(0, 8)}...</span>
                  <span data-testid={`conv-time-${otherId}`}>{formatTime(msg.createdAt)}</span>
                  {isUnread && <span data-testid={`unread-${otherId}`} className="unread-dot" />}
                  <p data-testid={`conv-preview-${otherId}`}>{msg.content}</p>
                </button>
              );
            })
          )}
        </div>

        <div data-testid="message-thread">
          {!selectedUserId ? (
            <p data-testid="select-prompt">Select a conversation to view messages</p>
          ) : (
            <>
              <div data-testid="messages-container">
                {messages.filter(m =>
                  m.shelterId === shelterId &&
                  (m.senderId === selectedUserId || m.recipientId === selectedUserId)
                ).map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg._id} data-testid={`message-${msg._id}`} className={isMine ? 'sent' : 'received'}>
                      <p data-testid={`msg-content-${msg._id}`}>{msg.content}</p>
                      <span data-testid={`msg-time-${msg._id}`}>{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
              <div data-testid="compose-area">
                <input
                  data-testid="message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      if (onSendMessage) onSendMessage({ recipientId: selectedUserId, content: messageInput.trim() });
                      setMessageInput('');
                    }
                  }}
                />
                <button
                  data-testid="send-btn"
                  disabled={!messageInput.trim()}
                  onClick={() => {
                    if (messageInput.trim() && onSendMessage) {
                      onSendMessage({ recipientId: selectedUserId, content: messageInput.trim() });
                      setMessageInput('');
                    }
                  }}
                >Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const mockConversations = [
    { _id: 'c1', senderId: 'user1', recipientId: 'shelter1', shelterId: 'shelter1', content: 'Hello!', read: false, createdAt: new Date().toISOString() },
    { _id: 'c2', senderId: 'shelter1', recipientId: 'user2', shelterId: 'shelter1', content: 'Your application is approved', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  const mockMessages = [
    { _id: 'm1', senderId: 'user1', recipientId: 'shelter1', shelterId: 'shelter1', content: 'Hello!', read: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'm2', senderId: 'shelter1', recipientId: 'user1', shelterId: 'shelter1', content: 'Hi there!', read: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { _id: 'm3', senderId: 'user1', recipientId: 'shelter1', shelterId: 'shelter1', content: 'Is Buddy available?', read: false, createdAt: new Date().toISOString() }
  ];

  it('should show loading state', () => {
    render(<MockMessagingPanel loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(<MockMessagingPanel error={true} />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('should display title', () => {
    render(<MockMessagingPanel />);
    expect(screen.getByTestId('title')).toHaveTextContent('Messages');
  });

  it('should show empty conversations message', () => {
    render(<MockMessagingPanel conversations={[]} />);
    expect(screen.getByTestId('empty-conversations')).toHaveTextContent('No conversations yet.');
  });

  it('should render conversation list', () => {
    render(<MockMessagingPanel conversations={mockConversations} />);
    expect(screen.getByTestId('conversation-user1')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-user2')).toBeInTheDocument();
  });

  it('should show conversation preview text', () => {
    render(<MockMessagingPanel conversations={mockConversations} />);
    expect(screen.getByTestId('conv-preview-user1')).toHaveTextContent('Hello!');
    expect(screen.getByTestId('conv-preview-user2')).toHaveTextContent('Your application is approved');
  });

  it('should show unread indicator for unread messages', () => {
    render(<MockMessagingPanel conversations={mockConversations} currentUserId="shelter1" />);
    expect(screen.getByTestId('unread-user1')).toBeInTheDocument();
  });

  it('should not show unread indicator for read messages', () => {
    render(<MockMessagingPanel conversations={mockConversations} currentUserId="shelter1" />);
    expect(screen.queryByTestId('unread-user2')).not.toBeInTheDocument();
  });

  it('should show select prompt when no conversation selected', () => {
    render(<MockMessagingPanel conversations={mockConversations} />);
    expect(screen.getByTestId('select-prompt')).toHaveTextContent('Select a conversation to view messages');
  });

  it('should show messages when conversation is selected', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    expect(screen.getByTestId('message-m1')).toBeInTheDocument();
    expect(screen.getByTestId('message-m2')).toBeInTheDocument();
    expect(screen.getByTestId('message-m3')).toBeInTheDocument();
  });

  it('should display message content', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    expect(screen.getByTestId('msg-content-m1')).toHaveTextContent('Hello!');
    expect(screen.getByTestId('msg-content-m2')).toHaveTextContent('Hi there!');
  });

  it('should style sent messages differently from received', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} currentUserId="shelter1" />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    expect(screen.getByTestId('message-m1').className).toContain('received');
    expect(screen.getByTestId('message-m2').className).toContain('sent');
  });

  it('should show compose area when conversation selected', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    expect(screen.getByTestId('compose-area')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-btn')).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    expect(screen.getByTestId('send-btn')).toBeDisabled();
  });

  it('should enable send button when input has text', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });
    expect(screen.getByTestId('send-btn')).not.toBeDisabled();
  });

  it('should call onSendMessage when send is clicked', () => {
    const mockSend = vi.fn();
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} onSendMessage={mockSend} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'New message' } });
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(mockSend).toHaveBeenCalledWith({ recipientId: 'user1', content: 'New message' });
  });

  it('should clear input after sending', () => {
    const mockSend = vi.fn();
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} onSendMessage={mockSend} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByTestId('send-btn'));
    expect(screen.getByTestId('message-input').value).toBe('');
  });

  it('should send message on Enter key', () => {
    const mockSend = vi.fn();
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} onSendMessage={mockSend} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Enter msg' } });
    fireEvent.keyDown(screen.getByTestId('message-input'), { key: 'Enter' });
    expect(mockSend).toHaveBeenCalledWith({ recipientId: 'user1', content: 'Enter msg' });
  });

  it('should not send on Enter when input is empty', () => {
    const mockSend = vi.fn();
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} onSendMessage={mockSend} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    fireEvent.keyDown(screen.getByTestId('message-input'), { key: 'Enter' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should highlight selected conversation', () => {
    render(<MockMessagingPanel conversations={mockConversations} messages={mockMessages} />);
    fireEvent.click(screen.getByTestId('conversation-user1'));
    expect(screen.getByTestId('conversation-user1').className).toContain('selected');
  });

  it('should show timestamps on conversations', () => {
    render(<MockMessagingPanel conversations={mockConversations} />);
    expect(screen.getByTestId('conv-time-user1')).toBeInTheDocument();
    expect(screen.getByTestId('conv-time-user2')).toBeInTheDocument();
  });
});
