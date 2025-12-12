window.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.querySelector('.welcome p');
    welcomeMessage.innerHTML = '';
    // welcomeMessage.innerHTML = 'Welcome to TNZY customised world.';
    // write this messege letter by letter
    const message = 'Welcome to TNZY customised world.';
    let index = 0;
    const interval = setInterval(() => {
        welcomeMessage.innerHTML += message[index];
        index++;
        if (index === message.length) {
            clearInterval(interval);
        }
    }, 100);
    // remove the parent element after writtung the message
    setTimeout(() => {
        welcomeMessage.parentElement.remove();
    }, 5000);
});

// design options
const optionsContainer = document.querySelector('.optionsContainer');
const materialOptions = document.querySelectorAll('.option.material .optionOption');
const styleOptions = document.querySelectorAll('.option.style .optionOption');
const sizeOptions = document.querySelectorAll('.option.size .optionOption');
const colorOptions = document.querySelectorAll('.option.color .optionOption');
const designOptions = document.querySelectorAll('.option.design .optionOption');
const printingOptions = document.querySelectorAll('.option.printing .optionOption');
const preview = document.querySelector('.option.preview');
const summaryContainer = document.querySelector('.ztshirtsummary');
const inputAITextForm = document.querySelector(".ai-back-form");
const cloudName = "dfochp65f"; // Replace with your Cloudinary cloud name
const uploadPreset = "my-upload-preset"; // Replace with your upload preset (configured in Cloudinary)
const TShirtDetails = {
    material: '',
    style: '',
    size: '',
    color: '',
    quanatity: 1,
    designText: '',
    printingImg: '',
    printingImgSide: 'back',
}
var zcart = {};


materialOptions.forEach((material)=>{
    material.addEventListener('click', ()=>{
        materialOptions.forEach((m)=>{m.classList.remove('selected');})
        material.classList.add('selected');
        // update summary
        const summaryMaterial = document.getElementById('summaryMaterial');
        summaryMaterial.innerText = material.innerText;
        setTimeout(() => {
            // show style options
            document.querySelector('.option.style').classList.remove('d-none');
            // hide material options
            TShirtDetails.material = material.innerText;
            document.querySelector('.option.material').classList.add('hidden');
            document.querySelector('.option.material').classList.remove('active');
        }, 600);
    });
})
styleOptions.forEach((style)=>{
    style.addEventListener('click', ()=>{
        styleOptions.forEach((s)=>{s.classList.remove('selected');})
        style.classList.add('selected');
        // update summary
        const summaryStyle = document.getElementById('summaryStyle');
        summaryStyle.innerText = style.innerText;
        setTimeout(() => {
            // show size options
            document.querySelector('.option.size').classList.remove('d-none');
            // hide style options
            TShirtDetails.style = style.innerText;
            document.querySelector('.option.style').classList.add('hidden');
            document.querySelector('.option.style').classList.remove('active');
        }, 600);
    });
});
sizeOptions.forEach((size)=>{
    size.addEventListener('click', ()=>{
        sizeOptions.forEach((s)=>{s.classList.remove('selected');})
        size.classList.add('selected');
        // update summary
        const summarySize = document.getElementById('summarySize');
        summarySize.innerText = size.innerText;
        setTimeout(() => {
            // show color options
            document.querySelector('.option.color').classList.remove('d-none');
            // hide size options
            TShirtDetails.size = size.innerText;
            document.querySelector('.option.size').classList.add('hidden');
            document.querySelector('.option.size').classList.remove('active');
        }
        , 600);
    });
});
colorOptions.forEach((color)=>{
    color.addEventListener('click', ()=>{
        colorOptions.forEach((c)=>{c.classList.remove('selected');})
        color.classList.add('selected');
        // update summary
        const summaryColor = document.getElementById('summaryColor');
        summaryColor.innerText = color.getAttribute('data-color');
        setTimeout(() => {
            // show design options
            document.querySelector('.option.design').classList.remove('d-none');
            // hide color options
            TShirtDetails.color = color.getAttribute('data-color');
            document.querySelector('.option.color').classList.add('hidden');
            document.querySelector('.option.color').classList.remove('active');
        }, 600);
    });
});
designOptions.forEach((design)=>{
    design.addEventListener('click', ()=>{
        designOptions.forEach((d)=>{d.classList.remove('selected');})
        design.classList.add('selected');
        if(design.id == "uploadDesign"){
            document.querySelector('.printing').classList.remove('d-none');
            document.querySelector('.option.design').classList.add('hidden');
            document.querySelector('.option.design').classList.remove('active');
        }else{
            let designText = prompt("Enter your design text: ");
            if(designText){
                // hide design options
                document.querySelector('.option.design').classList.add('hidden');
                document.querySelector('.option.design').classList.remove('active');
                document.querySelector('.option.printing').classList.add('d-none');
                TShirtDetails.designText = designText;
                // show preview options
                document.querySelectorAll(".option").forEach((option)=>{
                    option.classList.add('d-none');
                })
                loadTshirtPreview("needlework");
            }
        }
    });
});

