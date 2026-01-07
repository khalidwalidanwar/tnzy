
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore,setDoc, onSnapshot ,documentId, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
const firebaseConfig = {
    apiKey: "AIzaSyAuxTcAXtMRU7MJVRxddmM68fBLuOTaw5Q",
    authDomain: "teenzy-3f9ca.firebaseapp.com",
    projectId: "teenzy-3f9ca",
    storageBucket: "teenzy-3f9ca.firebasestorage.app",
    messagingSenderId: "992928404570",
    appId: "1:992928404570:web:925762f824baa6c42b3463",
    measurementId: "G-CYSGKWQM7G"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

{

// Main Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Stop the link from navigating

            // 1. Get the target page ID
            const targetPage = item.getAttribute('data-page');
            const targetElementId = `${targetPage}-page`;

            // 2. Update Active Class for Navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 3. Update Active Class for Content Pages
            contentPages.forEach(page => {
                page.classList.remove('active');
            });
            
            const activePage = document.getElementById(targetElementId);
            if (activePage) {
                activePage.classList.add('active');
            }
            
            // OPTIONAL: Load dynamic content here (e.g., fetch data for 'products' page)
            if (targetPage === 'products') {
                // Example of dynamic content loading:
                activePage.innerHTML = `
                    <button class="add-button">+</button>
                    `;
            } else if (targetPage === 'orders') {
                 activePage.innerHTML = `
                    <h2>Order Management</h2>
                    <p>View and process all customer orders.</p>
                `;
            }
        });
    });
});


