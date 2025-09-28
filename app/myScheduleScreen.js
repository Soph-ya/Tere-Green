import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { auth, db } from "../config/firebase.config";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

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

export default function MySchedulesScreen() {
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const q = query(
          collection(db, "agendamentos"),
          where("userId", "==", currentUser.uid)
        );

        const unsubscribeSchedules = onSnapshot(q, async (snapshot) => {
          const schedulesWithTrilhaData = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              let trilhaData = {};
              
              if (data.trilhaId) {
                const trilhaDoc = await getDoc(doc(db, "trilhas", data.trilhaId));
                if (trilhaDoc.exists()) {
                  trilhaData = trilhaDoc.data();
                }
              }
              
              const imageIndex = data.imageIndex !== undefined 
                ? data.imageIndex 
                : (trilhaData.imageIndex !== undefined ? trilhaData.imageIndex : 0);
              
              return { 
                id: docSnap.id, 
                ...data, 
                ...trilhaData,
                imageIndex: Math.max(0, Math.min(imageIndex, localBanners.length - 1))
              };
            })
          );
          setSchedules(schedulesWithTrilhaData);
          setLoading(false);
        });

        return () => unsubscribeSchedules();
      } else {
        router.replace("/");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    try {
      await deleteDoc(doc(db, "agendamentos", scheduleToDelete.id));
      setSchedules((prev) =>
        prev.filter((s) => s.id !== scheduleToDelete.id)
      );
      setModalVisible(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setModalVisible(false);
      setScheduleToDelete(null);
    }
  };

  const getDificuldadeColor = (dificuldade) => {
    if (!dificuldade) return '#6b7280';
    switch (dificuldade.toLowerCase()) {
      case 'fácil': return '#10b981';
      case 'moderada': return '#f59e0b';
      case 'difícil': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    
    try {
      if (dateString.toDate) {
        return dateString.toDate().toLocaleDateString('pt-BR');
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
      
      return dateString;
    } catch (error) {
      return dateString || "—";
    }
  };

  const renderScheduleCard = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={localBanners[item.imageIndex % localBanners.length]}
        style={styles.trilhaImage}
      />
      
      <View style={styles.cardContent}>
        <Text style={styles.trilhaNome}>
          🏔️ {item.trilhaNome || item.nome || "Trilha sem nome"}
        </Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailItem}>
            <Text style={styles.detailLabel}>📍 Local:</Text> {item.trilhaLocal || item.local || "—"}
          </Text>
          
          <Text style={styles.detailItem}>
            <Text style={styles.detailLabel}>📅 Data da Trilha:</Text> {formatDate(item.trilhaData || item.data)}
          </Text>
          
          <Text style={styles.detailItem}>
            <Text style={styles.detailLabel}>⏰ Agendado em:</Text> {formatDate(item.agendadaEm)}
          </Text>
          
          {item.trilhaDificuldade || item.dificuldade ? (
            <View style={[styles.dificuldadeBadge, 
              { backgroundColor: getDificuldadeColor(item.trilhaDificuldade || item.dificuldade) }]}>
              <Text style={styles.dificuldadeText}>
                🏋️ {item.trilhaDificuldade || item.dificuldade}
              </Text>
            </View>
          ) : null}
          
          {item.status && (
            <View style={[styles.statusBadge, 
              { backgroundColor: item.status === 'confirmado' ? '#10b981' : '#f59e0b' }]}>
              <Text style={styles.statusText}>
                {item.status === 'confirmado' ? '✅ Confirmado' : '⏳ Pendente'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setScheduleToDelete(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️ Excluir Agendamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user || loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.background} />
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando suas aventuras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>📋 Meus Agendamentos</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>↶ Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>🚪 Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          🌟 {schedules.length} aventura{schedules.length !== 1 ? 's' : ''} agendada{schedules.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {schedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌲</Text>
          <Text style={styles.emptyTitle}>Nenhuma aventura agendada</Text>
          <Text style={styles.emptyText}>
            Você ainda não explorou nenhuma trilha.{'\n'}
            Descubra novas aventuras e viva experiências incríveis na natureza!
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.back()}
          >
            <Text style={styles.exploreButtonText}>🌄 Explorar Trilhas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderScheduleCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🗑️ Confirmar Exclusão</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja cancelar o agendamento da trilha {"\n"}
              <Text style={styles.modalHighlight}>
                "{scheduleToDelete?.trilhaNome || scheduleToDelete?.nome}"?
              </Text>
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>↶ Manter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteSchedule}
                style={[styles.modalButton, styles.deleteButtonModal]}
              >
                <Text style={styles.deleteButtonTextModal}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    height: '12%',
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 45,
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: { 
    color: "#10b981", 
    fontWeight: '600',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: { 
    color: "#ffffff", 
    fontWeight: '600',
    fontSize: 12,
  },
  counterContainer: {
    padding: 12,
    backgroundColor: '#d1fae5',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  counterText: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  trilhaImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 14,
  },
  trilhaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  detailsContainer: {
    marginBottom: 14,
  },
  detailItem: {
    fontSize: 13,
    marginBottom: 6,
    color: '#6b7280',
    lineHeight: 18,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#10b981',
  },
  dificuldadeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dificuldadeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  modalHighlight: {
    fontWeight: '600',
    color: '#10b981',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButtonModal: {
    backgroundColor: "#dc2626",
  },
  deleteButtonTextModal: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});