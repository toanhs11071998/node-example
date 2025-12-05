/**
 * Socket.io Client Example (React/Vue/Vanilla JS)
 * 
 * For browser/frontend, install: npm install socket.io-client
 * 
 * Usage example in React:
 */

// React Hook Example
/*
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export function useSocket(token) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Listen for connection
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    // Listen for errors
    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    // Listen for task updates
    newSocket.on('task-updated', (data) => {
      console.log('Task updated:', data);
      // Update UI or state
    });

    // Listen for task status changes
    newSocket.on('task-status-changed', (data) => {
      console.log('Task status changed:', data);
      // Refresh task or update UI
    });

    // Listen for task assignments
    newSocket.on('task-assigned-to-you', (data) => {
      console.log('New task assigned:', data);
      // Show notification
    });

    // Listen for new comments
    newSocket.on('comment-added', (data) => {
      console.log('New comment:', data);
      // Add comment to UI
    });

    // Listen for comment updates
    newSocket.on('comment-updated', (data) => {
      console.log('Comment updated:', data);
    });

    // Listen for comment deletions
    newSocket.on('comment-deleted', (data) => {
      console.log('Comment deleted:', data);
    });

    // Listen for reactions
    newSocket.on('reaction-added', (data) => {
      console.log('Reaction added:', data);
    });

    newSocket.on('reaction-removed', (data) => {
      console.log('Reaction removed:', data);
    });

    // Listen for notifications
    newSocket.on('notification', (data) => {
      console.log('Notification:', data);
      // Show toast or notification UI
    });

    // Listen for user typing
    newSocket.on('user-typing', (data) => {
      console.log('User typing:', data.userName);
    });

    newSocket.on('user-stop-typing', (data) => {
      console.log('User stopped typing:', data.userId);
    });

    // Listen for user joining/leaving project
    newSocket.on('user-joined', (data) => {
      console.log('User joined project:', data);
    });

    newSocket.on('user-left', (data) => {
      console.log('User left project:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return socket;
}

// Usage in component
export function TaskBoard({ token, projectId }) {
  const socket = useSocket(token);

  useEffect(() => {
    if (!socket) return;

    // Join project room
    socket.emit('join-project', projectId);

    return () => {
      socket.emit('leave-project', projectId);
    };
  }, [socket, projectId]);

  return <div>/* Task board UI */</div>;
}

// Usage in task detail component
export function TaskDetail({ token, taskId, projectId }) {
  const socket = useSocket(token);

  useEffect(() => {
    if (!socket) return;

    // Join task room
    socket.emit('join-task', taskId);

    return () => {
      socket.emit('leave-task', taskId);
    };
  }, [socket, taskId]);

  const handleStartTyping = (userName) => {
    socket?.emit('start-typing', taskId, userName);
  };

  const handleStopTyping = () => {
    socket?.emit('stop-typing', taskId);
  };

  return <div>/* Task detail UI */</div>;
}
*/

// Vanilla JavaScript Example
/*
const token = localStorage.getItem('token');
const socket = io('http://localhost:3000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('join-project', 'project-id-here');
});

socket.on('task-updated', (data) => {
  console.log('Task updated:', data);
  // Update DOM
});

socket.on('comment-added', (data) => {
  console.log('New comment:', data);
  // Add comment to DOM
});

socket.on('notification', (data) => {
  console.log('Notification:', data.notification);
  // Show notification toast
});
*/

module.exports = 'Socket.io client example for frontend';
