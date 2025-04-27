'use client';

import React, { useState } from 'react';

interface Conversation {
  id: string;
  type: string;
  participants: string[];
  status: string;
  resolved: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: string;
}

const conversations: Conversation[] = [
  { id: '1', type: 'General', participants: ['Admin', 'Tanya Lamba'], status: 'Open', resolved: false },
  { id: '2', type: 'Order #627852', participants: ['Admin', 'Tanya Lamba'], status: 'Open', resolved: true },
  { id: '3', type: 'General', participants: ['Admin', 'Gurav'], status: 'Open', resolved: false },
  { id: '4', type: 'Order #627853', participants: ['Contractor', 'Admin'], status: 'Open', resolved: false },
  { id: '5', type: 'General', participants: ['Worker', 'Admin'], status: 'Open', resolved: true },
  { id: '6', type: 'Order #627854', participants: ['Worker', 'Admin'], status: 'Open', resolved: false },
];

const messages: Message[] = [
  { id: 'm1', conversationId: '1', sender: 'Tanya Lamba', content: 'Please check your bill and tap the "Confirm Order" button to confirm your order.', timestamp: 'Apr 24, 16:55 PM' },
  { id: 'm2', conversationId: '2', sender: 'Tanya Lamba', content: 'I am checking the availability of medicines now...', timestamp: 'Apr 24, 16:55 PM' },
  { id: 'm3', conversationId: '3', sender: 'Gurav', content: 'We have the same medicine with the...', timestamp: 'Apr 24, 16:50 PM' },
  { id: 'm4', conversationId: '4', sender: 'Contractor', content: 'Order status update...', timestamp: 'Apr 24, 16:45 PM' },
  { id: 'm5', conversationId: '5', sender: 'Worker', content: 'General query...', timestamp: 'Apr 24, 16:40 PM' },
  { id: 'm6', conversationId: '6', sender: 'Worker', content: 'Order #627854 details...', timestamp: 'Apr 24, 16:35 PM' },
];

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

const Dashboard: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<'admin' | 'user' | 'contractor' | 'worker'>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [chatView, setChatView] = useState<'messages' | 'order'>('messages');
  const [conversationStates, setConversationStates] = useState<{ [key: string]: boolean }>(
    conversations.reduce((acc, conv) => ({ ...acc, [conv.id]: conv.resolved }), {})
  );

  const filterConversations = (profile: string) => {
    if (profile === 'admin') return conversations;
    if (profile === 'user') return conversations.filter(conv => conv.participants.includes('Admin') && conv.participants.some(p => ['Tanya Lamba', 'Gurav'].includes(p)));
    if (profile === 'contractor') return conversations.filter(conv => conv.participants.includes('Admin') && conv.participants.some(p => ['Contractor'].includes(p)));
    if (profile === 'worker') return conversations.filter(conv => conv.participants.includes('Admin') && conv.participants.some(p => ['Worker'].includes(p)));
    return [];
  };

  const filteredConversations = filterConversations(activeProfile);
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

  const toggleResolved = (conversationId: string) => {
    setConversationStates(prev => ({
      ...prev,
      [conversationId]: !prev[conversationId],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Profile Switcher */}
      <div className="p-4 border-b border-gray-700">
        <select
          value={activeProfile}
          onChange={(e) => setActiveProfile(e.target.value as 'admin' | 'user' | 'contractor' | 'worker')}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="contractor">Contractor</option>
          <option value="worker">Worker</option>
        </select>
      </div>

      {/* Conversations Table */}
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2">Participants</th>
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredConversations.map(conv => (
              <tr key={conv.id} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedConversation(conv.id)}>
                <td className="py-2 flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-semibold">{getInitials(conv.participants.join(' '))}</span>
                  </div>
                  {conv.participants.join(', ')}
                </td>
                <td className="py-2">{conv.type}</td>
                <td className="py-2">{conv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Messages List */}
      <div className="w-1/4 p-4 border-r border-gray-700">
        <input
          type="text"
          placeholder="Search for messages in conversation"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Messages</h2>
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
          <span className="text-sm text-blue-400 border-b-2 border-blue-400 pb-1">All</span>
        </div>
        <ul>
          {filteredMessages.map(msg => (
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
                  <div className="flex justify-between">
                    <span>{msg.sender}</span>
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.content.substring(0, 50)}...</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Screen */}
      <div className="w-2/4 p-4 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{filteredConversations.find(conv => conv.id === selectedConversation)?.participants.join(' - ')}</h2>
              <button
                onClick={() => toggleResolved(selectedConversation)}
                className={`px-3 py-1 rounded-lg text-sm ${conversationStates[selectedConversation] ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {conversationStates[selectedConversation] ? 'Resolved' : 'Unresolved'}
              </button>
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
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {chatView === 'messages' ? (
                selectedMessages.map(msg => (
                  <div key={msg.id} className={`mb-4 flex ${msg.sender === activeProfile ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-start">
                      {msg.sender !== activeProfile && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-semibold">{getInitials(msg.sender)}</span>
                        </div>
                      )}
                      <div>
                        <div className={`inline-block p-3 rounded-lg ${msg.sender === activeProfile ? 'bg-blue-600' : 'bg-gray-700'}`}>
                          <p>{msg.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
                      </div>
                      {msg.sender === activeProfile && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                          <span className="text-xs font-semibold">{getInitials(msg.sender)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : selectedOrderDetails ? (
                <div className="p-4 bg-gray-800 rounded-lg">
                  {selectedOrderDetails.items.map((item, index) => (
                    <p key={index} className="text-sm">{index + 1}. {item}</p>
                  ))}
                  <p className="text-sm mt-2">Total: {selectedOrderDetails.total}</p>
                  <p className="text-sm">Shipping Charge: {selectedOrderDetails.shipping}</p>
                  <p className="text-sm">Net Payable: {selectedOrderDetails.netPayable}</p>
                </div>
              ) : (
                <p className="text-gray-400">No order details available.</p>
              )}
            </div>
            {chatView === 'messages' && (
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Reply..."
                  className="flex-1 p-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none"
                />
                <button className="p-2 bg-blue-600 rounded-r-lg">Send</button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;