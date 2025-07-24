#!/usr/bin/env python3
"""
Script de diagnóstico e correção do banco de dados de verificação de email
"""
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.config import get_database_url
from core.database import Base, SessionLocal
from routes.email_verification import EmailVerification
from models import User

def print_separator(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def diagnose_database():
    """Diagnostica problemas no banco de dados"""
    print_separator("DIAGNÓSTICO DO BANCO DE DADOS")
    
    # Criar engine e sessão
    engine = create_engine(get_database_url())
    inspector = inspect(engine)
    db = SessionLocal()
    
    try:
        # 1. Verificar se a tabela existe
        print("1. Verificando se a tabela 'email_verifications' existe...")
        if 'email_verifications' in inspector.get_table_names():
            print("✅ Tabela 'email_verifications' existe")
        else:
            print("❌ Tabela 'email_verifications' NÃO existe!")
            return False
        
        # 2. Verificar estrutura da tabela
        print("\n2. Verificando estrutura da tabela...")
        columns = inspector.get_columns('email_verifications')
        expected_columns = ['id', 'user_id', 'email', 'verification_code', 'verification_token', 'expires_at', 'created_at', 'verified', 'verified_at', 'attempts']
        
        existing_columns = [col['name'] for col in columns]
        print(f"Colunas existentes: {existing_columns}")
        
        missing_columns = set(expected_columns) - set(existing_columns)
        if missing_columns:
            print(f"❌ Colunas faltando: {missing_columns}")
        else:
            print("✅ Todas as colunas necessárias estão presentes")
        
        # 3. Verificar dados na tabela
        print("\n3. Verificando dados na tabela...")
        total_verifications = db.query(EmailVerification).count()
        print(f"Total de registros de verificação: {total_verifications}")
        
        # Verificações recentes (últimas 24h)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_verifications = db.query(EmailVerification).filter(
            EmailVerification.created_at > yesterday
        ).count()
        print(f"Verificações nas últimas 24h: {recent_verifications}")
        
        # 4. Verificar códigos não verificados
        print("\n4. Verificando códigos não verificados...")
        unverified = db.query(EmailVerification).filter(
            EmailVerification.verified == False
        ).all()
        
        print(f"Códigos não verificados: {len(unverified)}")
        
        if unverified:
            print("\nÚltimos 5 códigos não verificados:")
            for v in unverified[-5:]:
                now = datetime.utcnow()
                is_expired = v.expires_at < now
                time_diff = (v.expires_at - now).total_seconds() / 60  # em minutos
                
                print(f"  - User ID: {v.user_id}")
                print(f"    Código: {v.verification_code}")
                print(f"    Email: {v.email}")
                print(f"    Criado: {v.created_at}")
                print(f"    Expira: {v.expires_at}")
                print(f"    Expirado: {'❌ SIM' if is_expired else f'✅ NÃO (resta {time_diff:.1f}min)'}")
                print(f"    Tentativas: {v.attempts}")
                print()
        
        # 5. Verificar consistência com tabela users
        print("5. Verificando consistência com tabela 'users'...")
        users_with_verifications = db.execute(text("""
            SELECT DISTINCT ev.user_id 
            FROM email_verifications ev 
            LEFT JOIN users u ON ev.user_id = u.id 
            WHERE u.id IS NULL
        """)).fetchall()
        
        if users_with_verifications:
            print(f"❌ Encontrados {len(users_with_verifications)} registros órfãos (usuários não existem)")
            for row in users_with_verifications:
                print(f"  - User ID órfão: {row[0]}")
        else:
            print("✅ Todos os registros de verificação têm usuários válidos")
        
        # 6. Verificar timezone/data
        print("\n6. Verificando problemas de timezone...")
        current_utc = datetime.utcnow()
        print(f"Hora UTC atual (Python): {current_utc}")
        
        db_time = db.execute(text("SELECT NOW()")).fetchone()[0]
        print(f"Hora do banco de dados: {db_time}")
        
        if isinstance(db_time, datetime):
            time_diff = abs((current_utc - db_time).total_seconds())
            if time_diff > 60:  # Mais de 1 minuto de diferença
                print(f"⚠️ Diferença de tempo suspeita: {time_diff:.1f} segundos")
            else:
                print("✅ Hora do banco e Python estão sincronizadas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante diagnóstico: {e}")
        return False
    finally:
        db.close()

