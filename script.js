const SYNC_URL = "https://script.google.com/macros/s/AKfycbxLi3Z4XDa1P4ZDRutiuZul48QNJEhWTVlAJlqbyXGUvINANpYr32uV0Qh-pXRiF-YPZw/exec";

document.addEventListener("DOMContentLoaded", () => {
    fetch(SYNC_URL)
        .then(response => response.json())
        .then(data => {
            populateAppContent(data);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function populateAppContent(data) {
    const appContent = document.getElementById('app-content');
    
    // Add repertorio
    if (data.repertorio && Array.isArray(data.repertorio)) {
        appContent.innerHTML += `
            <h2>Repertorio</h2>
            <ul>
                ${data.repertorio.map(song => `<li>${song}</li>`).join('')}
            </ul>
        `;
    }

    // Add scalettes
    if (data.scalette && Array.isArray(data.scalette)) {
        appContent.innerHTML += `
            <h2>Scalette</h2>
            <ul>
                ${data.scalette.map(scala => `<li>${scala}</li>`).join('')}
            </ul>
        `;
    }

    // Add other sections as needed
}

// Install prompt for PWA
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.deferredPrompt = event;
});

window.addEventListener('appinstalled', () => {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then(choiceResult => {
            console.log('User chose:', choiceResult);
            window.deferredPrompt = null;
        });
    }
});
