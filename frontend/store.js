import Cookies from 'js-cookie';

export const initialStore=()=>{
  const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const storedToken = Cookies.get('token') || null;

  return{
    user: null,
    token: storedToken,
    message: null,
    coins: [],
    favorites: storedFavorites,
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
      const { token } = action;
      Cookies.set('token', token || '', { expires: 1 }); // Expires in 1 day
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
      case'add_favorite':
      const { favoriteCoin } = action;
      const updatedFavorites = [...store.favorites, favoriteCoin];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return {
        ...store,
        favorites: updatedFavorites
      };

    case'remove_favorite':
      const { coinId } = action;
      const filteredFavorites = store.favorites.filter(coin => coin.id !== coinId);
      localStorage.setItem('favorites', JSON.stringify(filteredFavorites));
      return {
        ...store,
        favorites: filteredFavorites
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