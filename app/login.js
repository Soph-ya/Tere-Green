import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View, Image, TextInput } from 'react-native';
import { useState } from 'react';
import { auth } from '../config/firebase.config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Login() {
  const [userMail, setUserMail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function replacePass() {
    router.replace('/replacePass');
  }

  function newUser() {
    router.replace('/newUser');
  }

  async function userLogin() {
    if (!userMail || !userPass) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, userMail, userPass);
      router.replace('/explore');
    } catch (error) {
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={styles.header}>
        <Text style={styles.logo}>🏔️</Text>
        <Text style={styles.title}>Trilhas Explorer</Text>
        <Text style={styles.subtitle}>Conecte-se à natureza</Text>
      </View>
      <View style={styles.loginCard}>
        <Text style={styles.cardTitle}>Acesse sua conta</Text>
        
        <TextInput 
          style={styles.formInput}
          placeholder='E-mail'
          placeholderTextColor="#9ca3af"
          keyboardType='email-address'
          autoCapitalize='none'
          autoComplete='email'
          value={userMail}
          onChangeText={setUserMail}
        />
        
        <TextInput 
          style={styles.formInput}
          placeholder='Senha'
          placeholderTextColor="#9ca3af"
          autoCapitalize='none'
          secureTextEntry
          value={userPass}
          onChangeText={setUserPass}
        />

        <Pressable 
          style={[styles.formButton, loading && styles.formButtonDisabled]}
          onPress={userLogin}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.textButton}>Carregando...</Text>
          ) : (
            <Text style={styles.textButton}>🌲 Entrar na Trilha</Text>
          )}
        </Pressable>

        <View style={styles.linksContainer}>
          <Pressable style={styles.subButton} onPress={replacePass}>
            <Text style={styles.subTextButton}>🧭 Esqueci a senha</Text>
          </Pressable>
          
          <Pressable style={styles.subButton} onPress={newUser}>
            <Text style={styles.subTextButton}>📝 Criar nova conta</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Descubra novas aventuras</Text>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  loginCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 25,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1f2937',
  },
  formButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  formButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  textButton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  subButton: {
    padding: 12,
    marginVertical: 5,
  },
  subTextButton: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
  },
};
