import React, { useEffect, useState } from "react";
import {View,Text,FlatList,TouchableOpacity,Modal,ScrollView,TextInput,Image,StyleSheet,Alert,ActivityIndicator} from "react-native";
import { db, auth } from "../config/firebase.config";
import {collection,addDoc,getDocs,updateDoc,deleteDoc,doc,getDoc,} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";

const localBanners = [
    require("../assets/images/img_01.jpg"),
    require("../assets/images/img_02.jpg"),
    require("../assets/images/img_03.jpg"),
    require("../assets/images/img_04.jpg"),
    require("../assets/images/img_05.jpg"),
    require("../assets/images/img_06.jpg"),
    require("../assets/images/img_07.jpg"),
    require("../assets/images/img_08.jpg"),
    require("../assets/images/img_09.jpg"),
    require("../assets/images/img_10.jpg"),
];

export default function Explore() {
    const [trilhas, setTrilhas] = useState([]);
    const [modalMode, setModalMode] = useState(null);
    const [selectedTrilha, setSelectedTrilha] = useState(null);
    const [form, setForm] = useState({
        nome: "",
        trilhaNome: "",
        local: "",
        dificuldade: "",
        data: "",
        descricao: "",
        imageIndex: 0,
    });
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [agendando, setAgendando] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setTimeout(() => {
                    router.replace("/login");
                }, 100);
            } else {
                setAuthChecked(true);
                fetchUserData();
            }
        });

        return unsubscribe;
    }, []);

    const fetchUserData = async () => {
        if (!auth.currentUser) return;

        try {
            setLoading(true);
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role);
            } else {
                setUserRole("user");
            }
            
            await fetchTrilhas();
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            Alert.alert("Erro", "Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTrilhas = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "trilhas"));
            const trilhasData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                let imageIndex = 0;
                if (data.imageIndex !== undefined) {
                    const num = parseInt(data.imageIndex, 10);
                    if (!isNaN(num)) {
                        imageIndex = Math.max(0, Math.min(num, localBanners.length - 1));
                    }
                }
                return { id: doc.id, ...data, imageIndex };
            });
            setTrilhas(trilhasData);
        } catch (err) {
            console.error("Erro ao buscar trilhas:", err);
            throw err;
        }
    };

    const handleSaveTrilha = async () => {
        if (userRole !== "admin") return;

        if (!form.trilhaNome || !form.local || !form.data) {
            Alert.alert("Atenção", "Preencha os campos obrigatórios: Nome da Trilha, Local e Data.");
            return;
        }

        try {
            const trilhaData = { 
                ...form, 
                imageIndex: Number(form.imageIndex),
                atualizadoEm: new Date().toISOString()
            };
            
            if (modalMode === "edit" && selectedTrilha?.id) {
                await updateDoc(doc(db, "trilhas", selectedTrilha.id), trilhaData);
                Alert.alert("Sucesso", "Trilha atualizada com sucesso!");
            } else {
                trilhaData.criadoEm = new Date().toISOString();
                await addDoc(collection(db, "trilhas"), trilhaData);
                Alert.alert("Sucesso", "Trilha criada com sucesso!");
            }

            await fetchTrilhas();
            resetForm();
        } catch (err) {
            console.error("❌ Erro ao salvar trilha:", err);
            Alert.alert("Erro", "Não foi possível salvar a trilha.");
        }
    };

    const handleDeleteTrilha = async (id) => {
        if (userRole !== "admin") return;

        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir esta trilha?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "trilhas", id));
                            await fetchTrilhas();
                            resetForm();
                            Alert.alert("Sucesso", "Trilha excluída com sucesso!");
                        } catch (err) {
                            console.error("Erro ao excluir trilha:", err);
                            Alert.alert("Erro", "Não foi possível excluir a trilha.");
                        }
                    }
                }
            ]
        );
    };

    const handleAgendarTrilha = async (trilhaId) => {
        if (!auth.currentUser || !trilhaId) {
            Alert.alert("Erro", "Você precisa estar logado para agendar uma trilha.");
            return;
        }

        setAgendando(true);
        try {
            await addDoc(collection(db, "agendamentos"), {
                userId: auth.currentUser.uid,
                trilhaId: trilhaId,
                agendadaEm: new Date().toISOString(),
                status: "confirmado"
            });
            Alert.alert("✅ Sucesso", "Trilha agendada com sucesso!");
            setSelectedTrilha(null);
            setModalMode(null);
        } catch (err) {
            console.error("❌ Erro ao agendar trilha:", err);
            Alert.alert("Erro", "Não foi possível agendar a trilha.");
        } finally {
            setAgendando(false);
        }
    };

    const resetForm = () => {
        setForm({
            nome: "", 
            trilhaNome: "", 
            local: "", 
            dificuldade: "", 
            data: "", 
            descricao: "", 
            imageIndex: 0,
        });
        setModalMode(null);
        setSelectedTrilha(null);
        setAgendando(false);
    };

    const renderTrilhaCard = ({ item }) => (
        <TouchableOpacity
            style={styles.trilhaCard}
            onPress={() => {
                setSelectedTrilha(item);
                setForm({ ...item });
                setModalMode("view");
            }}
        >
            <Image
                source={localBanners[item.imageIndex % localBanners.length]}
                style={styles.trilhaImage}
            />
            <View style={styles.trilhaInfo}>
                <Text style={styles.trilhaNome}>{item.trilhaNome || "Trilha sem nome"}</Text>
                <Text style={styles.trilhaLocal}>📍 {item.local || "Local não informado"}</Text>
                <Text style={styles.trilhaData}>📅 {item.data || "Data não informada"}</Text>
                {item.dificuldade && (
                    <View style={[styles.dificuldadeBadge, 
                        { backgroundColor: getDificuldadeColor(item.dificuldade) }]}>
                        <Text style={styles.dificuldadeText}>{item.dificuldade}</Text>
                    </View>
                )}
            </View>
            {userRole === "admin" && (
                <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const getDificuldadeColor = (dificuldade) => {
        switch (dificuldade.toLowerCase()) {
            case 'fácil': return '#10b981';
            case 'moderada': return '#f59e0b';
            case 'difícil': return '#dc2626';
            default: return '#6b7280';
        }
    };

    if (!authChecked) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Verificando autenticação...</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Carregando trilhas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.background} />
            <View style={styles.header}>
                <Text style={styles.title}>🏔️ Explorar Trilhas</Text>     
                <View style={styles.headerButtons}>
                    {userRole === "admin" && (
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => setModalMode("create")}
                        >
                            <Text style={styles.createButtonText}>🌿 Criar Trilha</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.userRoleIndicator}>
                <Text style={styles.userRoleText}>
                    👤 Logado como: <Text style={styles.userRoleHighlight}>{userRole === 'admin' ? 'Administrador' : 'Explorador'}</Text>
                </Text>
            </View>

            <FlatList
                data={trilhas}
                keyExtractor={(item) => item.id}
                renderItem={renderTrilhaCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🌲</Text>
                        <Text style={styles.emptyTitle}>
                            {userRole === 'admin' 
                                ? "Nenhuma trilha cadastrada"
                                : "Nenhuma trilha disponível"
                            }
                        </Text>
                        <Text style={styles.emptyText}>
                            {userRole === 'admin' 
                                ? "Toque em 'Criar Trilha' para começar sua aventura!"
                                : "Em breve teremos novas trilhas para explorar!"
                            }
                        </Text>
                    </View>
                }
            />
            <Modal visible={!!modalMode} animationType="slide" transparent={false}>
                <View style={styles.modalContainer}>
                    {(selectedTrilha || modalMode === "create") && (
                        <Image
                            source={
                                selectedTrilha
                                    ? localBanners[selectedTrilha.imageIndex % localBanners.length]
                                    : localBanners[form.imageIndex % localBanners.length]
                            }
                            style={StyleSheet.absoluteFillObject}
                            blurRadius={3}
                        />
                    )}

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        {(modalMode === "edit" || modalMode === "create") && (
                            <View style={styles.crudContainer}>
                                <Text style={styles.modalTitle}>
                                    {modalMode === "create" ? "🌿 Criar Nova Trilha" : `✏️ Editar "${selectedTrilha?.trilhaNome}"`}
                                </Text>
                                
                                <TextInput 
                                    style={styles.textInput} 
                                    placeholder="Nome do Guia*" 
                                    placeholderTextColor="#9ca3af"
                                    value={form.nome} 
                                    onChangeText={(text) => setForm({ ...form, nome: text })} 
                                />
                                <TextInput 
                                    style={styles.textInput} 
                                    placeholder="Nome da Trilha*" 
                                    placeholderTextColor="#9ca3af"
                                    value={form.trilhaNome} 
                                    onChangeText={(text) => setForm({ ...form, trilhaNome: text })} 
                                />
                                <TextInput 
                                    style={styles.textInput} 
                                    placeholder="Local*" 
                                    placeholderTextColor="#9ca3af"
                                    value={form.local} 
                                    onChangeText={(text) => setForm({ ...form, local: text })} 
                                />
                                <TextInput 
                                    style={styles.textInput} 
                                    placeholder="Dificuldade" 
                                    placeholderTextColor="#9ca3af"
                                    value={form.dificuldade} 
                                    onChangeText={(text) => setForm({ ...form, dificuldade: text })} 
                                />
                                <TextInput 
                                    style={styles.textInput} 
                                    placeholder="Data*" 
                                    placeholderTextColor="#9ca3af"
                                    value={form.data} 
                                    onChangeText={(text) => setForm({ ...form, data: text })} 
                                />
                                <TextInput 
                                    style={[styles.textInput, styles.textArea]} 
                                    placeholder="Descrição" 
                                    placeholderTextColor="#9ca3af"
                                    multiline 
                                    numberOfLines={3} 
                                    value={form.descricao} 
                                    onChangeText={(text) => setForm({ ...form, descricao: text })} 
                                />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={`Índice do Banner (0-${localBanners.length - 1})`}
                                    placeholderTextColor="#9ca3af"
                                    value={String(form.imageIndex)}
                                    onChangeText={(text) => {
                                        const index = parseInt(text) || 0;
                                        setForm({ ...form, imageIndex: Math.max(0, Math.min(index, localBanners.length - 1)) });
                                    }}
                                    keyboardType="numeric"
                                />

                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveTrilha}>
                                    <Text style={styles.saveButtonText}>
                                        {modalMode === "edit" ? "💾 Salvar Alterações" : "🌱 Criar Trilha"}
                                    </Text>
                                </TouchableOpacity>

                                {modalMode === "edit" && (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteTrilha(selectedTrilha.id)}
                                    >
                                        <Text style={styles.deleteButtonText}>🗑️ Excluir Trilha</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        {modalMode === "view" && selectedTrilha && (
                            <View style={styles.viewContainer}>
                                <Text style={styles.modalTitle}>🏔️ {selectedTrilha.trilhaNome || "Trilha"}</Text>
                                
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>👤 Guia:</Text> {selectedTrilha.nome || "Não informado"}
                                    </Text>
                                    <Text style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>📍 Local:</Text> {selectedTrilha.local || "Não informado"}
                                    </Text>
                                    <Text style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>🏋️ Dificuldade:</Text> {selectedTrilha.dificuldade || "Não informada"}
                                    </Text>
                                    <Text style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>📅 Data:</Text> {selectedTrilha.data || "Não informada"}
                                    </Text>
                                    <Text style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>📝 Descrição:</Text> {selectedTrilha.descricao || "Não informada"}
                                    </Text>
                                </View>
                                <View style={styles.actionButtons}>
                                    {userRole === "admin" ? (
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => setModalMode("edit")}
                                        >
                                            <Text style={styles.editButtonText}>✏️ Editar Trilha</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.scheduleButton, agendando && styles.disabledButton]}
                                            onPress={() => handleAgendarTrilha(selectedTrilha.id)}
                                            disabled={agendando}
                                        >
                                            {agendando ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.scheduleButtonText}>✅ Agendar Esta Trilha</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                        <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                            <Text style={styles.cancelButtonText}>❌ Fechar</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

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
        fontSize: 16,
    },
    header: { 
        padding: 20, 
        paddingTop: 50,
        backgroundColor: '#10b981',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#ffffff', 
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    headerButtons: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap' 
    },
    userRoleIndicator: { 
        padding: 12, 
        backgroundColor: '#d1fae5', 
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#a7f3d0',
    },
    userRoleText: { 
        fontSize: 14, 
        color: '#065f46',
        fontWeight: '500',
    },
    userRoleHighlight: {
        fontWeight: 'bold',
        color: '#10b981',
    },
    listContainer: {
        padding: 10,
        paddingBottom: 20,
    },
    trilhaCard: { 
        backgroundColor: "#ffffff", 
        margin: 10, 
        borderRadius: 16, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    trilhaImage: { 
        width: "100%", 
        height: 180 
    },
    trilhaInfo: { 
        padding: 16 
    },
    trilhaNome: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1f2937',
        marginBottom: 8,
    },
    trilhaLocal: { 
        fontSize: 14, 
        color: '#6b7280', 
        marginBottom: 4,
        fontWeight: '500',
    },
    trilhaData: { 
        fontSize: 14, 
        color: '#6b7280', 
        marginBottom: 12,
        fontWeight: '500',
    },
    dificuldadeBadge: { 
        alignSelf: 'flex-start', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 12,
        marginTop: 4,
    },
    dificuldadeText: { 
        color: '#fff', 
        fontSize: 12, 
        fontWeight: 'bold' 
    },
    adminBadge: { 
        position: 'absolute', 
        top: 12, 
        right: 12, 
        backgroundColor: '#f59e0b', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    adminBadgeText: { 
        color: '#fff', 
        fontSize: 10, 
        fontWeight: 'bold' 
    },
    emptyContainer: { 
        padding: 40, 
        alignItems: 'center',
        marginTop: 60,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyTitle: { 
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyText: { 
        textAlign: 'center', 
        color: '#6b7280', 
        fontSize: 16,
        lineHeight: 22,
    },
    modalContainer: { 
        flex: 1 
    },
    modalContent: { 
        padding: 20, 
        backgroundColor: 'rgba(255,255,255,0.98)', 
        margin: 20, 
        borderRadius: 20, 
        minHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    crudContainer: { 
        marginBottom: 20 
    },
    modalTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#10b981',
        textAlign: 'center', 
        marginBottom: 24,
    },
    textInput: { 
        borderWidth: 1, 
        borderColor: "#d1d5db", 
        padding: 16, 
        marginBottom: 16, 
        borderRadius: 12, 
        backgroundColor: '#f9fafb',
        fontSize: 16,
        color: '#1f2937',
    },
    textArea: { 
        minHeight: 100, 
        textAlignVertical: 'top' 
    },
    viewContainer: { 
        marginBottom: 20 
    },
    detailsContainer: { 
        backgroundColor: '#f8fafc', 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    detailItem: { 
        fontSize: 16, 
        marginBottom: 12, 
        lineHeight: 22,
        color: '#374151',
    },
    detailLabel: { 
        fontWeight: 'bold', 
        color: '#10b981' 
    },
    actionButtons: { 
        marginBottom: 16 
    },
    saveButton: { 
        backgroundColor: "#10b981", 
        padding: 18, 
        borderRadius: 12, 
        marginBottom: 12,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    deleteButton: { 
        backgroundColor: "#dc2626", 
        padding: 18, 
        borderRadius: 12, 
        marginBottom: 12,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    deleteButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    editButton: { 
        backgroundColor: "#f59e0b", 
        padding: 18, 
        borderRadius: 12, 
        marginBottom: 12,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    editButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    scheduleButton: { 
        backgroundColor: "#10b981", 
        padding: 18, 
        borderRadius: 12, 
        marginBottom: 12,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        shadowColor: '#9ca3af',
    },
    scheduleButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    cancelButton: { 
        backgroundColor: "#6b7280", 
        padding: 18, 
        borderRadius: 12,
        shadowColor: '#6b7280',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cancelButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    createButton: { 
        backgroundColor: "#10b981", 
        padding: 12, 
        borderRadius: 10, 
        marginBottom: 10, 
        minWidth: 120,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    createButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 14, 
        fontWeight: 'bold' 
    },
    logoutButton: { 
        backgroundColor: "#f59e0b", 
        padding: 12, 
        borderRadius: 10, 
        marginBottom: 10, 
        minWidth: 80,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    logoutButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 14,
        fontWeight: 'bold',
    },
    scheduleNavButton: { 
        backgroundColor: "#3b82f6", 
        padding: 12, 
        borderRadius: 10, 
        marginBottom: 10, 
        minWidth: 150,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    scheduleNavButtonText: { 
        color: "#fff", 
        textAlign: "center", 
        fontSize: 14,
        fontWeight: 'bold',
    },
});