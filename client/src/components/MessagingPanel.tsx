import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ShelterConversationsResponse, ConversationMessagesResponse, Message } from "../types";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";

const { SHELTER_CONVERSATIONS, CONVERSATION_MESSAGES } = Queries;
const { SEND_MESSAGE } = Mutations;

interface MessagingPanelProps {
  shelterId: string;
  currentUserId: string;
}

interface MessagingPanelState {
  selectedUserId: string;
  messageInput: string;
}

class MessagingPanel extends Component<MessagingPanelProps, MessagingPanelState> {
  constructor(props: MessagingPanelProps) {
    super(props);
    this.state = {
      selectedUserId: "",
      messageInput: ""
    };
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  renderConversationList(conversations: Message[]) {
    if (conversations.length === 0) {
      return (
        <p className="text-muted-foreground text-sm text-center py-4">
          No conversations yet.
        </p>
      );
    }

    return (
      <div className="space-y-1">
        {conversations.map((msg) => {
          const otherId = msg.senderId === this.props.shelterId ? msg.recipientId : msg.senderId;
          const isSelected = otherId === this.state.selectedUserId;
          const isUnread = !msg.read && msg.recipientId === this.props.currentUserId;

          return (
            <button
              key={msg._id}
              onClick={() => this.setState({ selectedUserId: otherId })}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isSelected ? "bg-sky-100 border-sky-300 border" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-800 truncate">
                  {otherId.substring(0, 8)}...
                </span>
                <span className="text-xs text-gray-400">{this.formatTime(msg.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {isUnread && <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />}
                <p className={`text-xs truncate ${isUnread ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                  {msg.content}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  renderMessageThread() {
    if (!this.state.selectedUserId) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Select a conversation to view messages
        </div>
      );
    }

    return (
      <Query<ConversationMessagesResponse>
        query={CONVERSATION_MESSAGES}
        variables={{ userId: this.state.selectedUserId, shelterId: this.props.shelterId }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          if (loading) return <p className="text-gray-500 animate-pulse p-4">Loading messages...</p>;
          if (error) return <p className="text-red-500 p-4">Error loading messages</p>;

          const messages = data?.conversationMessages || [];

          return (
            <div className="flex flex-col h-72">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center">No messages in this conversation</p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === this.props.currentUserId;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          isMine ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-800"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-0.5 ${isMine ? "text-sky-100" : "text-gray-400"}`}>
                            {this.formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="border-t p-3">
                <Mutation
                  mutation={SEND_MESSAGE}
                  refetchQueries={[
                    { query: CONVERSATION_MESSAGES, variables: { userId: this.state.selectedUserId, shelterId: this.props.shelterId } },
                    { query: SHELTER_CONVERSATIONS, variables: { shelterId: this.props.shelterId } }
                  ]}
                >
                  {(sendMessage: (opts: { variables: Record<string, string> }) => void) => (
                    <div className="flex gap-2">
                      <Input
                        value={this.state.messageInput}
                        onChange={(e) => this.setState({ messageInput: e.target.value })}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && this.state.messageInput.trim()) {
                            sendMessage({
                              variables: {
                                senderId: this.props.currentUserId,
                                recipientId: this.state.selectedUserId,
                                shelterId: this.props.shelterId,
                                content: this.state.messageInput.trim()
                              }
                            });
                            this.setState({ messageInput: "" });
                          }
                        }}
                      />
                      <Button
                        variant="salmon"
                        size="sm"
                        disabled={!this.state.messageInput.trim()}
                        onClick={() => {
                          if (this.state.messageInput.trim()) {
                            sendMessage({
                              variables: {
                                senderId: this.props.currentUserId,
                                recipientId: this.state.selectedUserId,
                                shelterId: this.props.shelterId,
                                content: this.state.messageInput.trim()
                              }
                            });
                            this.setState({ messageInput: "" });
                          }
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  )}
                </Mutation>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }

  render() {
    const { shelterId } = this.props;

    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sky-blue font-capriola text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 border-r pr-4">
              <Query<ShelterConversationsResponse>
                query={SHELTER_CONVERSATIONS}
                variables={{ shelterId }}
              >
                {({ loading, error, data }) => {
                  if (loading) return <p className="text-gray-500 animate-pulse">Loading...</p>;
                  if (error) return <p className="text-red-500 text-sm">Error</p>;
                  return this.renderConversationList(data?.shelterConversations || []);
                }}
              </Query>
            </div>
            <div className="md:col-span-2">
              {this.renderMessageThread()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default MessagingPanel;
