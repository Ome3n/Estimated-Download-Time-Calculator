document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();

    if (page === 'index.html' || page === '') {
        setupCalculator();
    } else if (page === 'converter.html') {
        setupConverter();
    }
});

function setupCalculator() {
    const modeSelect = document.getElementById('calculation-mode');
    const form = document.getElementById('calculator-form');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const errorMessage = document.getElementById('error-message');

    const fileSizeGroup = document.getElementById('file-size-group');
    const speedGroup = document.getElementById('internet-speed-group');
    const timeGroup = document.getElementById('download-time-group');

    const fileSizeInput = document.getElementById('file-size');
    const fileSizeUnit = document.getElementById('file-size-unit');
    const speedInput = document.getElementById('internet-speed');
    const speedUnit = document.getElementById('internet-speed-unit');
    const timeInput = document.getElementById('download-time');
    const timeUnit = document.getElementById('download-time-unit');

    modeSelect.addEventListener('change', () => {
        updateFormVisibility(modeSelect.value);
        clearForm();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError();
        resultContainer.classList.remove('visible');

        // Add pop animation to the button
        const calculateButton = form.querySelector('button[type="submit"]');
        calculateButton.classList.add('pop-animation');
        setTimeout(() => {
            calculateButton.classList.remove('pop-animation');
        }, 300);

        try {
            const result = calculate(modeSelect.value);
            displayResult(result);
        } catch (error) {
            showError(error.message);
        }
    });

    // Unit conversion listeners
    fileSizeUnit.addEventListener('change', () => handleUnitChange(fileSizeInput, fileSizeUnit, { 'MB': 1, 'GB': 1024 }));
    speedUnit.addEventListener('change', () => handleUnitChange(speedInput, speedUnit, { 'Mbps': 1, 'MB/s': 8, 'Gbps': 1000, 'GB/s': 8192 }));
    timeUnit.addEventListener('change', () => handleUnitChange(timeInput, timeUnit, { 'seconds': 1, 'minutes': 60 }));

    function updateFormVisibility(mode) {
        fileSizeGroup.style.display = 'none';
        speedGroup.style.display = 'none';
        timeGroup.style.display = 'none';

        if (mode === 'time') {
            fileSizeGroup.style.display = 'block';
            speedGroup.style.display = 'block';
        } else if (mode === 'size') {
            speedGroup.style.display = 'block';
            timeGroup.style.display = 'block';
        } else if (mode === 'speed') {
            fileSizeGroup.style.display = 'block';
            timeGroup.style.display = 'block';
        }
    }

    function calculate(mode) {
        if (mode === 'time') {
            const { size, speed } = getInputs(['size', 'speed']);
            const timeInSeconds = (size * 8) / speed;
            return formatTime(timeInSeconds);
        } else if (mode === 'size') {
            const { speed, time } = getInputs(['speed', 'time']);
            const sizeInMb = (speed * time) / 8;
            return formatSize(sizeInMb);
        } else if (mode === 'speed') {
            const { size, time } = getInputs(['size', 'time']);
            const speedInMbps = (size * 8) / time;
            return formatSpeed(speedInMbps);
        }
    }

    function getInputs(required) {
        const inputs = {};
        if (required.includes('size')) {
            const size = parseFloat(fileSizeInput.value);
            if (isNaN(size) || size <= 0) throw new Error('Please enter a valid file size.');
            inputs.size = convertToMb(size, fileSizeUnit.value);
        }
        if (required.includes('speed')) {
            const speed = parseFloat(speedInput.value);
            if (isNaN(speed) || speed <= 0) throw new Error('Please enter a valid internet speed.');
            inputs.speed = convertToMbps(speed, speedUnit.value);
        }
        if (required.includes('time')) {
            const time = parseFloat(timeInput.value);
            if (isNaN(time) || time <= 0) throw new Error('Please enter a valid download time.');
            inputs.time = convertToSeconds(time, timeUnit.value);
        }
        return inputs;
    }

    function displayResult(result) {
        resultText.innerHTML = result;
        resultContainer.classList.remove('hidden');
        setTimeout(() => resultContainer.classList.add('visible'), 10);
    }

    function clearForm() {
        form.reset();
        resultContainer.classList.remove('visible');
        hideError();
    }

    updateFormVisibility('time'); // Initial setup
}

