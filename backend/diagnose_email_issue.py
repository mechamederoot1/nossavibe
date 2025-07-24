#!/usr/bin/env python3
"""
Script principal para diagnosticar problemas de verificação de email
"""
import subprocess
import sys
import os

def run_script(script_name, description):
    """Executa um script e mostra o resultado"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, 
                              text=True, 
                              cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Erro ao executar {script_name}: {e}")
        return False

def main():
    print("🚀 DIAGNÓSTICO COMPLETO - VERIFICAÇÃO DE EMAIL")
    print("="*60)
    print("Este script irá executar várias verificações para identificar")
    print("o problema com a verificação de email.")
    print("="*60)
    
    scripts = [
        ("check_services_sync.py", "Verificando serviços e conectividade"),
        ("quick_db_check.py", "Verificação rápida do banco de dados"),
    ]
    
    results = []
    
    for script, description in scripts:
        success = run_script(script, description)
        results.append((script, success))
    
    # Resumo final
    print(f"\n{'='*60}")
    print("📊 RESUMO DOS RESULTADOS")
    print(f"{'='*60}")
    
    all_good = True
    for script, success in results:
        status = "✅ OK" if success else "❌ FALHOU"
        print(f"{script}: {status}")
        if not success:
            all_good = False
    
    if all_good:
        print("\n🎉 Todos os testes passaram!")
        print("O problema pode estar na comunicação entre frontend e backend.")
        print("Verifique se ambos os serviços estão rodando:")
        print("  - Backend Python: python main.py (porta 8000)")
        print("  - Email Service: cd email-service && npm start (porta 3001)")
    else:
        print("\n⚠️ Foram encontrados problemas!")
        print("Execute o script de correção:")
        print("  python fix_email_verification_db.py")

if __name__ == "__main__":
    main()
