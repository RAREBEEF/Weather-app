import { requestForegroundPermissionsAsync } from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: innerWidth } = Dimensions.get("window");

const API_KEY = "657ffa08a11bf0a94e0555cfc8706fb5";

export default function App() {
  const daysRef = useRef(null);
  const [city, setCity] = useState("...");
  const [permission, setPermission] = useState(true);
  const [days, setWeathers] = useState(null);
  const dateDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weatherIcons = {
    Clear: "sunny-outline",
    Rain: "rainy-outline",
    Clouds: "cloudy-outline",
    Thunderstorm: "thunderstorm-outline",
    Drizzle: "rainy-outline",
    Snow: "snow-outline",
    Squall: "rainy-outline",
  };
  const anotherWeatherIcons = {
    Mist: "weather-fog",
    Smoke: "face-mask-outline",
    Haze: "weather-fog",
    Dust: "face-mask-outline",
    Fog: "weather-fog",
    Sand: "face-mask-outline",
    Ash: "face-mask-outline",
    Tornado: "weather-tornado",
  };

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setPermission(false);
      return;
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );

    setCity(location[0].city);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await res.json();

    setWeathers(json.daily);
  };

  useEffect(() => {
    getWeather();
  }, []);

  const onWeekTouch = useCallback((i) => {
    if (!daysRef.current) {
      return;
    }

    daysRef.current.scrollTo({ x: i * innerWidth });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Ionicons name="location-outline" size={44} color="#778DA9" />
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.days}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={daysRef}
      >
        {days === null ? (
          <ActivityIndicator
            color="#E0E1DD"
            size="large"
            style={styles.loading}
          />
        ) : (
          days.map((day, i) => (
            <View style={styles.day} key={i}>
              <Text style={styles.date}>
                {`${new Date(day.dt * 1000).getMonth() < 9 ? "0" : ""}${
                  new Date(day.dt * 1000).getMonth() + 1
                } / ${
                  new Date(day.dt * 1000).getDate() < 10 ? "0" : ""
                }${new Date(day.dt * 1000).getDate()}`}
              </Text>
              <Text style={styles.dateDay}>
                {dateDay[new Date(day.dt * 1000).getDay()]}
              </Text>
              {weatherIcons[day.weather[0].main] ? (
                <Ionicons
                  style={{ marginTop: 10 }}
                  name={weatherIcons[day.weather[0].main]}
                  size={104}
                  color="#415A77"
                />
              ) : (
                <MaterialCommunityIcons
                  style={{ marginTop: 10 }}
                  name={anotherWeatherIcons[day.weather[0].main]}
                  size={104}
                  color="#415A77"
                />
              )}

              <View style={styles.temp}>
                <Text style={styles.number}>{Math.round(day.temp.day)}</Text>
                <Text style={styles.sign}>°C</Text>
              </View>
              <Text style={styles.desc}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <ScrollView
        contentContainerStyle={styles.summaries}
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        {days !== null &&
          days.map((day, i) => (
            <TouchableOpacity
              style={styles.summary}
              key={i}
              onPress={() => {
                onWeekTouch(i);
              }}
            >
              <Text style={styles.summaryDate}>
                {`${new Date(day.dt * 1000).getMonth() < 9 ? "0" : ""}${
                  new Date(day.dt * 1000).getMonth() + 1
                } / ${
                  new Date(day.dt * 1000).getDate() < 10 ? "0" : ""
                }${new Date(day.dt * 1000).getDate()}`}
              </Text>
              <Text style={styles.summaryDateDay}>
                {dateDay[new Date(day.dt * 1000).getDay()]}
              </Text>
              {weatherIcons[day.weather[0].main] ? (
                <Ionicons
                  style={{ marginTop: 10 }}
                  name={weatherIcons[day.weather[0].main]}
                  size={54}
                  color="#778DA9"
                />
              ) : (
                <MaterialCommunityIcons
                  style={{ marginTop: 10 }}
                  name={anotherWeatherIcons[day.weather[0].main]}
                  size={54}
                  color="#778DA9"
                />
              )}
              <Text style={styles.summaryTemp}>
                {Math.round(day.temp.day)}°C
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D1B2A" },
  city: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0D1B2A",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  cityName: {
    fontSize: 44,
    color: "#778DA9",
  },
  days: {},
  day: {
    margin: 50,
    alignItems: "center",
    justifyContent: "center",
    width: innerWidth - 100,
    // backgroundColor: "#E0E1DD",
    // borderRadius: 15,
  },
  date: {
    fontSize: 30,
    color: "#778DA9",
    fontWeight: "300",
  },
  dateDay: {
    fontSize: 30,
    color: "#778DA9",
    fontWeight: "600",
  },
  temp: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 23,
  },
  number: { fontSize: 74, color: "#415A77", fontWeight: "500" },
  sign: {
    color: "#415A77",
    fontSize: 20,
    marginTop: 15,
    fontWeight: "600",
  },
  desc: { fontSize: 18, color: "#778DA9", fontWeight: "500" },
  summaries: {
    justifyContent: "center",
    alignItems: "center",
  },
  summary: {
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#1B263B",
    borderRadius: 15,
  },
  summaryDate: {
    color: "#415A77",
  },
  summaryDateDay: {
    color: "#415A77",
    marginBottom: -10,
    fontWeight: "700",
  },
  summaryTemp: {
    color: "#778DA9",
    fontWeight: "700",
  },
  loading: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: innerWidth,
  },
});
