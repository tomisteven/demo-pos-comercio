import React, { createContext, useState, useCallback, useMemo } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0); // en %

  const addToCart = useCallback((product, options = {}) => {
    // === Promoción (combo) ===
    if (options.esPromocion) {
      const cartItemId = `promo-${options.promocion}`;
      const precioVenta = options.precioVenta !== undefined ? options.precioVenta : product.precioFinal;

      setCartItems((prev) => {
        const existItem = prev.find((x) => x.cartItemId === cartItemId);

        if (existItem) {
          return prev.map((x) =>
            x.cartItemId === cartItemId
              ? {
                  ...existItem,
                  cantidad: existItem.cantidad + 1,
                  subtotal: (existItem.cantidad + 1) * existItem.precioVenta,
                }
              : x
          );
        }

        const precioCompra = options.precioCompra !== undefined ? options.precioCompra : product.subtotalCosto;
        return [
          ...prev,
          {
            cartItemId,
            promocion: options.promocion,
            producto: product._id,
            nombre: options.nombre || product.nombre,
            sku: 'PROMO',
            precioVenta,
            precioCompra,
            cantidad: 1,
            subtotal: precioVenta,
            stockMaximo: 999,
            esPromocion: true,
            esGenerico: false,
            unidadMedida: 'combo',
            precioUnitario: precioVenta,
          },
        ];
      });
      return true;
    }

    // Identificador único de la línea. Los productos genéricos (precio libre)
    // pueden cargarse con precios distintos, así que no se agrupan.
    const isCustom = options.esGenerico;
    const cartItemId = isCustom ? `${product._id}-${Date.now()}` : product._id;

    setCartItems((prev) => {
      const existItem = prev.find((x) => x.cartItemId === cartItemId);

      if (existItem) {
        // Se permite vender igual si el registro de stock dice 0 (hay stock físico)
        if (product.stock > 0 && product.stock < existItem.cantidad + 1) {
          return prev; // Sin stock
        }
        return prev.map((x) =>
          x.cartItemId === cartItemId
            ? {
                ...existItem,
                cantidad: existItem.cantidad + 1,
                subtotal: (existItem.cantidad + 1) * existItem.precioVenta,
              }
            : x
        );
      }

      // Se permite vender igual si el registro de stock dice 0 (hay stock físico)
      if (product.stock > 0 && product.stock < 1) return prev;

      const precioVenta = options.precioVenta !== undefined ? options.precioVenta : product.precioVenta;

      return [
        ...prev,
        {
          cartItemId, // ID único para el carrito
          producto: product._id, // ID en base de datos
          nombre: options.nombrePersonalizado || product.nombre,
          sku: product.sku,
          codigoBarras: product.codigoBarras || null,
          precioVenta,
          precioCompra: product.precioCompra,
          cantidad: 1, // Cantidad de unidades
          subtotal: precioVenta,
          stockMaximo: product.stock,
          esGenerico: options.esGenerico || false,
          unidadMedida: product.unidadMedida || 'unidad',
          precioUnitario: options.precioUnitario !== undefined ? options.precioUnitario : precioVenta,
        },
      ];
    });

    return true;
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCartItems((prev) => prev.filter((x) => x.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(cartItemId);

    setCartItems((prev) =>
      prev.map((x) => {
        if (x.cartItemId === cartItemId) {
          return {
            ...x,
            cantidad: newQuantity,
            subtotal: newQuantity * x.precioVenta,
          };
        }
        return x;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
  }, []);

  const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.subtotal, 0), [cartItems]);
  const cartTotal = useMemo(() => cartSubtotal - (cartSubtotal * (discount / 100)), [cartSubtotal, discount]);

  const value = useMemo(() => ({
    cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
    discount, setDiscount, cartSubtotal, cartTotal
  }), [cartItems, addToCart, updateQuantity, removeFromCart, clearCart, discount, cartSubtotal, cartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
