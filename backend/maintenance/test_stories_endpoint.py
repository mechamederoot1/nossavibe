#!/usr/bin/env python3
"""
Teste manual do endpoint de stories
"""

import sys
import os
import requests
import json

# Configurações
API_BASE = "http://localhost:8000"

def test_stories_endpoint():
    """Teste básico do endpoint de stories"""
    print("🧪 TESTANDO ENDPOINT DE STORIES")
    print("=" * 50)
    
    # 1. Testar se API está rodando
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API está rodando")
        else:
            print(f"❌ API não está funcionando: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ API não está acessível. Certifique-se que o backend está rodando na porta 8000")
        return False
    
    # 2. Testar endpoint stories com OPTIONS
    try:
        response = requests.options(f"{API_BASE}/stories/", timeout=5)
        if response.status_code in [200, 405]:
            print("✅ Endpoint /stories/ existe")
        else:
            print(f"❌ Endpoint /stories/ não encontrado: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao testar endpoint: {e}")
        return False
    
    # 3. Tentar fazer login com usuário de teste
    print("\n🔐 Testando login...")
    login_data = {
        "username": "test@story.com",
        "password": "123456"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login", data=login_data, timeout=10)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print("✅ Login realizado com sucesso")
        else:
            print(f"⚠️ Login falhou: {response.status_code}")
            print("   Isso é normal se não houver usuário de teste")
            # Criar um token falso para testar apenas a estrutura da API
            token = "fake_token_for_structure_test"
    except Exception as e:
        print(f"⚠️ Erro no login: {e}")
        token = "fake_token_for_structure_test"
    
    # 4. Testar criação de story (mesmo com token falso, deve mostrar erro de auth, não 404)
    print("\n📝 Testando criação de story...")
    
    story_data = {
        "content": "Test story from script",
        "background_color": "#FF5722",
        "duration_hours": "24"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{API_BASE}/stories/", data=story_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Story criada com sucesso!")
            result = response.json()
            print(f"   Story ID: {result.get('story_id')}")
        elif response.status_code == 401:
            print("✅ Endpoint funciona (erro de autenticação esperado)")
        elif response.status_code == 404:
            print("❌ Endpoint não encontrado (404)")
            return False
        else:
            print(f"⚠️ Resposta inesperada: {response.status_code}")
            print(f"   Resposta: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Erro ao testar criação: {e}")
        return False
    
    # 5. Testar busca de stories
    print("\n📖 Testando busca de stories...")
    
    try:
        response = requests.get(f"{API_BASE}/stories/", headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Busca de stories funciona!")
            stories = response.json()
            print(f"   Encontradas {len(stories)} stories")
        elif response.status_code == 401:
            print("✅ Endpoint de busca funciona (erro de autenticação esperado)")
        elif response.status_code == 404:
            print("❌ Endpoint de busca não encontrado (404)")
            return False
        else:
            print(f"⚠️ Resposta inesperada na busca: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao testar busca: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 TESTE CONCLUÍDO - ENDPOINTS ESTÃO FUNCIONANDO!")
    print("\nSe você viu '✅ Endpoint funciona' nas mensagens acima,")
    print("significa que o problema não é o endpoint, mas sim:")
    print("1. Autenticação/token")
    print("2. Dados sendo enviados")
    print("3. Validação no backend")
    print("\nPróximo passo: Verificar logs do backend enquanto testa no front-end")
    
    return True

if __name__ == "__main__":
    success = test_stories_endpoint()
    if not success:
        print("\n💥 FALHA NOS TESTES - VERIFIQUE SE O BACKEND ESTÁ RODANDO")
        sys.exit(1)
