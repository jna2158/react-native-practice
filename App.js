import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EvilIcons from "@expo/vector-icons/EvilIcons";

export default function App() {
  const [working, setWorking] = useState(true);
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState({});
  const [editing, setEditing] = useState(false);
  const [editKey, setEditKey] = useState(null);

  const work = async () => {
    await AsyncStorage.setItem("working", "true");
    setWorking(true);
  };
  const travel = async () => {
    await AsyncStorage.setItem("working", "false");
    setWorking(false);
  };

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

  const loadTab = async () => {
    const working = await AsyncStorage.getItem("working");
    setWorking(working === "true");
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

  const editTodo = (key) => {
    setEditing(true);
    setEditKey(key);
    setInput(todos[key].text);
  };

  const finishEditing = async () => {
    if (input !== "" && editKey) {
      const newTodos = { ...todos };
      newTodos[editKey].text = input;
      setTodos(newTodos);
      await saveTodos(newTodos);
      setEditing(false);
      setEditKey(null);
      setInput("");
    }
  };

  const toggleTodo = (key) => {
    const newTodos = { ...todos };
    newTodos[key].checked = !newTodos[key].checked;
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  useEffect(() => {
    loadTodos();
    loadTab();
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
        placeholder={editing ? "Edit task" : "Add a task"}
        value={input}
        onChangeText={setInput}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (editing) {
            finishEditing();
          } else {
            addTodo(input);
          }
        }}
      />
      {editing && (
        <View style={styles.editingControls}>
          <TouchableOpacity style={styles.editButton} onPress={finishEditing}>
            <Text style={styles.editButtonText}>저장</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, styles.cancelButton]}
            onPress={() => {
              setEditing(false);
              setEditKey(null);
              setInput("");
            }}
          >
            <Text style={styles.editButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView>
        {Object.keys(todos).map((key) =>
          working === todos[key].work ? (
            <View style={styles.todo} key={key}>
              <TouchableOpacity
                style={styles.todoTextContainer}
                onPress={() => toggleTodo(key)}
              >
                <Checkbox
                  style={styles.checkbox}
                  value={todos[key].checked}
                  onValueChange={() => toggleTodo(key)}
                />
                <Text
                  style={{
                    ...styles.todoText,
                    textDecorationLine: todos[key].checked
                      ? "line-through"
                      : "none",
                    textDecorationStyle: "solid",
                    textDecorationColor: "#b5aaaa",
                    color: todos[key].checked ? "#8a8a8a" : "white",
                    opacity: todos[key].checked ? 0.7 : 1,
                  }}
                >
                  {todos[key].text}
                </Text>
              </TouchableOpacity>
              {todos[key].checked ? null : (
                <View style={styles.todoIconContainer}>
                  <TouchableOpacity onPress={() => editTodo(key)}>
                    <EvilIcons name="pencil" size={34} color="#635959" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTodo(key)}>
                    <FontAwesome name="trash" size={24} color="#635959" />
                  </TouchableOpacity>
                </View>
              )}
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
  checkbox: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    width: 20,
    height: 20,
  },
  todoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  todoIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  editingControls: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: theme.toDoBg,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#635959",
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
