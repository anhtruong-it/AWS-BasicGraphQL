import React, { useEffect, useReducer } from 'react';
import { API } from 'aws-amplify';
import { List } from 'antd';
//import 'antd/dist/antd.css'; // Import the overall Ant Design styles
import 'antd/lib/button/style'; // Import the styles for the Button component
import 'antd/lib/input/style'; // Import the styles for the Input component
import { listNotes } from './graphql/queries';

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, loading: false }
    case 'ERROR':
      return { ...state, loading: false, error: true }
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

  const styles = {
    container: { padding: 20 },
    input: { marginBottom: 10 },
    item: { textAlign: 'lesf' },
    p: { color: '#1890ff' }
  };

  function renderItem(item) {
    return (
      <List.Item style={styles.item}>
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

    <div style={styles.container}>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  )
}
export default App


