$(document).ready(function() {
  
   // Get the user's operating system, browser, and device type
    const parser = new UAParser();
    const os = parser.getOS().name + ' ' + parser.getOS().version;
    console.log('OS:', os);
    const browser = parser.getBrowser().name + ' ' + parser.getBrowser().version;
    console.log('Browser:', browser);
    const deviceType = parser.getDevice().type || 'Unknown';
    console.log('Device type:', deviceType);
  
    // Get the referrer URL (if any)
    let referrer = document.referrer || 'Direct';
    if (referrer && referrer !== '') {
      const a = document.createElement('a');
      a.href = referrer;
      referrer = a.hostname;
    }
    console.log('Referrer:', referrer);
  
    // Attempt to get the user's IP address using an external API
    $.getJSON("https://api.ipify.org?format=json")
      .done(function(data) {
        const ip = data.ip;
        console.log('IP address:', ip);
  
        // Combine all the user info into a string
        const userInfo = `Operating System: ${os}\nBrowser: ${browser}\nDevice Type: ${deviceType}\nReferrer: ${referrer}\nIP Address: ${ip}`;
  
        // Display the user info in the textarea element
        $('#user-info-display').val(userInfo);
      })
      .fail(function() {
        console.log('Failed to get IP address from API');
  
        // Combine all the user info into a string (without IP address)
        const userInfo = `Operating System: ${os}\nBrowser: ${browser}\nDevice Type: ${deviceType}\nReferrer: ${referrer}\nFailed to get IP address from API`;
  
        // Display the user info in the textarea element
        $('#user-info-display').val(userInfo);
      });


      let completed = false;
      window.addEventListener('scroll', function() {
        const helloWorldContainer = document.querySelector('.helloworldcontainer');
        const helloWorldText = document.querySelector('.helloworld');
        const imagePath = "assets/favicon.png"; // Replace with the actual path to your image
        let scrollvarient = 40;
        
      
        if (window.scrollY > scrollvarient && completed == false) { // Adjust the scroll threshold as needed
          const image = new Image();
          image.src = imagePath;
          image.onload = function() {
            // Set image size and animation
            image.style.width = "40%";
            image.style.height = "auto";
            image.style.transition = "opacity 0.5s ease-in-out";
            image.style.opacity = 0;
            image.style.borderRadius = "10px";
            image.style.boxShadow = "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";

            
      
            // Replace text and animate image in
            helloWorldText.replaceWith(image);
            setTimeout(function() {
              image.style.opacity = 1;
            }, 100); // Adjust delay for animation duration


          };

          
        } 
        
      });
      
      


      /*
      const letters = "AaBbCcDdEeFfGHhIiJKkLlMmNnOoPpQRrSsTtUuVvWwXxYyZz ";
      //const letters = "01";


      let interval = null;
      
      document.querySelector("h1").onmouseover = event => {  
        let iteration = 0;
        
        clearInterval(interval);
        
        interval = setInterval(() => {
          event.target.innerText = event.target.innerText
            .split("")
            .map((letter, index) => {
              if(index < iteration) {
                return event.target.dataset.value[index];
              }
            
              return letters[Math.floor(Math.random() * 26)]
            })
            .join("");
          
          if(iteration >= event.target.dataset.value.length){ 
            clearInterval(interval);
          }
          
          iteration += 1 / 3;
        }, 30);
      }
*/

  });
  