#!/usr/bin/env python3
"""
Script completo de diagnóstico e correção para Stories
Verifica banco de dados, tabelas, rotas e resolve problemas
"""

import os
import sys
import requests
import json
from datetime import datetime
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import get_database_url
from core.database import Base, engine
from models.story import Story, StoryView, StoryTag, StoryOverlay
from models.user import User

class StoriesDiagnostic:
    def __init__(self):
        self.database_url = get_database_url()
        self.engine = engine
        self.Session = sessionmaker(bind=self.engine)
        self.api_base = "http://localhost:8000"
        self.results = {
            "database_connection": False,
            "tables_exist": False,
            "api_endpoint": False,
            "sample_data": False,
            "errors": [],
            "warnings": [],
            "fixes_applied": []
        }
    
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"🔍 {title}")
        print(f"{'='*60}")
    
    def print_success(self, message):
        print(f"✅ {message}")
    
    def print_error(self, message):
        print(f"❌ {message}")
        self.results["errors"].append(message)
    
    def print_warning(self, message):
        print(f"⚠️  {message}")
        self.results["warnings"].append(message)
    
    def print_fix(self, message):
        print(f"🔧 {message}")
        self.results["fixes_applied"].append(message)
    
    def test_database_connection(self):
        """Testar conexão com o banco de dados"""
        self.print_header("TESTE DE CONEXÃO COM BANCO DE DADOS")
        
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1")).fetchone()
                if result:
                    self.print_success("Conexão com banco de dados estabelecida")
                    self.results["database_connection"] = True
                    
                    # Verificar se o banco vibe existe
                    result = conn.execute(text("SELECT DATABASE()")).fetchone()
                    db_name = result[0] if result else "Unknown"
                    self.print_success(f"Conectado ao banco: {db_name}")
                    
                    return True
        except Exception as e:
            self.print_error(f"Erro de conexão com banco: {str(e)}")
            return False
    
    def check_and_create_tables(self):
        """Verificar e criar tabelas necessárias"""
        self.print_header("VERIFICAÇÃO E CRIAÇÃO DE TABELAS")
        
        try:
            inspector = inspect(self.engine)
            existing_tables = inspector.get_table_names()
            
            required_tables = ['stories', 'story_views', 'story_tags', 'story_overlays', 'users']
            missing_tables = []
            
            for table in required_tables:
                if table in existing_tables:
                    self.print_success(f"Tabela {table} existe")
                else:
                    missing_tables.append(table)
                    self.print_error(f"Tabela {table} NÃO existe")
            
            if missing_tables:
                self.print_fix("Criando tabelas faltantes...")
                
                # Criar todas as tabelas usando o Base.metadata
                Base.metadata.create_all(bind=self.engine)
                
                # Verificar novamente
                inspector = inspect(self.engine)
                existing_tables = inspector.get_table_names()
                
                for table in missing_tables:
                    if table in existing_tables:
                        self.print_success(f"Tabela {table} criada com sucesso")
                    else:
                        self.print_error(f"Falha ao criar tabela {table}")
            
            # Verificar estrutura das tabelas de stories
            if 'stories' in existing_tables:
                columns = [col['name'] for col in inspector.get_columns('stories')]
                required_columns = ['id', 'author_id', 'content', 'media_type', 'media_url', 
                                  'background_color', 'created_at', 'expires_at']
                
                for col in required_columns:
                    if col in columns:
                        self.print_success(f"Coluna stories.{col} existe")
                    else:
                        self.print_error(f"Coluna stories.{col} NÃO existe")
            
            self.results["tables_exist"] = len(missing_tables) == 0
            return True
            
        except Exception as e:
            self.print_error(f"Erro ao verificar tabelas: {str(e)}")
            return False
    
    def check_uploads_directory(self):
        """Verificar e criar diretórios de upload"""
        self.print_header("VERIFICAÇÃO DE DIRETÓRIOS DE UPLOAD")
        
        upload_dirs = ['uploads', 'uploads/stories', 'uploads/posts', 'uploads/profiles']
        
        for directory in upload_dirs:
            full_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), directory)
            
            if os.path.exists(full_path):
                self.print_success(f"Diretório {directory} existe")
            else:
                try:
                    os.makedirs(full_path, exist_ok=True)
                    self.print_fix(f"Diretório {directory} criado")
                except Exception as e:
                    self.print_error(f"Erro ao criar diretório {directory}: {str(e)}")
    
    def test_api_endpoint(self):
        """Testar endpoint da API"""
        self.print_header("TESTE DE ENDPOINT DA API")
        
        try:
            # Testar health check
            response = requests.get(f"{self.api_base}/health", timeout=5)
            if response.status_code == 200:
                self.print_success("API está rodando")
            else:
                self.print_error(f"API health check falhou: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.print_error("API não está rodando ou não está acessível")
            return False
        except Exception as e:
            self.print_error(f"Erro ao testar API: {str(e)}")
            return False
        
        # Testar se endpoint de stories existe
        try:
            response = requests.options(f"{self.api_base}/stories/", timeout=5)
            if response.status_code in [200, 405]:  # 405 é normal para OPTIONS
                self.print_success("Endpoint /stories/ está disponível")
                self.results["api_endpoint"] = True
            else:
                self.print_error(f"Endpoint /stories/ não funciona: {response.status_code}")
        except Exception as e:
            self.print_error(f"Erro ao testar endpoint stories: {str(e)}")
        
        return self.results["api_endpoint"]
    
    def create_test_user(self):
        """Criar usuário de teste se não existir"""
        self.print_header("CRIAÇÃO DE USUÁRIO DE TESTE")
        
        try:
            session = self.Session()
            
            # Verificar se já existe um usuário de teste
            test_user = session.query(User).filter(User.email == "test@story.com").first()
            
            if test_user:
                self.print_success(f"Usuário de teste já existe: ID {test_user.id}")
                return test_user
            
            # Criar usuário de teste
            from utils.auth import hash_password
            
            test_user = User(
                first_name="Test",
                last_name="Story",
                email="test@story.com",
                password=hash_password("123456"),
                username="teststory",
                display_id="1000000001",
                is_verified=True,
                is_active=True
            )
            
            session.add(test_user)
            session.commit()
            session.refresh(test_user)
            
            self.print_fix(f"Usuário de teste criado: ID {test_user.id}")
            return test_user
            
        except Exception as e:
            self.print_error(f"Erro ao criar usuário de teste: {str(e)}")
            return None
        finally:
            session.close()
    
    def test_story_creation(self):
        """Testar criação de story no banco"""
        self.print_header("TESTE DE CRIAÇÃO DE STORY")
        
        try:
            session = self.Session()
            
            # Criar usuário de teste
            test_user = self.create_test_user()
            if not test_user:
                return False
            
            # Tentar criar uma story
            from datetime import datetime, timedelta
            
            test_story = Story(
                author_id=test_user.id,
                content="Story de teste - Diagnóstico",
                media_type="text",
                background_color="#FF5722",
                duration_hours=24,
                expires_at=datetime.utcnow() + timedelta(hours=24)
            )
            
            session.add(test_story)
            session.commit()
            session.refresh(test_story)
            
            self.print_success(f"Story de teste criada: ID {test_story.id}")
            
            # Verificar se a story foi salva corretamente
            saved_story = session.query(Story).filter(Story.id == test_story.id).first()
            if saved_story:
                self.print_success("Story foi salva e pode ser recuperada")
                self.results["sample_data"] = True
                
                # Limpar dados de teste
                session.delete(saved_story)
                session.commit()
                self.print_success("Dados de teste limpos")
                
                return True
            else:
                self.print_error("Story não foi salva corretamente")
                return False
                
        except Exception as e:
            self.print_error(f"Erro ao testar criação de story: {str(e)}")
            return False
        finally:
            session.close()
    
    def test_full_api_flow(self):
        """Testar fluxo completo da API"""
        self.print_header("TESTE DE FLUXO COMPLETO DA API")
        
        try:
            # Primeiro, fazer login para obter token
            login_data = {
                "email": "test@story.com",
                "password": "123456"
            }
            
            login_response = requests.post(
                f"{self.api_base}/auth/login",
                data=login_data,
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                token = token_data.get("access_token")
                self.print_success("Login bem-sucedido, token obtido")
            else:
                self.print_error(f"Falha no login: {login_response.status_code} - {login_response.text}")
                return False
            
            # Testar criação de story via API
            headers = {"Authorization": f"Bearer {token}"}
            story_data = {
                "content": "Story via API - Teste de diagnóstico",
                "background_color": "#4CAF50"
            }
            
            story_response = requests.post(
                f"{self.api_base}/stories/",
                data=story_data,
                headers=headers,
                timeout=10
            )
            
            if story_response.status_code == 200:
                story_result = story_response.json()
                story_id = story_result.get("story_id")
                self.print_success(f"Story criada via API: ID {story_id}")
                
                # Testar busca de stories
                get_response = requests.get(
                    f"{self.api_base}/stories/",
                    headers=headers,
                    timeout=10
                )
                
                if get_response.status_code == 200:
                    stories = get_response.json()
                    self.print_success(f"Stories recuperadas: {len(stories)} encontradas")
                    
                    # Deletar story de teste
                    if story_id:
                        delete_response = requests.delete(
                            f"{self.api_base}/stories/{story_id}",
                            headers=headers,
                            timeout=10
                        )
                        if delete_response.status_code == 200:
                            self.print_success("Story de teste deletada")
                    
                    return True
                else:
                    self.print_error(f"Falha ao buscar stories: {get_response.status_code}")
            else:
                self.print_error(f"Falha ao criar story via API: {story_response.status_code} - {story_response.text}")
                return False
                
        except Exception as e:
            self.print_error(f"Erro no teste de fluxo da API: {str(e)}")
            return False
    
    def run_full_diagnostic(self):
        """Executar diagnóstico completo"""
        print("🚀 INICIANDO DIAGNÓSTICO COMPLETO DE STORIES")
        print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 1. Testar conexão com banco
        if not self.test_database_connection():
            self.print_error("FALHA CRÍTICA: Não foi possível conectar ao banco")
            return False
        
        # 2. Verificar e criar tabelas
        self.check_and_create_tables()
        
        # 3. Verificar diretórios
        self.check_uploads_directory()
        
        # 4. Testar endpoint da API
        if self.test_api_endpoint():
            # 5. Testar criação de story no banco
            self.test_story_creation()
            
            # 6. Testar fluxo completo da API
            self.test_full_api_flow()
        
        # Relatório final
        self.print_final_report()
        
        return len(self.results["errors"]) == 0
    
    def print_final_report(self):
        """Imprimir relatório final"""
        self.print_header("RELATÓRIO FINAL")
        
        print(f"📊 Conexão BD: {'✅' if self.results['database_connection'] else '❌'}")
        print(f"📊 Tabelas: {'✅' if self.results['tables_exist'] else '❌'}")
        print(f"📊 API Endpoint: {'✅' if self.results['api_endpoint'] else '❌'}")
        print(f"📊 Dados de Teste: {'✅' if self.results['sample_data'] else '❌'}")
        
        if self.results["errors"]:
            print(f"\n❌ ERROS ENCONTRADOS ({len(self.results['errors'])}):")
            for error in self.results["errors"]:
                print(f"   • {error}")
        
        if self.results["warnings"]:
            print(f"\n⚠️  AVISOS ({len(self.results['warnings'])}):")
            for warning in self.results["warnings"]:
                print(f"   • {warning}")
        
        if self.results["fixes_applied"]:
            print(f"\n🔧 CORREÇÕES APLICADAS ({len(self.results['fixes_applied'])}):")
            for fix in self.results["fixes_applied"]:
                print(f"   • {fix}")
        
        if len(self.results["errors"]) == 0:
            print(f"\n🎉 DIAGNÓSTICO CONCLUÍDO: SISTEMA STORIES FUNCIONANDO!")
        else:
            print(f"\n💥 PROBLEMAS ENCONTRADOS: Verifique os erros acima")

if __name__ == "__main__":
    diagnostic = StoriesDiagnostic()
    success = diagnostic.run_full_diagnostic()
    
    if success:
        print("\n🚀 Sistema pronto para usar!")
        exit(0)
    else:
        print("\n💥 Problemas encontrados que precisam ser corrigidos manualmente")
        exit(1)
