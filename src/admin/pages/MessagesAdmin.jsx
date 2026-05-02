import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import "./MessagesAdmin.css";

const statusFilters = [
  { value: "all", label: "Toutes" },
  { value: "open", label: "Ouvertes" },
  { value: "pending", label: "En attente" },
  { value: "closed", label: "Fermees" },
];

const statusOptions = [
  { value: "open", label: "Ouverte" },
  { value: "pending", label: "En attente" },
  { value: "closed", label: "Fermee" },
];

function formatDate(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status) {
  const item = statusOptions.find((option) => option.value === status);
  return item?.label || status || "--";
}

function isImageAttachment(attachment) {
  return attachment?.mimeType?.startsWith("image/");
}

function MessagesAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const selectedConversationData = useMemo(
    () =>
      conversations.find((conversation) => Number(conversation.id) === Number(selectedConversationId)) ||
      selectedConversation,
    [conversations, selectedConversation, selectedConversationId]
  );

  useEffect(() => {
    const requestedConversationId = Number(searchParams.get("conversation"));

    if (requestedConversationId) {
      setSelectedConversationId(requestedConversationId);
    }
  }, [searchParams]);

  const loadConversations = async (nextConversationId = null, currentFilter = statusFilter) => {
    try {
      setLoadingConversations(true);
      setError("");
      const query = currentFilter !== "all" ? `?status=${currentFilter}` : "";
      const data = await apiRequest(`/admin/conversations${query}`);
      const nextConversations = data.conversations || [];
      setConversations(nextConversations);

      if (nextConversationId) {
        setSelectedConversationId(nextConversationId);
      } else if (nextConversations.length > 0) {
        const stillSelected = nextConversations.some(
          (conversation) => Number(conversation.id) === Number(selectedConversationId)
        );
        if (!stillSelected) {
          setSelectedConversationId(nextConversations[0].id);
        }
      } else {
        setSelectedConversationId(null);
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      setSelectedConversation(null);
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");
      const data = await apiRequest(`/admin/conversations/${conversationId}/messages`);
      setSelectedConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedConversationId) {
      setSearchParams({ conversation: String(selectedConversationId) });
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, setSearchParams]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedConversationId) {
      return;
    }

    try {
      setSendingMessage(true);
      setError("");
      const payload = new FormData();
      payload.append("message", replyMessage);
      if (attachment) {
        payload.append("attachment", attachment);
      }

      const data = await apiRequest(`/admin/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        body: payload,
      });

      setMessages((current) => [...current, data.message]);
      setReplyMessage("");
      setAttachment(null);
      await loadConversations(selectedConversationId, statusFilter);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!selectedConversationId) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      const data = await apiRequest(`/admin/conversations/${selectedConversationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setSelectedConversation(data.conversation);
      setConversations((current) =>
        current.map((conversation) =>
          Number(conversation.id) === Number(selectedConversationId)
            ? { ...conversation, status: data.conversation.status }
            : conversation
        )
      );
      await loadConversations(null, statusFilter);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="messages-admin-page">
      <section className="table-card admin-messages-shell">
        <div className="table-card-header">
          <div>
            <p className="section-eyebrow">Support client</p>
            <h3>Conversations</h3>
          </div>

          <div className="filter-row">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-pill${statusFilter === filter.value ? " active" : ""}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="admin-messages-layout">
          <aside className="admin-messages-sidebar">
            {loadingConversations ? (
              <div className="admin-state-card">Chargement des conversations...</div>
            ) : conversations.length > 0 ? (
              <div className="admin-conversation-list">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`admin-conversation-card${
                      Number(conversation.id) === Number(selectedConversationId) ? " active" : ""
                    }`}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="admin-conversation-card-top">
                      <strong>{conversation.subject}</strong>
                      <span className={`status-badge status-${conversation.status}`}>
                        {formatStatus(conversation.status)}
                      </span>
                    </div>
                    <span className="table-subtext">
                      {conversation.client?.name} - {conversation.client?.email}
                    </span>
                    <p>{conversation.lastMessage || "Aucun message pour le moment."}</p>
                    <small>{formatDate(conversation.lastMessageAt || conversation.createdAt)}</small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="admin-state-card">Aucune conversation trouvee.</div>
            )}
          </aside>

          <section className="admin-chat-panel">
            {selectedConversationData ? (
              <>
                <div className="admin-chat-header">
                  <div>
                    <p className="section-eyebrow">Conversation selectionnee</p>
                    <h3>{selectedConversationData.subject}</h3>
                    <span className="table-subtext">
                      {selectedConversationData.client?.name} - {selectedConversationData.client?.email}
                    </span>
                  </div>

                  <div className="admin-chat-header-actions">
                    <select
                      className="status-select"
                      value={selectedConversationData.status}
                      onChange={(event) => handleStatusChange(event.target.value)}
                      disabled={updatingStatus}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <small>{selectedConversationData.messageCount} message(s)</small>
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="admin-state-card">Chargement des messages...</div>
                ) : (
                  <>
                    <div className="admin-chat-thread">
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <article
                            key={message.id}
                            className={`admin-chat-bubble${
                              message.senderRole === "admin" ? " own" : ""
                            }`}
                          >
                            <div className="admin-chat-bubble-head">
                              <strong>{message.senderName}</strong>
                              <small>{formatDate(message.createdAt)}</small>
                            </div>
                            {message.content ? <p>{message.content}</p> : null}

                            {message.attachments?.length ? (
                              <div className="admin-chat-attachments">
                                {message.attachments.map((item) => (
                                  <a
                                    key={item.id}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="admin-attachment-link"
                                  >
                                    {isImageAttachment(item) ? (
                                      <img src={item.url} alt={item.filename} />
                                    ) : null}
                                    <span>{item.filename}</span>
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ))
                      ) : (
                        <div className="admin-state-card">Aucun message dans cette conversation.</div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form className="admin-reply-form" onSubmit={handleSendMessage}>
                      <textarea
                        value={replyMessage}
                        onChange={(event) => setReplyMessage(event.target.value)}
                        placeholder="Ecrire une reponse..."
                        rows="4"
                      />

                      <div className="admin-reply-actions">
                        <label className="admin-file-label">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
                            onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                          />
                          {attachment ? attachment.name : "Ajouter une piece jointe"}
                        </label>

                        <button type="submit" className="primary-btn" disabled={sendingMessage}>
                          {sendingMessage ? "Envoi..." : "Envoyer"}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            ) : (
              <div className="admin-state-card">
                Selectionnez une conversation dans la liste pour afficher les details.
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

export default MessagesAdmin;
