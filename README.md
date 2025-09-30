# 🏔️ TereGreen - MVP Mobile

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Conectando entusiastas de trilhas e ecoturismo**

[Features](#-features) • [Tecnologias](#-tecnologias) • [Instalação](#-instalação) • [Uso](#-uso)

</div>

👥 **Criadora:**

Sophia Resende de Freitas - 06007538

## 📋 Sobre o Projeto

O **Tere Gren** é um aplicativo móvel MVP desenvolvido para conectar entusiastas de trilhas e ecoturismo. A plataforma permite que usuários explorem trilhas disponíveis, e façam agendamentos.

## ✨ Features

- 🏔️ **Exploração de Trilhas** - Catálogo visual com fotos e informações detalhadas
- 🔐 **Sistema de Autenticação** - Login e cadastro de usuários
- 📅 **Sistema de Agendamento** - Reservas de trilhas disponíveis
- 👨‍💼 **Painel Administrativo** - Gestão completa de trilhas
- 🎯 **Controle de Acesso** - Diferentes níveis de permissão (admin/usuário)

## 🛠️ Tecnologias

**Frontend:**
- React Native + Expo
- Expo Router
- React Hooks

**Backend:**
- Firebase Authentication
- Firebase Firestore
- Firebase Security Rules

**UI/UX:**
- React Native StyleSheet
- Ionicons

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Expo CLI
- Conta no Firebase
- Expo Go app

### Passo a Passo

1. **Clone o repositório**
```bash
    git clone <URL_DO_REPOSITÓRIO>
```

2. **Instale as dependências**
```bash
    npm install
```

3. **Configure o Firebase**
   
Crie um projeto no console do Firebase.

Ative os serviços de Authentication (com o provedor de E-mail/Senha) e Cloud Firestore.

Na configuração do seu projeto no Firebase, crie um novo aplicativo Web (</>).

Copie as credenciais do Firebase (o objeto firebaseConfig).

Renomeie ou crie o arquivo src/lib/firebase.ts e cole suas credenciais, como no exemplo abaixo:

4. **Configure as credenciais do Firebase**

```bash
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// SUAS CREDENCIAIS DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

5. **Inicie o projeto**
```bash
    npx expo start
```

6. **Execute no seu dispositivo**
   
Abra o app Expo Go no seu celular

Escaneie o QR code exibido no terminal
