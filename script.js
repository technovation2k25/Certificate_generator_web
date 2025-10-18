// Certificate Generator JavaScript
class CertificateGenerator {
    constructor() {
        this.canvas = document.getElementById('certificateCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.certificateImage = new Image();
        this.certificateImage.src = 'Certificate.png'; // Ensure this image exists in the same directory
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('certificateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateCertificate();
        });

        // College dropdown change
        document.getElementById('college').addEventListener('change', (e) => {
            const customCollegeInput = document.getElementById('customCollege');
            if (e.target.value === 'other') {
                customCollegeInput.style.display = 'block';
                customCollegeInput.required = true;
            } else {
                customCollegeInput.style.display = 'none';
                customCollegeInput.required = false;
                customCollegeInput.value = '';
            }
        });

        // Department dropdown change
        document.getElementById('department').addEventListener('change', (e) => {
            const customDepartmentInput = document.getElementById('customDepartment');
            if (e.target.value === 'other') {
                customDepartmentInput.style.display = 'block';
                customDepartmentInput.required = true;
            } else {
                customDepartmentInput.style.display = 'none';
                customDepartmentInput.required = false;
                customDepartmentInput.value = '';
            }
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadCertificate();
        });

        // Generate new certificate button
        document.getElementById('generateNewBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Wait for certificate image to load
        this.certificateImage.addEventListener('load', () => {
            console.log('Certificate template loaded successfully');
        });

        this.certificateImage.addEventListener('error', () => {
            console.error('Failed to load certificate template');
            this.showMessage('Error: Could not load certificate template. Please check if Certificate.jpg exists.', 'error');
        });
    }

    generateCertificate() {
        const studentName = document.getElementById('studentName').value.trim();
        const year = document.getElementById('year').value;
        const departmentSelect = document.getElementById('department').value;
        const customDepartment = document.getElementById('customDepartment').value.trim();
        const collegeSelect = document.getElementById('college').value;
        const customCollege = document.getElementById('customCollege').value.trim();
        const event = document.getElementById('event').value;

        // Validation
        if (!studentName || !year || !departmentSelect || !event) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        if (collegeSelect === 'other' && !customCollege) {
            this.showMessage('Please enter your college name.', 'error');
            return;
        }

        if (departmentSelect === 'other' && !customDepartment) {
            this.showMessage('Please enter your department name.', 'error');
            return;
        }

        const collegeName = collegeSelect === 'other' ? customCollege : collegeSelect;
        const departmentName = departmentSelect === 'other' ? customDepartment : departmentSelect;
        
        // Combine student name with year and department
        const fullStudentName = `${studentName} - ${year} - ${departmentName}`;

        // Show loading
        const submitBtn = document.querySelector('form button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Generating... <span class="loading"></span>';
        submitBtn.disabled = true;

        // Generate certificate after a short delay to show loading
        setTimeout(() => {
            this.drawCertificate(fullStudentName, collegeName, event);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show certificate section
            document.getElementById('certificateSection').style.display = 'block';
            document.getElementById('certificateSection').scrollIntoView({ behavior: 'smooth' });
            
            this.showMessage('Certificate generated successfully!', 'success');
        }, 1000);
    }

    drawCertificate(studentName, collegeName, eventName) {
        // Clear canvas and draw background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.certificateImage, 0, 0, this.canvas.width, this.canvas.height);

        // Configure text styling for precise alignment
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#000000';
        this.ctx.textBaseline = 'middle';

        // Student Name - single line with font size adjustment for long combined names
        this.drawSingleLineName(studentName.toUpperCase(), 590, 420, 22, 700);

        // College Name - with dynamic fitting for long names
        this.drawFittedText(collegeName.toUpperCase(), 400, 470, 22, 550);

        // Event Name - positioned in the blank space (moved left from center)
        this.ctx.font = 'bold 22px "Times New Roman", serif';
        this.ctx.fillText(eventName.toUpperCase(), 350, 520);

        console.log(`Certificate generated for: ${studentName} from ${collegeName} for ${eventName}`);
    }

    // Dynamic text fitting function for college names
    drawFittedText(text, x, y, baseFontSize, maxWidth) {
        let fontSize = baseFontSize;
        
        // Start with base font size and measure text width
        this.ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
        let textWidth = this.ctx.measureText(text).width;
        
        // If text is too wide, reduce font size until it fits
        while (textWidth > maxWidth && fontSize > 14) {
            fontSize -= 1;
            this.ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
            textWidth = this.ctx.measureText(text).width;
        }
        
        // If text is still too wide even at minimum font size, break into lines
        if (textWidth > maxWidth) {
            this.drawMultiLineText(text, x, y, fontSize, maxWidth);
        } else {
            // Draw single line text
            this.ctx.fillText(text, x, y);
        }
        
        console.log(`College: "${text}" | Font Size: ${fontSize}px | Width: ${textWidth}px | Max: ${maxWidth}px`);
    }

    // Multi-line text drawing for very long college names
    drawMultiLineText(text, x, y, fontSize, maxWidth) {
        this.ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
        
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        // Build lines that fit within maxWidth
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = this.ctx.measureText(testLine).width;
            
            if (testWidth <= maxWidth || !currentLine) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        // Draw multiple lines with adjusted spacing
        const lineHeight = fontSize + 2;
        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            this.ctx.fillText(line, x, startY + (index * lineHeight));
        });
    }

