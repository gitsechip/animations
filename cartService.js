class CartService {
    constructor() {
      this.cart = [];
      this.auth = firebase.auth();
      this.db = firebase.firestore();
    }
  
    async init() {
      // Cargar carrito desde localStorage
      this.loadFromLocalStorage();
      
      // Escuchar cambios de autenticación
      this.auth.onAuthStateChanged(async (user) => {
        if (user) {
          await this.syncWithFirestore(user.uid);
        }
      });
    }
  
    loadFromLocalStorage() {
      this.cart = JSON.parse(localStorage.getItem('cart')) || [];
      this.updateUI();
    }
  
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.updateUI();
    }
  
    async syncWithFirestore(userId) {
      try {
        const doc = await this.db.collection('users').doc(userId).get();
        if (doc.exists && doc.data().cart) {
          // Si hay productos en Firestore, actualizar localStorage
          this.cart = doc.data().cart;
          this.saveToLocalStorage();
        } else {
          // Si no hay productos en Firestore, guardar los de localStorage
          await this.saveToFirestore(userId);
        }
      } catch (error) {
        console.error('Error al sincronizar con Firestore:', error);
      }
    }
  
    async saveToFirestore(userId) {
      try {
        await this.db.collection('users').doc(userId).update({
          cart: this.cart
        });
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
      }
    }
  
    async addToCart(product) {
      this.cart.push(product);
      this.saveToLocalStorage();
      
      const user = this.auth.currentUser;
      if (user) {
        await this.saveToFirestore(user.uid);
      }
    }
  
    updateUI() {
      if (typeof renderCartItems === 'function') {
        renderCartItems();
      }
      if (typeof actualizarBadge === 'function') {
        actualizarBadge();
      }
    }
  }