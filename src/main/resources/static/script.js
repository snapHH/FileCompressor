document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const compressBtn = document.getElementById('compressBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = progressBar.querySelector('.progress');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('dragover');
    }

    function unhighlight() {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        updateFileName();
    }

    fileInput.addEventListener('change', updateFileName);

    function updateFileName() {
        const fileName = fileInput.files[0] ? fileInput.files[0].name : 'Choose a file or drag it here';
        uploadArea.querySelector('span').textContent = fileName;
    }
});

async function compressFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const progressBar = document.getElementById('progressBar');
    const progress = progressBar.querySelector('.progress');
    progressBar.style.display = 'block';

    try {
        const response = await fetch('/api/files/compress', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            let receivedLength = 0;
            let chunks = [];

            while(true) {
                const {done, value} = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;
                const percentComplete = (receivedLength / contentLength) * 100;
                progress.style.width = percentComplete + '%';
            }

            const blob = new Blob(chunks);
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${file.name}.zip`;
            link.textContent = "Download Compressed File";
            link.className = 'download-link';
            document.getElementById('downloadLink').innerHTML = "";
            document.getElementById('downloadLink').appendChild(link);
        } else {
            alert("Failed to compress file.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred.");
    } finally {
        progressBar.style.display = 'none';
    }
}