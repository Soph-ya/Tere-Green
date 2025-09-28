import { Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../config/firebase.config.js';

export default function ReplacePass() {
    const [userMail, setUserMail] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const router = useRouter();

    async function replacePass() {
        if(userMail === '') {
            alert('É preciso informar um email válido para redefinir a senha');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, userMail);
            alert('✅ Email enviado para: ' + userMail + "\n\nVerifique sua caixa de mensagem e spam.");
        } catch (error) {
            console.error("Erro ao enviar email:", error);
            let errorMessage = "Erro ao enviar email de recuperação";
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado';
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
            <View style={styles.background} />
            
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Pressable onPress={handleGoBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </Pressable>
                    <Text style={styles.title}>🔐 Redefinir Senha</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.cardTitle}>Recuperação de Senha</Text>
                    <Text style={styles.cardSubtitle}>
                        Digite seu email para receber um link de redefinição de senha
                    </Text>
                    
                    <TextInput
                        style={[
                            styles.formInput,
                            focusedInput === 'email' && styles.formInputFocused
                        ]}
                        placeholder="seu@email.com"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={userMail}
                        onChangeText={setUserMail}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                    />

                    <Pressable
                        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                        onPress={replacePass}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.sendButtonText}>⏳ Enviando...</Text>
                        ) : (
                            <Text style={styles.sendButtonText}>📧 Enviar Link de Recuperação</Text>
                        )}
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        O link de recuperação expira em 1 hora
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
        fontSize: 22,
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
        marginBottom: 20,
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
    sendButton: {
        backgroundColor: '#10b981',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sendButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowColor: '#9ca3af',
    },
    sendButtonText: {
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
};