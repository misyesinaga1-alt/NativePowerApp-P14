import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {

  const [name, setName] = useState("");

  const [photo, setPhoto] = useState(null);

  const [latitude, setLatitude] = useState("");

  const [longitude, setLongitude] = useState("");

  const [address, setAddress] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem("profile");

      if (data) {
        const profile = JSON.parse(data);

        setName(profile.name || "");
        setPhoto(profile.photo || null);
        setLatitude(profile.latitude || "");
        setLongitude(profile.longitude || "");
        setAddress(profile.address || "");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveData = async () => {
    try {
      const profile = {
        name,
        photo,
        latitude,
        longitude,
        address,
      };

      await AsyncStorage.setItem(
        "profile",
        JSON.stringify(profile)
      );

      Alert.alert(
        "Berhasil",
        "Data berhasil disimpan."
      );
    } catch (e) {
      console.log(e);
    }
  };

  const choosePhoto = () => {
    Alert.alert(
      "Pilih Foto",
      "Pilih sumber foto",
      [
        {
          text: "Kamera",
          onPress: openCamera,
        },
        {
          text: "Galeri",
          onPress: openGallery,
        },
        {
          text: "Batal",
          style: "cancel",
        },
      ]
    );
  };

  const openCamera = async () => {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (permission.status !== "granted") {

      Alert.alert(
        "Izin Kamera Ditolak",
        "Silakan aktifkan izin kamera di Settings.",
        [
          {
            text: "Settings",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Tutup",
          },
        ]
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const openGallery = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {

      Alert.alert(
        "Izin Galeri Ditolak",
        "Silakan aktifkan izin galeri di Settings.",
        [
          {
            text: "Settings",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Tutup",
          },
        ]
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: true,
      });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };
    const getLocation = async () => {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert(
        "Izin Lokasi Ditolak",
        "Silakan aktifkan izin lokasi di Settings.",
        [
          {
            text: "Settings",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Tutup",
          },
        ]
      );
      return;
    }

    try {
      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const lat = location.coords.latitude.toString();
      const lon = location.coords.longitude.toString();

      setLatitude(lat);
      setLongitude(lon);

      const addressResult =
        await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

      if (addressResult.length > 0) {
        const place = addressResult[0];

        const fullAddress =
          `${place.street || ""} ${place.name || ""}
${place.city || ""}
${place.region || ""}
${place.country || ""}`;

        setAddress(fullAddress);
      }

    } catch (error) {
      Alert.alert(
        "Error",
        "Gagal mengambil lokasi."
      );
    }
  };

  const openMaps = () => {

    if (!latitude || !longitude) {
      Alert.alert(
        "Lokasi belum tersedia"
      );
      return;
    }

    const url =
      `https://www.google.com/maps?q=${latitude},${longitude}`;

    Linking.openURL(url);
  };

  const resetData = async () => {

    Alert.alert(
      "Reset Data",
      "Apakah Anda yakin ingin menghapus semua data?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: async () => {

            setName("");
            setPhoto(null);
            setLatitude("");
            setLongitude("");
            setAddress("");

            await AsyncStorage.removeItem("profile");

            Alert.alert(
              "Berhasil",
              "Data berhasil dihapus."
            );
          },
        },
      ]
    );
  };

  return (
        <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.title}>
          Native Power App
        </Text>

        <Image
          source={
            photo
              ? { uri: photo }
              : {
                  uri: "https://via.placeholder.com/180",
                }
          }
          style={styles.photo}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={choosePhoto}
        >
          <Text style={styles.buttonText}>
            📷 Kamera / Galeri
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>
          Nama
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Masukkan nama"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={getLocation}
        >
          <Text style={styles.buttonText}>
            📍 Ambil Lokasi
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>

          <Text style={styles.info}>
            Latitude
          </Text>

          <Text style={styles.value}>
            {latitude || "-"}
          </Text>

          <Text style={styles.info}>
            Longitude
          </Text>

          <Text style={styles.value}>
            {longitude || "-"}
          </Text>

          <Text style={styles.info}>
            Alamat
          </Text>

          <Text style={styles.address}>
            {address || "-"}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={openMaps}
        >
          <Text style={styles.buttonText}>
            🗺️ Buka Google Maps
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveData}
        >
          <Text style={styles.buttonText}>
            💾 Simpan Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetData}
        >
          <Text style={styles.buttonText}>
            🗑 Reset Data
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEAF4",
  },

  scroll: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E91E63",
    marginTop: 20,
    marginBottom: 20,
  },

  photo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: "#FF69B4",
    backgroundColor: "#F8D7E6",
    marginBottom: 20,
  },

  label: {
    alignSelf: "flex-start",
    marginLeft: "5%",
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },

  input: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFB6C1",
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    width: "90%",
    backgroundColor: "#FF69B4",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveButton: {
    width: "90%",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  resetButton: {
    width: "90%",
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  card: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    elevation: 4,
  },

  info: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E91E63",
    marginTop: 8,
  },

  value: {
    fontSize: 15,
    color: "#333",
    marginBottom: 5,
  },

  address: {
    fontSize: 15,
    color: "#333",
    marginTop: 5,
    lineHeight: 22,
  },
});