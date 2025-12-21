import {getCookie, setCookie, eraseCookie,appendAlert} from './main.js';
import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';
// check if user is logged in
window.addEventListener('load', () => {
    document.querySelector("input#email").focus();
    const user = getCookie('userId');
    if(getCookie("emailToVirify")){
        window.location.href = './verify.html';
    }else if(user){
        window.location.href = '../../';
    }
});
// handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    event.target.querySelector('button').disabled = true;
    const email = document.getElementById('email').value;
    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
        appendAlert('Please enter a valid email address.',"danger");
        return;
    }
    // Simulate sending a verification code to the email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCookie('emailToVirify', email, 15); // 15 minutes
    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email), limit(1));
    getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
            // User exists, update verification code
            const userDoc = querySnapshot.docs[0];
            updateDoc(doc(db, "users", userDoc.id), {
                verificationCode: verificationCode,
                createdAt: new Date(),
                isVerified: false,
            }).then(() => {
                // sendVerificationEmail(email, verificationCode);
                const templateParams = {email: email,code: verificationCode,message: `${verificationCode} هو رمز التحقق الخاص بك لتسجيل الدخول إلى TNZY. هذا الرمز صالح لمدة 15 دقائق. إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`};
                emailjs.send('service_82g1fut', 'template_9yw7zah', templateParams)
                    .then((response) => {
                        setCookie('userId', userDoc.id, 60*24*365); // 1 Year
                        appendAlert(`A verification code has been sent to ${email}. The code is valid for 15 minutes.`,"success");
                        setTimeout(() => {
                            window.location.href = './verify.html';
                        }, 5000);
                    }, (error) => {
                        appendAlert('Failed to send verification email. Please try again later.','warning');
                        console.log('FAILED...', error);
                    });
            });
        } else {
            // User does not exist, create new user
            addUser(email, verificationCode).then((docRef) => {
                // sendVerificationEmail(email, verificationCode);
                const templateParams = {email: email,code: verificationCode,message: `${verificationCode} هو رمز التحقق الخاص بك لتسجيل الدخول إلى TNZY. هذا الرمز صالح لمدة 15 دقائق. إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`};
                emailjs.send('service_82g1fut', 'template_9yw7zah', templateParams)
                    .then((response) => {
                        setCookie('userId', docRef.id, 60*24*365); // 1 Year
                        appendAlert(`A verification code has been sent to ${email}. The code is valid for 15 minutes.`,"success");
                        setTimeout(() => {
                            window.location.href = './verify.html';
                        }, 5000);
                    }, (error) => {
                        appendAlert('Failed to send verification email. Please try again later.','warning');
                        console.log('FAILED...', error);
                    });
            });
        }
    }).catch((error) => {
        console.error("Error checking user existence: ", error);
        appendAlert('An error occurred. Please try again later.',"danger");
    });
});




function addUser(email,code) {
    return addDoc(collection(db, "users"), {
        email: email,
        createdAt: new Date(),
        verificationCode:code,
        isVerified: false,
    });
}
