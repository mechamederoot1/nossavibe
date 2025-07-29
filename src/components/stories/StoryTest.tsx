import React, { useState } from 'react';
import { StoryViewer } from './StoryViewer';

// Mock data para testar stories
const mockStories = [
  {
    id: "1",
    author: {
      id: 1,
      first_name: "Teste",
      last_name: "Usuario",
      avatar: null
    },
    content: "Este é um story de teste só com texto",
    media_type: "text",
    media_url: null,
    background_color: "#3B82F6",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    views_count: 0
  },
  {
    id: "2", 
    author: {
      id: 1,
      first_name: "Teste",
      last_name: "Usuario",
      avatar: null
    },
    content: "Story com imagem de teste",
    media_type: "image",
    media_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjMwMHgyMDA8L3RleHQ+PC9zdmc+",
    background_color: "#10B981",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    views_count: 5
  },
  {
    id: "3",
    author: {
      id: 1,
      first_name: "Teste", 
      last_name: "Usuario",
      avatar: null
    },
    content: null,
    media_type: "image",
    media_url: "https://via.placeholder.com/400x600/ff6b6b/ffffff?text=Story+Image",
    background_color: "#FF6B6B",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    views_count: 12
  }
];

export const StoryTest: React.FC = () => {
  const [showViewer, setShowViewer] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Stories</h2>
      
      <button
        onClick={() => setShowViewer(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Abrir Stories de Teste
      </button>

      <div className="mt-4 space-y-2">
        <h3 className="font-semibold">Stories de Teste:</h3>
        {mockStories.map((story, index) => (
          <div key={story.id} className="p-2 border rounded">
            <strong>Story {index + 1}:</strong> {story.content || 'Sem texto'} 
            <br />
            <small>Tipo: {story.media_type} | URL: {story.media_url ? 'Sim' : 'Não'}</small>
          </div>
        ))}
      </div>

      {showViewer && (
        <StoryViewer
          stories={mockStories}
          currentIndex={0}
          onClose={() => setShowViewer(false)}
          userToken="test-token"
          currentUserId={1}
        />
      )}
    </div>
  );
};
