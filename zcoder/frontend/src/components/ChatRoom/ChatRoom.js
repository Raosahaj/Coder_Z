// ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import './ChatRoom.css';

const ChatRoom = () => {
    const user = useSelector(selectUser);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:80');
        
        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                setMessages(prev => [...prev, message]);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
            const message = { 
                sender: user?.displayName || user?.email || 'Anonymous',
                text: input,
                timestamp: new Date().toISOString()
            };
            ws.current.send(JSON.stringify(message));
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="chat-room">
            <div className="rules">
                <p>RULES TO FOLLOW IN THIS CHAT ROOM</p>
                <span>1. Be civil and courteous</span>
                <span>2. Do not spam messages</span>
                <span>3. Ask coding related questions only</span>
                <span>4. Violators will be banned permanently</span>
            </div>

            <div className="messages">
                {messages.map((msg, index) => (
                    <div className="message" key={index}>
                        <strong>{msg.sender}:</strong> 
                        <span>{msg.text}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>

            <div className="points">
                <p>Points to Remember</p>
                <span>1. History is not saved - messages disappear when you leave</span>
                <span>2. Press Enter or click Send to submit messages</span>
                <span>3. Respect every user's privacy</span>
            </div>
        </div>
    );
};

export default ChatRoom;
