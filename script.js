document.getElementById('resumeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const experience = document.getElementById('experience').value;
    const education = document.getElementById('education').value;

    const response = await fetch('/api/resume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, experience, education })
    });

    const data = await response.json();
    if (data.success) {
        document.getElementById('resumeContent').innerHTML = `
            <h3>${data.resume.name}</h3>
            <p>Email: ${data.resume.email}</p>
            <p>Phone: ${data.resume.phone}</p>
            <h4>Experience:</h4>
            <p>${data.resume.experience}</p>
            <h4>Education:</h4>
            <p>${data.resume.education}</p>
        `;
        document.getElementById('resumeDisplay').style.display = 'block';
    }
});

document.getElementById('downloadBtn').addEventListener('click', function () {
    fetch('/api/download', { method: 'POST' })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf';
            document.body.appendChild(a); // Append the <a> element to the body
            a.click(); // Programmatically click the <a> element
            window.URL.revokeObjectURL(url); // Clean up the URL object
            document.body.removeChild(a); // Remove the <a> element
        })
        .catch(error => console.error('Error downloading the PDF:', error));
});