function setupConverter() {
    const speed1Input = document.getElementById('speed1');
    const speed1Unit = document.getElementById('speed1-unit');
    const speed2Input = document.getElementById('speed2');
    const speed2Unit = document.getElementById('speed2-unit');
    const swapBtn = document.getElementById('swap-units-btn');

    speed1Input.addEventListener('input', () => convertSpeed(speed1Input, speed1Unit, speed2Input, speed2Unit));
    speed1Unit.addEventListener('change', () => convertSpeed(speed1Input, speed1Unit, speed2Input, speed2Unit));
    speed2Input.addEventListener('input', () => convertSpeed(speed2Input, speed2Unit, speed1Input, speed1Unit));
    speed2Unit.addEventListener('change', () => convertSpeed(speed2Input, speed2Unit, speed1Input, speed1Unit));

    swapBtn.addEventListener('click', () => {
        const tempUnit = speed1Unit.value;
        speed1Unit.value = speed2Unit.value;
        speed2Unit.value = tempUnit;

        // Trigger conversion after swapping
        convertSpeed(speed1Input, speed1Unit, speed2Input, speed2Unit);
    });
}

function convertSpeed(input, inputUnit, output, outputUnit) {
    const inputValue = parseFloat(input.value);
    if (isNaN(inputValue)) {
        output.value = '';
        return;
    }

    const valueInMbps = convertToMbps(inputValue, inputUnit.value);
    const outputValue = convertFromMbps(valueInMbps, outputUnit.value);

    output.value = parseFloat(outputValue.toFixed(5));
}

// --- Unit Conversion Utilities ---

function handleUnitChange(input, unitSelect, factors) {
    const currentValue = parseFloat(input.value);
    if (isNaN(currentValue)) return;

    const oldUnit = unitSelect.dataset.previousUnit || unitSelect.options[0].value;
    const newUnit = unitSelect.value;

    if (oldUnit === newUnit) return;

    const oldValueInBase = currentValue * (factors[oldUnit] || 1);
    const newValue = oldValueInBase / (factors[newUnit] || 1);

    input.value = parseFloat(newValue.toFixed(5));
    unitSelect.dataset.previousUnit = newUnit;
}

function convertToMb(value, unit) {
    if (unit === 'GB') return value * 1024; // to MB
    return value; // is already MB
}

function convertToMbps(value, unit) {
    switch (unit) {
        case 'MB/s': return value * 8;
        case 'Gbps': return value * 1000;
        case 'GB/s': return value * 8 * 1024;
        default: return value; // is already Mbps
    }
}

function convertToSeconds(value, unit) {
    if (unit === 'minutes') return value * 60;
    return value; // is already seconds
}

function convertFromMbps(value, unit) {
    switch (unit) {
        case 'MB/s': return value / 8;
        case 'Gbps': return value / 1000;
        case 'GB/s': return value / (8 * 1024);
        default: return value; // is already Mbps
    }
}

// --- Formatting Utilities ---

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes} min ${secs} sec`;
}

function formatSize(sizeInMb) {
    if (sizeInMb >= 1024) {
        return `${(sizeInMb / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMb.toFixed(2)} MB`;
}

function formatSpeed(speedInMbps) {
    if (speedInMbps >= 1000) {
        return `${(speedInMbps / 1000).toFixed(2)} Gbps`;
    }
    return `${speedInMbps.toFixed(2)} Mbps`;
}

// --- Error Handling ---

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('visible');
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.classList.remove('visible');
        errorMessage.classList.add('hidden');
    }
}

// Store previous unit for conversion
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('focus', (e) => {
        e.target.dataset.previousUnit = e.target.value;
    });
});