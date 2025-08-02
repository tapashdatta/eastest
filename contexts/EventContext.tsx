// contexts/EventContext.tsx - SIMPLIFIED SINGLE CONTEXT
// Replaces both EventContext.tsx and EventCartContext.tsx

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { EventRegistrationItem, EventCartTotals, ParticipantInfo } from '@/types/event';

const MAX_CART_ITEMS = 10;

// ================================
// SIMPLIFIED CONTEXT TYPE
// ================================

interface EventContextType {
  // Cart state
  cart: EventRegistrationItem[];
  cartTotals: EventCartTotals;
  
  // Cart actions
  addToCart: (item: EventRegistrationItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateParticipantInfo: (itemId: string, participantInfo: ParticipantInfo) => void;
  clearCart: () => void;
}

// ================================
// CONTEXT SETUP
// ================================

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventCart = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventCart must be used within an EventProvider');
  }
  return context;
};

// ================================
// SIMPLIFIED PROVIDER
// ================================

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<EventRegistrationItem[]>([]);

  // Simple cart totals calculation
  const cartTotals = useMemo((): EventCartTotals => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cart.length;
    const registrationCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      total: Number(subtotal.toFixed(2)),
      itemCount,
      registrationCount,
    };
  }, [cart]);

  // Add to cart - simplified logic
  const addToCart = useCallback((item: EventRegistrationItem) => {
    if (!item?.event_id || !item?.event_title) {
      throw new Error('Invalid item data');
    }

    setCart(prevCart => {
      // Check if item already exists
      const existingIndex = prevCart.findIndex(cartItem => 
        cartItem.event_id === item.event_id && cartItem.fee_id === item.fee_id
      );

      if (existingIndex !== -1) {
        // Update existing item
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
          total: updated[existingIndex].amount * (updated[existingIndex].quantity + item.quantity)
        };
        return updated;
      }

      // Add new item
      const newItem: EventRegistrationItem = {
        id: item.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event_id: item.event_id,
        event_title: item.event_title,
        event_start_date: item.event_start_date,
        fee_id: item.fee_id,
        fee_label: item.fee_label,
        amount: Number(item.amount) || 0,
        quantity: Number(item.quantity) || 1,
        total: Number(item.amount) * (Number(item.quantity) || 1),
        participant_info: item.participant_info || {
          first_name: '',
          last_name: '',
          email: '',
        },
      };

      return [...prevCart, newItem];
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => prevCart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          total: item.amount * quantity
        };
      }
      return item;
    }));
  }, [removeFromCart]);

  // Update participant info
  const updateParticipantInfo = useCallback((itemId: string, participantInfo: ParticipantInfo) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          participant_info: participantInfo
        };
      }
      return item;
    }));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    cart,
    cartTotals,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateParticipantInfo,
    clearCart,
  }), [
    cart,
    cartTotals,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateParticipantInfo,
    clearCart,
  ]);

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};