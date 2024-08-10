export const initialStore=()=>{
  const token = localStorage.getItem('token') || null;

  return{
    user: null,
    token: token,
    message: null,
    coins: [],
    favorites: [],
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'update_token':
      case 'update_token':
        const { token } = action;
        localStorage.setItem('token', token);  
        return {
          ...store,
          token
        };
    case 'update_user':
      const { user } = action;
      return {
        ...store,
        user
      };
    case 'load_coins':
      const { coins } = action;
      return {
        ...store,
        coins
      };
    case 'add_favorite':
      const { favoriteCoin } = action;
      return {
        ...store,
        favorites: [...store.favorites, favoriteCoin]
      };
    case 'remove_favorite':
      const { coinId } = action;
      return {
        ...store,
        favorites: store.favorites.filter(coin => coin.id !== coinId)
      };

    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}