import React, { useEffect, useReducer } from 'react';
import { API } from 'aws-amplify';
import { List, Button, Input } from 'antd';
import 'antd/lib/button/style'; // Import the styles for the Button component
import 'antd/lib/input/style'; // Import the styles for the Input component
import { listNotes } from './graphql/queries';
import { v4 as uuid } from 'uuid'; // Import the UUID library to create a unique identifier for the client
import { createNote as CreateNote, deleteNote as DeleteNote } from './graphql/mutations'; // Import the createNote and deleteNote mutation definition

// reate a new CLIENT_ID variable
const CLIENT_ID = uuid();

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NOTES': // List all notes from listNotes
      return { ...state, notes: action.notes, loading: false }
    case 'ERROR':
      return { ...state, loading: false, error: true }
    case 'ADD_NOTE': // adding a new note to the loal state
      return { ...state, notes: [action.note, ...state.notes] }
    case 'RESET_FORM': // resetting the form state to clear out the form
      return { ...state, form: initialState.form }
    case 'SET_INPUT': // updating the form state when the user types
      return { ...state, form: { ...state.form, [action.name]: action.value } }
    default:
      return state
  }
}

function App() {

  const [state, dispatch] = useReducer(reducer, initialState);

  async function fetchNotes() {
    try {
      const notesData = await API.graphql({
        query: listNotes
      });
      dispatch({ type: 'SET_NOTES', notes: notesData.data.listNotes.items })
      console.log("return: ", notesData);
    } catch (err) {
      console.log('error: ', err);
      dispatch({ type: 'ERROR' })
    }
  }

  // create the createNote function
  async function createNote() {
    const { form } = state;
    if (!form.name || !form.description) {
      return alert('please enter a name and ddescription!')
    }
    const note = { ...form, clientId: CLIENT_ID, completed: false, id: uuid() }
    dispatch({ type: 'ADD_NOTE', note })
    dispatch({ type: 'RESET_FORM' })
    try {
      await API.graphql({
        query: CreateNote,
        variables: { input: note }
      })
      console.log("note created");
    } catch (err) {
      console.log("error: ", err);
    }
  }

  // onChange handler to update the form state when user interacts with an input
  function onChange(e) {
    dispatch({ type: 'SET_INPUT', name: e.target.name, value: e.target.value })
  }

  // create the deleteNote function
  async function deleteNote({ id }) {
    const index = state.notes.findIndex(n => n.id === id)
    const notes = [
      ...state.notes.slice(0, index),
      ...state.notes.slice(index + 1)];
    dispatch({ type: 'SET_NOTES', notes })
    try {
      await API.graphql({
        query: DeleteNote,
        variables: { input: { id } }
      })
      console.log("note deleted");
    } catch (err) {
      console.log('error: ', err);
    }
  }

  const styles = {
    container: { padding: 20 },
    input: { marginBottom: 10 },
    item: { textAlign: 'lesf' },
    p: { color: '#1890ff' }
  };

  function renderItem(item) {
    return (
      <List.Item
        style={styles.item}
        actions={[
          <p style={styles.p} onClick={() => deleteNote(item)}>Delete</p>
        ]}
      >
        <List.Item.Meta
          title={item.name}
          description={item.description}
        />
      </List.Item>
    )
  };

  useEffect(() => {
    fetchNotes()
  }, []);


  return (
    <div>
      <Input
        onChange={onChange}
        value={state.form.name}
        placeholder='Note name'
        name='name'
        style={styles.input}
      />
      <Input
        onChange={onChange}
        value={state.form.description}
        placeholder='Description'
        name='description'
        style={styles.input}
      />
      <Button
        onClick={createNote}
        type='primary'
      >Create Note</Button>

      <div style={styles.container}>
        <List
          loading={state.loading}
          dataSource={state.notes}
          renderItem={renderItem}
        />
      </div>
    </div>
  )
}
export default App


