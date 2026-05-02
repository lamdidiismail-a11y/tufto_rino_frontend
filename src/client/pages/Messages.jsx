import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./Messages.css";
import { apiRequest, getAuthSession } from "../../services/api.js";

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
  const labels = {
    open: "Ouverte",
    pending: "En attente",
    closed: "Fermee",
  };

  return labels[status] || status || "--";
}

function isImageAttachment(attachment) {
  return attachment?.mimeType?.startsWith("image/");
}

function Messages() {
  const { user } = getAuthSession();
  const [conversations, setConversations] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState({
    subject: "",
    initialMessage: "",
    customRequestId: "",
  });
  const [replyMessage, setReplyMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const chatEndRef = useRef(null);

  const selectedConversationData = useMemo(
    () =>
      conversations.find((conversation) => Number(conversation.id) === Number(selectedConversationId)) ||
      selectedConversation,
    [conversations, selectedConversation, selectedConversationId]
  );

  const loadConversations = async (nextConversationId = null) => {
    try {
      setLoadingConversations(true);
      setError("");
      const [conversationData, requestData] = await Promise.all([
        apiRequest("/conversations"),
        apiRequest("/custom-requests/my"),
      ]);

      const nextConversations = conversationData.conversations || [];
      setConversations(nextConversations);
      setCustomRequests(requestData.customRequests || []);

      if (nextConversationId) {
        setSelectedConversationId(nextConversationId);
      } else if (nextConversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(nextConversations[0].id);
      } else if (nextConversations.length === 0) {
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
      const data = await apiRequest(`/conversations/${conversationId}/messages`);
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
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateConversation = async (event) => {
    event.preventDefault();

    try {
      setCreatingConversation(true);
      setError("");
      const data = await apiRequest("/conversations", {
        method: "POST",
        body: JSON.stringify({
          subject: createForm.subject,
          initialMessage: createForm.initialMessage,
          customRequestId: createForm.customRequestId || null,
        }),
      });

      setCreateForm({
        subject: "",
        initialMessage: "",
        customRequestId: "",
      });

      await loadConversations(data.conversation?.id);
      if (data.conversation?.id) {
        await loadMessages(data.conversation.id);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreatingConversation(false);
    }
  };

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

      const data = await apiRequest(`/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        body: payload,
      });

      setMessages((current) => [...current, data.message]);
      setReplyMessage("");
      setAttachment(null);
      await loadConversations(selectedConversationId);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="client-messages-page">
      <Navbar />

      <main className="client-messages-main">
        <section className="client-messages-shell">
          <div className="client-messages-header">
            <div>
              <p className="client-messages-eyebrow">Support Tufto Rino</p>
              <h1>Messagerie client</h1>
              <p className="client-messages-copy">
                Echangez avec l&apos;equipe admin a propos de vos commandes, demandes sur mesure
                et suivis de projet.
              </p>
            </div>
            <div className="client-messages-usercard">
              <span>Compte connecte</span>
              <strong>{user?.email}</strong>
            </div>
          </div>

          {error ? <div className="client-messages-error">{error}</div> : null}

          <div className="client-messages-layout">
            <aside className="client-messages-sidebar">
              <section className="client-panel-card">
                <div className="client-panel-head">
                  <h2>Nouvelle conversation</h2>
                </div>

                <form className="client-create-form" onSubmit={handleCreateConversation}>
                  <label>
                    Sujet
                    <input
                      name="subject"
                      value={createForm.subject}
                      onChange={handleCreateChange}
                      placeholder="Exemple : Suivi de ma commande"
                      required
                    />
                  </label>

                  <label>
                    Message initial
                    <textarea
                      name="initialMessage"
                      value={createForm.initialMessage}
                      onChange={handleCreateChange}
                      placeholder="Expliquez votre besoin ou votre question..."
                      rows="4"
                    />
                  </label>

                  <label>
                    Lier a une demande sur mesure
                    <select
                      name="customRequestId"
                      value={createForm.customRequestId}
                      onChange={handleCreateChange}
                    >
                      <option value="">Aucune</option>
                      {customRequests.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button type="submit" className="client-primary-btn" disabled={creatingConversation}>
                    {creatingConversation ? "Creation..." : "Creer la conversation"}
                  </button>
                </form>
              </section>

              <section className="client-panel-card">
                <div className="client-panel-head">
                  <h2>Mes conversations</h2>
                </div>

                {loadingConversations ? (
                  <div className="client-state-card">Chargement des conversations...</div>
                ) : conversations.length > 0 ? (
                  <div className="client-conversation-list">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        className={`client-conversation-item${
                          Number(conversation.id) === Number(selectedConversationId) ? " active" : ""
                        }`}
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <div className="client-conversation-item-top">
                          <strong>{conversation.subject}</strong>
                          <span className={`client-status-badge status-${conversation.status}`}>
                            {formatStatus(conversation.status)}
                          </span>
                        </div>
                        <p>{conversation.lastMessage || "Aucun message pour le moment."}</p>
                        <small>{formatDate(conversation.lastMessageAt || conversation.createdAt)}</small>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="client-state-card">
                    Aucune conversation pour le moment. Creez votre premier echange.
                  </div>
                )}
              </section>
            </aside>

            <section className="client-panel-card client-chat-panel">
              {selectedConversationData ? (
                <>
                  <div className="client-chat-header">
                    <div>
                      <p className="client-messages-eyebrow">Conversation</p>
                      <h2>{selectedConversationData.subject}</h2>
                    </div>
                    <div className="client-chat-meta">
                      <span className={`client-status-badge status-${selectedConversationData.status}`}>
                        {formatStatus(selectedConversationData.status)}
                      </span>
                      <small>{selectedConversationData.messageCount} message(s)</small>
                    </div>
                  </div>

                  {loadingMessages ? (
                    <div className="client-state-card">Chargement des messages...</div>
                  ) : (
                    <>
                      <div className="client-chat-thread">
                        {messages.length > 0 ? (
                          messages.map((message) => (
                            <article
                              key={message.id}
                              className={`client-chat-bubble${message.isOwnMessage ? " own" : ""}`}
                            >
                              <div className="client-chat-bubble-head">
                                <strong>{message.senderName}</strong>
                                <small>{formatDate(message.createdAt)}</small>
                              </div>
                              {message.content ? <p>{message.content}</p> : null}

                              {message.attachments?.length ? (
                                <div className="client-attachments">
                                  {message.attachments.map((item) => (
                                    <a
                                      key={item.id}
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="client-attachment-link"
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
                          <div className="client-state-card">
                            Aucun message dans cette conversation.
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form className="client-reply-form" onSubmit={handleSendMessage}>
                        <textarea
                          value={replyMessage}
                          onChange={(event) => setReplyMessage(event.target.value)}
                          placeholder="Ecrivez votre message..."
                          rows="4"
                          disabled={selectedConversationData.status === "closed"}
                        />
                        <div className="client-reply-actions">
                          <label className="client-file-label">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
                              onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                              disabled={selectedConversationData.status === "closed"}
                            />
                            {attachment ? attachment.name : "Ajouter une piece jointe"}
                          </label>

                          <button
                            type="submit"
                            className="client-primary-btn"
                            disabled={sendingMessage || selectedConversationData.status === "closed"}
                          >
                            {sendingMessage ? "Envoi..." : "Envoyer"}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </>
              ) : (
                <div className="client-state-card">
                  Selectionnez une conversation ou creez-en une nouvelle pour commencer.
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Messages;
