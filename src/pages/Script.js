window.onload = function () {
    const textElements = document.querySelector(".typewriter-text");
    if (!textElements) {
        console.error("Element '.typewriter-text' not found!");
        return;
    }
    typeWriter();
};

function hamburg() {
    const navbar = document.querySelector(".dropdown");
    if (navbar) {
        navbar.style.transform = "translateY(0px)";
    } else {
        console.error("Element '.dropdown' not found!");
    }
}

function cancel() {
    const navbar = document.querySelector(".dropdown");
    if (navbar) {
        navbar.style.transform = "translateY(-500px)";
    } else {
        console.error("Element '.dropdown' not found!");
    }
}

const texts = ["DONOR", "PATIENT"];
let speed = 100;
let textIndex = 0;
let charcterIndex = 0;

function typeWriter() {
    const textElements = document.querySelector(".typewriter-text");
    if (!textElements) return;

    if (charcterIndex < texts[textIndex].length) {
        textElements.textContent += texts[textIndex].charAt(charcterIndex);
        charcterIndex++;
        setTimeout(typeWriter, speed);
    } else {
        setTimeout(eraseText, 1000);
    }
}

function eraseText() {
    const textElements = document.querySelector(".typewriter-text");
    if (!textElements) return;

    if (textElements.textContent.length > 0) {
        textElements.textContent = textElements.textContent.slice(0, -1);
        setTimeout(eraseText, 50);
    } else {
        textIndex = (textIndex + 1) % texts.length;
        charcterIndex = 0;
        setTimeout(typeWriter, 500);
    }
}
