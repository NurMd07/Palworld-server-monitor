const loginForm = document.querySelector("#login-form");
const loginButton = document.querySelector("#login-button");
const username = loginForm.querySelector('input[name=username]');
const password = loginForm.querySelector('input[name=password]');
const loginError = loginForm.querySelector('.login-error');
const logo = document.querySelector('.logo');

const loginErrors = ['Username or Password is invalid! Try again.','Something Went wrong! Try again.'];

logo.addEventListener('click',(e)=>{
    window.location.href = '/';
});
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(loginForm);
    const data = new URLSearchParams(formData);
try{
    const response = await fetch('/login',{
        method:"POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
        body:data
    });
    
    if(response.status == 200){
        const result = await response.json();
        if(result.status == 'success'){
            loginError.classList.add('hidden');
 
            return window.location.href = '/';
        }else{
            loginError.classList.remove('hidden');
            loginError.textContent = loginErrors[1];
        }
   
    }else if(response.status == 401){
        loginError.textContent = loginErrors[0];
        username.classList.add('border-b-red-400');
        password.classList.add('border-b-red-400');
        loginError.classList.remove('hidden');
    }else{
        loginError.classList.remove('hidden');
        loginError.textContent = loginErrors[1];
    }


}catch(e){
    console.log(e)
    loginError.classList.remove('hidden');
    loginError.textContent = loginErrors[1];
}
})