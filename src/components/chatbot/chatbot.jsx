import React, { useState } from 'react';
import axios from 'axios';
import chatbotLogo from '../../assets/chatbot-logo.png'; // ✅ Place your logo in src/assets

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me about your library account.' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);

    let reply = 'Sorry, I did not understand that.';

    try {
      const lower = input.toLowerCase();

      // 📊 Book count
      if (lower.includes('how many books')) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/books`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        reply = `There are ${res.data.length} books in the library.`;

      // 📚 List available books
      } else if (lower.includes('available books') || lower.includes('list books')) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/books`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const titles = res.data.map(b => b.title).join(', ');
        reply = titles ? `Available books: ${titles}` : 'No books found.';

      // 🏷️ List categories/types of books
      } else if (lower.includes('types of books') || lower.includes('categories')) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/books`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const categories = [...new Set(res.data.map(b => b.category))];
        reply = categories.length
          ? `We have these categories: ${categories.join(', ')}`
          : 'No categories found.';

      // 🤖 Default: call backend chatbot API
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/chatbot`,
          { message: input },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        reply = res.data.reply || reply;
      }
    } catch (err) {
      reply = 'Error connecting to chatbot.';
    }

    setMessages([...newMessages, { sender: 'bot', text: reply }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating logo button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full shadow-lg bg-transparent"
        >
          <img
            src={chatbotLogo}
            alt="Chatbot Logo"
            className="w-12 h-12 rounded-full hover:scale-105 transition-transform"
          />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <img src={chatbotLogo} alt="Chatbot Logo" className="w-6 h-6" />
              <h2 className="text-lg font-bold dark:text-white">Library Chatbot</h2>
            </div>
            <button onClick={() => setOpen(false)} className="text-red-500">✖</button>
          </div>
          <div className="h-64 overflow-y-auto border p-2 mb-2 rounded dark:border-gray-600">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span
                  className={`inline-block px-2 py-1 rounded ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