// products Page
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');
    const productsPage = document.getElementById('products-page');

    const renderProductsPage = async() => {
        // Content for the Products page
        productsPage.innerHTML = `
            <div class="page-header-actions">
                <h2>(12 Items Total)</h2>
                <button class="primary-button" id="open-product-modal">
                    <span class="icon">+</span>
                </button>
            </div>

            <div class="data-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th class="productTitile">Name</th>
                            <th class="productCategory">Category</th>
                            <th class="productOldPrice">oldPrice</th>
                            <th class="productNewPrice">Price</th>
                            <th class="stock-high">Stock</th>
                            <th class="productStatus">Status</th>
                            <th class="productBtn">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        `;
// load products from firebase and populate the table here (omitted for brevity)
        const snap = await getDocs(collection(db, "products"));
        document.querySelector(".page-header-actions h2").innerText = `(${snap.size} Items Total)`;
        snap.forEach(async (doc) => {
            const product = doc.data();
            // calc quantity from sizes
            let totalQuantity = 0;
            if (product.avaliableSizes) {
                for (const size in product.avaliableSizes) {
                    totalQuantity += product.avaliableSizes[size];
                }
            }

            productsPage.querySelector('tbody').innerHTML += `
            <tr data-Id='${doc.id}'>
                <td class="imgCon" ><img src="${product.imgUrl[0]}" alt="T-Shirt" class="product-thumb"></td>
                <td class="productTitile" >${product.title}</td>
                <td class="productCategory" >${product.category}</td>
                <td class="productOldPrice"  style='text-decoration: line-through;'>${product.oldPrice} EGP</td>
                <td class="productNewPrice" >${product.newPrice} EGP</td>
                <td class="${totalQuantity < 10 ? 'stock-low' : 'stock-high'}">${totalQuantity}</td>
                <td class="productStatus" ><span class="status-badge shipped">${product.status}</span></td>
                <td class="productBtn" >
                    <button class="action-btn edit-btn">Edit</button>
                    <button class="action-btn delete-btn">Delete</button>
                </td>
            </tr>
            `;
        });
        productsPage.innerHTML += `
                        </tbody>
                </table>
            </div>
            
            <div id="product-modal" class="modal">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h3>Add/Edit Clothing Product</h3>
                    <form id="product-form">
                        <div class="form-group">
                            <label for="product-name">Product Name</label>
                            <input type="text" id="product-name" required>
                        </div>
                        <div class="form-group">
                            <label for="product-oldprice">oldPrice ($)</label>
                            <input type="number" id="product-oldprice" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="product-price">newPrice ($)</label>
                            <input type="number" id="product-price" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="product-stock">Stock Quantity</label>
                            <input type="number" id="product-stock" required>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Category</label>
                            <select id="product-category" required>
                                <option value="" disabled>Select Category</option>
                                <option value="tshirt">tshirt</option>
                                <option value="pant">Pants</option>
                                <option value="hoodie">Hoodies</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-desc">Description</label>
                            <textarea id="product-desc" rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="product-images">Upload Images</label>
                            <input type="file" id="product-images" multiple accept="image/*">
                        </div>
                        <div class="form-group">
                            <label for="product-sizes">Available Sizes</label>
                            <input type="number" id="size-s" placeholder="Size S Qty" min="0">
                            <input type="number" id="size-m" placeholder="Size M Qty" min="0">
                            <input type="number" id="size-l" placeholder="Size L Qty" min="0">
                            <input type="number" id="size-xl" placeholder="Size XL Qty" min="0">
                            <input type="number" id="size-2xl" placeholder="Size 2XL Qty" min="0">
                        </div>
                        <div class="form-group">
                            <label for="product-subName">Subname</label>
                            <input type="text" id="product-subName">
                        </div>
                        <div class="form-group">
                            <label for="product-status">Status</label>
                            <input type="text" id="product-status">
                        </div>
                        <button type="submit" class="primary-button save-new-btn">Save new Product</button>
                        <button type="submit" class="success-button save-update-btn">Save edited Product</button>
                    </form>
                </div>
            </div>
        `;

        
        
        // Attach modal event listeners after content is rendered
        const modal = document.getElementById('product-modal');
        const openBtn = document.getElementById('open-product-modal');
        const closeBtn = modal.querySelector('.close-btn');

        openBtn.onclick = () => { modal.style.display = 'block';
            document.querySelector('#product-form .primary-button').style.display = 'block';
            document.querySelector('#product-form .success-button').style.display = 'none';
         }
        closeBtn.onclick = () => { modal.style.display = 'none'; }
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // delete product logic
        productsPage.querySelectorAll('.delete-btn').forEach((button, index) => {
            button.addEventListener('click', async () => {
                const productId = (await getDocs(collection(db, "products"))).docs[index].id;
                if (confirm('Are you sure you want to delete this product?')) {
                    await deleteDoc(doc(db, "products", productId));
                    alert('Product deleted successfully!');
                    renderProductsPage(); // Refresh the products page to reflect deletion
                }
            });
        });


        // open edit poduct modal
        productsPage.querySelectorAll('.edit-btn').forEach((button, index) => {
            button.addEventListener('click', async (e) => {
                document.querySelector('#product-form').setAttribute("data-id",e.target.parentElement.parentElement.getAttribute("data-id"))
                document.querySelector('#product-form .primary-button').style.display = 'none';
                document.querySelector('#product-form .success-button').style.display = 'block';
                const productSnap = (await getDocs(collection(db, "products"))).docs[index];
                const product = productSnap.data();
                document.getElementById('product-name').value = product.title;
                document.getElementById('product-subName').value = product.subname || '';
                document.getElementById('product-desc').value = product.description || '';
                document.getElementById('product-category').value = product.category || '';
                document.getElementById('product-status').value = product.status || '';
                document.getElementById('product-oldprice').value = product.oldPrice || 0;
                document.getElementById('product-price').value = product.newPrice || 0;
                let totalStock = 0;
                for (const size in product.avaliableSizes) {
                    totalStock += product.avaliableSizes[size];
                }
                document.getElementById('product-stock').value = totalStock;
                document.getElementById('size-s').value = product.avaliableSizes?.Small || 0;
                document.getElementById('size-m').value = product.avaliableSizes?.Medium || 0;
                document.getElementById('size-l').value = product.avaliableSizes?.Large || 0;
                document.getElementById('size-xl').value = product.avaliableSizes?.XL || 0;
                document.getElementById('size-2xl').value = product.avaliableSizes?.['2XL'] || 0;
                modal.style.display = 'block';
            });
        });


        // update current product
        document.querySelector('#product-form .success-button.save-update-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = document.querySelector("#product-form").getAttribute("data-id");
            e.target.setAttribute("disabled","")
            // edit existing product in firebase db
            const editProduct = async (productId, title, subname, description, category, status, newPrice, oldPrice,imgUrl,avaliableSizes) => {
                try {
                    const productData = {
                        title: title,
                        subname: subname,
                        description: description,
                        category: category,
                        status: status,
                        newPrice: newPrice,
                        oldPrice: oldPrice,
                        // Array of images
                        imgUrl: imgUrl,
                        // Map (Object) for sizes
                        avaliableSizes: avaliableSizes,
                    };
                    const productRef = doc(db, "products", productId);
                    await updateDoc(productRef, productData);
                    console.log("Product updated with ID: ", productId);
                    e.target.removeAttribute("disabled");
                    alert("Product updated successfully!");
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            };
            // check if uploaded new images to cloudinary
            const title = document.getElementById('product-name').value;
            const subname = document.getElementById('product-subName').value;
            const description = document.getElementById('product-desc').value;
            const category = document.getElementById('product-category').value;
            const oldPrice = parseFloat(document.getElementById('product-oldprice').value);
            const newPrice = parseFloat(document.getElementById('product-price').value);
            const stock = parseInt(document.getElementById('product-stock').value);
            const sizeS = parseInt(document.getElementById('size-s').value) || 0;
            const sizeM = parseInt(document.getElementById('size-m').value) || 0;
            const sizeL = parseInt(document.getElementById('size-l').value) || 0;
            const sizeXL = parseInt(document.getElementById('size-xl').value) || 0;
            const size2XL = parseInt(document.getElementById('size-2xl').value) || 0;
            const imageFiles = document.getElementById('product-images').files;
            const avaliableSizes = {
                "Small": sizeS,
                "Medium": sizeM,
                "Large": sizeL,
                "XL": sizeXL,
                "2XL": size2XL
            };
            const status = document.querySelector("#product-status").value;
            const imgUrl = [];
            const uploadImage = async (file) => {
                const url = `https://api.cloudinary.com/v1_1/dfochp65f/image/upload`;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'my-upload-preset');
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                return data.secure_url;
            };
            const uploadImages = async (files) => {
                const urls = [];
                for (const file of files) {
                    const url = await uploadImage(file);
                    urls.push(url);
                }
                return urls;
            };
            let finalImgUrls = [];
            if (imageFiles.length > 0) {
                finalImgUrls = await uploadImages(imageFiles);
            } else {
                const refref =  (await getDoc(doc(db, "products",productId)));
                finalImgUrls =refref.data().imgUrl;
            }
            await editProduct(productId, title, subname, description, category, status, newPrice, oldPrice, finalImgUrls, avaliableSizes);
            modal.style.display = 'none';
            renderProductsPage(); // Refresh the products page to show the updated product
        })
        // add new product
        document.querySelector('#product-form .primary-button.save-new-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            // add new product to firebase db
            const addProduct = async (title, subname, description, category, status, newPrice, oldPrice,imgUrl,avaliableSizes) => {
                try {
                    const productData = {
                        title: title,
                        subname: subname,
                        description: description,
                        category: category,
                        status: status,
                        newPrice: newPrice,
                        oldPrice: oldPrice,
                        // Array of images
                        imgUrl: imgUrl,
                        // Map (Object) for sizes
                        avaliableSizes: avaliableSizes,
                    };

                    // Reference the "products" collection
                    const docRef = await addDoc(collection(db, "products"), productData);
                    
                    console.log("Product added with ID: ", docRef.id);
                    e.target.removeAttribute("disabled")
                    alert("Product added successfully!");

                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            };

            // upload images to cloudinary
            const title = document.getElementById('product-name').value;
            const subname = document.getElementById('product-subName').value;
            const description = document.getElementById('product-desc').value;
            const category = document.getElementById('product-category').value;
            const oldPrice = parseFloat(document.getElementById('product-oldprice').value);
            const newPrice = parseFloat(document.getElementById('product-price').value);
            const stock = parseInt(document.getElementById('product-stock').value);
            const sizeS = parseInt(document.getElementById('size-s').value) || 0;
            const sizeM = parseInt(document.getElementById('size-m').value) || 0;
            const sizeL = parseInt(document.getElementById('size-l').value) || 0;
            const sizeXL = parseInt(document.getElementById('size-xl').value) || 0;
            const size2XL = parseInt(document.getElementById('size-2xl').value) || 0;
            const imageFiles = document.getElementById('product-images').files;
            const avaliableSizes = {
                "Small": sizeS,
                "Medium": sizeM,
                "Large": sizeL,
                "XL": sizeXL,
                "2XL": size2XL
            };
            const status = document.querySelector("#product-status").value;
            const imgUrl = [];
            const uploadImage = async (file) => {
                const url = `https://api.cloudinary.com/v1_1/dfochp65f/image/upload`;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'my-upload-preset');
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                return data.secure_url; // Return the uploaded image URL
            }
            for (let i = 0; i < imageFiles.length; i++) {
                const imageUrl = await uploadImage(imageFiles[i]);
                imgUrl.push(imageUrl);
            }
            await addProduct(title, subname, description, category, status, newPrice, oldPrice, imgUrl, avaliableSizes);
            modal.style.display = 'none';
            renderProductsPage(); // Refresh the products page to show the new product
        });
    };

    // Main navigation switching logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetPage = item.getAttribute('data-page');
            const targetElementId = `${targetPage}-page`;

            // Update Active Class for Navigation and Pages
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            contentPages.forEach(page => page.classList.remove('active'));
            const activePage = document.getElementById(targetElementId);
            if (activePage) {
                activePage.classList.add('active');
            }

            // Load specific page content
            // Add other page rendering functions here (orders, customers)
        });
    });

    // Initial load for the dashboard (make sure the script runs the click for the default view)
    // Find the dashboard nav item and simulate a click on load
    document.querySelector('[data-page="dashboard"]').click();


