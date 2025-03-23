document.addEventListener("DOMContentLoaded", function () {
    function updateProgress(value) {
        if(value>100){
            value=100;
        }
        else if(value<0){
            value=0;
        }
        let maxOffset = 251.2; // The total length of the arc
        let offset = maxOffset - (value / 100) * maxOffset;

        document.getElementById("progress-bar").style.strokeDashoffset = offset;
        document.getElementById("progress-text").textContent = value + "%";
    }

    // Example: Update progress dynamically
    updateProgress(100);  // Change this to test different percentages
});


