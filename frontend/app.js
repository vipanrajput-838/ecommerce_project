document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.getElementById('custom-cursor');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;
    let currentScale = 1, targetScale = 1;
    
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        targetScale = cursor.classList.contains('hovering') ? 2.5 : 1;
        currentScale += (targetScale - currentScale) * 0.1;
        cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0) scale(${currentScale})`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const bindCursorHover = () => {
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    };

    // State
    // Live Render URL
    const API_URL = 'https://vipan-ecommerce-api.onrender.com/api';
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let token = localStorage.getItem('access_token');
    
    // Elements
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const toggleAuthMode = document.getElementById('toggle-auth-mode');
    let isLogin = true;

    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Init check auth
    if (token) authBtn.textContent = 'PROFILE / LOGOUT';

    // Product Detail Logic
    const productModal = document.getElementById('product-modal');
    const closeProductModal = document.getElementById('close-product-modal');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return alert('Cart is empty');
            window.location.href = 'checkout.html';
        });
    }

    if(closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            productModal.classList.remove('active');
        });
    }

    window.openProductDetail = (id) => {
        const product = allProducts.find(p => p.id === id);
        if (!product) return;
        
        document.getElementById('detail-image').src = product.image_url || 'https://via.placeholder.com/600x600/eeeeee/aaaaaa?text=No+Image';
        document.getElementById('detail-title').textContent = product.name;
        document.getElementById('detail-category').textContent = product.category ? product.category.name : 'Uncategorized';
        document.getElementById('detail-price').textContent = '₹' + product.price;
        document.getElementById('detail-description').textContent = product.description;
        
        const addBtn = document.getElementById('detail-add-cart');
        addBtn.onclick = () => {
            window.addToCart(product.id, product.name, product.price);
            productModal.classList.remove('active');
            cartSidebar.classList.add('active');
        };
        
        productModal.classList.add('active');
    };

    // Auth logic
    authBtn.addEventListener('click', () => {
        if (token) {
            localStorage.removeItem('access_token');
            token = null;
            authBtn.textContent = 'LOGIN';
            alert('Logged out successfully.');
        } else {
            authModal.classList.add('active');
        }
    });

    document.getElementById('close-auth').addEventListener('click', () => authModal.classList.remove('active'));

    toggleAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        document.getElementById('auth-title').textContent = isLogin ? 'Login' : 'Register';
        document.getElementById('email').style.display = isLogin ? 'none' : 'block';
        toggleAuthMode.textContent = isLogin ? 'Register' : 'Login';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;

        try {
            const endpoint = isLogin ? '/users/login/' : '/users/register/';
            const body = isLogin ? { username, password } : { username, password, email };
            const res = await fetch(API_URL + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            
            if (res.ok) {
                if (isLogin) {
                    token = data.access;
                    localStorage.setItem('access_token', token);
                    authBtn.textContent = 'PROFILE / LOGOUT';
                    authModal.classList.remove('active');
                } else {
                    alert('Registration successful. Please login.');
                    isLogin = true;
                    toggleAuthMode.click(); // switch to login UI
                }
            } else {
                alert(JSON.stringify(data));
            }
        } catch (err) { console.error(err); }
    });

    // Cart Logic
    const updateCartUI = () => {
        cartBtn.textContent = `CART (${cart.reduce((a, b) => a + b.quantity, 0)})`;
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <p>${item.name}</p>
                        <small>₹${item.price} x ${item.quantity}</small>
                    </div>
                    <button class="nav-btn" onclick="window.removeFromCart(${index})">Remove</button>
                </div>
            `;
        });
        document.getElementById('cart-total').textContent = total.toFixed(2);
        localStorage.setItem('cart', JSON.stringify(cart));
        bindCursorHover();
    };

    window.addToCart = (id, name, price) => {
        const existing = cart.find(i => i.id === id);
        if (existing) existing.quantity++;
        else cart.push({ id, name, price, quantity: 1 });
        updateCartUI();
        cartSidebar.classList.add('active');
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    cartBtn.addEventListener('click', () => cartSidebar.classList.add('active'));
    document.getElementById('close-cart').addEventListener('click', () => cartSidebar.classList.remove('active'));

    checkoutBtn.addEventListener('click', async () => {
        if (!token) return alert('Please login first to checkout.');
        if (cart.length === 0) return alert('Cart is empty.');

        try {
            // First create order
            const res = await fetch(API_URL + '/orders/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ total_price: document.getElementById('cart-total').textContent })
            });
            const order = await res.json();
            if (res.ok) {
                alert('Order placed successfully! Order ID: ' + order.id);
                cart = [];
                updateCartUI();
                cartSidebar.classList.remove('active');
            } else {
                alert('Checkout failed: ' + JSON.stringify(order));
            }
        } catch(e) { console.error(e); }
    });

    // Products and Categories State
    let allProducts = [];

    const renderProducts = (productsToRender) => {
        const grid = document.getElementById('product-grid');
        if(productsToRender.length === 0) {
            grid.innerHTML = '<p>No products found in this category.</p>';
            return;
        }

        grid.innerHTML = productsToRender.map(p => `
            <article class="project-item">
                <a href="#" class="project-link" onclick="event.preventDefault(); window.openProductDetail(${p.id})">
                    <div class="image-container">
                        <img src="${p.image_url || 'https://via.placeholder.com/600x450/eeeeee/aaaaaa?text=No+Image'}" alt="${p.name}">
                        <div class="hover-overlay">
                            <svg class="arrow-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                        </div>
                    </div>
                </a>
                <div class="metadata">
                    <h3 class="title">${p.name}</h3>
                    <div class="meta-info">
                        <span class="mono">₹${p.price}</span>
                    </div>
                </div>
                <button class="add-to-cart-btn" onclick="window.addToCart(${p.id}, '${p.name}', ${p.price})">Add to Cart</button>
            </article>
        `).join('');
        
        bindCursorHover();
    };

    const renderCategories = () => {
        const filtersContainer = document.getElementById('category-filters');
        
        const uniqueCats = {};
        allProducts.forEach(p => {
            if(p.category) uniqueCats[p.category.id] = p.category.name;
        });
        
        let html = '<button class="cat-btn active" data-id="all">All</button>';
        for(let id in uniqueCats) {
            html += `<button class="cat-btn" data-id="${id}">${uniqueCats[id]}</button>`;
        }
        filtersContainer.innerHTML = html;
        bindCursorHover();

        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const catId = e.target.getAttribute('data-id');
                if(catId === 'all') {
                    renderProducts(allProducts);
                } else {
                    renderProducts(allProducts.filter(p => p.category && p.category.id == catId));
                }
            });
        });
    };

    const fetchProducts = async () => {
        const grid = document.getElementById('product-grid');
        try {
            const res = await fetch(API_URL + '/products/products/');
            if(!res.ok) throw new Error('Failed to fetch');
            allProducts = await res.json();
            
            if(allProducts.length === 0) {
                grid.innerHTML = '<p>No products available yet. Add some via the Django admin panel.</p>';
                return;
            }

            renderProducts(allProducts);
            renderCategories();
            
        } catch (e) {
            console.error(e);
            grid.innerHTML = `<p>Error loading products. Ensure the Django server is running on http://127.0.0.1:8000</p>`;
        }
    };

    fetchProducts();
    updateCartUI();
    bindCursorHover();
});
