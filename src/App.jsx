import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Replace with your backend URL when deployed to Render
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const socket = io(BACKEND_URL);

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [password, setPassword] = useState('');
  const messagesEndRef = useRef(null);

  const rooms = [
    { id: 'general', name: 'General' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'music', name: 'Music' },
    { id: 'coding', name: 'Coding' },
    { id: 'tech', name: 'Tech' },
    { id: 'politics', name: 'Politics' },
    { id: 'admin', name: 'Admin', protected: true }
  ];

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [...prev, { ...data, system: true }]);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [...prev, { ...data, system: true }]);
    });

    socket.on('error', (error) => {
      alert(error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    socket.emit('join_room', { room, username, password });
    setMessages([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit('send_message', { message, room });
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!isConnected ? (
        <div className="text-center text-red-500">
          Connecting to server...
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Real-time Chat Rooms</h1>
          
          {/* Join Room Form */}
          <form onSubmit={handleJoinRoom} className="mb-6 space-y-4 bg-white p-4 rounded-lg shadow">
            <div>
              <label className="block mb-2">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Select Room:</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {room === 'admin' && (
              <div>
                <label className="block mb-2">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Join Room
            </button>
          </form>

          {/* Chat Messages */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-96 overflow-y-auto mb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded ${
                    msg.system
                      ? 'bg-gray-100 text-gray-600'
                      : msg.author === username
                      ? 'bg-blue-100'
                      : 'bg-gray-50'
                  }`}
                >
                  {!msg.system && <strong>{msg.author}: </strong>}
                  {msg.message}
                  <div className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