document.querySelector(".option.printing .photo").addEventListener('click', (e)=>{
    printingOptions.forEach((p)=>{p.classList.remove('selected');})
    e.target.classList.add('selected');
    if(e.target.id == "chooseFromGallery"){
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();
        fileInput.onchange = ()=>{
            const file = fileInput.files[0];
            if(file){
                // image preview
                let reader = new FileReader();
                reader.onload = ()=>{
                    // show image in photoPreview
                    const photoPreview = document.querySelector('.photoPreview');
                    photoPreview.classList.remove('d-none');
                    photoPreview.querySelector("img").src = reader.result;
                    document.getElementById("confirmPhoto").addEventListener("click",(e)=>{
                        TShirtDetails.printingImg =  file;
                        TShirtDetails.printingImgSide =  document.querySelector(".image-side input[type='radio']:checked").classList.contains("front-side") ? "front" : "back";
                        loadTshirtPreview("gallery");
                    })
                }
                reader.readAsDataURL(file);
            }
        }
    }
});
document.querySelector(".option.printing .gemini").addEventListener('click', (e)=>{
    var AIText = false;
    printingOptions.forEach((p)=>{p.classList.remove('selected');})
    e.target.classList.add('selected');
    inputAITextForm.classList.remove("d-none");
    inputAITextForm.addEventListener("click",(e)=>{
        if(e.target.classList.contains("ai-back-form")){
            inputAITextForm.classList.add("d-none");
            inputAITextForm.querySelector("input").value = "";
        }else if(e.target.classList.contains("generateWithAI")){
            if(inputAITextForm.querySelector("input").value.trim() != ""){
                AIText = inputAITextForm.querySelector("input").value.trim();
                inputAITextForm.classList.add("d-none");

                // disable confirm and remove buttons
                document.getElementById("confirmPhoto").removeEventListener("click",()=>{});
                document.getElementById("confirmPhoto").setAttribute("disabled","")
                document.getElementById("removePhoto").setAttribute("disabled","")

                // show loading img
                const photoPreview = document.querySelector('.photoPreview');
                photoPreview.classList.remove('d-none');
                photoPreview.querySelector("img").src = "../../sources/loading.gif";
                photoPreview.querySelector("img").style.filter = "blur(2px)";
                photoPreview.querySelector("img").style.width = "256px";

                // get Ai image link
                const form = new FormData()
                form.append('prompt', AIText)
                fetch('https://clipdrop-api.co/text-to-image/v1', {
                method: 'POST',
                headers: {
                'x-api-key': "d6d3196b4af2f3cc63041f74b2881ef43816ff119b5f8133be1324802a5dd4174bd49acc377cd9a37cb29bbc1f65ec6e",
                },
                body: form,
                })
                .then(response => response.arrayBuffer())
                .then(buffer => {
                const blob = new Blob([buffer], { type: "image/png" });
                const url = URL.createObjectURL(blob);
                photoPreview.querySelector("img").src = url;
                photoPreview.querySelector("img").style.filter = "none";
                document.getElementById("confirmPhoto").removeAttribute("disabled","")
                document.getElementById("removePhoto").removeAttribute("disabled","")
                document.getElementById("confirmPhoto").addEventListener("click",async(e)=>{
                    const blob = await fetch(url).then(r => r.blob());
                    const file = new File([blob], "image.png", { type: blob.type });
                    TShirtDetails.printingImg =  file;
                    TShirtDetails.printingImgSide =  document.querySelector(".image-side input[type='radio']:checked").classList.contains("front-side") ? "front" : "back";
                    loadTshirtPreview("ai");
                })
                });
            }else{
                alert("Please enter a valid prompt.");
            }
        }
    })
})

document.querySelector(".image-side .tshirt-front").addEventListener("click",(e)=>{e.target.parentElement.querySelector("input").click();});
document.querySelector(".image-side .tshirt-back").addEventListener("click",(e)=>{e.target.parentElement.querySelector("input").click();});


// toggle options
const optionHeads = document.querySelectorAll('.option .head');
optionHeads.forEach((head)=>{
    head.addEventListener('click', ()=>{
        const option = head.parentElement;
        option.classList.toggle('hidden');
        option.classList.toggle('active');
        const arrow = head.querySelector('.arrow i');
        arrow.classList.toggle('fa-arrow-down');
        arrow.classList.toggle('fa-arrow-up');
    });
});
document.getElementById("removePhoto").addEventListener("click",()=>{
    document.querySelector('.photoPreview').classList.add('d-none');
    document.querySelector('.photoPreview').querySelector("img").src = "";
    document.querySelector('.photoPreview').querySelector("img").style.filter = "none";
    document.querySelector("#chooseFromGallery").click();
})

