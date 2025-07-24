"""
Middleware de performance e otimização
"""
import time
import gzip
import asyncio
from typing import Dict, Any, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import json
import hashlib
from datetime import datetime, timedelta

class PerformanceMiddleware:
    def __init__(self):
        # Cache em memória para respostas
        self.response_cache: Dict[str, Dict[str, Any]] = {}
        # Estatísticas de performance
        self.stats = {
            'requests_total': 0,
            'requests_cached': 0,
            'avg_response_time': 0,
            'slow_requests': 0,
        }
        # Configurações
        self.CACHE_TTL = 300  # 5 minutos
        self.SLOW_REQUEST_THRESHOLD = 1000  # 1 segundo
        self.MAX_CACHE_SIZE = 1000
        self.COMPRESSION_MIN_SIZE = 1024  # 1KB
        
        # Endpoints que podem ser cacheados
        self.cacheable_endpoints = [
            '/auth/me',
            '/posts',
            '/users/profile',
            '/stories',
        ]
        
        # Endpoints que não devem ser cacheados
        self.non_cacheable_endpoints = [
            '/auth/login',
            '/auth/register',
            '/upload',
            '/messages',
        ]
    
    def should_cache_endpoint(self, path: str, method: str) -> bool:
        """Verificar se o endpoint deve ser cacheado"""
        if method != 'GET':
            return False
            
        # Verificar endpoints explicitamente não cacheáveis
        for non_cacheable in self.non_cacheable_endpoints:
            if non_cacheable in path:
                return False
        
        # Verificar endpoints cacheáveis
        for cacheable in self.cacheable_endpoints:
            if cacheable in path:
                return True
                
        return False
    
    def generate_cache_key(self, request: Request, user_id: Optional[str] = None) -> str:
        """Gerar chave de cache para a requisição"""
        # Incluir método, path, query params e user_id
        key_data = {
            'method': request.method,
            'path': str(request.url.path),
            'query': str(request.url.query),
            'user_id': user_id or 'anonymous'
        }
        
        # Criar hash da chave
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Obter resposta do cache se válida"""
        if cache_key not in self.response_cache:
            return None
            
        cached_data = self.response_cache[cache_key]
        
        # Verificar se não expirou
        if datetime.now() > cached_data['expires_at']:
            del self.response_cache[cache_key]
            return None
            
        self.stats['requests_cached'] += 1
        return cached_data
    
    def cache_response(self, cache_key: str, response_data: Any, status_code: int = 200):
        """Armazenar resposta no cache"""
        # Limitar tamanho do cache
        if len(self.response_cache) >= self.MAX_CACHE_SIZE:
            # Remover entradas mais antigas
            oldest_key = min(
                self.response_cache.keys(),
                key=lambda k: self.response_cache[k]['created_at']
            )
            del self.response_cache[oldest_key]
        
        # Armazenar no cache
        self.response_cache[cache_key] = {
            'data': response_data,
            'status_code': status_code,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(seconds=self.CACHE_TTL),
            'content_type': 'application/json'
        }
    
    def should_compress_response(self, content: bytes, request: Request) -> bool:
        """Verificar se a resposta deve ser comprimida"""
        # Verificar tamanho mínimo
        if len(content) < self.COMPRESSION_MIN_SIZE:
            return False
            
        # Verificar se o cliente aceita gzip
        accept_encoding = request.headers.get('accept-encoding', '')
        if 'gzip' not in accept_encoding:
            return False
            
        return True
    
    def compress_response(self, content: bytes) -> bytes:
        """Comprimir resposta usando gzip"""
        return gzip.compress(content)
    
    def extract_user_id_from_request(self, request: Request) -> Optional[str]:
        """Extrair user_id do token de autorização"""
        auth_header = request.headers.get('authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        # Para simplificar, usamos hash do token como user_id
        token = auth_header.split(' ')[1]
        return hashlib.md5(token.encode()).hexdigest()[:8]
    
    async def process_request(self, request: Request) -> Optional[Response]:
        """Processar requisição com otimizações de performance"""
        start_time = time.time()
        self.stats['requests_total'] += 1
        
        # Verificar se deve usar cache
        user_id = self.extract_user_id_from_request(request)
        should_cache = self.should_cache_endpoint(str(request.url.path), request.method)
        
        if should_cache:
            cache_key = self.generate_cache_key(request, user_id)
            cached_response = self.get_cached_response(cache_key)
            
            if cached_response:
                # Retornar resposta cacheada
                response_time = (time.time() - start_time) * 1000
                self.update_stats(response_time)
                
                content = json.dumps(cached_response['data']).encode()
                
                # Comprimir se necessário
                headers = {'content-type': 'application/json'}
                if self.should_compress_response(content, request):
                    content = self.compress_response(content)
                    headers['content-encoding'] = 'gzip'
                    headers['x-cache'] = 'HIT-COMPRESSED'
                else:
                    headers['x-cache'] = 'HIT'
                
                return Response(
                    content=content,
                    status_code=cached_response['status_code'],
                    headers=headers
                )
        
        # Se não foi cacheado, armazenar informações para cache posterior
        request.state.start_time = start_time
        request.state.should_cache = should_cache
        if should_cache:
            request.state.cache_key = cache_key
        
        return None
    
    async def process_response(self, request: Request, response: Response) -> Response:
        """Processar resposta com otimizações"""
        # Calcular tempo de resposta
        if hasattr(request.state, 'start_time'):
            response_time = (time.time() - request.state.start_time) * 1000
            self.update_stats(response_time)
            
            # Adicionar headers de performance
            response.headers['x-response-time'] = f"{response_time:.2f}ms"
            
            # Marcar requests lentos
            if response_time > self.SLOW_REQUEST_THRESHOLD:
                response.headers['x-slow-request'] = 'true'
                print(f"⚠️ Slow request detected: {request.url.path} took {response_time:.2f}ms")
        
        # Cache da resposta se aplicável
        if (hasattr(request.state, 'should_cache') and 
            request.state.should_cache and 
            hasattr(request.state, 'cache_key') and
            response.status_code == 200):
            
            # Obter conteúdo da resposta
            if hasattr(response, 'body'):
                try:
                    response_data = json.loads(response.body.decode())
                    self.cache_response(
                        request.state.cache_key, 
                        response_data, 
                        response.status_code
                    )
                    response.headers['x-cache'] = 'MISS'
                except (json.JSONDecodeError, AttributeError):
                    pass
        
        # Comprimir resposta se aplicável
        if (hasattr(response, 'body') and 
            isinstance(response.body, bytes) and
            self.should_compress_response(response.body, request)):
            
            compressed_body = self.compress_response(response.body)
            response.headers['content-encoding'] = 'gzip'
            response.headers['content-length'] = str(len(compressed_body))
            
            # Criar nova resposta com conteúdo comprimido
            return Response(
                content=compressed_body,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        
        return response
    
    def update_stats(self, response_time: float):
        """Atualizar estatísticas de performance"""
        # Atualizar tempo médio de resposta
        total_requests = self.stats['requests_total']
        current_avg = self.stats['avg_response_time']
        self.stats['avg_response_time'] = (
            (current_avg * (total_requests - 1) + response_time) / total_requests
        )
        
        # Contar requests lentos
        if response_time > self.SLOW_REQUEST_THRESHOLD:
            self.stats['slow_requests'] += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas de performance"""
        return {
            **self.stats,
            'cache_hit_rate': (
                self.stats['requests_cached'] / max(self.stats['requests_total'], 1) * 100
            ),
            'cache_size': len(self.response_cache),
            'slow_request_rate': (
                self.stats['slow_requests'] / max(self.stats['requests_total'], 1) * 100
            )
        }
    
    def clear_cache(self):
        """Limpar cache"""
        self.response_cache.clear()
    
    def clear_expired_cache(self):
        """Limpar entradas expiradas do cache"""
        now = datetime.now()
        expired_keys = [
            key for key, value in self.response_cache.items()
            if now > value['expires_at']
        ]
        
        for key in expired_keys:
            del self.response_cache[key]

# Instância global do middleware
performance_middleware = PerformanceMiddleware()

# Limpar cache expirado periodicamente
async def cleanup_cache_task():
    """Task para limpeza periódica do cache"""
    while True:
        await asyncio.sleep(300)  # 5 minutos
        performance_middleware.clear_expired_cache()

# Função para iniciar a task de limpeza
def start_cache_cleanup():
    asyncio.create_task(cleanup_cache_task())
