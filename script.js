document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const fileSizeInput = document.getElementById('file-size');
    const fileSizeUnit = document.getElementById('file-size-unit');
    const internetSpeedInput = document.getElementById('internet-speed');
    const internetSpeedUnit = document.getElementById('internet-speed-unit');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError();
        resultContainer.classList.remove('visible');

        const fileSize = parseFloat(fileSizeInput.value);
        const internetSpeed = parseFloat(internetSpeedInput.value);

        if (isNaN(fileSize) || isNaN(internetSpeed) || fileSize <= 0 || internetSpeed <= 0) {
            showError('Please enter valid, positive numbers for file size and internet speed.');
            return;
        }

        // Convert file size to Megabits (Mb)
        let fileSizeInMb = fileSize;
        if (fileSizeUnit.value === 'GB') {
            fileSizeInMb *= 1024; // 1 GB = 1024 MB
        }
        fileSizeInMb *= 8; // 1 MB = 8 Mb

        // Convert internet speed to Megabits per second (Mbps)
        let speedInMbps = internetSpeed;
        switch (internetSpeedUnit.value) {
            case 'MB/s':
                speedInMbps *= 8;
                break;
            case 'Gbps':
                speedInMbps *= 1000;
                break;
            case 'GB/s':
                speedInMbps *= 8 * 1024;
                break;
        }

        const timeInSeconds = fileSizeInMb / speedInMbps;

        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.round(timeInSeconds % 60);

        resultText.textContent = `${minutes} minutes ${seconds} seconds`;
        
        resultContainer.classList.remove('hidden');
        setTimeout(() => {
            resultContainer.classList.add('visible');
        }, 10);
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('visible');
    }

    function hideError() {
        errorMessage.classList.remove('visible');
        errorMessage.classList.add('hidden');
    }
});
