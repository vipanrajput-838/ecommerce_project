document.addEventListener('DOMContentLoaded', () => {
    // Custom cursor logic
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
    }

    // Load Cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemsContainer = document.getElementById('checkout-items');
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('place-order-btn').disabled = true;
        document.getElementById('place-order-btn').style.opacity = '0.5';
        document.getElementById('place-order-btn').style.cursor = 'not-allowed';
        return;
    }

    let subtotal = 0;
    itemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <div class="checkout-item">
                <div class="ci-info">
                    <strong>${item.name}</strong>
                    <span class="ci-qty">Qty: ${item.quantity}</span>
                </div>
                <div class="ci-price">₹${itemTotal.toLocaleString('en-IN')}</div>
            </div>
        `;
    }).join('');

    const gst = subtotal * 0.18;
    const delivery = 99;
    const platform = 20;
    const total = subtotal + gst + delivery + platform;

    document.getElementById('summ-subtotal').textContent = `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('summ-gst').textContent = `₹${gst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('summ-total').textContent = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Form submission
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulate processing
        const btn = document.getElementById('place-order-btn');
        btn.textContent = "PROCESSING PAYMENT...";
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            localStorage.removeItem('cart');
            document.getElementById('success-modal').classList.add('active');
        }, 1500);
    });
});
