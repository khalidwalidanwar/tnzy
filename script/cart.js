import {getCookie, setCookie, eraseCookie,appendAlert} from './main.js';
import {app, db,setDoc , collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';
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
let totalOfProducts =0;
let deliveryFees = 80;
let discount = 0;
const productsContainer = document.querySelector(".products");
const cart = JSON.parse(window.localStorage.cart);
window.addEventListener("load",async()=>{
    if(window.localStorage.cart && Object.values(JSON.parse(window.localStorage.cart)).length > 0){
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        const user = userSnap.data();
        const deliveryFeesRef = doc(db, "products", "customized-product");
        const deliveryFeesSnap = await getDoc(deliveryFeesRef);
        var deliveryFeesData = deliveryFeesSnap.data().deliveryFees;
        deliveryFees = deliveryFeesData[user.addresses[0].country] || window.history.back();
        let dicounts;
        const snap = await getDocs(collection(db, "products"));
        snap.forEach(async (doc) => {
            if(doc.id == "customized-product"){
                const productData = doc.data();
                dicounts = productData.copones;
            }
        });
        productsContainer.innerHTML ="";

        {// get user info
            if(userId){
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                const user = userSnap.data();
                if(!user.addresses || Object.values(user.addresses).length === 0){
                    appendAlert("Please add an address to your profile before placing an order.","warning");
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
                document.querySelector(".userInfo .deliveryInfo .chooseLocation select").addEventListener("change",async(e)=>{
                const selectedAddress = e.target.value;
                const address = Object.values(user.addresses).find(addr=>addr.address === selectedAddress);
                finalSelectedAddress = address;
                const deliveryFeesRef = doc(db, "products", "customized-product");
                const deliveryFeesSnap = await getDoc(deliveryFeesRef);
                var deliveryFeesData = deliveryFeesSnap.data().deliveryFees;
                deliveryFees = deliveryFeesData[address.country] || window.history.back();
                Object.values(cart).forEach((product)=>{loadProductsTotal(product)});
                document.querySelector(".userInfo .deliveryInfo .locationInfo .loc").innerHTML = `${address.address}, ${address.city}, ${address.country}` || "لم يتم تحديد عنوان بعد";
                document.querySelector(".userInfo .deliveryInfo .locationInfo .num").innerHTML = address.phone || "لم يتم تحديد رقم هاتف بعد";
                })
            }
        }

        Object.values(cart).forEach((product)=>{loadProductsTotal(product)});

        {//discount
            document.querySelector(".applyBtn").addEventListener("click",async (e)=>{
            e.target.setAttribute("disabled","");
            const code = document.querySelector(".discountCobone input");
            if(code.hasAttribute("disabled")){
                return;
            }
            if(dicounts[(code.value).toUpperCase()]){
                // add dicount number or percentage
                if(dicounts[code.value.toUpperCase()] < 1){
                    discount = Math.round((totalOfProducts + deliveryFees) * dicounts[code.value.toUpperCase()]);
                }else{
                    discount = dicounts[code.value.toUpperCase()];
                }
                // check if this copone has been used before by this user
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                var user = userSnap.data();
                if(user.usedCoupons && user.usedCoupons.includes(code.value.toUpperCase())){
                    appendAlert("You have already used this copone","warning");
                    e.target.removeAttribute("disabled");
                }else{
                    // add coupon to used coupons
                    var usedCoupons = user.usedCoupons || [];
                    usedCoupons.push(code.value.toUpperCase());
                    await updateDoc(userRef, { usedCoupons });
                    document.querySelector(".summary-details .discount").classList.remove("d-none");
                    document.querySelector(".taxes").innerHTML = `-${discount} <span>EGP</span>`;
                    const totalPrice = totalOfProducts + deliveryFees - discount;
                    document.querySelector(".totalPriceValue").innerHTML = totalPrice;
                    appendAlert("Discount code applied successfully","success");
                    code.setAttribute("disabled","");
                }
            }else{
                appendAlert("Invalid discount code","warning");
                e.target.removeAttribute("disabled");
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
                //vfcash
                if(method.querySelector("input").id === "vodafoneCash"){
                    method.querySelector(".payment-details").style.display = "block";
                    setTimeout(() => {
                        method.querySelector(".payment-details").style.display = "none";
                    }, 10000);
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
                const adminParams = {email: "zerot2026@gmail.com",orderId: order.orderId,time: order.createdAt,totalOfProducts: order.totalOfProducts,deliveryFees: order.deliveryFees,discount: order.discount,totalPrice: order.totalPrice,paymentMethod: order.paymentMethod,};
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
                    if(product.productId == "custom-tshirt"){
                        return; // skip custom products
                    }
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
                                    appendAlert('Thanks for your order! A confirmation email has been sent to you.', 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Medium"){
                        await updateDoc(productRef, { "avaliableSizes.Medium": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert('Thanks for your order! A confirmation email has been sent to you.', 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Large"){
                        await updateDoc(productRef, { "avaliableSizes.Large": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert('Thanks for your order! A confirmation email has been sent to you.', 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "XL"){
                        await updateDoc(productRef, { "avaliableSizes.XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert('Thanks for your order! A confirmation email has been sent to you.', 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "2XL"){
                        await updateDoc(productRef, { "avaliableSizes.2XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert('Thanks for your order! A confirmation email has been sent to you.', 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
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
                    if(product.productId == "custom-tshirt"){
                    return; // skip custom products
                    }
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
                                    appendAlert("Thanks for your order! A confirmation email has been sent to you.", 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Medium"){
                        await updateDoc(productRef, { "avaliableSizes.Medium": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert("Thanks for your order! A confirmation email has been sent to you.", 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "Large"){
                        await updateDoc(productRef, { "avaliableSizes.Large": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert("Thanks for your order! A confirmation email has been sent to you.", 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "XL"){
                        await updateDoc(productRef, { "avaliableSizes.XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert("Thanks for your order! A confirmation email has been sent to you.", 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
                                    console.log('FAILED...', error);
                                });
                        });
                        }else if(product.size == "2XL"){
                        await updateDoc(productRef, { "avaliableSizes.2XL": newQty, status: newStatus }).then(()=>{
                            emailjs.send('service_82g1fut', 'template_zorvcag', adminParams);
                            emailjs.send('service_82g1fut', 'template_zorvcag', templateParams)
                                .then((response) => {
                                    appendAlert("Thanks for your order! A confirmation email has been sent to you.", 'success');
                                    window.localStorage.removeItem("cart");
                                    window.location.href = '../profile/';
                                }, (error) => {
                                    appendAlert('Failed to send Your email. Please try again later.', 'danger');
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
                appendAlert("There was an error processing your order. Please try again.", "danger");
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

async function loadProductsTotal(product){
    productsContainer.innerHTML ="";
    totalOfProducts = 0;
    const userRef = doc(db, "products", product.productId);
            const userSnap = await getDoc(userRef);
            var item = userSnap.data();
            if(!item){
                // custom products like t-shirts
                if(product.productId === "custom-tshirt"){
                    item = product;
                    var highQualitFees;
                    var lowQualityFees;
                    var printingFees;
                    // get product price from firebase based on TShirtDetails
                    const snap = await getDocs(collection(db, "products"));
                    snap.forEach(async (doc) => {
                        if(doc.id == "customized-product"){
                            const productData = doc.data();
                            highQualitFees = productData.high;
                            lowQualityFees = productData.low;
                            printingFees = productData.printing;
                        }
                    });
                    // calc. price
                    let price = 0;
                    item.material == "High" ? price += highQualitFees : price += lowQualityFees;
                    item.printingBackImg && item.printingFrontImg ? price += parseInt(printingFees)*2 :
                    item.printingImg || item.printingBackImg || item.printingFrontImg ? price += printingFees : price+= parseInt(printingFees);
                    const productTotalPrice = price * item.quantity;
                    totalOfProducts += productTotalPrice;

                    // load product info
                    const productElement = document.createElement("div");
                    productElement.classList.add("product");
                    productElement.innerHTML=`
                    <div class="details">
                        <div class="product-title">
                        <p>${(item.productId).toUpperCase()}</p>
                        </div>
                        <div class="product-details">
                        <p class="product-size">Style: ${item.style || "Hoodie"}</p>
                        <p class="product-size">Size: ${item.size || "S"}</p>
                        <p class="product-size">Color: <span>${item.color}</span></p>
                        <p class="product-size">Printing: <span>${item.side=="back-front"?"Front & Back":item.side}</span></p>
                        ${item.designText ? `<p class="product-size">Design Text: <span>${item.designText}</span></p>` : ""}
                        <p class="product-price" class="price">Price: <span>${price}</span> EGP</p>
                        <p class="product-quantity" dir="rtl">Quantity: <input type="number" class="form-control" value="${item.quantity}" min="1"> </p>
                        </div>
                    </div>
                    <div class="imgContainer">
                        <img src="../../sources/customTshirt.png" alt="">
                    </div>
                    <div class="totalPrice">
                        <p>Total : </p>
                        <span class="totalProductPrice">${productTotalPrice} EGP</span>
                    </div>
                    <div class="deleteItem"><i class="fa-solid fa-close"></i></div>
                    `;
                    productsContainer.appendChild(productElement);
                    productElement.querySelector(".deleteItem").addEventListener("click",()=>{
                        productsContainer.removeChild(productElement);
                        totalOfProducts -= productTotalPrice;
                        document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>EGP</span>`;
                        document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>EGP</span>`;
                        const totalPrice = totalOfProducts + deliveryFees - discount;
                        document.querySelector(".totalPriceValue").innerHTML = totalPrice;
                        // remove from cart
                        delete cart[Object.keys(cart).find(key=>cart[key].productId === product.productId && cart[key].material === product.material && cart[key].size === product.size && cart[key].designText === product.designText && cart[key].printingImgSide === product.printingImgSide && cart[key].color === product.color && cart[key].style === product.style)];
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
                    });
                    productElement.querySelector(".product-quantity input").addEventListener("change",(e)=>{
                        const newQuantity = parseInt(e.target.value);
                        if(newQuantity >= 1){
                            const newTotalPrice = price * newQuantity;
                            productElement.querySelector(".totalProductPrice").innerHTML = `${newTotalPrice} EGP`;
                            totalOfProducts = totalOfProducts - (price * product.quantity) + newTotalPrice;
                            document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>EGP</span>`;
                            document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>EGP</span>`;
                            const totalPrice = totalOfProducts + deliveryFees - discount;
                            document.querySelector(".totalPriceValue").innerHTML = totalPrice;
                            // update cart
                            Object.values(cart).forEach(p=>{
                            if(p.productId === product.productId && p.size === product.size && p.material === product.material && p.designText === product.designText && p.printingImgSide === product.printingImgSide && p.color === product.color && p.style === product.style){
                                p.quantity = newQuantity;
                            }
                            })
                            window.localStorage.cart = JSON.stringify(cart);
                        }else{
                            appendAlert("Quantity must be at least 1","warning");
                            e.target.value = product.quantity;
                        }
                    })
                }else{
                    return;
                }
            }else{
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
                    <p class="product-price" class="price">Price: <span>${item.newPrice}</span> EGP</p>
                    <p class="product-quantity" dir="rtl">Quantity: <input type="number" class="form-control" value="${product.quantity}" min="1"> </p>
                    </div>
                </div>
                <div class="imgContainer">
                    <img src="${item.imgUrl[0]}" alt="">
                </div>
                <div class="totalPrice">
                    <p>Total : </p>
                    <span class="totalProductPrice">${productTotalPrice} EGP</span>
                </div>
                <div class="deleteItem"><i class="fa-solid fa-close"></i></div>
                `;
                productsContainer.appendChild(productElement);
                productElement.querySelector(".product-quantity input").addEventListener("change",(e)=>{
                    const newQuantity = parseInt(e.target.value);
                    if(item.avaliableSizes && newQuantity <= item.avaliableSizes[product.size]){
                        if(newQuantity >= 1){
                            const newTotalPrice = item.newPrice * newQuantity;
                            productElement.querySelector(".totalProductPrice").innerHTML = `${newTotalPrice} EGP`;
                            totalOfProducts = totalOfProducts - (item.newPrice * product.quantity) + newTotalPrice;
                            document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>EGP</span>`;
                            document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>EGP</span>`;
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
                            appendAlert("Quantity must be at least 1","warning");
                            e.target.value = product.quantity;
                        }
                    }else{
                        appendAlert(`The requested quantity is not available. The available quantity for size ${product.size} is only ${item.avaliableSizes ? item.avaliableSizes[product.size] : 0} pieces.`,"warning");
                        e.target.value = product.quantity;
                    }
                })
                productElement.querySelector(".deleteItem").addEventListener("click",()=>{
                    productsContainer.removeChild(productElement);
                    totalOfProducts -= productTotalPrice;
                    document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>EGP</span>`;
                    document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>EGP</span>`;
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
            }
            document.querySelector(".totalOfProducts").innerHTML = `${totalOfProducts} <span>EGP</span>`;
            document.querySelector(".deliveryFees").innerHTML = `${deliveryFees} <span>EGP</span>`;
            document.querySelector(".taxes").innerHTML = `---- <span>EGP</span>`;
            document.querySelector(".subTotalPrice").innerHTML = `${totalOfProducts + deliveryFees} <span>EGP</span>`;
            const totalPrice = totalOfProducts + deliveryFees - discount;
            document.querySelector(".totalPriceValue").innerHTML = totalPrice;
            // change quantity
}