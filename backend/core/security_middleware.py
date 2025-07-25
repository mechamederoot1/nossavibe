"""
Middleware de segurança avançado para proteção contra ataques
"""
import time
import hashlib
import ipaddress
from typing import Dict, List, Optional, Set
from collections import defaultdict, deque
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import re

class SecurityMiddleware:
    def __init__(self):
        # Rate limiting por IP
        self.ip_requests: Dict[str, deque] = defaultdict(lambda: deque())
        # Rate limiting por usuário
        self.user_requests: Dict[str, deque] = defaultdict(lambda: deque())
        # Tentativas de login falhadas
        self.failed_login_attempts: Dict[str, List[datetime]] = defaultdict(list)
        # IPs bloqueados temporariamente
        self.blocked_ips: Dict[str, datetime] = {}
        # Padrões suspeitos
        self.suspicious_patterns = [
            r'<script[^>]*>.*?</script>',  # XSS
            r'union\s+select',  # SQL Injection
            r'drop\s+table',  # SQL Injection
            r'insert\s+into',  # SQL Injection
            r'delete\s+from',  # SQL Injection
            r'exec\s*\(',  # Command Injection
            r'eval\s*\(',  # Code Injection
            r'javascript:',  # XSS
            r'vbscript:',  # XSS
            r'onload\s*=',  # XSS
            r'onerror\s*=',  # XSS
        ]
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.suspicious_patterns]
        
        # Lista de IPs confiáveis (localhost, etc.)
        self.trusted_ips = {'127.0.0.1', '::1', 'localhost'}
        
        # Configurações
        self.MAX_REQUESTS_PER_MINUTE = 300  # Aumentado para desenvolvimento
        self.MAX_REQUESTS_PER_HOUR = 5000   # Aumentado para desenvolvimento
        self.MAX_LOGIN_ATTEMPTS = 5
        self.LOGIN_LOCKOUT_DURATION = timedelta(minutes=15)
        self.BLOCKED_IP_DURATION = timedelta(hours=1)
        
    def get_client_ip(self, request: Request) -> str:
        """Extrair IP real do cliente considerando proxies"""
        # Verificar headers de proxy
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            # Pegar o primeiro IP da lista
            ip = forwarded_for.split(',')[0].strip()
            try:
                ipaddress.ip_address(ip)
                return ip
            except ValueError:
                pass
        
        # Verificar outros headers
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            try:
                ipaddress.ip_address(real_ip)
                return real_ip
            except ValueError:
                pass
        
        # Fallback para IP direto
        return request.client.host if request.client else '127.0.0.1'
    
    def is_ip_blocked(self, ip: str) -> bool:
        """Verificar se IP está bloqueado"""
        if ip in self.trusted_ips:
            return False
            
        if ip in self.blocked_ips:
            if datetime.now() - self.blocked_ips[ip] < self.BLOCKED_IP_DURATION:
                return True
            else:
                # Remover bloqueio expirado
                del self.blocked_ips[ip]
        return False
    
    def block_ip(self, ip: str, duration: Optional[timedelta] = None):
        """Bloquear IP temporariamente"""
        if ip not in self.trusted_ips:
            self.blocked_ips[ip] = datetime.now()
            print(f"🚫 IP {ip} bloqueado por {duration or self.BLOCKED_IP_DURATION}")
    
    def check_rate_limit(self, ip: str, user_id: Optional[str] = None) -> bool:
        """Verificar rate limiting"""
        now = time.time()
        minute_ago = now - 60
        hour_ago = now - 3600
        
        # Limpar requests antigos
        ip_queue = self.ip_requests[ip]
        while ip_queue and ip_queue[0] < minute_ago:
            ip_queue.popleft()
        
        # Verificar limite por minuto
        if len(ip_queue) >= self.MAX_REQUESTS_PER_MINUTE:
            print(f"⚠️ Rate limit excedido para IP {ip}: {len(ip_queue)} requests no último minuto")
            return False
        
        # Adicionar request atual
        ip_queue.append(now)
        
        # Verificar limite por hora para usuários autenticados
        if user_id:
            user_queue = self.user_requests[user_id]
            while user_queue and user_queue[0] < hour_ago:
                user_queue.popleft()
            
            if len(user_queue) >= self.MAX_REQUESTS_PER_HOUR:
                print(f"⚠️ Rate limit excedido para usuário {user_id}: {len(user_queue)} requests na última hora")
                return False
            
            user_queue.append(now)
        
        return True
    
    def check_login_attempts(self, ip: str, email: str) -> bool:
        """Verificar tentativas de login falhadas"""
        now = datetime.now()
        key = f"{ip}:{email}"
        
        # Limpar tentativas antigas
        attempts = self.failed_login_attempts[key]
        attempts[:] = [attempt for attempt in attempts if now - attempt < self.LOGIN_LOCKOUT_DURATION]
        
        # Verificar se excedeu o limite
        if len(attempts) >= self.MAX_LOGIN_ATTEMPTS:
            print(f"🚫 Muitas tentativas de login falhadas para {email} do IP {ip}")
            return False
        
        return True
    
    def record_failed_login(self, ip: str, email: str):
        """Registrar tentativa de login falhada"""
        key = f"{ip}:{email}"
        self.failed_login_attempts[key].append(datetime.now())
        
        # Bloquear IP se muitas tentativas
        if len(self.failed_login_attempts[key]) >= self.MAX_LOGIN_ATTEMPTS:
            self.block_ip(ip, self.LOGIN_LOCKOUT_DURATION)
    
    def detect_suspicious_patterns(self, content: str) -> List[str]:
        """Detectar padrões suspeitos no conteúdo"""
        detected = []
        for i, pattern in enumerate(self.compiled_patterns):
            if pattern.search(content):
                detected.append(self.suspicious_patterns[i])
        return detected
    
    def sanitize_input(self, data: str) -> str:
        """Sanitizar entrada para prevenir ataques"""
        if not isinstance(data, str):
            return data
        
        # Remover caracteres perigosos
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\x0a', '\x0d']
        for char in dangerous_chars:
            data = data.replace(char, '')
        
        # Limitar tamanho
        if len(data) > 10000:  # 10KB
            data = data[:10000]
        
        return data.strip()
    
    def check_request_size(self, request: Request) -> bool:
        """Verificar tamanho da requisição"""
        content_length = request.headers.get('content-length')
        if content_length:
            size = int(content_length)
            # Limite de 10MB para uploads, 1MB para outros
            max_size = 10 * 1024 * 1024 if '/upload' in str(request.url) else 1 * 1024 * 1024
            if size > max_size:
                return False
        return True
    
    def validate_headers(self, request: Request) -> bool:
        """Validar headers da requisição"""
        # Verificar User-Agent válido
        user_agent = request.headers.get('user-agent', '')
        if not user_agent or len(user_agent) < 10:
            print(f"⚠️ User-Agent suspeito: {user_agent}")
            return False
        
        # Verificar Origin para requests CORS
        origin = request.headers.get('origin')
        if origin:
            allowed_origins = [
                'http://localhost:5173',
                'http://localhost:3000',
                'https://vibe.social',
                'https://app.vibe.social'
            ]
            if origin not in allowed_origins:
                print(f"⚠️ Origin não permitido: {origin}")
                return False
        
        return True
    
    async def process_request(self, request: Request) -> Optional[JSONResponse]:
        """Processar requisição com todas as verificações de segurança"""
        ip = self.get_client_ip(request)
        
        # 1. Verificar se IP está bloqueado
        if self.is_ip_blocked(ip):
            print(f"🚫 Request bloqueada - IP {ip} está na lista de bloqueados")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "IP temporariamente bloqueado devido a atividade suspeita"}
            )
        
        # 2. Verificar rate limiting
        user_id = None
        auth_header = request.headers.get('authorization')
        if auth_header and auth_header.startswith('Bearer '):
            # Extrair user_id do token (implementação simplificada)
            token = auth_header.split(' ')[1]
            user_id = hashlib.md5(token.encode()).hexdigest()[:8]
        
        if not self.check_rate_limit(ip, user_id):
            self.block_ip(ip, timedelta(minutes=5))
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Muitas requisições. Tente novamente em alguns minutos."}
            )
        
        # 3. Verificar tamanho da requisição
        if not self.check_request_size(request):
            print(f"⚠️ Request muito grande do IP {ip}")
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Requisição muito grande"}
            )
        
        # 4. Validar headers
        if not self.validate_headers(request):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Headers inválidos"}
            )
        
        # 5. Verificar padrões suspeitos na URL e query params
        url_str = str(request.url)
        suspicious = self.detect_suspicious_patterns(url_str)
        if suspicious:
            print(f"🚫 Padrões suspeitos detectados na URL do IP {ip}: {suspicious}")
            self.block_ip(ip, timedelta(hours=24))
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Conteúdo suspeito detectado"}
            )
        
        return None  # Continuar processamento normal

# Instância global do middleware
security_middleware = SecurityMiddleware()

async def security_check(request: Request):
    """Função middleware para FastAPI"""
    return await security_middleware.process_request(request)
