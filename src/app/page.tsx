'use client';

import React, { useState } from 'react';
import './styles.css';

interface Conversation {
  id: string;
  type: string;
  participants: string[];
  status: string;
  resolved: boolean;
  inbox: string;
  label?: string;
}

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: string;
  attachment?: string;
  attachmentUrl?: string;
}

const conversations: Conversation[] = [
  { id: '1', type: 'General', participants: ['Admin', 'Tanya Lamba'], status: 'Open', resolved: false, inbox: 'Medicine Delivery', label: 'order_received' },
  { id: '2', type: 'Order #627852', participants: ['Admin', 'Tanya Lamba'], status: 'Open', resolved: true, inbox: 'Medicine Delivery', label: 'order_billed' },
  { id: '3', type: 'General', participants: ['Admin', 'Gurav'], status: 'Open', resolved: false, inbox: 'Support', label: 'order_delivered' },
  { id: '4', type: 'Order #627853', participants: ['Contractor', 'Admin'], status: 'Open', resolved: false, inbox: 'Medicine Delivery', label: 'order_received' },
  { id: '5', type: 'General', participants: ['Worker', 'Admin'], status: 'Open', resolved: true, inbox: 'Support', label: 'order_billed' },
  { id: '6', type: 'Order #627854', participants: ['Worker', 'Admin'], status: 'Open', resolved: false, inbox: 'Medicine Delivery', label: 'order_delivered' },
];

const messages: Message[] = [
  { id: 'm1', conversationId: '1', sender: 'Tanya Lamba', content: 'Please check your bill and tap the "Confirm Order" button to confirm your order.', timestamp: 'Apr 24, 16:55 PM' },
  { id: 'm2', conversationId: '2', sender: 'Tanya Lamba', content: 'I am checking the availability of medicines now...', timestamp: 'Apr 24, 16:55 PM' },
  { id: 'm3', conversationId: '3', sender: 'Gurav', content: 'We have the same medicine with the...', timestamp: 'Apr 24, 16:50 PM' },
  { id: 'm4', conversationId: '4', sender: 'Contractor', content: 'Order status update...', timestamp: 'Apr 24, 16:45 PM' },
  { id: 'm5', conversationId: '5', sender: 'Worker', content: 'General query...', timestamp: 'Apr 24, 16:40 PM' },
  { id: 'm6', conversationId: '6', sender: 'Worker', content: 'Order #627854 details...', timestamp: 'Apr 24, 16:35 PM' },
];

// Function to generate a unique message ID
const generateMessageId = () => `m${Date.now()}`;

const orderDetails: { [key: string]: { items: string[], total: string, shipping: string, netPayable: string } } = {
  '2': {
    items: ['Mederma PM Intensive Overnight Scar Cream - Win Medicare Pvt Ltd', '1 Tube of 10 Gm x 1 = ₹ 485.00'],
    total: '₹ 485.00',
    shipping: '₹ 35.00',
    netPayable: '₹ 520.00 = ₹ 471.50',
  },
  '4': {
    items: ['Generic Medicine - Supplier X', '2 Units x ₹ 200.00 = ₹ 400.00'],
    total: '₹ 400.00',
    shipping: '₹ 30.00',
    netPayable: '₹ 430.00',
  },
  '6': {
    items: ['Medicine Y - Supplier Z', '1 Unit x ₹ 150.00 = ₹ 150.00'],
    total: '₹ 150.00',
    shipping: '₹ 20.00',
    netPayable: '₹ 170.00',
  },
};

// Function to generate initials from a name
const getInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

