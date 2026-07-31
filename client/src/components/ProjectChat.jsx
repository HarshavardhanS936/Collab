import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchProjectMessages, sendMessage } from '../api/message.api';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

export default function ProjectChat({ projectId, isMember }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  const loadMessages = async () => {
    try {
      const res = await fetchProjectMessages(projectId);
      let msgs = res.data?.data?.messages || res.data?.messages || res.messages || res.data || [];
      if (!Array.isArray(msgs)) {
        msgs = msgs.messages || msgs.data || [];
        if (!Array.isArray(msgs)) msgs = [];
      }
      setMessages(msgs);
      setError(null);
    } catch (err) {
      if (err.response?.status !== 403) {
        setError('Failed to load chat messages.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMember) {
      loadMessages();
      // Simple polling for real-time updates
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [projectId, isMember]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isMember) return;
    
    setIsSending(true);
    try {
      await sendMessage(projectId, newMessage);
      setNewMessage('');
      await loadMessages(); // Reload instantly after sending
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isMember) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Chat</h2>
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
          <p className="text-gray-600">You must be a member of this project to view and send messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col h-[600px]">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Chat</h2>
      <ErrorMessage message={error} />
      
      <div className="flex-1 bg-white border border-gray-200 rounded-t-xl shadow-sm overflow-hidden flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center"><Loader /></div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
              No messages yet. Say hello to your team!
            </div>
          ) : (
            (Array.isArray(messages) ? messages : []).map((msg) => {
              const currentUserId = user?._id || user?.id;
              const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
              const isMine = currentUserId === senderId;
              
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                    {!isMine && (
                      <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">
                        {msg.sender?.name || 'Unknown User'}
                      </span>
                    )}
                    <div className="flex items-end gap-2">
                      {!isMine && msg.sender?.avatarUrl && (
                        <img src={msg.sender.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full shadow-sm bg-white" />
                      )}
                      
                      <div className={`px-4 py-2 rounded-2xl ${
                        isMine 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-200">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSending}
            />
            <button 
              type="submit" 
              disabled={isSending || !newMessage.trim()}
              className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSending ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