    // Single line text with font size adjustment (for student names with dept/year)
    drawSingleLineName(text, x, y, baseFontSize, maxWidth) {
        let fontSize = baseFontSize;
        
        // Start with base font size and measure text width
        this.ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
        let textWidth = this.ctx.measureText(text).width;
        
        // If text is too wide, reduce font size until it fits (minimum 12px for very long names)
        while (textWidth > maxWidth && fontSize > 12) {
            fontSize -= 0.5; // Reduce by smaller increments for finer control
            this.ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
            textWidth = this.ctx.measureText(text).width;
        }
        
        // If still too wide at minimum font size, use a slightly smaller font
        if (textWidth > maxWidth && fontSize <= 12) {
            fontSize = Math.max(10, fontSize - 1);
            this.ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
        }
        
        // Always draw as single line, perfectly centered
        this.ctx.fillText(text, x, y);
        
        console.log(`Student Name: "${text}" | Font Size: ${fontSize}px | Width: ${textWidth}px | Max: ${maxWidth}px`);
    }

    downloadCertificate() {
        try {
            const studentName = document.getElementById('studentName').value.trim();
            const year = document.getElementById('year').value;
            const departmentSelect = document.getElementById('department').value;
            const customDepartment = document.getElementById('customDepartment').value.trim();
            const departmentName = departmentSelect === 'other' ? customDepartment : departmentSelect;
            const fullStudentName = `${studentName} - ${year} - ${departmentName}`;
            
            // Get canvas data as image
            const canvasData = this.canvas.toDataURL('image/jpeg', 0.95);
            
            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [297, 210] // A4 landscape
            });
            
            // Add the certificate image to PDF
            const imgWidth = 297;
            const imgHeight = 210;
            pdf.addImage(canvasData, 'JPEG', 0, 0, imgWidth, imgHeight);
            
            // Create filename with full student name using underscores
            const fileName = `${fullStudentName.replace(/\s+/g, '_').replace(/-/g, '_')}.pdf`;
            
            // Download the PDF
            pdf.save(fileName);
            
            this.showMessage(`Certificate downloaded as ${fileName}!`, 'success');
        } catch (error) {
            console.error('Download failed:', error);
            this.showMessage('Failed to download certificate. Make sure all fields are filled correctly.', 'error');
        }
    }

    resetForm() {
        // Reset form
        document.getElementById('certificateForm').reset();
        document.getElementById('customCollege').style.display = 'none';
        document.getElementById('customCollege').required = false;
        
        // Hide certificate section
        document.getElementById('certificateSection').style.display = 'none';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.showMessage('Form reset. You can generate a new certificate.', 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        // Insert message at the top of the form section
        const formSection = document.querySelector('.form-section');
        formSection.insertBefore(messageDiv, formSection.firstChild);

        // Auto remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function() {
    // Initialize certificate generator
    const generator = new CertificateGenerator();

    // Student name input - no auto-formatting to avoid editing issues

    // Format custom college input
    const customCollegeInput = document.getElementById('customCollege');
    customCollegeInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });

    // Format custom department input
    const customDepartmentInput = document.getElementById('customDepartment');
    customDepartmentInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter to generate certificate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const form = document.getElementById('certificateForm');
            if (form.checkValidity()) {
                generator.generateCertificate();
            }
        }

        // Escape to reset form
        if (e.key === 'Escape') {
            generator.resetForm();
        }
    });

    // Add form validation styling
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('invalid', function() {
            this.style.borderColor = '#e74c3c';
        });
        
        input.addEventListener('input', function() {
            if (this.validity.valid) {
                this.style.borderColor = '#27ae60';
            } else {
                this.style.borderColor = '#e74c3c';
            }
        });
    });

    console.log('Certificate Generator initialized successfully');
});