// orders Page
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');
    const ordersPage = document.getElementById('orders-page'); // Get the orders page element

    // --- NEW Function to Render the Orders Page ---
    const renderOrdersPage = async () => {
        ordersPage.innerHTML = `
            <div class="page-header-actions">
                <h2>Order Queue (Pending: 8)</h2>
                <div class="filter-controls">
                    <select id="order-filter-status" class="filter-select">
                        <option value="all">Filter by Status (All)</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div class="data-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer Name</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        `;
        // load all orders dynamically from database
        const snap = await getDocs(collection(db, "orders"));
        snap.forEach(async (docu) => {
            const order = docu.data();
            let customerData;
            const q = query(collection(db, "users"), where(documentId(), "==", order.userId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docum) => {
                customerData = docum.data();
                // format Date
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-UK', {
                    year: 'numeric',
                    day: 'numeric',
                    month: 'numeric',
                });
                const customerName = customerData ? customerData.firstName+" "+customerData.lastName : 'Unknown Customer';
                ordersPage.querySelector('tbody').innerHTML += `
                <tr data-order-id="${docu.id}">
                    <td>${order.orderId.split('_')[0]}<br>${order.orderId.split('_')[1]}</td>
                    <td>${formattedDate}</td>
                    <td>${customerName}</td>
                    <td>${order.totalPrice} EGP</td>
                    <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                    ${order.status === 'pending' ? `<td><button class="action-btn process-btn">Prepare Order</button></td>` : ``}
                    ${order.status === 'preparing' ? `<td><button class="action-btn ship-btn">Ship Order</button></td>` : ``}
                    ${order.status === 'delivering' ? `<td><button class="action-btn shipped-btn">Order Done</button></td>` : ``}
                    ${order.status === 'delivered' ? `<td>Order Done ✅</td>` : ``}
                    ${order.status === 'cancelled' ? `<td><span class="">----------</span></td>` : ``}
                    <td><button class="action-btn view-btn">View Details</button></td>
                </tr>`;
                // View Details button logic
                ordersPage.querySelectorAll('.view-btn').forEach((button)=>{
                    button.addEventListener('click', (e) => {
                        var orderId = e.target.closest("tr").getAttribute("data-order-id");
                        alert("Order Details for Order ID: "+orderId+"\n\n(In a real app, this would open a modal with detailed order info.)","info");
                    });
                });
                // Add event listeners for the dynamically created buttons
                document.querySelectorAll(".process-btn").forEach((button)=>{
                    button.addEventListener('click', (e) => {
                        var orderId = e.target.closest("tr").getAttribute("data-order-id");
                        // update order status in firebase db
                        updateDoc(doc(db, "orders", orderId), {
                            status: 'preparing'
                        }).then(() => {
                            alert("Order moved to proccesing successfully.","success");
                            renderOrdersPage(); // Refresh the orders page to reflect status change
                        });
                    });
                });
                document.querySelectorAll(".ship-btn").forEach((button)=>{
                    button.addEventListener('click', (e) => {
                    var orderId = e.target.closest("tr").getAttribute("data-order-id");
                    // update order status in firebase db
                    updateDoc(doc(db, "orders", orderId), {
                        status: 'delivering'
                    }).then(() => {
                        alert("Order moved to delivering successfully.","success");
                        renderOrdersPage(); // Refresh the orders page to reflect status change
                    });
                });
                });
                document.querySelectorAll(".shipped-btn").forEach((button)=>{
                    button.addEventListener('click', (e) => {
                    var orderId = e.target.closest("tr").getAttribute("data-order-id");
                    // update order status in firebase db
                    updateDoc(doc(db, "orders", orderId), {
                        status: 'delivered'
                    }).then(() => {
                        alert("Order moved to delivered successfully.","success");
                        renderOrdersPage(); // Refresh the orders page to reflect status change
                    });
                });
                });
            });
        });
        ordersPage.innerHTML += `
                        </tbody>
                </table>
            </div>
            
            <div class="pagination-controls">
                <button class="action-btn">Previous</button>
                <span>Page 1 of 5</span>
                <button class="action-btn">Next</button>
            </div>
        `;
        
        // Example dynamic interaction: changing the Process button color/text
        ordersPage.querySelectorAll('.process-btn').forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.closest('tr').getAttribute('data-order-id');
                alert(`Moving Order ${orderId} to Processing status!`);
                // In a real app, this would trigger an API call and refresh the row/table.
            });
        });
    };

    // Main navigation switching logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetPage = item.getAttribute('data-page');
            const targetElementId = `${targetPage}-page`;

            // Update Active Class for Navigation and Pages
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            contentPages.forEach(page => page.classList.remove('active'));
            const activePage = document.getElementById(targetElementId);
            if (activePage) {
                activePage.classList.add('active');
            }

            // Load specific page content
            if (targetPage === 'products') {
                renderProductsPage();
            } else if (targetPage === 'orders') {
                renderOrdersPage(); // CALL THE NEW FUNCTION
            }
            // Add other page rendering functions here (customers, reports)
        });
    });

    // Initial load for the dashboard
    document.querySelector('[data-page="dashboard"]').click();
});


