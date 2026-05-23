import { useState, useEffect, useRef } from "react";
import { Search, Send, Plus, X, Paperclip } from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { api } from "../../../services/api";

type Message = { id: string; text: string; from: "me" | "them"; time: string; };

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
};

const CONVOS: Conversation[] = [
  {
    id: "c1", name: "Dr. Alice Monroe", avatar: "https://i.pravatar.cc/80?img=49", role: "Teacher", lastMessage: "The exam papers are ready.", time: "2 min ago", unread: 2,
    messages: [
      { id: "m1", text: "Hi, the exam papers for Biology 101 are ready for review.", from: "them", time: "10:00 AM" },
      { id: "m2", text: "Great! Please send them to the admin office.", from: "me", time: "10:05 AM" },
      { id: "m3", text: "The exam papers are ready.", from: "them", time: "10:08 AM" },
    ],
  },
  {
    id: "c2", name: "Margaret Harper", avatar: "https://i.pravatar.cc/80?img=46", role: "Parent", lastMessage: "Thank you for the update.", time: "1 hr ago", unread: 0,
    messages: [
      { id: "m1", text: "Good afternoon, I wanted to ask about Evelyn's progress.", from: "them", time: "09:00 AM" },
      { id: "m2", text: "Evelyn is doing excellent! She is top of her class.", from: "me", time: "09:15 AM" },
      { id: "m3", text: "Thank you for the update.", from: "them", time: "09:20 AM" },
    ],
  },
  {
    id: "c3", name: "Mr. James Okafor", avatar: "https://i.pravatar.cc/80?img=11", role: "Teacher", lastMessage: "Class schedule confirmed.", time: "Yesterday", unread: 0,
    messages: [
      { id: "m1", text: "Can we move the calculus class to room 205?", from: "them", time: "Yesterday" },
      { id: "m2", text: "Sure, that works. Class schedule confirmed.", from: "me", time: "Yesterday" },
    ],
  },
  {
    id: "c4", name: "Kofi Osei", avatar: "https://i.pravatar.cc/80?img=24", role: "Parent", lastMessage: "I will attend the meeting.", time: "2 days ago", unread: 1,
    messages: [
      { id: "m1", text: "Will you be attending the parent-teacher meeting?", from: "me", time: "2 days ago" },
      { id: "m2", text: "I will attend the meeting.", from: "them", time: "2 days ago" },
    ],
  },
];

