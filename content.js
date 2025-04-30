(function() {
    'use strict';
    
    // CONFIGURABLE VARIABLES //
    const ANIMATION_DURATION = 0.3; // seconds for transitions
    const ANIMATION_DELAY = 50; // milliseconds before starting animation
    const ANIMATION_OFFSET = 10; // pixels for translateY animation
    const PROCESSING_DELAY = 500; // milliseconds between processing comments
    const POPUP_CHECK_INTERVAL = 500; // milliseconds between checks for popup appearance
    const POPUP_MAX_ATTEMPTS = 5; // maximum attempts to check for popup
    const POPUP_CLOSE_DELAY = 500; // milliseconds before closing popup
    const POPUP_FULLY_CLOSED_DELAY = 500; // milliseconds to ensure popup is fully closed
    const REPROCESS_INTERVAL = 15000; // milliseconds between periodic re-processing
    
    // UI STYLE CONSTANTS //
    const PADDING = '4px 8px';
    const BORDER_RADIUS = '4px';
    const FONT_SIZE = '1rem';
    const BORDER_STYLE = '1px solid rgba(128,128,128,0.2)';
    const GENERAL_BACKGROUND = 'var(--yt-spec-general-background-a, #fff)';
    const TEXT_COLOR = 'var(--yt-spec-text-primary, #000)';
    const BADGE_MIN_WIDTH = '180px';
    const BADGE_GAP = '8px';
    const INFO_CONTAINER_GAP = '8px';
    const INFO_CONTAINER_MARGIN = '4px';
    const INFO_COLUMN_GAP = '4px';
    const BADGE_COLUMN_GAP = '8px';
    const ICON_MARGIN = '8px';
    const BADGE_TITLE_FONT_SIZE = '0.9rem';
    const BADGE_TITLE_MARGIN_TOP = '2px';
    const ICON_SIZE = '16px';
    
    // sequential processing control
    let isProcessing = false;
    let processingQueue = [];
    
    /**
     * info box
     * @param {string} icon -> emoji / image
     * @param {string} text -> text
     * @returns {HTMLElement|null}
     */
    function createInfoBox(icon, text) {
        if (!text || text === 'N/A') return null;
        const box = document.createElement('div');
        box.className = 'yt-enhanced-info-item';
        box.innerHTML = icon + ' ' + text;
        styleInfoBox(box);
        return box;
    }
    
    /**
     * badge info box with title and subtitle on separate lines
     * @param {string} icon -> emoji / image
     * @param {string} badgeTitle -> badge title (displayed as bold header)
     * @param {string} badgeSubtitle -> badge subtitle (displayed as smaller text below)
     * @returns {HTMLElement|null}
     */
    function createBadgeBox(icon, badgeTitle, badgeSubtitle) {
        if (!badgeTitle) return null;
        const box = document.createElement('div');
        box.className = 'yt-enhanced-badge-item';
        
        // container for icon and text
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'flex-start';
        container.style.gap = BADGE_GAP;
        
        // icon
        const iconSpan = document.createElement('div');
        iconSpan.innerHTML = icon;
        iconSpan.style.marginRight = ICON_MARGIN;
        iconSpan.style.display = 'flex';
        iconSpan.style.alignItems = 'center';
        iconSpan.style.height = '100%';
        
        // text container for title and subtitle
        const textContainer = document.createElement('div');
        textContainer.style.display = 'flex';
        textContainer.style.flexDirection = 'column';
        
        // title as bold header text
        const titleElem = document.createElement('div');
        titleElem.textContent = badgeTitle;
        titleElem.style.fontWeight = 'bold';
        textContainer.appendChild(titleElem);
        
        // subtitle as smaller text if available
        if (badgeSubtitle) {
            const subtitleElem = document.createElement('div');
            subtitleElem.textContent = badgeSubtitle;
            subtitleElem.style.fontSize = BADGE_TITLE_FONT_SIZE;
            subtitleElem.style.marginTop = BADGE_TITLE_MARGIN_TOP;
            textContainer.appendChild(subtitleElem);
        }
        
        container.appendChild(iconSpan);
        container.appendChild(textContainer);
        box.appendChild(container);
        styleInfoBox(box);
        box.style.minWidth = BADGE_MIN_WIDTH;
        return box;
    }
    
    /**
     * info box styling
     * @param {HTMLElement} el -> styling
     */
    function styleInfoBox(el) {
        el.style.background = GENERAL_BACKGROUND;
        el.style.color = TEXT_COLOR;
        el.style.padding = PADDING;
        el.style.borderRadius = BORDER_RADIUS;
        el.style.border = BORDER_STYLE;
        el.style.fontSize = FONT_SIZE;
        el.style.width = 'fit-content';
        el.style.position = 'relative';
    }
    
    /**
     * profile information from popup
     * @returns {Object} extracted profile information
     */
    function extractProfileInfo() {
        const profileCard = document.querySelector('.yt-profile-card-view-model-wiz');
        if (!profileCard) return null;
        const info = {
            commentsCount: null,
            heartsReceived: null,
            badges: [],
            userName: null
        };
        
        // username
        const usernameElement = profileCard.querySelector('.yt-profile-identity-info-view-model-wiz__metadata-handle-with-bold-font');
        if (usernameElement) {
            info.userName = usernameElement.textContent.trim();
        }
        
        // comments count
        const sectionDescriptions = profileCard.querySelectorAll('.yt-profile-info-view-model-wiz__section-desc');
        if (sectionDescriptions && sectionDescriptions.length > 0) {
            const subtitles = sectionDescriptions[0].querySelectorAll('.yt-profile-info-view-model-wiz__section-subtitle');
            if (subtitles && subtitles.length > 0) {
                info.commentsCount = subtitles[0].textContent.trim();
            }
            
            // hearts received
            const heartIcon = sectionDescriptions[0].querySelector('.yt-profile-info-view-model-wiz__section-heart-icon');
            if (heartIcon) {
                const heartSubtitle = heartIcon.nextElementSibling;
                if (heartSubtitle && heartSubtitle.classList.contains('yt-profile-info-view-model-wiz__section-subtitle')) {
                    info.heartsReceived = heartSubtitle.textContent.trim();
                }
            }
        }
        
        // badge info
        const badgeSection = profileCard.querySelector('.yt-profile-info-view-model-wiz__badge');
        if (badgeSection) {
            const badges = badgeSection.querySelectorAll('.profile-badge-view-model-wiz');
            if (badges && badges.length > 0) {
                badges.forEach(badge => {
                    const badgeInfo = {
                        title: null,
                        subtitle: null,
                        icon: null
                    };
                    
                    // badge title
                    const badgeTitle = badge.querySelector('.profile-badge-view-model-wiz__badge-description');
                    if (badgeTitle) {
                        badgeInfo.title = badgeTitle.textContent.trim();
                    }
                    
                    // badge subtitle
                    const badgeSubtitle = badge.querySelector('.profile-badge-view-model-wiz__badge-subtitle');
                    if (badgeSubtitle) {
                        badgeInfo.subtitle = badgeSubtitle.textContent.trim();
                    }
                    
                    // badge icon
                    const badgeIconElem = badge.querySelector('img');
                    if (badgeIconElem && badgeIconElem.src) {
                        badgeInfo.icon = badgeIconElem.src;
                    }
                    
                    if (badgeInfo) {
                        info.badges.push(badgeInfo);
                    }
                });
            }
        }
        
        return info;
    }
    
    /**
     * click profile picture and wait for popup to extract info
     * @param {HTMLElement} profilePic
     * @returns {Promise<Object>}
     */
    async function getProfileInfo(profilePic) {
        return new Promise((resolve) => {
            profilePic.click();
            
            // wait for popup to appear and extract info
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                const profileInfo = extractProfileInfo();
                if (profileInfo || attempts >= POPUP_MAX_ATTEMPTS) {
                    clearInterval(checkInterval);
                    
                    // delay before closing the popup to ensure complete data extraction
                    setTimeout(() => {
                        // click somewhere else to close the popup
                        document.body.click();
                        
                        // add additional delay to ensure popup is fully closed
                        setTimeout(() => {
                            resolve(profileInfo || {});
                        }, POPUP_FULLY_CLOSED_DELAY);
                    }, POPUP_CLOSE_DELAY);
                }
            }, POPUP_CHECK_INTERVAL);
        });
    }
    
    /**
     * get username from comment element
     * @param {HTMLElement} commentElement
     * @returns {string|null}
     */
    function getUsernameFromComment(commentElement) {
        const authorElement = commentElement.querySelector('#author-text');
        return authorElement ? authorElement.textContent.trim() : null;
    }
    
    /**
     * add profile info to comment
     * @param {HTMLElement} commentElement
     */
    async function addProfileInfo(commentElement) {
        // check if we've already processed this comment
        if (commentElement.querySelector('.yt-profile-info')) {
            processNextInQueue();
            return;
        }
        
        const authorElement = commentElement.querySelector('div#header-author, .author');
        if (!authorElement) {
            processNextInQueue();
            return;
        }
        
        const profilePic = commentElement.querySelector('img.style-scope.yt-img-shadow');
        if (!profilePic) {
            processNextInQueue();
            return;
        }
        
        // get the username from the comment before clicking
        const commentUsername = getUsernameFromComment(commentElement);
        if (!commentUsername) {
            processNextInQueue();
            return;
        }
        
        // container for profile info
        const infoContainer = document.createElement('div');
        infoContainer.className = 'yt-profile-info';
        infoContainer.style.display = 'flex';
        infoContainer.style.flexWrap = 'wrap';
        infoContainer.style.gap = INFO_CONTAINER_GAP;
        infoContainer.style.marginTop = INFO_CONTAINER_MARGIN;
        infoContainer.style.marginBottom = INFO_CONTAINER_MARGIN;
        infoContainer.style.width = '100%';
        infoContainer.style.maxWidth = '800px';
        authorElement.parentNode.insertBefore(infoContainer, authorElement.nextSibling);
        
        try {
            // get profile info from popup
            const profileInfo = await getProfileInfo(profilePic);
            
            // verify username match before proceeding
            if (!profileInfo || !profileInfo.userName || profileInfo.userName !== commentUsername) {
                infoContainer.remove();
                processNextInQueue();
                return;
            }
            
            // comment count & received hearts
            const leftColumn = document.createElement('div');
            leftColumn.style.display = 'flex';
            leftColumn.style.flexDirection = 'column';
            leftColumn.style.gap = INFO_COLUMN_GAP;
            
            // badge(s)
            const rightColumn = document.createElement('div');
            rightColumn.style.display = 'flex';
            rightColumn.style.flexDirection = 'column';
            rightColumn.style.gap = BADGE_COLUMN_GAP;
            
            if (profileInfo.commentsCount) {
                const commentsBox = createInfoBox('💬', profileInfo.commentsCount);
                if (commentsBox) leftColumn.appendChild(commentsBox);
            }
            
            if (profileInfo.heartsReceived) {
                const heartsBox = createInfoBox('❤️', profileInfo.heartsReceived);
                if (heartsBox) leftColumn.appendChild(heartsBox);
            }
            
            if (profileInfo.badges && profileInfo.badges.length > 0) {
                profileInfo.badges.forEach(badge => {
                    let badgeIcon = '';
                    if (badge.icon) {
                        badgeIcon = `<img src="${badge.icon}" style="height: ${ICON_SIZE}; width: ${ICON_SIZE}; vertical-align: middle;">`;
                    }
                    
                    const badgeBox = createBadgeBox(badgeIcon, badge.title, badge.subtitle);
                    if (badgeBox) rightColumn.appendChild(badgeBox);
                });
            }
            
            if (leftColumn.children.length > 0) infoContainer.appendChild(leftColumn);
            if (rightColumn.children.length > 0) infoContainer.appendChild(rightColumn);
            
            if (infoContainer.children.length === 0) {
                infoContainer.remove();
            } else {
                infoContainer.style.opacity = '0';
                infoContainer.style.transform = `translateY(-${ANIMATION_OFFSET}px)`;
                setTimeout(() => {
                    infoContainer.style.transition = `transform ${ANIMATION_DURATION}s ease, opacity ${ANIMATION_DURATION}s ease`;
                    infoContainer.style.transform = 'translateY(0)';
                    infoContainer.style.opacity = '1';
                }, ANIMATION_DELAY);
            }
        } catch (error) {
            infoContainer.remove();
        }
        
        setTimeout(processNextInQueue, PROCESSING_DELAY);
    }
    
    /**
     * process the next comment in the queue
     */
    function processNextInQueue() {
        if (processingQueue.length === 0) {
            isProcessing = false;
            return;
        }
        
        isProcessing = true;
        const nextComment = processingQueue.shift();
        addProfileInfo(nextComment);
    }
    
    /**
     * queue a comment for processing
     * @param {HTMLElement} comment
     */
    function queueCommentForProcessing(comment) {
        // skip if already processed or queued
        if (comment.dataset.processingQueued === 'true' || comment.querySelector('.yt-profile-info')) {
            return;
        }
        
        // mark as queued to prevent duplicate queuing
        comment.dataset.processingQueued = 'true';
        
        // add to processing queue
        processingQueue.push(comment);
        
        // start processing if not already running
        if (!isProcessing) {
            processNextInQueue();
        }
    }
    
    // process existing comments in sequence
    function processExistingComments() {
        const comments = document.querySelectorAll('ytd-comment-view-model');
        comments.forEach(comment => {
            queueCommentForProcessing(comment);
        });
    }
    
    // watch for new comments being added
    const commentObserver = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    // check if the added node is a comment or contains comments
                    if (node.nodeType === 1) {
                        if (node.tagName === 'YTD-COMMENT-VIEW-MODEL') {
                            queueCommentForProcessing(node);
                        } else {
                            // check for comments within the added node
                            const comments = node.querySelectorAll('ytd-comment-view-model');
                            comments.forEach(comment => {
                                queueCommentForProcessing(comment);
                            });
                        }
                    }
                });
            }
        }
    });
    
    // initial setup when page loads
    function initialize() {
        // process any existing comments
        processExistingComments();
        
        // start observing for new comments
        commentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // re-process periodically to catch any missed comments
        setInterval(processExistingComments, REPROCESS_INTERVAL);
    }
    
    // check if page is fully loaded, otherwise wait
    if (document.readyState === 'complete') {
        initialize();
    } else {
        window.addEventListener('load', initialize);
    }
})();