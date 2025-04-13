import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function App() {
  const [working, setWorking] = useState(true);
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState({});

  const work = () => setWorking(true);
  const travel = () => setWorking(false);

  const addTodo = async (text) => {
    if (text === "") return;

    const newTodo = { ...todos, [Date.now()]: { text, work: working } };
    setTodos(newTodo);
    await saveTodos(newTodo);
    setInput("");
  };

  const saveTodos = async (newTodo) => {
    await AsyncStorage.setItem("todos", JSON.stringify(newTodo));
  };

  const loadTodos = async () => {
    const loaded = await AsyncStorage.getItem("todos");
    setTodos(JSON.parse(loaded) || {});
  };

  const deleteTodo = (key) => {
    Alert.alert("Want to delete this Todo?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          saveTodos(newTodos);
        },
      },
    ]);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.textBtn, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.textBtn, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Add a task"
        value={input}
        onChangeText={setInput}
        returnKeyType="done"
        onSubmitEditing={() => addTodo(input)}
      />
      <ScrollView>
        {Object.keys(todos).map((key) =>
          working === todos[key].work ? (
            <View style={styles.todo} key={key}>
              <Text style={styles.todoText}>{todos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteTodo(key)}>
                <Text>
                  <FontAwesome name="trash" size={24} color="red" />
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    paddingTop: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  textBtn: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
  },
  todo: {
    backgroundColor: theme.toDoBg,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
