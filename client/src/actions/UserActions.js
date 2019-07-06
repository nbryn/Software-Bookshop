import axios from "axios";
import {
  NEW_USER,
  SET_USER,
  AUTH_USER,
  ADD_TO_CART,
  GET_QUANTITY_IN_CART,
  REMOVE_BOOK_FROM_CART
} from "./ActionTypes";

// Persist user -> Dispatch NEW_User
export const newUser = (user, history) => async dispatch => {
  const response = await axios.post(
    "http://localhost:3001/webshop/users/signup",
    user
  );
  history.push("/signin");

  // Dispatch NEW_USER action to store
  dispatch({
    type: NEW_USER,
    payload: response
  });
};
// Try to log user in -> Dispatch SET_USER/GET_ERRORS action
export const login = (signInRequest, history) => async dispatch => {
  const response = await axios.post(
    "http://localhost:3001/webshop/users/signin",
    signInRequest
  );
  history.push("/user/dashboard");

  // Set token in local storage
  const { token } = response.data;
  localStorage.setItem("jwtToken", token);

  // Dispatch SET_USER action to store
  dispatch({
    type: SET_USER,
    payload: response
  });
};
// Try to authenticate user -> Dispatch AUTH_USER action
export const authenticateUser = () => async dispatch => {
  // Get token from local storage
  const jwtToken = localStorage.getItem("jwtToken");
  const request = { token: jwtToken };
  const response = await axios.post(
    "http://localhost:3001/webshop/users/auth",
    request
  );

  // Dispatch AUTH_USER action to store
  dispatch({
    type: AUTH_USER,
    payload: response
  });
};

// Action for user signing out
export const signOut = () => dispatch => {
  localStorage.removeItem("jwtToken");
  dispatch({
    type: SET_USER,
    payload: {}
  });
};

// Forward book ID and User ID to server for persistence in cart
export const addToCart = (bookId, userId) => {
  const response = axios
    .post(
      `http://localhost:3001/webshop/users/addtocart?bookId=${bookId}&userId=${userId}`
    )
    .then(response => response.data);

  // Dispatch happens @ component
  return {
    type: ADD_TO_CART,
    payload: response
  };
};

// Get quantity of book in users cart for display in the cart component
export const getQuantityInCart = (cartItems, cart) => {
  const response = axios
    .get(`http://localhost:3001/webshop/book_by_id?id=${cartItems}&type=array`)
    .then(response => {
      cart.forEach(book => {
        // Loop through each book in cart and add quantity to the response
        response.data.forEach((book1, index) => {
          if (book.id === book1._id) {
            response.data[index].quantity = book.quantity;
          }
        });
      });

      return response.data;
    });

  // Dispatch happens @ component
  return {
    type: GET_QUANTITY_IN_CART,
    payload: response
  };
};

//
export const removeCartItem = id => {
  const response = axios
    .get(`http://localhost:3001/webshop/user/removeBookFromCart?_id=${id}`)
    .then(response => {
      response.data.cart.forEach(book => {
        response.data.booksInCart.forEach((book1, index) => {
          if (book.id === book1._id) {
            response.data.booksInCart[index].quantity = book.quantity;
          }
        });
      });
      return response.data;
    });

  return {
    type: REMOVE_BOOK_FROM_CART,
    payload: response
  };
};
