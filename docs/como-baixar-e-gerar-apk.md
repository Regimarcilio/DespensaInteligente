# 📱 Como Baixar e Instalar o APK do Despensa no Android

Existem **três maneiras fáceis** de ter o Despensa no seu celular Android:

---

## 🌟 Opção 1: Baixar o APK nas Releases do GitHub (Recomendado)

O arquivo `.apk` fica disponível diretamente na aba **Releases** do repositório no GitHub.

### 📥 Passo a passo para baixar e instalar no celular:

1. **Acesse as Releases no seu smartphone:**
   - Link: [github.com/Regimarcilio/DespensaInteligente/releases](https://github.com/Regimarcilio/DespensaInteligente/releases)
2. **Baixe o arquivo APK:**
   - Na versão mais recente (ex: `v0.8.0`), expanda a seção **Assets** e toque no arquivo `Despensa-v0.8-debug.apk` (ou `app-debug.apk`).
3. **Instale no Android:**
   - Quando o download terminar, toque em **Abrir**.
   - Se o Android perguntar *"Deseja permitir a instalação a partir desta fonte?"*, toque em **Configurações** e ative a opção **Permitir desta fonte** (Chrome, Gerenciador de Arquivos, etc.).
   - Toque em **Instalar**.
4. **Pronto!** O ícone do Despensa aparecerá no menu de aplicativos do seu celular.

---

## ⚡ Opção 2: Instalar Direto sem baixar arquivo APK (PWA Web App)

Se você preferir não gerenciar arquivos `.apk` e permissões de segurança:

1. Abra este site no **Google Chrome** no seu celular Android.
2. Toque no botão **Instalar** no topo ou nos **três pontinhos (⋮)** do Chrome.
3. Escolha **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
4. O app ganha ícone próprio, funciona 100% offline e armazena seus dados no aparelho com extrema velocidade.

---

## 🤖 Opção 3: Como o APK é Gerado e Publicado no GitHub

Configuramos o **GitHub Actions** em `.github/workflows/build-apk.yml`. 

### Como funciona a automação:
- **Ao fazer um push** ou criar uma **Release / Tag** no GitHub, o servidor de CI/CD do GitHub:
  1. Instala o ambiente Java 17 e Android SDK.
  2. Executa `./gradlew assembleDebug` no módulo `apps/mobile/Despensa`.
  3. Gera o arquivo `Despensa-v0.8-debug.apk`.
  4. Anexa automaticamente o arquivo no **GitHub Releases** e nos **Artefatos da Action**.

### Como gerar manualmente no seu computador (se quiser compilar localmente):
```bash
# Entre na pasta do app Android
cd apps/mobile/Despensa

# No Linux/Mac:
./gradlew assembleDebug

# No Windows:
gradlew.bat assembleDebug
```
O arquivo `.apk` gerado estará em:
`apps/mobile/Despensa/app/build/outputs/apk/debug/app-debug.apk`

Para disponibilizar no GitHub manualmente:
1. Vá em seu repositório no GitHub -> **Releases** -> **Draft a new release**.
2. Digite a tag (ex: `v0.8.0`), título e descrição.
3. Arraste e solte o arquivo `app-debug.apk` na área de anexo de arquivos.
4. Clique em **Publish release**. Pronto!
