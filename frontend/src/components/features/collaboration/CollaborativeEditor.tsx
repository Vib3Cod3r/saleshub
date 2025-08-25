import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface DocumentOperation {
  id: string;
  type: 'insert' | 'delete';
  position: number;
  text?: string;
  length?: number;
  userId: string;
  timestamp: number;
  version: number;
}

interface CollaborativeDocument {
  id: string;
  title: string;
  content: string;
  participants: string[];
  version: number;
  lastModified: Date;
  createdAt: Date;
  createdBy: string;
}

interface Participant {
  userId: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  lastActivity: Date;
}

interface CollaborativeEditorProps {
  documentId: string;
  onContentChange?: (content: string) => void;
  onParticipantsChange?: (participants: Participant[]) => void;
  className?: string;
}

export const CollaborativeEditor = ({
  documentId,
  onContentChange,
  onParticipantsChange,
  className = ""
}: CollaborativeEditorProps) => {
  const [document, setDocument] = useState<CollaborativeDocument | null>(null);
  const [content, setContent] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorPosition = useRef(0);
  const operationQueue = useRef<DocumentOperation[]>([]);
  const { isConnected: wsConnected } = useWebSocket();

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [documentId]);

  // Handle WebSocket events
  useEffect(() => {
    if (!wsConnected) return;

    // Note: WebSocket message handling is managed by the useWebSocket hook
    // Document-specific operations would be handled through the hook's message handling
    console.log('Collaborative editor connected to WebSocket');
  }, [wsConnected, documentId]);

  // Load document from API
  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Join document session
      const joinResponse = await fetch(`/api/collaborative-documents/${documentId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!joinResponse.ok) {
        throw new Error('Failed to join document session');
      }

      const joinData = await joinResponse.json();
      const doc = joinData.data.document;

      setDocument(doc);
      setContent(doc.content);
      setIsConnected(true);

      // Get participants
      await loadParticipants();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load document participants
  const loadParticipants = async () => {
    try {
      const response = await fetch(`/api/collaborative-documents/${documentId}/participants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.data.participants.map((userId: string) => ({
          userId,
          cursorPosition: 0,
          selectionStart: 0,
          selectionEnd: 0,
          lastActivity: new Date()
        })));
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  // Handle content change
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    const cursorPosition = event.target.selectionStart;
    
    setContent(newContent);
    onContentChange?.(newContent);

    // Calculate operation
    const operation = calculateOperation(content, newContent, cursorPosition);
    if (operation) {
      // Apply operation locally
      applyLocalOperation(operation);
      
      // Send operation to server
      sendOperation(operation);
    }

    // Update cursor position
    updateCursorPosition(cursorPosition);
  }, [content, onContentChange]);

  // Calculate operation from content change
  const calculateOperation = (
    oldContent: string,
    newContent: string,
    cursorPosition: number
  ): DocumentOperation | null => {
    if (oldContent === newContent) return null;

    const oldLength = oldContent.length;
    const newLength = newContent.length;

    if (newLength > oldLength) {
      // Insert operation
      const insertedText = newContent.slice(cursorPosition - (newLength - oldLength), cursorPosition);
      return {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'insert',
        position: cursorPosition - insertedText.length,
        text: insertedText,
        userId: 'current-user', // This would be the actual user ID
        timestamp: Date.now(),
        version: document?.version || 0
      };
    } else if (newLength < oldLength) {
      // Delete operation
      const deletedLength = oldLength - newLength;
      return {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'delete',
        position: cursorPosition,
        length: deletedLength,
        userId: 'current-user', // This would be the actual user ID
        timestamp: Date.now(),
        version: document?.version || 0
      };
    }

    return null;
  };

  // Apply local operation
  const applyLocalOperation = (operation: DocumentOperation) => {
    let newContent = content;

    switch (operation.type) {
      case 'insert':
        if (operation.text) {
          newContent = content.slice(0, operation.position) + operation.text + content.slice(operation.position);
        }
        break;
      case 'delete':
        if (operation.length) {
          newContent = content.slice(0, operation.position) + content.slice(operation.position + operation.length);
        }
        break;
    }

    setContent(newContent);
    onContentChange?.(newContent);
  };

  // Apply remote operation
  const applyRemoteOperation = (operation: DocumentOperation) => {
    // Don't apply our own operations
    if (operation.userId === 'current-user') return;

    applyLocalOperation(operation);
  };

  // Send operation to server
  const sendOperation = async (operation: DocumentOperation) => {
    try {
      const response = await fetch(`/api/collaborative-documents/${documentId}/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: operation.type,
          position: operation.position,
          text: operation.text,
          length: operation.length
        })
      });

      if (!response.ok) {
        console.error('Failed to send operation');
      }
    } catch (error) {
      console.error('Error sending operation:', error);
    }
  };

  // Update cursor position
  const updateCursorPosition = async (position: number) => {
    if (position === lastCursorPosition.current) return;
    
    lastCursorPosition.current = position;

    try {
      await fetch(`/api/collaborative-documents/${documentId}/cursor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cursorPosition: position
        })
      });
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  };

  // Update participant cursor
  const updateParticipantCursor = (userId: string, cursorData: any) => {
    setParticipants(prev => {
      const updated = prev.map(p => 
        p.userId === userId 
          ? { ...p, ...cursorData, lastActivity: new Date() }
          : p
      );
      
      // Add new participant if not found
      if (!updated.find(p => p.userId === userId)) {
        updated.push({
          userId,
          cursorPosition: cursorData.cursorPosition,
          selectionStart: cursorData.selectionStart,
          selectionEnd: cursorData.selectionEnd,
          lastActivity: new Date()
        });
      }

      onParticipantsChange?.(updated);
      return updated;
    });
  };

  // Handle session events
  const handleSessionEvent = (event: string, data: any) => {
    switch (event) {
      case 'user_joined':
        console.log(`User ${data.userId} joined the document`);
        break;
      case 'user_left':
        console.log(`User ${data.userId} left the document`);
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
        break;
      default:
        console.log('Session event:', event, data);
    }
  };

  // Handle key events for real-time updates
  const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPosition = event.currentTarget.selectionStart;
    updateCursorPosition(cursorPosition);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-red-800 font-medium">Error loading document</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={loadDocument}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Document Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{document?.title}</h2>
          <p className="text-sm text-gray-500">
            {participants.length} participant{participants.length !== 1 ? 's' : ''} online
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Collaborative Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyUp={handleKeyUp}
          placeholder="Start typing to collaborate in real-time..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={!isConnected}
        />
        
        {/* Connection Status Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-gray-600 font-medium">Disconnected</div>
              <div className="text-gray-500 text-sm">Reconnecting...</div>
            </div>
          </div>
        )}
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Active Participants</h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center space-x-2 px-3 py-1 bg-white border border-gray-200 rounded-full"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{participant.userId}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Info */}
      <div className="text-xs text-gray-500">
        Version {document?.version} • Last modified {document?.lastModified.toLocaleString()}
      </div>
    </div>
  );
};