// customers Page
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');
    // ... (other page elements: productsPage, ordersPage) ...
    const customersPage = document.getElementById('customers-page'); // Get the customers page element

    // --- (Keep renderProductsPage and renderOrdersPage functions here) ---

    // --- NEW Function to Render the Customers Page ---
    const renderCustomersPage = () => {
        customersPage.innerHTML = `
            <div class="page-header-actions">
                <h2>Customer List (520 Total)</h2>
                <div class="filter-controls">
                    <input type="text" placeholder="Search by name or email..." class="search-input">
                    <button class="primary-button">Search</button>
                </div>
            </div>

            <div class="data-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Customer ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Reg. Date</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-customer-id="C1001">
                            <td>C1001</td>
                            <td>Alex Johnson</td>
                            <td>alex@example.com</td>
                            <td>2024-05-15</td>
                            <td>12</td>
                            <td class="spend-high">$1,540.00</td>
                            <td><span class="status-badge active-user">Active</span></td>
                            <td><button class="action-btn view-btn">View Profile</button></td>
                        </tr>
                        <tr data-customer-id="C1002">
                            <td>C1002</td>
                            <td>Maria Garcia</td>
                            <td>maria@test.com</td>
                            <td>2025-01-20</td>
                            <td>3</td>
                            <td>$210.50</td>
                            <td><span class="status-badge new-user">New</span></td>
                            <td><button class="action-btn view-btn">View Profile</button></td>
                        </tr>
                        <tr data-customer-id="C1003">
                            <td>C1003</td>
                            <td>John Smith</td>
                            <td>jsmith@web.co</td>
                            <td>2023-08-01</td>
                            <td>0</td>
                            <td>$0.00</td>
                            <td><span class="status-badge inactive-user">Inactive</span></td>
                            <td><button class="action-btn view-btn">View Profile</button></td>
                        </tr>
                        </tbody>
                </table>
            </div>
            
            <div class="pagination-controls">
                <button class="action-btn">Previous</button>
                <span>Page 1 of 26</span>
                <button class="action-btn">Next</button>
            </div>
        `;
        
        // Example dynamic interaction: View Profile button click
        customersPage.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const customerId = button.closest('tr').getAttribute('data-customer-id');
                alert(`Loading detailed profile for Customer ${customerId} (In a real app, this would open a modal).`);
            });
        });

        // Add search functionality listener here (e.g., filter the table based on input value)
    };

    // Main navigation switching logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetPage = item.getAttribute('data-page');
            const targetElementId = `${targetPage}-page`;

            // Update Active Class for Navigation and Pages
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            contentPages.forEach(page => page.classList.remove('active'));
            const activePage = document.getElementById(targetElementId);
            if (activePage) {
                activePage.classList.add('active');
            }

            // Load specific page content
            if (targetPage === 'products') {
                // ...
            } else if (targetPage === 'orders') {
                // ...
            } else if (targetPage === 'customers') {
                renderCustomersPage(); // CALL THE NEW FUNCTION
            }
            // Add other page rendering functions here (reports)
        });
    });

    // Initial load for the dashboard
    document.querySelector('[data-page="dashboard"]').click();
});