// Function to get label color based on label type
const getLabelColor = (label: string | undefined) => {
  switch (label) {
    case 'order_received':
      return 'bg-green-500';
    case 'order_billed':
      return 'bg-blue-500';
    case 'order_delivered':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const Dashboard: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [chatView, setChatView] = useState<'messages' | 'order' | 'profile'>('messages');
  const [conversationStates, setConversationStates] = useState<{ [key: string]: string }>(
    conversations.reduce((acc, conv) => ({ ...acc, [conv.id]: conv.resolved ? 'Resolved' : 'Unresolved' }), {})
  );
  const [showLogout, setShowLogout] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const filteredConversations = selectedLabel
    ? conversations.filter(conv => conv.label === selectedLabel)
    : conversations;

  const filteredMessages = messages
    .filter(msg => filteredConversations.some(conv => conv.id === msg.conversationId))
    .filter(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(msg => filter === 'all' || conversations.find(conv => conv.id === msg.conversationId)?.type.toLowerCase().includes(filter))
    .sort((a, b) => sort === 'newest' ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const selectedMessages = messages.filter(msg => msg.conversationId === selectedConversation);
  const selectedOrderDetails = selectedConversation ? orderDetails[selectedConversation] : null;

  const toggleFilter = () => {
    setFilter(filter === 'all' ? 'general' : filter === 'general' ? 'order' : 'all');
  };

  const toggleSort = () => {
    setSort(sort === 'newest' ? 'oldest' : 'newest');
  };

  const handleLabelClick = (label: string) => {
    setSelectedLabel(selectedLabel === label ? null : label);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() || attachment) {
      const newMessage: Message = {
        id: generateMessageId(),
        conversationId: selectedConversation!,
        sender: 'Admin',
        content: messageInput.trim(),
        timestamp: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        attachment: attachment ? attachment.name : undefined,
        attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
      };
      messages.push(newMessage);
      setMessageInput('');
      setAttachment(null);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setAttachment(file);
      } else {
        alert('Please select an image file (e.g., PNG, JPEG).');
      }
    }
  };

  const handleCall = (participants: string[]) => {
    // Simulate a call action (replace with actual call functionality as needed)
    alert(`Initiating call with ${ participants.join(' and ') }...`);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      {/* Leftmost Bar (Admin Profile and Settings) */}
      <div className="w-1/12 p-4 border-r border-gray-700 flex flex-col">
        {/* Admin Profile */}
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-sm font-semibold">{getInitials('Admin')}</span>
          </div>
          <span className="text-lg font-semibold"></span>
        </div>

        {/* Navigation Icons (Without Names) */}
        <div className="flex flex-col space-y-4 mb-6">
          <button className="text-gray-400 hover:text-white flex items-center justify-center" title="Dashboard">
            <span className="text-2xl w-6 h-6 flex items-center justify-center">📊</span>
          </button>
          <button className="text-gray-400 hover:text-white flex items-center justify-center" title="Conversations">
            <span className="text-2xl w-6 h-6 flex items-center justify-center">💬</span>
          </button>
          <button className="text-gray-400 hover:text-white flex items-center justify-center" title="Inboxes">
            <span className="text-2xl w-6 h-6 flex items-center justify-center">📥</span>
          </button>
          <button className="text-gray-400 hover:text-white flex items-center justify-center" title="Labels">
            <span className="text-2xl w-6 h-6 flex items-center justify-center">🏷️</span>
          </button>
          <button className="text-gray-400 hover:text-white flex items-center justify-center" title="Notifications">
            <span className="text-2xl w-6 h-6 flex items-center justify-center">🔔</span>
          </button>
        </div>

        {/* Settings/Logout */}
        <div className="mt-auto flex justify-end">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="text-gray-400 hover:text-white flex items-center justify-center"
          >
            <span className="text-2xl w-6 h-6 flex items-center justify-center">⚙️</span>
          </button>
          {showLogout && (
            <div className="absolute mt-2 bg-gray-800 p-2 rounded-lg shadow-lg">
              <button className="text-sm text-red-400 hover:text-red-300">Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Second Bar (Inboxes and Labels) */}
      <div className="w-1/6 p-4 border-r border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Inboxes</h2>
        <ul className="mb-6">
          <li className="mb-2 hover:bg-gray-800 p-2 rounded-lg cursor-pointer">General</li>
          <li className="hover:bg-gray-800 p-2 rounded-lg cursor-pointer">Order</li>
        </ul>
        <h2 className="text-lg font-semibold mb-4">Labels</h2>
        <ul className="mb-6">
          <li
            className={`mb-2 hover:bg-gray-800 p-2 rounded-lg cursor-pointer flex items-center ${selectedLabel === 'order_received' ? 'bg-gray-700' : ''}`}
            onClick={() => handleLabelClick('order_received')}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>order_received
          </li>
          <li
            className={`mb-2 hover:bg-gray-800 p-2 rounded-lg cursor-pointer flex items-center ${selectedLabel === 'order_billed' ? 'bg-gray-700' : ''}`}
            onClick={() => handleLabelClick('order_billed')}
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>order_billed
          </li>
          <li
            className={`hover:bg-gray-800 p-2 rounded-lg cursor-pointer flex items-center ${selectedLabel === 'order_delivered' ? 'bg-gray-700' : ''}`}
            onClick={() => handleLabelClick('order_delivered')}
          >
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>order_delivered
          </li>
        </ul>
      </div>

      {/* Messages Section */}
      <div className="w-1/3 p-4 border-r border-gray-700 relative">
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search messages in conversations
        </button>
        {showSearchModal && (
          <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && setShowSearchModal(false)}
                placeholder="Search messages..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="mt-2 p-2 bg-blue-600 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Conversations <span className="text-gray-400">Open</span></h2>
          <div className="flex space-x-2">
            <button onClick={toggleFilter} className="text-gray-400 hover:text-white" title={`Filter: ${filter}`}>
              ⏳
            </button>
            <button onClick={toggleSort} className="text-gray-400 hover:text-white" title={`Sort: ${sort}`}>
              ⇅
            </button>
          </div>
        </div>
        <div className="mb-4">
          <span className="text-sm text-blue-400 border-b-2 border-blue-400 pb-1">
            All <span className="text-gray-400">{filteredMessages.length}</span>
          </span>
        </div>
        <ul>
          {filteredMessages.map(msg => {
            const conv = conversations.find(c => c.id === msg.conversationId);
            return (
              <li
                key={msg.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer ${selectedConversation === msg.conversationId ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setSelectedConversation(msg.conversationId)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-semibold">{getInitials(msg.sender)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{msg.sender}</span>
                      <span className="text-xs text-gray-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300">{msg.content.substring(0, 30)}...</p>
                  </div>
                  {conv?.label && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getLabelColor(conv.label)} text-white`}>
                      {conv.label}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Chat Screen */}
      <div className="w-5/12 p-4 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold flex items-center">
                {filteredConversations.find(conv => conv.id === selectedConversation)?.participants.join(' - ')}
                <button
                  onClick={() => handleCall(filteredConversations.find(conv => conv.id === selectedConversation)?.participants || [])}
                  className="call-icon ml-2 text-lg"
                  title="Call"
                >
                  📞
                </button>
              </h2>
              <select
                value={conversationStates[selectedConversation!] || 'Unresolved'}
                onChange={(e) => {
                  const newState = e.target.value;
                  setConversationStates(prev => ({
                    ...prev,
                    [selectedConversation!]: newState,
                  }));
                }}
                className={`p-1 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${conversationStates[selectedConversation!] === 'Unresolved' ? 'bg-red-500' : conversationStates[selectedConversation!] === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`}
              >
                <option value="Unresolved" className="bg-gray-800 text-white">Unresolved</option>
                <option value="Resolved" className="bg-gray-800 text-white">Resolved</option>
                <option value="Closed" className="bg-gray-800 text-white">Closed</option>
              </select>
            </div>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setChatView('messages')}
                className={`text-sm ${chatView === 'messages' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-400'}`}
              >
                Messages
              </button>
              <button
                onClick={() => setChatView('order')}
                className={`text-sm ${chatView === 'order' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-400'}`}
              >
                Order Details
              </button>
              <button
                onClick={() => setChatView('profile')}
                className={`text-sm ${chatView === 'profile' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-400'}`}
              >
                Profile
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {chatView === 'messages' ? (
                selectedMessages.map(msg => (
                  <div key={msg.id} className={`mb-4 flex ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-start">
                      {msg.sender !== 'Admin' && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-semibold">{getInitials(msg.sender)}</span>
                        </div>
                      )}
                      <div>
                        <div className={`p-3 rounded-lg ${msg.sender === 'Admin' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                          {msg.content && <p>{msg.content}</p>}
                          {msg.attachmentUrl && (
                            <img
                              src={msg.attachmentUrl}
                              alt={msg.attachment}
                              className="mt-2 max-w-xs rounded-lg"
                            />
                          )}
                          {msg.attachment && !msg.attachmentUrl && (
                            <p className="text-xs text-gray-400 mt-1">Attachment: {msg.attachment}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
                      </div>
                      {msg.sender === 'Admin' && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                          <span className="text-xs font-semibold">{getInitials(msg.sender)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : chatView === 'order' && selectedOrderDetails ? (
                <div className="p-4 bg-gray-800 rounded-lg">
                  {selectedOrderDetails.items.map((item, index) => (
                    <p key={index} className="text-sm">{index + 1}. {item}</p>
                  ))}
                  <p className="text-sm mt-2">Total: {selectedOrderDetails.total}</p>
                  <p className="text-sm">Shipping Charge: {selectedOrderDetails.shipping}</p>
                  <p className="text-sm">Net Payable: {selectedOrderDetails.netPayable}</p>
                </div>
              ) : chatView === 'profile' ? (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-md font-semibold mb-2">User Profile</h3>
                  <p>Participant: {filteredConversations.find(conv => conv.id === selectedConversation)?.participants.join(', ')}</p>
                  <p>Status: {filteredConversations.find(conv => conv.id === selectedConversation)?.status}</p>
                  <p>Inbox: {filteredConversations.find(conv => conv.id === selectedConversation)?.inbox}</p>
                  <p>Label: {filteredConversations.find(conv => conv.id === selectedConversation)?.label || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-gray-400">Select a view to see details</p>
              )}
            </div>
            {chatView === 'messages' && (
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Reply..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none"
                />
                <label className="p-2 bg-gray-700 rounded-r-lg cursor-pointer flex items-center">
                  <span className="text-white mr-1">📎</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleAttachmentChange}
                    accept="image/*"
                  />
                </label>
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-600 rounded-lg ml-2"
                  disabled={!messageInput.trim() && !attachment}
                >
                  Send
                </button>
                {attachment && (
                  <span className="ml-2 text-sm text-gray-400">Attached: {attachment.name}</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Select a conversation to view messages</p>
          </div>
        )}
      </div>

      {/* Ensure modal overlay is above all content */}
      {showSearchModal && <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && setShowSearchModal(false)}
            placeholder="Search messages..."
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => setShowSearchModal(false)}
            className="mt-2 p-2 bg-blue-600 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>}
    </div>
  );
};

export default Dashboard;