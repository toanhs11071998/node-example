# WebSocket Real-Time Updates

## Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

socket.on('connect', () => console.log('Connected'));
socket.on('error', (err) => console.error('Error:', err));
```

## Client Events (Emit)

### Project & Task Rooms

- **join-project** `(projectId: string)` - Join project room for real-time updates
- **leave-project** `(projectId: string)` - Leave project room
- **join-task** `(taskId: string)` - Join task room (for comments)
- **leave-task** `(taskId: string)` - Leave task room

### Typing Indicators

- **start-typing** `(taskId: string, userName: string)` - Notify typing on task
- **stop-typing** `(taskId: string)` - Notify stopped typing

## Server Events (Listen)

### Task Updates

- **task-updated** - Any field changed (title, description, priority, progress, dueDate)
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "task": { /* full task object */ },
    "updatedBy": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

- **task-status-changed** - Task status changed (todo → in-progress → done)
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "task": { /* full task object */ },
    "newStatus": "in-progress",
    "updatedBy": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

- **task-assigned** - Task assigned to someone
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "task": { /* full task object */ },
    "assigneeId": "user-id",
    "assignedBy": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

- **task-assigned-to-you** - Personal notification (sent to assignee only)
  ```json
  {
    "taskId": "xxx",
    "taskTitle": "Setup Backend",
    "projectId": "xxx",
    "assignedBy": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

### Comment Updates

- **comment-added** - New comment on task
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "comment": { /* full comment object */ },
    "authorId": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

- **task-comment-added** - Comment added (project-level broadcast)
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "commentId": "xxx",
    "authorId": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

- **comment-updated** - Comment content changed
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "comment": { /* full comment object */ },
    "timestamp": "2025-12-05T..."
  }
  ```

- **comment-deleted** - Comment removed
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "commentId": "xxx",
    "timestamp": "2025-12-05T..."
  }
  ```

### Reactions

- **reaction-added** - Emoji reaction added
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "commentId": "xxx",
    "emoji": "👍",
    "userId": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

- **reaction-removed** - Emoji reaction removed
  ```json
  {
    "taskId": "xxx",
    "projectId": "xxx",
    "commentId": "xxx",
    "emoji": "👍",
    "userId": "user-id",
    "timestamp": "2025-12-05T..."
  }
  ```

### Notifications

- **notification** - Personal notification
  ```json
  {
    "notification": { /* full notification object */ },
    "timestamp": "2025-12-05T..."
  }
  ```

### Project Events

- **project-updated** - Project info changed
  ```json
  {
    "projectId": "xxx",
    "project": { /* full project object */ },
    "timestamp": "2025-12-05T..."
  }
  ```

- **member-joined-project** - User added to project
  ```json
  {
    "projectId": "xxx",
    "userId": "user-id",
    "userName": "John Doe",
    "timestamp": "2025-12-05T..."
  }
  ```

### Presence Events

- **user-joined** - User joined project room
- **user-left** - User left project room
- **user-joined-task** - User viewing task
- **user-left-task** - User left task view
- **user-typing** - User typing comment
- **user-stop-typing** - User stopped typing

## Best Practices

1. **Token Management**: Always pass JWT token in `auth` option
2. **Room Management**: Join/leave project and task rooms as user navigates
3. **Error Handling**: Listen to 'error' event and handle reconnection
4. **Typing Indicators**: Emit start-typing on focus, stop-typing on blur/submit
5. **Performance**: Unsubscribe from rooms when leaving to reduce server load
6. **UI Updates**: Use debouncing for rapid updates to avoid UI thrashing

## Example React Hook

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useProjectSocket(token, projectId) {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const s = io(process.env.REACT_APP_API_URL, { auth: { token } });

    s.on('connect', () => {
      s.emit('join-project', projectId);
    });

    s.on('task-updated', (data) => {
      setTasks(prev => 
        prev.map(t => t._id === data.taskId ? data.task : t)
      );
    });

    s.on('comment-added', (data) => {
      // Update comment count or show new comment
    });

    setSocket(s);
    return () => s.close();
  }, [token, projectId]);

  return socket;
}
```
