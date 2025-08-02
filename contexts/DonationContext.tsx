// contexts/DonationContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import Logger from '@/utils/Logger';

const GIFT_AID_RATE = 0.25;
const MAX_CART_ITEMS = 20;

export interface DonationItem {
  id: string;
  category: string;
  financial_type_id: number;
  amount: number;
  quantity: number;
  sponsorship_date?: string;
  message?: string;
  total: number;
}

export interface CartTotals {
  subtotal: number;
  giftAidAmount: number;
  total: number;
  itemCount: number;
  charityTotal: number;
}

interface DonationContextType {
  cart: DonationItem[];
  addToCart: (item: DonationItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotals: CartTotals;
  giftAidEnabled: boolean;
  setGiftAidEnabled: (enabled: boolean) => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

// Main hook for cart operations
export const useDonationCart = (): DonationContextType => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonationCart must be used within a DonationProvider');
  }
  return context;
};

interface DonationProviderProps {
  children: ReactNode;
}

export const DonationProvider: React.FC<DonationProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<DonationItem[]>([]);
  const [giftAidEnabled, setGiftAidEnabled] = useState(false);

  const cartTotals = useMemo((): CartTotals => {
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);
      const giftAidAmount = giftAidEnabled ? subtotal * GIFT_AID_RATE : 0;
      const total = subtotal;
      const itemCount = cart.length;
      const charityTotal = subtotal + giftAidAmount;

      return {
        subtotal: Number(subtotal.toFixed(2)),
        giftAidAmount: Number(giftAidAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
        itemCount,
        charityTotal: Number(charityTotal.toFixed(2)),
      };
    } catch (error) {
      Logger.error('Cart totals calculation error', error);
      return {
        subtotal: 0,
        giftAidAmount: 0,
        total: 0,
        itemCount: 0,
        charityTotal: 0,
      };
    }
  }, [cart, giftAidEnabled]);

  const addToCart = useCallback((item: DonationItem) => {
    try {
      if (!item || !item.category || !item.amount) {
        throw new Error('Invalid item data provided');
      }

      setCart(prevCart => {
        if (prevCart.length >= MAX_CART_ITEMS) {
          throw new Error(`Maximum ${MAX_CART_ITEMS} items allowed in cart`);
        }

        const safeItem: DonationItem = {
          id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: String(item.category),
          financial_type_id: Number(item.financial_type_id) || 1,
          amount: Number(item.amount) || 0,
          quantity: Number(item.quantity) || 1,
          sponsorship_date: item.sponsorship_date,
          message: item.message,
          total: Number(item.amount) * (Number(item.quantity) || 1),
        };

        const newCart = [...prevCart, safeItem];
        
        Logger.info('Item added to cart', {
          itemId: safeItem.id,
          category: safeItem.category,
          amount: safeItem.amount,
          newCartSize: newCart.length
        });
        
        return newCart;
      });
      
    } catch (error) {
      Logger.error('Add to cart failed', error);
      throw error;
    }
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    try {
      setCart(prevCart => {
        const newCart = prevCart.filter(item => item.id !== itemId);
        Logger.info('Item removed from cart', {
          itemId,
          newCartSize: newCart.length
        });
        return newCart;
      });
    } catch (error) {
      Logger.error('Remove from cart failed', error);
    }
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        setCart(prevCart => {
          const newCart = prevCart.filter(item => item.id !== itemId);
          Logger.info('Item removed from cart (quantity 0)', {
            itemId,
            newCartSize: newCart.length
          });
          return newCart;
        });
        return;
      }

      setCart(prevCart => prevCart.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            quantity,
            total: item.amount * quantity
          };
          
          Logger.info('Item quantity updated', {
            itemId,
            newQuantity: quantity,
            newTotal: updatedItem.total
          });
          
          return updatedItem;
        }
        return item;
      }));
    } catch (error) {
      Logger.error('Update quantity failed', error);
    }
  }, []);

  const clearCart = useCallback(() => {
    try {
      setCart(prevCart => {
        const previousSize = prevCart.length;
        Logger.info('Cart cleared', { previousSize });
        return [];
      });
      setGiftAidEnabled(false);
    } catch (error) {
      Logger.error('Clear cart failed', error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotals,
    giftAidEnabled,
    setGiftAidEnabled,
  }), [
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotals,
    giftAidEnabled,
  ]);

  return (
    <DonationContext.Provider value={contextValue}>
      {children}
    </DonationContext.Provider>
  );
};