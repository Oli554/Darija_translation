import React, { useState } from 'react';
import { encode } from 'base-64';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';

const DEFAULT_API = Platform.OS === 'android' ? 'http://10.0.2.2:8080/darija-translator/api' : 'http://localhost:8080/darija-translator/api';
export default function App() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_API);
  const [username, setUsername] = useState('translator');
  const [password, setPassword] = useState('ChangeMe123!');
  const [source, setSource] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const translate = async () => {
    if (!source.trim()) { setError('Enter text to translate.'); return; }
    setLoading(true); setError(''); setTranslation('');
    try {
      const token = encode(`${username}:${password}`);
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/translator/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${token}` }, body: JSON.stringify({ text: source.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setTranslation(data.translation || '');
    } catch (e) { setError(e.message || 'Could not connect to the API.'); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}>
    <View style={styles.header}><Text style={styles.title}>Darija Translator</Text><Text style={styles.subtitle}>English to Moroccan Arabic</Text></View>
    <Text style={styles.label}>REST API URL</Text><TextInput style={styles.input} value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" />
    <View style={styles.row}><View style={styles.half}><Text style={styles.label}>Username</Text><TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" /></View><View style={styles.half}><Text style={styles.label}>Password</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry /></View></View>
    <Text style={styles.label}>Text to translate</Text><TextInput style={[styles.input, styles.textarea]} multiline value={source} onChangeText={setSource} placeholder="Type or paste English text..." textAlignVertical="top" />
    <TouchableOpacity style={styles.button} onPress={translate} disabled={loading}>{loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Translate to Darija</Text>}</TouchableOpacity>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {!!translation && <View style={styles.result}><Text style={styles.resultTitle}>Darija translation</Text><Text style={styles.resultText}>{translation}</Text></View>}
    <Text style={styles.hint}>Android emulator: use 10.0.2.2 to reach your computer. On a physical phone, enter your computer's LAN IP address.</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:'#f4f7fb'},container:{padding:20},header:{backgroundColor:'#102b4e',padding:22,borderRadius:14,marginBottom:20},title:{fontSize:24,fontWeight:'800',color:'#fff'},subtitle:{color:'#c7d8e8',marginTop:5},label:{fontWeight:'700',color:'#20344d',marginBottom:6,marginTop:12},input:{backgroundColor:'#fff',borderColor:'#ccd7e2',borderWidth:1,borderRadius:9,padding:12,color:'#17243b'},textarea:{height:150,textAlignVertical:'top'},row:{flexDirection:'row',gap:10},half:{flex:1},button:{backgroundColor:'#087e8b',padding:15,borderRadius:9,alignItems:'center',marginTop:16},buttonText:{color:'#fff',fontWeight:'800'},error:{color:'#a32626',marginTop:12},result:{backgroundColor:'#fff',padding:16,borderRadius:10,borderWidth:1,borderColor:'#dce5ed',marginTop:20},resultTitle:{fontWeight:'800',fontSize:17,color:'#102b4e',marginBottom:10},resultText:{fontSize:17,color:'#17243b',lineHeight:26},hint:{color:'#65758b',fontSize:12,marginTop:18,lineHeight:18}});
