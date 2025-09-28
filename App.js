// import { StatusBar } from 'expo-status-bar';
// import { Pressable, Text, View } from 'react-native';
// import { styles } from './src/style.js'
// import { TextInput } from 'react-native-web';
// import { useState } from 'react';
// import { auth } from './config/firebase.config.js';
// import { signInWithEmailAndPassword } from 'firebase/auth';

// export default function App() {
//   const [userMail, setUserMail] = useState('');
//   const [userPass, setUserPass] = useState('');

//   function userLogin() {
//     signInWithEmailAndPassword(auth, userMail, userPass)
//     .then((userCredential) => {
//       const user = userCredential.user;
//       alert('Login Efetuado');
//       console.log(user);
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       alert(errorMessage);
//     })
//   }

//   return (
//     <View style={styles.container}>
//       <Text>Login!</Text>
//       <TextInput style={styles.formInput}
//       placeholder='Informe o E-mail'
//       keyboardType='email-adress'
//       autoCapitalize='none'
//       autoComplete='email'
//       value={userMail}
//       onChangeText={setUserMail}
//       />
//       <TextInput style={styles.formInput}
//       placeholder='Informe a senha'
//       autoCapitalize='none'
//       secureTextEntry
//       value={userPass}
//       onChangeText={setUserPass}
//       />
//       <Pressable style={styles.formButton}
//       onPress={userLogin}
//       >
//         <Text style={styles.textButton}>Logar</Text>
//       </Pressable>
//       <View>
//         <Pressable style={styles.subButton}>
//           <Text style={styles.subTextButton}>Esqueci a senha</Text>
//         </Pressable>
//         <Pressable style={styles.subButton}>
//           <Text style={styles.subTextButton}>Novo usuárioa</Text>
//         </Pressable>
//       </View>
//       <StatusBar style="auto" />
//     </View>
//   );
// }


