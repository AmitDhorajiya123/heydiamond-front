import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const Cart = () => {
    return (
        <Layout title="My Cart">
            <div className="table-container" style={{ padding: '40px', textAlign: 'center' }}>
                <ShoppingCart size={64} style={{ color: 'var(--color-primary)', opacity: 0.2, margin: '0 auto 24px' }} />
                <h2 className="table-title" style={{ marginBottom: '12px' }}>Your cart is empty</h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '32px' }}>
                    Looks like you haven't added any diamonds to your cart yet.
                </p>
                <button className="submit-button" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Browse Diamonds <ArrowRight size={16} />
                </button>
            </div>
        </Layout>
    );
};

export default Cart;
