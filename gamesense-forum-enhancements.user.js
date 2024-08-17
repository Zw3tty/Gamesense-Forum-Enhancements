// ==UserScript==
// @name         Gamesense Forum Enhancements
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Enhances the Gamesense forum chatbox with error message handling, username checks, usergroup retrieval, and custom CSS injection. Original CSS by Abbie.
// @author       Your Name
// @match        https://gamesense.pub/forums/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/your-username/your-repo/main/gamesense-forum-enhancements.user.js
// @downloadURL  https://raw.githubusercontent.com/your-username/your-repo/main/gamesense-forum-enhancements.user.js
// ==/UserScript==

(function() {
    'use strict';

    const GITHUB_CSS_URL = 'https://raw.githubusercontent.com/your-username/your-repo/main/your-stylesheet.css'; // Replace with your GitHub raw CSS URL

    // Function to inject custom CSS from a GitHub raw URL
    function injectCustomCSS(url) {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                if (response.status === 200) {
                    GM_addStyle(response.responseText);
                } else {
                    console.error("Failed to load custom CSS from:", url);
                }
            },
            onerror: function() {
                console.error("Error while loading custom CSS from:", url);
            }
        });
    }

    // Function to retrieve and apply usergroup class to the logged-in user
    function applyUsergroupClass() {
        const usernameElement = document.querySelector('.brdwelcome strong');
        if (!usernameElement) return;

        const username = usernameElement.textContent.trim();
        const onlineList = document.querySelectorAll('#onlinelist dd a');

        onlineList.forEach(userElement => {
            if (userElement.textContent.trim() === username) {
                const usergroupClass = userElement.className;
                usernameElement.classList.add(usergroupClass);
            }
        });
    }

    function displayCustomErrorMessage() {
        const shoutbox = document.getElementById('shout');
        if (!shoutbox) return;

        // Get the form element inside the shoutbox
        const form = shoutbox.querySelector('form');
        if (!form) return;

        const label = form.querySelector('label span');
        if (label && label.innerHTML.includes('Your connection is <strong>closed</strong>, please <strong>refresh</strong>')) {
            // Preserve the original container size
            shoutbox.style.display = 'flex';
            shoutbox.style.alignItems = 'center';
            shoutbox.style.justifyContent = 'center';
            shoutbox.innerHTML = '';

            // Create and insert the custom error message
            const errorOverlay = document.createElement('div');
            errorOverlay.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                background-color: #272726;
                width: 1152px;
                height: 234px; /* Exact height to match original shoutbox */
                color: #ccc;
                overflow: hidden;
            `;
            errorOverlay.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="60" height="60" viewBox="0 0 20 20" nighteye="disabled">
                    <path fill="#e25950" d="M18.5 19h-18c-0.178 0-0.342-0.094-0.432-0.248s-0.091-0.343-0.004-0.498l9-16c0.089-0.157 0.255-0.255 0.436-0.255s0.347 0.097 0.436 0.255l9 16c0.087 0.155 0.085 0.344-0.004 0.498s-0.254 0.248-0.432 0.248zM1.355 18h16.29l-8.145-14.48-8.145 14.48z"/>
                    <path fill="#e25950" d="M9.5 14c-0.276 0-0.5-0.224-0.5-0.5v-5c0-0.276 0.224-0.5 0.5-0.5s0.5 0.224 0.5 0.5v5c0 0.276-0.224 0.5-0.5 0.5z"/>
                    <path fill="#e25950" d="M9.5 17c-0.276 0-0.5-0.224-0.5-0.5v-1c0-0.276 0.224-0.5 0.5-0.5s0.5 0.224 0.5 0.5z"/>
                </svg>
                <span style="padding: 10px;font-size: 1em;">Your connection is <strong style="color: #fff;">closed</strong>, please <strong style="color: #fff;">refresh</strong></span>
            `;

            shoutbox.appendChild(errorOverlay);
        }
    }

    function addCopyButtonToCodeBlocks() {
        const codeBoxes = document.querySelectorAll('div.codebox');
        codeBoxes.forEach((box) => {
            const codeBlock = box.querySelector('pre > code.hljs');
            const button = document.createElement('button');
            button.textContent = 'Copy Code';
            button.className = 'button';  // Apply the existing "button" class

            button.style.cssText = `
                position: absolute;
                right: 10px;
                top: 10px;
            `;

            button.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy Code';
                    }, 2000);
                });
            });

            // Position the code box relative to allow button positioning
            box.style.position = 'relative';
            box.appendChild(button);

            // Adjust button position on window resize
            const adjustButtonPosition = () => {
                const boxWidth = box.offsetWidth;
                if (boxWidth < 400) {
                    button.style.right = '5px';
                    button.style.top = '5px';
                    button.style.fontSize = '0.8em';
                    button.style.padding = '4px 8px';
                } else {
                    button.style.right = '10px';
                    button.style.top = '10px';
                    button.style.fontSize = '';
                    button.style.padding = '';
                }
            };

            // Initial adjustment and on resize
            adjustButtonPosition();
            window.addEventListener('resize', adjustButtonPosition);
        });
    }

    // Wait for the DOM to load, then display the message and add copy buttons
    window.addEventListener('load', function() {
        // Inject custom CSS
        injectCustomCSS(GITHUB_CSS_URL);

        // Apply usergroup class to logged-in user
        applyUsergroupClass();

        // Set up a MutationObserver to watch for changes in the shoutbox form
        const shoutbox = document.getElementById('shout');
        if (shoutbox) {
            const form = shoutbox.querySelector('form');
            if (form) {
                const observer = new MutationObserver(displayCustomErrorMessage);
                observer.observe(form, { childList: true, subtree: true });
            }

            // Also run the check initially in case the message is already present
            displayCustomErrorMessage();
        }

        // Add copy buttons to code blocks
        addCopyButtonToCodeBlocks();
    });
})();