export default function AdminMessagesPage() {
  const [convos, setConvos] = useState<Conversation[]>(CONVOS);
  const [activeId, setActiveId] = useState<string>(CONVOS[0].id);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTo, setNewTo] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, convos]);

  async function loadConversations() {
    try {
      setLoadingConvos(true);
      const res = await api.getAdminConversations();
      if (res.success && res.data.length > 0) {
        const mapped: Conversation[] = res.data.map((c: any) => ({
          id: String(c.other_user_id),
          name: c.other_user_name || "Unknown",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.other_user_name || c.other_user_id}`,
          role: c.other_user_role || "User",
          lastMessage: c.last_message || "",
          time: new Date(c.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          unread: c.read === false && c.direction !== "out" ? 1 : 0,
          messages: [],
        }));
        setConvos(mapped);
        if (mapped.length > 0) {
          setActiveId(mapped[0].id);
          await loadMessages(mapped[0].id);
        }
      }
    } catch {
      // keep mock data
    } finally {
      setLoadingConvos(false);
    }
  }

  async function loadMessages(userId: string) {
    try {
      const res = await api.getAdminMessages(userId);
      if (res.success) {
        const msgs: Message[] = res.data.map((m: any) => ({
          id: String(m.id),
          text: m.text,
          from: m.direction === "out" ? "me" : "them" as "me" | "them",
          time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        }));
        setConvos(cs => cs.map(c => c.id === userId
          ? { ...c, messages: msgs, unread: 0 }
          : c
        ));
      }
    } catch {
      // keep existing messages
    }
  }

  const active = convos.find(c => c.id === activeId) ?? convos[0];

  const filteredConvos = convos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  async function openConvo(id: string) {
    setActiveId(id);
    setConvos(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c));
    await loadMessages(id);
  }

  async function sendMessage() {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    const tempMsg: Message = { id: `tmp${Date.now()}`, text, from: "me", time: "Just now" };
    setConvos(cs => cs.map(c => c.id === activeId
      ? { ...c, messages: [...c.messages, tempMsg], lastMessage: text, time: "Just now" }
      : c));
    setDraft("");
    try {
      setSending(true);
      await api.sendAdminMessage({
        recipient_id: parseInt(activeId, 10),
        recipient_name: active.name,
        text,
      });
    } catch {
      // message already shown optimistically
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const totalUnread = convos.reduce((a, c) => a + c.unread, 0);

  return (
    <div className="flex min-h-screen bg-[#f5f5fb] font-sans text-ink-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex w-full overflow-hidden rounded-none">

            {/* Conversation list */}
            <aside className="flex w-72 shrink-0 flex-col border-r border-ink-200 bg-white">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3.5">
                <h2 className="font-bold text-ink-900">Messages {totalUnread > 0 && <span className="ml-1 rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{totalUnread}</span>}</h2>
                <button onClick={() => setShowNew(true)} className="rounded-full p-1.5 hover:bg-violet-50 text-violet-600">
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="px-3 pt-3 pb-2">
                <label className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 size-3.5 text-ink-400" />
                  <input type="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                    className="h-9 w-full rounded-xl border border-ink-200 bg-ink-50 pl-8 pr-3 text-sm outline-none focus:border-violet-400" />
                </label>
              </div>
              <ul className="flex-1 overflow-y-auto">
                {loadingConvos && <li className="px-4 py-3 text-xs text-ink-400">Loading…</li>}
                {filteredConvos.map(c => (
                  <li key={c.id} onClick={() => openConvo(c.id)}
                    className={`flex cursor-pointer items-center gap-3 border-b border-ink-50 px-4 py-3 transition hover:bg-violet-50/50 ${activeId === c.id ? "bg-violet-50" : ""}`}>
                    <div className="relative shrink-0">
                      <img src={c.avatar} alt={c.name} className="size-10 rounded-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold text-ink-900">{c.name}</p>
                        <span className="shrink-0 text-[10px] text-ink-400">{c.time}</span>
                      </div>
                      <p className="truncate text-xs text-ink-500">{c.lastMessage}</p>
                    </div>
                    {c.unread > 0 && (
                      <span className="ml-1 shrink-0 flex size-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">{c.unread}</span>
                    )}
                  </li>
                ))}
              </ul>
            </aside>

            {/* Chat panel */}
            <div className="flex min-w-0 flex-1 flex-col bg-[#f5f5fb]">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-ink-200 bg-white px-5 py-3.5">
                <img src={active.avatar} alt={active.name} className="size-10 rounded-full object-cover ring-2 ring-violet-100" />
                <div>
                  <p className="font-bold text-ink-900">{active.name}</p>
                  <p className="text-xs text-ink-500">{active.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
                {active?.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                    {msg.from === "them" && (
                      <img src={active.avatar} alt="" className="mr-2.5 mt-auto size-7 rounded-full object-cover shrink-0" />
                    )}
                    <div className={`max-w-[60%] rounded-2xl px-4 py-2.5 text-sm ${msg.from === "me" ? "bg-violet-600 text-white rounded-br-sm" : "bg-white border border-ink-200 text-ink-900 rounded-bl-sm shadow-card"}`}>
                      <p>{msg.text}</p>
                      <p className={`mt-1 text-[10px] ${msg.from === "me" ? "text-violet-200" : "text-ink-400"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-ink-200 bg-white px-5 py-3.5">
                <div className="flex items-end gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-2.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                  <button className="mb-0.5 text-ink-400 hover:text-violet-600 shrink-0"><Paperclip className="size-4" /></button>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    placeholder="Type a message..."
                    className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-ink-400"
                  />
                  <button onClick={sendMessage}
                    className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-50"
                    disabled={!draft.trim() || sending}>
                    <Send className="size-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-ink-400">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Message</h2>
              <button onClick={() => setShowNew(false)} className="rounded-full p-1.5 hover:bg-ink-100"><X className="size-4 text-ink-500" /></button>
            </div>
            <label className="mb-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">Recipient Name</span>
              <input type="text" value={newTo} onChange={e => setNewTo(e.target.value)} placeholder="Teacher or parent name..." className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-violet-400" />
            </label>
            <label className="mb-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-700">Message</span>
              <textarea rows={4} value={newMsg} onChange={e => setNewMsg(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-violet-400 resize-none" placeholder="Write your message..." />
            </label>
            <div className="flex gap-3">
              <button onClick={() => { setShowNew(false); setNewTo(""); setNewMsg(""); }} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button
                disabled={!newTo.trim() || !newMsg.trim()}
                onClick={async () => {
                  if (!newTo.trim() || !newMsg.trim()) return;
                  const placeholder: Conversation = {
                    id: `new-${Date.now()}`, name: newTo.trim(),
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newTo}`,
                    role: "User", lastMessage: newMsg.trim(), time: "Just now", unread: 0,
                    messages: [{ id: `m0`, text: newMsg.trim(), from: "me", time: "Just now" }],
                  };
                  setConvos(cs => [placeholder, ...cs]);
                  setActiveId(placeholder.id);
                  setShowNew(false); setNewTo(""); setNewMsg("");
                }}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
