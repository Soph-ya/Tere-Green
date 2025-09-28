import React, { useEffect, useState } from "react";
import { 
    View, 
    Text, 
    Pressable, 
    ActivityIndicator, 
    StyleSheet 
} from "react-native";
import { db, auth } from "../config/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

const animalIcons = [
    '🐻', '🦊', '🐺', '🦌', '🐗', '🐿️', '🦡', 
    '🦅', '🦉', '🐦', '🦜', '🐐', '🐏', '🦁', 
    '🐯', '🐆', '🐘', '🦒', '🦏', '🦇', '🐍', '🦎'
];

export default function ProfileScreen() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userIcon, setUserIcon] = useState('🐻');
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                router.replace("/login");
                return;
            }

            try {
                const profileData = {
                    email: user.email,
                    uid: user.uid,
                    role: "user"
                };

                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    setUserData({
                        ...profileData,
                        ...userDoc.data(),
                    });
                } else {
                    setUserData(profileData);
                }

                const iconIndex = user.uid.charCodeAt(0) % animalIcons.length;
                setUserIcon(animalIcons[iconIndex]);

            } catch (err) {
                console.error("Erro ao buscar dados do usuário:", err);
                setUserData({ email: user.email, uid: user.uid, role: "user" });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace("/login");
        } catch (err) {
            console.error("Erro ao sair:", err);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.background} />
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.background} />
                <Text style={styles.errorText}>Não foi possível carregar o perfil.</Text>
                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Sair</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.background} />
            
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Pressable onPress={handleGoBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>
                            {userIcon}
                        </Text>
                    </View>
                    
                    <Text style={styles.userName}>
                        {userData.nome || "Explorador"}
                    </Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>📧 E-mail</Text>
                            <Text style={styles.infoValue}>{userData.email}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>🌟 Status</Text>
                            <Text style={styles.statusText}>
                                {userData.role === 'admin' ? '👑 Administrador' : '🌿 Explorador'}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>🐾 Espírito Animal</Text>
                            <Text style={styles.animalText}>
                                {userIcon} {getAnimalDescription(userIcon)}
                            </Text>
                        </View>
                    </View>

                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Seu espírito animal te guia nas aventuras!
                    </Text>
                </View>
            </View>
        </View>
    );
}

const getAnimalDescription = (icon) => {
    const descriptions = {
        '🐻': 'Urso - Forte e protetor',
        '🦊': 'Raposa - Inteligente e ágil',
        '🐺': 'Lobo - Líder da matilha',
        '🦌': 'Cervo - Elegante e nobre',
        '🐗': 'Javali - Corajoso e resistente',
        '🐿️': 'Esquilo - Ágil e preparado',
        '🦡': 'Texugo - Persistente e determinado',
        '🦅': 'Águia - Visão ampla e liberdade',
        '🦉': 'Coruja - Sábia e observadora',
        '🐦': 'Pássaro - Livre e explorador',
        '🦜': 'Papagaio - Colorido e comunicativo',
        '🐐': 'Cabra-montesa - Ágil nas alturas',
        '🐏': 'Carneiro - Resistente e estável',
        '🦁': 'Leão - Coragem e liderança',
        '🐯': 'Tigre - Força e determinação',
        '🐆': 'Leopardo - Agilidade e estratégia',
        '🐘': 'Elefante - Sabedoria e memória',
        '🦒': 'Girafa - Perspectiva elevada',
        '🦏': 'Rinoceronte - Força e proteção',
        '🦇': 'Morcego - Orientação e intuição',
        '🐍': 'Serpente - Transformação e renovação',
        '🦎': 'Lagarto - Adaptação e regeneração'
    };
    return descriptions[icon] || 'Aventureiro da natureza';
};

const styles = StyleSheet.create({
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
    loadingContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
    },
    loadingText: {
        marginTop: 12,
        color: '#10b981',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#dc2626',
        marginBottom: 20,
        textAlign: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 50,
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
    profileCard: {
        backgroundColor: '#ffffff',
        width: '100%',
        padding: 30,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10b981',
        color: '#ffffff',
        fontSize: 50,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8,
        fontStyle: 'italic',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 30,
    },
    infoItem: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    infoValue: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    statusText: {
        fontSize: 15,
        color: '#10b981',
        fontWeight: '600',
    },
    animalText: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
        fontStyle: 'italic',
    },
    logoutButton: {
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.2)',
    },
    logoutButtonText: {
        color: '#dc2626',
        fontSize: 15,
        fontWeight: '600',
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
});