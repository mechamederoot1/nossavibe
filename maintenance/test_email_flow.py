#!/usr/bin/env python3
"""
Script para testar o fluxo completo de verificação de e-mail
"""
import requests
import json
import time

# Configurações
BACKEND_URL = "http://localhost:8000"
EMAIL_SERVICE_URL = "http://localhost:3001"

def test_registration():
    """Testa o registro de usuário"""
    print("🧪 Testando registro de usuário...")
    
    user_data = {
        "first_name": "Teste",
        "last_name": "Usuario",
        "email": "teste@exemplo.com",
        "password": "senha123",
        "username": "testeusuario123",
        "display_id": "1234567890"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=user_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Usuário registrado com ID: {data.get('id')}")
            return data
        else:
            print(f"❌ Erro no registro: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return None

def test_email_verification_backend(user_id, email, first_name):
    """Testa o serviço de verificação do backend"""
    print("🧪 Testando serviço de verificação do backend...")
    
    verification_data = {
        "email": email,
        "first_name": first_name,
        "user_id": user_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/email-verification/send-verification", 
            json=verification_data
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Código enviado via backend")
            return True
        else:
            print(f"❌ Erro no backend: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro de conexão com backend: {e}")
        return False

def test_email_service_external(user_id, email, first_name):
    """Testa o serviço de e-mail externo"""
    print("🧪 Testando serviço de e-mail externo...")
    
    verification_data = {
        "email": email,
        "firstName": first_name,
        "userId": user_id
    }
    
    try:
        response = requests.post(
            f"{EMAIL_SERVICE_URL}/send-verification", 
            json=verification_data
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Código enviado via serviço externo")
            return True
        else:
            print(f"❌ Erro no serviço externo: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro de conexão com serviço externo: {e}")
        return False

def test_health_checks():
    """Testa a saúde dos serviços"""
    print("🧪 Testando saúde dos serviços...")
    
    # Backend
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            print("✅ Backend está funcionando")
        else:
            print(f"❌ Backend com problemas: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend inacessível: {e}")
    
    # Email service
    try:
        response = requests.get(f"{EMAIL_SERVICE_URL}/health")
        if response.status_code == 200:
            print("✅ Serviço de e-mail está funcionando")
        else:
            print(f"❌ Serviço de e-mail com problemas: {response.status_code}")
    except Exception as e:
        print(f"❌ Serviço de e-mail inacessível: {e}")

def main():
    print("🚀 Iniciando teste completo do fluxo de e-mail")
    print("=" * 50)
    
    # 1. Testar saúde dos serviços
    test_health_checks()
    print()
    
    # 2. Testar registro
    user_data = test_registration()
    if not user_data:
        print("❌ Não foi possível continuar sem registro bem-sucedido")
        return
    
    print()
    
    # 3. Testar verificação via backend
    backend_success = test_email_verification_backend(
        user_data.get('id'),
        'teste@exemplo.com',
        'Teste'
    )
    
    print()
    
    # 4. Testar verificação via serviço externo
    external_success = test_email_service_external(
        user_data.get('id'),
        'teste@exemplo.com',
        'Teste'
    )
    
    print()
    print("📊 Resumo dos testes:")
    print(f"  - Backend: {'✅' if backend_success else '❌'}")
    print(f"  - Serviço externo: {'✅' if external_success else '❌'}")
    
    if backend_success or external_success:
        print("✅ Pelo menos um serviço está funcionando!")
    else:
        print("❌ Nenhum serviço de e-mail está funcionando")

if __name__ == "__main__":
    main()