let btn=document.querySelector(".btn-close");
let alertBox=document.querySelector(".alert")
btn.addEventListener("click",(event)=>{
    alertBox.classList.add("remove");
    console.dir(event);
})
