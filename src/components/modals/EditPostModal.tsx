import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { apiService } from '../../services/ApiService';

interface Post {
  id: number;
  content: string;
  post_type: string;
  privacy: string;
  media_url?: string;
  media_type?: string;
}

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  userToken: string;
  onPostUpdated: (updatedPost: Post) => void;
}

export function EditPostModal({ 
  isOpen, 
  onClose, 
  post, 
  userToken, 
  onPostUpdated 
}: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [privacy, setPrivacy] = useState(post.privacy);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setContent(post.content);
      setPrivacy(post.privacy);
      setError('');
    }
  }, [isOpen, post]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('O conteúdo não pode estar vazio');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.updatePost(post.id, {
        content: content.trim(),
        privacy
      }, userToken);

      if (response.ok) {
        const updatedPost = await response.json();
        onPostUpdated(updatedPost);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao atualizar post');
      }
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editar Post</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Content textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="O que você está pensando?"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              autoFocus
            />
            <div className="mt-1 text-xs text-gray-500">
              {content.length}/2000 caracteres
            </div>
          </div>

          {/* Privacy selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacidade
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="public">Público</option>
              <option value="friends">Amigos</option>
              <option value="private">Privado</option>
            </select>
          </div>

          {/* Media preview (if exists) */}
          {post.media_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mídia anexada
              </label>
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>📎</span>
                  <span>
                    {post.media_type?.startsWith('image/') ? 'Imagem' : 
                     post.media_type?.startsWith('video/') ? 'Vídeo' : 'Arquivo'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Para alterar a mídia, crie um novo post
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !content.trim() || content.length > 2000}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
