import {getCookie, setCookie, eraseCookie} from '../../script/main.js';
import {app, db,setDoc , collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from '../../script/app.js';
const menuBar =document.querySelector("header .links .menuBar")
const menu =document.querySelector("header .links .menu")
const menuControle =document.querySelector("header .links .menu .controle")
const overlay =document.querySelector(".mainOverlay");
const info =document.querySelector("header .info");
const header = document.querySelector('header');
const userId = getCookie("userId");
var finalSelectedAddress = null;
var finalPaymentMethod = "onDelivery";

if(!getCookie("userId")){
    window.location.href = '../../';
}else if(!getCookie("emailToVirify")){
    if(!window.localStorage.cart || Object.values(JSON.parse(window.localStorage.cart)).length === 0){
        window.location.href = '../../';
    }
}else{
    window.location.href = '../login/verify.html';
}
window.addEventListener("load",async()=>{
    if(window.localStorage.cart && Object.values(JSON.parse(window.localStorage.cart)).length > 0){
        const cart = JSON.parse(window.localStorage.cart);
        const productsContainer = document.querySelector(".products");
        let totalOfProducts =0;
        let deliveryFees = 80;
        let discount = 0;
        let dicounts = {
            "TNZY10": 0.1, // 10% discount
            "TNZY20": 0.2, // 20% discount
            "TNZY30": 0.3, // 30% discount
            "TNZY50": 0.5, // 50% discount
        }
        productsContainer.innerHTML ="";

        {// get user info
            if(userId){
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                const user = userSnap.data();
                if(!user.addresses || Object.values(user.addresses).length === 0){
                    alert("Please add an address to your profile before placing an order.");
                    window.location.href = '../profile/';
                }
                document.querySelector(".userInfo .username").innerHTML = (user.firstName || "") + " " + (user.lastName || "");
                document.querySelector(".userInfo .email").innerHTML = user.email;
                document.querySelector(".userInfo .deliveryInfo .locationInfo .loc").innerHTML = `${(user.addresses)[0].address}, ${(user.addresses)[0].city}, ${(user.addresses)[0].country}` || "لم يتم تحديد عنوان بعد";
                document.querySelector(".userInfo .deliveryInfo .locationInfo .num").innerHTML = (user.addresses)[0].phone || "لم يتم تحديد رقم هاتف بعد";
                document.querySelector(".userInfo .deliveryInfo .chooseLocation select").innerHTML = "";
                Object.values(user.addresses).forEach(address=>{
                const option = document.createElement("option");
                option.value = address.address;
                option.innerHTML = address.address;
                document.querySelector(".userInfo .deliveryInfo .chooseLocation select").appendChild(option);
                })
                finalSelectedAddress = Object.values(user.addresses).find(addr=>addr.address === document.querySelector(".userInfo .deliveryInfo .chooseLocation select").value);
                document.querySelector(".userInfo .deliveryInfo .chooseLocation select").addEventListener("change",(e)=>{
                const selectedAddress = e.target.value;
                const address = Object.values(user.addresses).find(addr=>addr.address === selectedAddress);
                finalSelectedAddress = address;
                document.querySelector(".userInfo .deliveryInfo .locationInfo .loc").innerHTML = `${address.address}, ${address.city}, ${address.country}` || "لم يتم تحديد عنوان بعد";
                document.querySelector(".userInfo .deliveryInfo .locationInfo .num").innerHTML = address.phone || "لم يتم تحديد رقم هاتف بعد";
                })
            }
        }

        Object.values(cart).forEach(async (product)=>{
            const userRef = doc(db, "products", product.productId);
            const userSnap = await getDoc(userRef);
            const item = userSnap.data();
            const productTotalPrice = item.newPrice * product.quantity;
            totalOfProducts += productTotalPrice;
            const productElement = document.createElement("div");
            productElement.classList.add("product");
            productElement.innerHTML=`
            <div class="details">
                <div class="product-title">
                <p>${item.title}</p>
                </div>
                <div class="product-details">
                <p class="product-size">Size: ${product.size || "S"}</p>
                <p class="product-price" class="price">Price: <span>${item.newPrice}</span> ج.م</p>
                <p class="product-quantity" dir="rtl">Quantity: <input type="number" class="form-control" value="${product.quantity}" min="1"> </p>
                </div>
            </div>
            <div class="imgContainer">
                <img src="../../sources/${item.imgUrl[0]}" alt="">
            </div>
            <div class="totalPrice">
                <p>Total : </p>
                <span class="totalProductPrice">${productTotalPrice} ج.م</span>
            </div>
            <div class="deleteItem"><i class="fa-solid fa-close"></i></div>
            `;
            productsContainer.appendChild(productElement);
            document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>ج.م</span>`;
            document.querySelector(".deliveryFees").innerHTML = `${deliveryFees} <span>ج.م</span>`;
            document.querySelector(".taxes").innerHTML = `---- <span>ج.م</span>`;
            document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>ج.م</span>`;
            const totalPrice = totalOfProducts + deliveryFees - discount;
            document.querySelector(".totalPriceValue").innerHTML = totalPrice;
            // change quantity
            productElement.querySelector(".product-quantity input").addEventListener("change",(e)=>{
                const newQuantity = parseInt(e.target.value);
                if(item.avaliableSizes && newQuantity <= item.avaliableSizes[product.size]){
                    if(newQuantity >= 1){
                        const newTotalPrice = item.newPrice * newQuantity;
                        productElement.querySelector(".totalProductPrice").innerHTML = `${newTotalPrice} ج.م`;
                        totalOfProducts = totalOfProducts - (item.newPrice * product.quantity) + newTotalPrice;
                        document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>ج.م</span>`;
                        document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>ج.م</span>`;
                        const totalPrice = totalOfProducts + deliveryFees - discount;
                        document.querySelector(".totalPriceValue").innerHTML = totalPrice;
                        // update cart
                        Object.values(cart).forEach(p=>{
                        if(p.productId === product.productId && p.size === product.size){
                            p.quantity = newQuantity;
                        }
                        })
                        window.localStorage.cart = JSON.stringify(cart);
                    }else{
                        alert("Quantity must be at least 1");
                        e.target.value = product.quantity;
                    }
                }else{
                    alert(`The requested quantity is not available. The available quantity for size ${product.size} is only ${item.avaliableSizes ? item.avaliableSizes[product.size] : 0} pieces.`);
                    e.target.value = product.quantity;
                }
            })
            productElement.querySelector(".deleteItem").addEventListener("click",()=>{
                productsContainer.removeChild(productElement);
                totalOfProducts -= productTotalPrice;
                document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>ج.م</span>`;
                document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>ج.م</span>`;
                const totalPrice = totalOfProducts + deliveryFees - discount;
                document.querySelector(".totalPriceValue").innerHTML = totalPrice;
                // remove from cart
                delete cart[Object.keys(cart).find(key=>cart[key].productId === product.productId && cart[key].size === product.size)];
                //reindex cart
                const reindexedCart = {};
                Object.values(cart).forEach((p, index) => {
                    reindexedCart[index] = p;
                });
                window.localStorage.cart = JSON.stringify(reindexedCart);
                if(Object.values(cart).length === 0){
                    window.localStorage.removeItem("cart");
                    window.location.reload();
                }
            })
        })
        
        {//discount
            document.querySelector(".applyBtn").addEventListener("click",()=>{
            const code = document.querySelector(".discountCobone input");
            if(dicounts[code.value]){
                discount = Math.round((totalOfProducts + deliveryFees) * dicounts[code.value]);
                document.querySelector(".taxes").innerHTML = `-${discount} <span>ج.م</span>`;
                const totalPrice = totalOfProducts + deliveryFees - discount;
                document.querySelector(".totalPriceValue").innerHTML = totalPrice;
                alert("Discount code applied successfully");
                code.setAttribute("disabled","");
            }else{
                alert("Invalid discount code");
            }
            })
        }

        {// payment btn
            document.querySelector(".payment-btn").addEventListener("click",()=>{
            document.querySelector(".orderInfo").classList.add("d-none");
            document.querySelector(".paymentMethods").classList.remove("d-none");
            document.querySelector(".payment-btn").classList.add("d-none");
            document.querySelector(".checkout-btn").classList.remove("d-none");
            window.scrollTo({ top: header.offsetHeight + 20, behavior: 'smooth' });
            finalPaymentMethod = document.querySelector(".paymentMethods .method.active input").id;
            });
            // payments opions
            document.querySelectorAll(".paymentMethods .method").forEach(method=>{
            method.addEventListener("click",()=>{
                if(!method.classList.contains("disabled")){
                document.querySelectorAll(".paymentMethods .method").forEach(m=>m.classList.remove("active"));
                method.querySelector("input").checked = true;
                method.classList.add("active");
                finalPaymentMethod = method.querySelector("input").id;
                console.log(finalPaymentMethod);
                //vfcash
                if(method.querySelector("input").id === "vodafoneCash"){
                    method.querySelector(".payment-details").style.display = "block";
                }else{
                    document.querySelectorAll(".paymentMethods .method .payment-details").forEach(detail=>{
                    detail.style.display = "none";
                    })
                }
                }
            })
            })
        }

        {// checkout
            document.querySelector(".checkout-btn").addEventListener("click",async()=>{
            document.querySelector(".checkout-btn").setAttribute("disabled","");
            if(userId && totalOfProducts){
                const order = {
                orderId: "order_" + Date.now(),
                userId,
                products: cart,
                totalOfProducts,
                deliveryFees: deliveryFees,
                discount :discount,
                totalPrice: totalOfProducts + deliveryFees - discount,
                address: finalSelectedAddress,
                status: "pending",
                createdAt: new Date().toISOString(),
                paymentMethod: finalPaymentMethod
                }
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                const user = userSnap.data();
                const templateParams = {
                    email: user.email,
                    orderId: order.orderId,
                    time: order.createdAt,
                    totalOfProducts: order.totalOfProducts,
                    deliveryFees: order.deliveryFees,
                    discount: order.discount,
                    totalPrice: order.totalPrice,
                    paymentMethod: order.paymentMethod,
                };
                const adminParams = {email: "teenzy2525@gmail.com",orderId: order.orderId,time: order.createdAt,totalOfProducts: order.totalOfProducts,deliveryFees: order.deliveryFees,discount: order.discount,totalPrice: order.totalPrice,paymentMethod: order.paymentMethod,};
                try {
                const newOrderRef = doc(collection(db, "orders"));
                await setDoc(newOrderRef, order); 
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                var orders = userData.orders || [];
                if (userData.orders) {
                    orders.push(newOrderRef.id);
                    updateDoc(userRef, { orders }).then(() => {
                    // decrease product quantities
                    Object.values(cart).forEach(async(product)=>{
                    const productRef = doc(db, "products", product.productId);
                    const productSnap = await getDoc(productRef);
                    const productData = productSnap.data();
                    const zSizes = productData.avaliableSizes;
                    if(zSizes && product.size && zSizes[product.size] !== undefined){
                        var newQty = zSizes[product.size] - product.quantity;
                        if(newQty < 0) newQty = 0;
                        var newStatus = productData.status;
                        if(Object.values(zSizes).every(qty => qty == 0)){
                        newStatus = "soldOut";
                        }
                        if(product.size == "Small"){
                        await updateDoc(productRef, { "avaliableSizes.Small": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert('Thanks for your order! A confirmation email has been sent to you.');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Medium"){
                        await updateDoc(productRef, { "avaliableSizes.Medium": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert('Thanks for your order! A confirmation email has been sent to you.');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Large"){
                        await updateDoc(productRef, { "avaliableSizes.Large": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert('Thanks for your order! A confirmation email has been sent to you.');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "XL"){
                        await updateDoc(productRef, { "avaliableSizes.XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert('Thanks for your order! A confirmation email has been sent to you.');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "2XL"){
                        await updateDoc(productRef, { "avaliableSizes.2XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert('Thanks for your order! A confirmation email has been sent to you.');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }
                    }
                    })
                    })
                } else {
                    orders = [newOrderRef.id];
                    updateDoc(userRef, { orders }).then(() => {
                    // decrease product quantities
                    Object.values(cart).forEach(async(product)=>{
                    const productRef = doc(db, "products", product.productId);
                    const productSnap = await getDoc(productRef);
                    const productData = productSnap.data();
                    const zSizes = productData.avaliableSizes;
                    if(zSizes && product.size && zSizes[product.size] !== undefined){
                        var newQty = zSizes[product.size] - product.quantity;
                        if(newQty < 0) newQty = 0;
                        var newStatus = productData.status;
                        if(Object.values(zSizes).every(qty => qty === 0)){
                        newStatus = "soldOut";
                        }
                        if(product.size == "Small"){
                        await updateDoc(productRef, { "avaliableSizes.Small": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert("Thanks for your order! A confirmation email has been sent to you.");
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Medium"){
                        await updateDoc(productRef, { "avaliableSizes.Medium": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert("Thanks for your order! A confirmation email has been sent to you.");
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Large"){
                        await updateDoc(productRef, { "avaliableSizes.Large": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert("Thanks for your order! A confirmation email has been sent to you.");
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "XL"){
                        await updateDoc(productRef, { "avaliableSizes.XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert("Thanks for your order! A confirmation email has been sent to you.");
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "2XL"){
                        await updateDoc(productRef, { "avaliableSizes.2XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    alert("Thanks for your order! A confirmation email has been sent to you.");
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    alert('Failed to send Your email. Please try again later.');
                                    console.log('FAILED...', error);
                                });
                        });
                        }
                    }
                    })
                    })
                }
                } catch (error) {
                console.error("Error adding document: ", error);
                alert("There was an error processing your order. Please try again.");
                }
            }else{
                window.location.href = '../login/';
            }
            })
        }

    }else{
        window.location.href='../../';
    }
})

{ // header menu
    // menu toggle
    document.querySelector("header .links .menuBar").addEventListener("click",()=>{
        document.querySelector("header").style.overflow = "visible"
        menu.style.right =0;
        info.style.right = '85px'
        overlay.style.display = 'block';
    })
    document.querySelector("header .links .menu .controle").addEventListener("click",()=>{
        document.querySelector("header").style.overflow = "hidden"
        menu.style.right ="-100%";
        info.style.right = '-100%'
        overlay.style.display = 'none';
    })
    menu.querySelectorAll("ul li").forEach(link=>{
        document.querySelector("header").style.overflow = "hidden"
        link.addEventListener("click",()=>{
            menu.style.right ="-100%";
            info.style.right = '-100%'
            overlay.style.display = 'none';
        })
    })
    overlay.addEventListener("click",()=>{
        document.querySelector("header").style.overflow = "hidden"
        menu.style.right ="-100%";
        info.style.right = '-100%'
        overlay.style.display = 'none';
    })
    document.querySelector("header .info .userProfile").addEventListener("click",()=>{
        if(getCookie('userId')){
            if(!getCookie("emailToVirify")){
                window.location.href = '../profile/';
            }else{
                window.location.href = '../login/verify.html';
            }
        }else{
            window.location.href = '../login/';
        }
})
}

