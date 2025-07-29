#!/usr/bin/env python3
"""
Script para testar upload de stories e debug de problemas
"""
import sys
import os
import requests
from pathlib import Path

# Adicionar o diretório backend ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_story_creation():
    """Testar criação de story com texto simples"""
    
    # URL da API
    api_url = "http://localhost:8000/stories/"
    
    # Dados do story
    story_data = {
        "content": "Story de teste criado via script",
        "media_type": "text",
        "background_color": "#3B82F6",
        "duration_hours": 24
    }
    
    # Headers (você precisa adicionar um token válido aqui)
    headers = {
        "Content-Type": "application/json",
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    try:
        print("🔄 Testando criação de story...")
        response = requests.post(api_url, json=story_data, headers=headers)
        
        print(f"📊 Status: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Story criado com sucesso!")
        else:
            print(f"❌ Erro ao criar story: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")

def check_directories():
    """Verificar se os diretórios de upload existem"""
    
    directories = [
        "uploads/stories",
        "uploads/image", 
        "uploads/video",
        "uploads/audio"
    ]
    
    print("📁 Verificando diretórios de upload...")
    
    for directory in directories:
        if os.path.exists(directory):
            print(f"✅ {directory} - existe")
            # Listar arquivos no diretório
            files = os.listdir(directory)
            if files:
                print(f"   📄 Arquivos encontrados: {len(files)}")
                for file in files[:3]:  # Mostrar apenas os 3 primeiros
                    print(f"      - {file}")
                if len(files) > 3:
                    print(f"      ... e mais {len(files) - 3} arquivos")
            else:
                print(f"   📁 Diretório vazio")
        else:
            print(f"❌ {directory} - não existe")

def test_static_file_access():
    """Testar acesso a arquivos estáticos"""
    
    # Verificar se há arquivos para testar
    stories_dir = "uploads/stories"
    if os.path.exists(stories_dir):
        files = os.listdir(stories_dir)
        if files:
            test_file = files[0]
            test_url = f"http://localhost:8000/uploads/stories/{test_file}"
            
            try:
                print(f"🔄 Testando acesso ao arquivo: {test_url}")
                response = requests.get(test_url)
                print(f"📊 Status: {response.status_code}")
                
                if response.status_code == 200:
                    print("✅ Arquivo acessível via HTTP!")
                else:
                    print(f"❌ Erro ao acessar arquivo: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Erro de conexão: {e}")
        else:
            print("📁 Nenhum arquivo encontrado em uploads/stories para testar")
    else:
        print("❌ Diretório uploads/stories não existe")

if __name__ == "__main__":
    print("🧪 TESTE DE DEBUG - STORIES")
    print("=" * 40)
    
    check_directories()
    print("\n" + "=" * 40)
    
    test_static_file_access()
    print("\n" + "=" * 40)
    
    # test_story_creation()  # Descomente se tiver um token válido
    
    print("\n✅ Testes concluídos!")
