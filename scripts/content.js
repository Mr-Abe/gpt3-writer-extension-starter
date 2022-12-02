/* This file will hold all of our scripts for the frontend of our extension, such as DOM manipulation 🤘. */

const insert = (content) => {
    const elements = document.getElementsByClassName('ProseMirror mousetrap');

    if (elements.length == 0) {
        return;
    }

    const element = elements[0];

    const pToRemove = element.childNodes[0];
    pToRemove.remove();

    const splitContent = content.split('\n');

    splitContent.forEach((content) => {
        const p = document.createElement('p');
      
        if (content === '') {
          const br = document.createElement('br');
          p.appendChild(br);
        } else {
          p.textContent = content;
        }
      
        // Insert into HTML one at a time
        element.appendChild(p);
      });
}

browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.message === 'inject') {
          const { content } = request;
                
          // Call this insert function
          const result = insert(content);
                
          // If something went wrong, send a failed status
          if (!result) {
            sendResponse({ status: 'failed' });
          }
    
          sendResponse({ status: 'success' });
        }
      }
);