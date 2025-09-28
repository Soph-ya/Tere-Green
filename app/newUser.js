import { Pressable, Text, View, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../config/firebase.config.js';
import { doc, setDoc } from "firebase/firestore";

export default function NewUser() {
    const [userMail, setUserMail] = useState('');
    const [userPass, setUserPass] = useState('');
    const [userRePass, setUserRePass] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const router = useRouter();

    async function newUser() {
        if (userMail === '' || userPass === '' || userRePass === '') {
            alert('Todos os campos devem ser preenchidos');
            return;
        }
        if (userPass !== userRePass) {
            alert('A senha e a senha de confirmação devem ser iguais!');
            return;
        }
        if (userPass.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userMail, userPass);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: userMail,
                role: "user",
                criadoEm: new Date().toISOString()
            });

            alert('✅ Conta criada com sucesso! Faça login para começar sua aventura.');
            router.replace('/login');
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            let errorMessage = "Erro ao criar conta";
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este e-mail já está em uso';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Senha muito fraca';
                    break;
                default:
                    errorMessage = error.message;
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    function handleGoBack() {
        router.back();
    }

    return (
        <View style={styles.container}>
            {/* Background igual ao Explorer */}
            <View style={styles.background} />
            
            {/* Header igual ao Explorer */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Pressable onPress={handleGoBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </Pressable>
                    <Text style={styles.title}>🌱 Criar Nova Conta</Text>
                </View>
            </View>

            {/* Conteúdo Principal */}
            <View style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.cardTitle}>Junte-se à Comunidade</Text>
                    <Text style={styles.cardSubtitle}>Crie sua conta para explorar trilhas incríveis</Text>
                    
                    <TextInput
                        style={[
                            styles.formInput,
                            focusedInput === 'email' && styles.formInputFocused
                        ]}
                        placeholder='E-mail'
                        placeholderTextColor='#9ca3af'
                        keyboardType='email-address'
                        autoCapitalize='none'
                        autoComplete='email'
                        value={userMail}
                        onChangeText={setUserMail}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                    />
                    
                    <TextInput 
                        style={[
                            styles.formInput,
                            focusedInput === 'password' && styles.formInputFocused
                        ]}
                        placeholder='Senha (mínimo 6 caracteres)'
                        placeholderTextColor='#9ca3af'
                        autoCapitalize='none'
                        secureTextEntry
                        value={userPass}
                        onChangeText={setUserPass}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                    />
                    
                    <TextInput 
                        style={[
                            styles.formInput,
                            focusedInput === 'repassword' && styles.formInputFocused
                        ]}
                        placeholder='Confirmar senha'
                        placeholderTextColor='#9ca3af'
                        autoCapitalize='none'
                        secureTextEntry
                        value={userRePass}
                        onChangeText={setUserRePass}
                        onFocus={() => setFocusedInput('repassword')}
                        onBlur={() => setFocusedInput(null)}
                    />

                    <Pressable 
                        style={[styles.formButton, loading && styles.formButtonDisabled]}
                        onPress={newUser}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.textButton}>⏳ Criando conta...</Text>
                        ) : (
                            <Text style={styles.textButton}>🌿 Criar Conta</Text>
                        )}
                    </Pressable>
                </View>

                {/* Rodapé */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Ao criar uma conta, você concorda com nossos {' '}
                        <Text style={styles.footerLink}>Termos de Uso</Text> e {' '}
                        <Text style={styles.footerLink}>Política de Privacidade</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = {
    container: { 
        flex: 1, 
        backgroundColor: "#f0fdf4" 
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '20%',
        backgroundColor: '#10b981',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        padding: 20,
        paddingTop: 80,
        paddingBottom: 15,
        backgroundColor: '#10b981',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
    },
    
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButtonText: { 
        color: "#ffffff", 
        fontSize: 16,
        fontWeight: '600',
    },
    title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#ffffff', 
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    formCard: {
        backgroundColor: '#ffffff',
        width: '100%',
        padding: 25,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    formInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 14,
        fontSize: 14,
        marginBottom: 16,
        color: '#1f2937',
        fontWeight: '400',
    },
    formInputFocused: {
        borderColor: '#10b981',
        backgroundColor: '#ffffff',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    formButton: {
        backgroundColor: '#10b981',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    formButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowColor: '#9ca3af',
    },
    textButton: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 16,
    },
    footerLink: {
        color: '#10b981',
        fontWeight: '600',
    },
};