// report Page
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');
    // ... (Get other page elements) ...
    const reportsPage = document.getElementById('reports-page'); // Get the reports page element


    // --- (Keep renderProductsPage, renderOrdersPage, and renderCustomersPage functions here) ---

    // --- NEW Function to Render the Reports Page ---
    const renderReportsPage = () => {
        reportsPage.innerHTML = `
            <div class="page-header-actions">
                <h2>Sales & Performance Analytics</h2>
                <div class="filter-controls">
                    <label for="date-range">Date Range:</label>
                    <select id="date-range" class="filter-select">
                        <option value="last7">Last 7 Days</option>
                        <option value="last30">Last 30 Days</option>
                        <option value="currentYear">Current Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <button class="primary-button">Generate Report</button>
                </div>
            </div>

            <div class="report-metrics-grid">
                <div class="metric-card report-summary-card">
                    <h3>Revenue Growth</h3>
                    <p class="summary-figure positive">$15,800.00</p>
                    <span class="change positive">vs. Previous Period: +18%</span>
                </div>
                <div class="metric-card report-summary-card">
                    <h3>Conversion Rate</h3>
                    <p class="summary-figure">2.4%</p>
                    <span class="change negative">vs. Previous Period: -0.3%</span>
                </div>
                <div class="metric-card report-summary-card">
                    <h3>AOV (Avg. Order Value)</h3>
                    <p class="summary-figure">$65.40</p>
                    <span class="change positive">vs. Previous Period: +4.2%</span>
                </div>
            </div>

            <div class="charts-grid">
                
                <div class="chart-card">
                    <h3>Sales Trend Over Time</h3>
                    <div class="chart-placeholder sales-chart">
                        <p>Line Chart Placeholder: Monthly Revenue</p>
                    </div>
                </div>

                <div class="chart-card">
                    <h3>Top 5 Selling Categories</h3>
                    <div class="chart-placeholder category-chart">
                        <p>Bar Chart Placeholder: Units Sold by Category</p>
                    </div>
                </div>
                
                <div class="chart-card full-width">
                    <h3>Inventory Health: Low Stock Report</h3>
                    <div class="low-stock-list">
                        <ul>
                            <li>Black T-Shirt, Size L: **5** units left</li>
                            <li>Blue Denim Jeans, Size 30: **10** units left</li>
                            <li>Floral Summer Dress, Size M: **3** units left</li>
                        </ul>
                        <button class="action-btn edit-btn">View All Low Stock</button>
                    </div>
                </div>

            </div>
        `;
        
        // Example: Chart library initialization would happen here in a real application
        console.log('Reports page loaded. Time to initialize charts!');
    };

    // Main navigation switching logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetPage = item.getAttribute('data-page');
            const targetElementId = `${targetPage}-page`;

            // Update Active Class for Navigation and Pages
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            contentPages.forEach(page => page.classList.remove('active'));
            const activePage = document.getElementById(targetElementId);
            if (activePage) {
                activePage.classList.add('active');
            }

            // Load specific page content
            if (targetPage === 'products') {
                // ...
            } else if (targetPage === 'orders') {
                // ...
            } else if (targetPage === 'customers') {
                // ...
            } else if (targetPage === 'reports') {
                renderReportsPage(); // CALL THE NEW FUNCTION
            }
        });
    });

    // Initial load for the dashboard
    document.querySelector('[data-page="dashboard"]').click();
});
}

