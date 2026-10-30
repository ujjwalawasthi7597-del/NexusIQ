import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  BotMessageSquare,
  Sparkles,
  StopCircle,
  RotateCcw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Folder,
  Layers,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import type { Conversation, ConversationMessage, Citation, Workspace } from '../types/index.ts';

interface AiAssistantViewProps {
  initialPrompt?: string;
  initialConversationId?: string;
  onOpenCitation: (citation: Citation) => void;
  onOpenFeedback: (messageId: string, rating: 'thumbs_up' | 'thumbs_down') => void;
  workspaces: Workspace[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  initialPrompt,
  initialConversationId,
  onOpenCitation,
  onOpenFeedback,
  workspaces,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputQuery, setInputQuery] = useState(initialPrompt || '');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInputQuery(initialPrompt);
    }
  }, [initialPrompt]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/v1/conversations');
      const data = await res.json();
      if (data?.conversations) {
        setConversations(data.conversations);
        if (!activeConversationId && data.conversations.length > 0) {
          loadMessages(data.conversations[0].id);
        }
      }
    } catch {}
  };

  const loadMessages = async (convoId: string) => {
    setActiveConversationId(convoId);
    try {
      const res = await fetch(`/api/v1/conversations/${convoId}/messages`);
      const data = await res.json();
      if (data?.messages) {
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      }
    } catch {}
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputQuery('');
    setActiveCitations([]);
    setStreamStatus(null);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convoId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/v1/conversations/${convoId}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== convoId));
      if (activeConversationId === convoId) {
        handleStartNewChat();
      }
    } catch {}
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || textToSend.trim().length === 0 || isStreaming) return;

    setInputQuery('');
    setIsStreaming(true);
    setStreamStatus('Enforcing pre-retrieval authorization...');

    // Optimistically render user message
    const tempUserMsg: ConversationMessage = {
      id: 'temp_user_' + Date.now(),
      organizationId: '',
      conversationId: activeConversationId || '',
      userId: '',
      role: 'user',
      content: textToSend.trim(),
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const tempAssistantMsg: ConversationMessage = {
      id: 'temp_assistant_' + Date.now(),
      organizationId: '',
      conversationId: activeConversationId || '',
      userId: '',
      role: 'assistant',
      content: '',
      status: 'generating',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg]);
    setTimeout(scrollToBottom, 50);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          conversationId: activeConversationId,
          workspaceId: selectedWorkspaceId || undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to connect to streaming RAG endpoint');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedAnswer = '';
      let citationsList: Citation[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('event:')) continue;
          const [eventPart, dataPart] = line.split('\ndata: ');
          const eventType = eventPart.replace('event: ', '').trim();
          const eventData = dataPart ? JSON.parse(dataPart) : {};

          if (eventType === 'conversation_created') {
            setActiveConversationId(eventData.conversation.id);
            setConversations((prev) => [eventData.conversation, ...prev]);
          } else if (eventType === 'status') {
            setStreamStatus(eventData.message);
          } else if (eventType === 'citations') {
            citationsList = eventData.citations || [];
            setActiveCitations(citationsList);
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                last.citations = citationsList;
              }
              return updated;
            });
          } else if (eventType === 'token') {
            accumulatedAnswer += eventData.delta;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                last.content = accumulatedAnswer;
              }
              return updated;
            });
            scrollToBottom();
          } else if (eventType === 'done') {
            setStreamStatus(null);
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                last.id = eventData.messageId || last.id;
                last.status = 'completed';
                last.usage = eventData.usage;
              }
              return updated;
            });
          } else if (eventType === 'error') {
            setStreamStatus(`Error: ${eventData.message}`);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStreamStatus(`Generation stopped or failed: ${err.message}`);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      loadConversations();
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamStatus('Generation stopped by user');
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const examplePrompts = [
    'What is our annual leave policy for employees in India?',
    'What are the mandatory password standards and MDM remote wipe policy?',
    'What is our maximum connection pool size for Node.js microservices?',
    'What are our target acquisition milestones for 2026?',
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Chat History Drawer */}
      <div className="w-72 border-r border-slate-800/80 bg-slate-950/60 flex flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4 text-indigo-400" />
            Inquiry History
          </span>
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => loadMessages(c.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                activeConversationId === c.id
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <BotMessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                <span className="truncate">{c.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, c.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500 italic">
              No conversations yet. Ask a question to begin.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/40 relative">
        {/* Workspace Scope Bar */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200">Pre-Retrieval Guardrails:</span>
            <span className="text-slate-400 hidden sm:inline">
              Only authorized document chunks are queried & synthesized.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Scope:</span>
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Accessible Workspaces</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20">
                <BotMessageSquare className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  NexusIQ Enterprise Assistant
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Ask questions about leave policies, IT security, architecture guides, and internal wikis. Every fact is strictly grounded with clickable source citations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {examplePrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-indigo-500/40 text-xs text-slate-300 transition-all flex items-start gap-2.5 group"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="line-clamp-2">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
                  <BotMessageSquare className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`space-y-3 ${msg.role === 'user' ? 'max-w-xl' : 'flex-1'}`}>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none font-sans'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.role === 'assistant' && msg.status === 'generating' && (
                    <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 cursor-blink align-middle" />
                  )}
                </div>

                {/* Citations Pill Bar */}
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3 text-indigo-400" />
                      Verifiable Evidence Citations ({msg.citations.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenCitation(cite)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-medium transition-all shadow-sm"
                        >
                          <FileText className="w-3 h-3 text-indigo-400" />
                          <span className="line-clamp-1 max-w-[180px]">{cite.documentTitle}</span>
                          <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-200 text-[10px] font-mono">
                            p.{cite.pageNumber}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistant Message Actions & Usage Specs */}
                {msg.role === 'assistant' && msg.status === 'completed' && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                        title="Copy answer text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => onOpenFeedback(msg.id, 'thumbs_up')}
                        className={`flex items-center gap-1 hover:text-emerald-400 transition-colors ${
                          msg.feedback?.rating === 'thumbs_up' ? 'text-emerald-400 font-bold' : ''
                        }`}
                        title="Grounded & Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenFeedback(msg.id, 'thumbs_down')}
                        className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                          msg.feedback?.rating === 'thumbs_down' ? 'text-rose-400 font-bold' : ''
                        }`}
                        title="Report Inaccuracy or Page Discrepancy"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {msg.usage && (
                      <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
                        <span>{msg.usage.latencyMs}ms</span>
                        <span>•</span>
                        <span>{msg.usage.totalTokens} tokens</span>
                        <span>•</span>
                        <span className="text-emerald-400">${msg.usage.estimatedCost.toFixed(5)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Stream Progress Indicator */}
        {streamStatus && (
          <div className="px-6 py-2 bg-indigo-950/40 border-t border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{streamStatus}</span>
            </div>
            {isStreaming && (
              <button
                onClick={handleStopGeneration}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about company policies, architecture, or benefits (e.g. India leave policy)..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputQuery.trim()}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-2">
            <span>Model: Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Pre-retrieval authorization enforced</span>
            <span>•</span>
            <span>Zero hallucination policy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
