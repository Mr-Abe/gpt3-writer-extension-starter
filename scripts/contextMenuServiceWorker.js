const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
          if (result['openai-key']) {
            const decodedKey = atob(result['openai-key']);
            resolve(decodedKey);
          }
        });
      });
};

const sendMessage = (content) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0].id;
  
      browser.tabs.sendMessage(
        activeTab,
        { message: 'inject', content },
        (response) => {
          if (response.status === 'failed') {
            console.log('injection failed.');
          }
        }
      );
    });
  };

const generate = async (prompt) => {
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';
	
    // Call completions endpoint
    const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.64,
    }),
  });
	
  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
}


const generateCompletionAction = async (info) => {
    try {
        sendMessage('generating...');

        const { selectionText } = info;
        const basePromptPrefix = `
        Write me a harvard business review style title, subtitle and table of contents based on the below selection.
    
        selection:
        `;

        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

        const secondPrompt = `
        Take the table of contents and title of the blog post below and generate an article written in the style of Harvard Business Review. Make it feel like a case study in the form of a story. Don't just list the points. 
        Go deep into each one explaining the why. Include at least 3 tips and complete the article with a conclusion and a call to action.
    
        Title: ${selectionText}
    
        Table of Contents: ${baseCompletion.text}
    
        Article Post:
        
        `;
        
        // Call a second prompt
        const secondPromptCompletion = await generate(secondPrompt);

        sendMessage(secondPromptCompletion.text);
        	
      } catch (error) {
        console.log(error);

        sendMessage(error.toString());
      }
    };

browser.contextMenus.create({
    id: 'context-run',
    title: 'Generate Article',
    contexts: ['selection'],
  });

browser.contextMenus.onClicked.addListener(generateCompletionAction);