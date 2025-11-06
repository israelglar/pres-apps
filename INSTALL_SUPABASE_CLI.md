# Instalação do Supabase CLI

Guia rápido para instalar o Supabase CLI no teu sistema.

**⚠️ Nota Importante:** Seguimos a recomendação oficial do Supabase de **não instalar globalmente**. Em vez disso, usamos `npx supabase` que funciona automaticamente com a versão do projeto.

---

## 🚀 Método Recomendado: npx (Sem Instalação)

**Não precisas de instalar nada!** O `npx` já vem incluído com o npm e executa automaticamente a versão mais recente do Supabase CLI:

```bash
# Testar que funciona
npx supabase --version

# Os scripts npm já estão configurados para usar npx
npm run db:start    # Usa: npx supabase start
npm run db:stop     # Usa: npx supabase stop
```

**Vantagens de usar npx:**
- ✅ Sempre usa a versão mais recente
- ✅ Não ocupa espaço global no sistema
- ✅ Não há conflitos de versões entre projetos
- ✅ Recomendação oficial do Supabase
- ✅ Já funciona imediatamente (npm scripts configurados)

---

## 🔧 Instalação Local (Alternativa - Opcional)

Se preferires ter o CLI instalado localmente no projeto:

```bash
npm install supabase --save-dev
```

Depois usa via npx:
```bash
npx supabase --version
```

---

## 💻 Instalação Nativa (Para usar `supabase` diretamente no terminal)

Se preferires usar `supabase` em vez de `npx supabase`:

### macOS

**Homebrew (Recomendado para macOS)**
```bash
brew install supabase/tap/supabase
```

### Windows

**Scoop**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux

**Download direto (Ubuntu/Debian)**
```bash
# Substituir X.Y.Z pela versão mais recente
# Ver: https://github.com/supabase/cli/releases
wget https://github.com/supabase/cli/releases/download/vX.Y.Z/supabase_X.Y.Z_linux_amd64.deb
sudo dpkg -i supabase_X.Y.Z_linux_amd64.deb
```

---

## ✅ Verificar que Funciona

**Se usas npx (recomendado):**
```bash
npx supabase --version
```

**Se instalaste nativamente:**
```bash
supabase --version
```

Deves ver algo como:
```
supabase version 1.130.0
```

---

## 🐳 Instalar Docker Desktop

O Supabase CLI precisa do Docker para correr a stack local.

### macOS
1. Download: https://docs.docker.com/desktop/install/mac-install/
2. Instalar ficheiro .dmg
3. Abrir Docker Desktop
4. Aguardar até ver "Docker Desktop is running"

### Windows
1. Download: https://docs.docker.com/desktop/install/windows-install/
2. Instalar ficheiro .exe
3. Reiniciar computador (se pedido)
4. Abrir Docker Desktop
5. Aguardar até ver "Docker Desktop is running"

### Linux
1. Seguir guia oficial: https://docs.docker.com/engine/install/
2. Instalar Docker Engine para a tua distro
3. Iniciar serviço:
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

**Verificar Docker:**
```bash
docker --version
# Deve mostrar: Docker version 24.x.x
```

---

## 🚀 Próximos Passos

Depois de instalar Supabase CLI + Docker:

1. **Ler documentação completa:**
   ```bash
   cat LOCAL_DEV.md
   ```

2. **Iniciar setup local:**
   ```bash
   npm run db:start
   ```

3. **Iniciar app:**
   ```bash
   npm run dev
   ```

4. **Abrir app no browser:**
   http://localhost:5173

---

## 🐛 Problemas Comuns

### "supabase: command not found" (depois de instalar via npm)

**Solução:** Adicionar pasta npm global ao PATH

**macOS/Linux:**
```bash
# Adicionar ao ~/.zshrc ou ~/.bashrc
export PATH="$PATH:$(npm config get prefix)/bin"

# Recarregar shell
source ~/.zshrc  # ou source ~/.bashrc
```

**Windows:**
```powershell
# Executar PowerShell como admin
npm config get prefix
# Adicionar pasta retornada ao PATH via System Settings
```

### "Docker is not running"

**Solução:** Abrir Docker Desktop app e aguardar até iniciar completamente.

### "Permission denied" (Linux)

**Solução:** Adicionar user ao grupo docker
```bash
sudo usermod -aG docker $USER
# Logout e login novamente
```

---

## 📚 Recursos

- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli
- **Docker Desktop Docs:** https://docs.docker.com/desktop/
- **Troubleshooting:** Ver LOCAL_DEV.md secção "Resolução de Problemas"

---

**Tempo estimado de instalação:** 10-15 minutos
**Espaço em disco necessário:** ~1GB (Docker images)