def fix_database():
    """Corrige problemas comuns no banco de dados"""
    print_separator("CORREÇÃO DO BANCO DE DADOS")
    
    db = SessionLocal()
    
    try:
        # 1. Limpar códigos expirados
        print("1. Limpando códigos expirados...")
        current_time = datetime.utcnow()
        expired_codes = db.query(EmailVerification).filter(
            EmailVerification.expires_at < current_time,
            EmailVerification.verified == False
        ).all()
        
        print(f"Encontrados {len(expired_codes)} códigos expirados para remover")
        
        for code in expired_codes:
            db.delete(code)
        
        # 2. Limpar registros órfãos
        print("\n2. Limpando registros órfãos...")
        orphaned = db.execute(text("""
            DELETE ev FROM email_verifications ev 
            LEFT JOIN users u ON ev.user_id = u.id 
            WHERE u.id IS NULL
        """))
        print(f"Removidos {orphaned.rowcount} registros órfãos")
        
        # 3. Limpar duplicatas para o mesmo usuário
        print("\n3. Limpando códigos duplicados por usuário...")
        # Manter apenas o mais recente para cada usuário não verificado
        subquery = text("""
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
                FROM email_verifications 
                WHERE verified = FALSE
            ) t WHERE rn > 1
        """)
        
        duplicates = db.execute(text("""
            DELETE FROM email_verifications 
            WHERE id IN (""" + str(subquery).replace('SELECT id FROM (', '').replace(') t WHERE rn > 1', ' AND ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) > 1') + """)
        """))
        
        # Método mais simples e seguro
        users_with_multiple = db.execute(text("""
            SELECT user_id, COUNT(*) as count 
            FROM email_verifications 
            WHERE verified = FALSE 
            GROUP BY user_id 
            HAVING COUNT(*) > 1
        """)).fetchall()
        
        for user_id, count in users_with_multiple:
            # Manter apenas o mais recente
            codes_to_keep = db.query(EmailVerification).filter(
                EmailVerification.user_id == user_id,
                EmailVerification.verified == False
            ).order_by(EmailVerification.created_at.desc()).limit(1).all()
            
            if codes_to_keep:
                keep_id = codes_to_keep[0].id
                old_codes = db.query(EmailVerification).filter(
                    EmailVerification.user_id == user_id,
                    EmailVerification.verified == False,
                    EmailVerification.id != keep_id
                ).all()
                
                for old_code in old_codes:
                    db.delete(old_code)
                    
                print(f"  - Usuário {user_id}: removidos {len(old_codes)} códigos antigos")
        
        # 4. Recriar tabela se necessário (apenas estrutura)
        print("\n4. Verificando estrutura da tabela...")
        try:
            # Tentar criar todas as tabelas (não faz nada se já existem)
            Base.metadata.create_all(bind=db.bind)
            print("✅ Estrutura da tabela verificada/criada")
        except Exception as e:
            print(f"⚠️ Aviso ao verificar estrutura: {e}")
        
        # Confirmar mudanças
        db.commit()
        print("\n✅ Correções aplicadas com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro durante correção: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    
    return True

def test_verification_flow():
    """Testa o fluxo de verificação"""
    print_separator("TESTE DO FLUXO DE VERIFICAÇÃO")
    
    db = SessionLocal()
    
    try:
        # Criar um código de teste
        test_user_id = 999999  # ID de teste que não existe
        test_email = "test@example.com"
        test_code = "123456"
        test_token = "test_token_12345"
        
        print("1. Criando código de teste...")
        
        # Limpar qualquer teste anterior
        db.query(EmailVerification).filter(
            EmailVerification.user_id == test_user_id
        ).delete()
        
        # Criar novo código de teste
        test_verification = EmailVerification(
            user_id=test_user_id,
            email=test_email,
            verification_code=test_code,
            verification_token=test_token,
            expires_at=datetime.utcnow() + timedelta(minutes=10),
            verified=False,
            attempts=1
        )
        
        db.add(test_verification)
        db.commit()
        print(f"✅ Código de teste criado: {test_code}")
        
        # Tentar buscar o código
        print("\n2. Testando busca do código...")
        found_code = db.query(EmailVerification).filter(
            EmailVerification.user_id == test_user_id,
            EmailVerification.verification_code == test_code,
            EmailVerification.verified == False,
            EmailVerification.expires_at > datetime.utcnow()
        ).first()
        
        if found_code:
            print("✅ Código encontrado com sucesso!")
            print(f"  - Expira em: {found_code.expires_at}")
            print(f"  - Tempo restante: {(found_code.expires_at - datetime.utcnow()).total_seconds()/60:.1f} minutos")
        else:
            print("❌ Código NÃO encontrado! Há problema na consulta.")
        
        # Limpar teste
        print("\n3. Limpando dados de teste...")
        db.delete(test_verification)
        db.commit()
        print("✅ Teste concluído e dados limpos")
        
        return found_code is not None
        
    except Exception as e:
        print(f"❌ Erro durante teste: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    print("🔍 DIAGNÓSTICO E CORREÇÃO - VERIFICAÇÃO DE EMAIL")
    print("=" * 60)
    
    # Executar diagnóstico
    if not diagnose_database():
        print("\n❌ Falha no diagnóstico. Verifique a conexão com o banco de dados.")
        return
    
    # Perguntar se deve corrigir
    print("\n" + "="*60)
    choice = input("Deseja executar as correções? (s/N): ").lower().strip()
    
    if choice in ['s', 'sim', 'y', 'yes']:
        if fix_database():
            print("\n✅ Correções aplicadas!")
        else:
            print("\n❌ Falha nas correções.")
    
    # Teste final
    print("\n" + "="*60)
    test_choice = input("Deseja executar teste de verificação? (s/N): ").lower().strip()
    
    if test_choice in ['s', 'sim', 'y', 'yes']:
        if test_verification_flow():
            print("\n✅ Sistema funcionando corretamente!")
        else:
            print("\n❌ Sistema ainda apresenta problemas.")

if __name__ == "__main__":
    main()