function loadTshirtPreview(method){
    document.querySelectorAll(".optionsContainer .option").forEach((option)=>{
        option.classList.add("d-none");
    })
    // loading while your tshirt is being prepared
    document.querySelector(".generating-Tshirt-loading").classList.remove("d-none");
    // preparing tshirt based on method
    if(method == "needlework"){
        // imagine needlework preview using ai
        var LogoName = TShirtDetails.designText;
        let aiPrompt = `
        A complete T-shirt design showing embroidery of the text "${LogoName}".
        and i want the embroidery to be in the upper right corner of the t-shirt so that it is on the chest of the person wearing it.
        and the Tshirt color is ${TShirtDetails.color},
        style is ${TShirtDetails.style} with a profesional person wearing it.
        `;
        // get T-shirt image link from ai
        const form = new FormData()
        form.append('prompt', aiPrompt)
        fetch('https://clipdrop-api.co/text-to-image/v1', {
        method: 'POST',
        headers: {
        'x-api-key': "d6d3196b4af2f3cc63041f74b2881ef43816ff119b5f8133be1324802a5dd4174bd49acc377cd9a37cb29bbc1f65ec6e",
        },
        body: form,
        })
        .then(response => response.arrayBuffer())
        .then(buffer => {
        const blob = new Blob([buffer], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        // hide loading
        document.querySelector('.tshirtPreview img#tshirtImage').src = url;
        document.querySelector('.option.preview').classList.remove('d-none');
        document.querySelector(".generating-Tshirt-loading").classList.add("d-none");
        })
    }
    else if(method == "gallery" || method == "ai"){
        // imagine printing preview using ai
        var LogoImageFile = TShirtDetails.printingImg;
        const formData = new FormData();
        formData.append("file", LogoImageFile);
        formData.append("upload_preset", uploadPreset);
        fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            TShirtDetails.printingImg = data.secure_url;
            document.querySelector('.tshirtPreview img#tshirtImage').src = `../../sources/tshirt_${TShirtDetails.printingImgSide}Img_mockup.png`;
            document.querySelector('.option.preview').classList.remove('d-none');
            document.querySelector(".generating-Tshirt-loading").classList.add("d-none");
        })
        .catch(error => {
            console.error("Error uploading image: ", error);
        });
    }
}

document.querySelector("#tshirt-summary").addEventListener("click",()=>{
    // calucate tshirt price
    let price = 0;
    TShirtDetails.material == "100% Cotton" ? price += 500 : price += 300;
    TShirtDetails.printingImg != "" ? price += 80 : "";
    document.getElementById("summaryPrice").innerText = "$" + price.toString();
    summaryContainer.classList.toggle("d-none");
    document.querySelector('.option.preview').classList.add('d-none');
})
document.querySelector(".summaryQyantity").addEventListener("change",(e)=>{
    if(e.target.value > 200){
        e.target.value = 200;
    }else if(e.target.value < 1){
        e.target.value = 1;
    }
    TShirtDetails.quanatity = e.target.value;
    document.getElementById("summaryPrice").innerText = "$" + (parseInt(document.getElementById("summaryPrice").innerText.replace("$","")) * TShirtDetails.quanatity).toString();
})
document.querySelector("#proceedToCheckout").addEventListener("click",(e)=>{
    e.target.setAttribute("disabled","");
    // add product to cart and redirect to checkout page
    var newProduct = {
        productId: "custom-tshirt",
        quantity:TShirtDetails.quanatity,
        size:TShirtDetails.size,
        material:TShirtDetails.material,
        style:TShirtDetails.style,
        color:TShirtDetails.color,
        designText:TShirtDetails.designText,
        printingImg:TShirtDetails.printingImg,
        printingImgSide:TShirtDetails.printingImgSide,
    };
    if(getCookie('userId') && !getCookie("emailToVirify")){
        if(window.localStorage.cart && window.localStorage.cart.length > 0){
            zcart = JSON.parse(window.localStorage.cart);
            let found = Object.values(zcart).find(
            item => item.size == TShirtDetails.size && item.color == TShirtDetails.color && item.productId == "custom-tshirt" && item.designText == TShirtDetails.designText && item.printingImg == TShirtDetails.printingImg && item.printingImgSide == TShirtDetails.printingImgSide && item.material == TShirtDetails.material && item.style == TShirtDetails.style
            );
            if (found) {
                e.target.removeAttribute("disabled");
                alert("This product is already in your cart. Go to cart to update quantity if needed.");
            } else {
                zcart[Object.keys(zcart).length] = newProduct;
                window.localStorage.cart = JSON.stringify(zcart);
                e.target.removeAttribute("disabled");
                alert("Product added to cart successfully!");
                window.location.href = '../orderConfirmation/cart.html';
            }
            
        }else{
            zcart = {
                0:{newProduct}
            };
            window.localStorage.cart = JSON.stringify(zcart);
            alert("Product added to cart successfully!");
            window.location.href = '../orderConfirmation/cart.html';
        }
    }else{
        alert('please log in first to add to cart.');
        window.location.href = '../login/';
    }
    // redirect to checkout page
    // window.location.href = "../../";
})

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}






// Example posting a text URL:
// (async function() {
//     const resp = await fetch('https://api.deepai.org/api/text2img', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'api-key': '00b1f7bb-b45e-45fc-8b41-47923f0ee07c'
//         },
//         body: JSON.stringify({
//             text: "a green man riding a blue horse in the style of van gogh",
//         })
//     });
    
//     const data = await resp.json();
//     console.log(data);
// })()