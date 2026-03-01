(() => {
	// CONFIGURABLE VARIABLES //
	const ANIMATION_DURATION = 1; // s for transitions
	const ANIMATION_DELAY = 0; // ms before starting animation
	const ANIMATION_OFFSET = 0; // px for translateY animation
	const PROCESSING_DELAY = 1000; // ms between processing comments
	const POPUP_CHECK_INTERVAL = 1000; // ms between checks for popup appearance
	const POPUP_MAX_ATTEMPTS = 10; // maximum attempts to check for popup
	const POPUP_CLOSE_DELAY = 1000; // ms before closing popup
	const POPUP_FULLY_CLOSED_DELAY = 1000; // ms to ensure popup is fully closed
	const REPROCESS_INTERVAL = 10000; // ms between periodic re-processing

	// UI STYLE CONSTANTS //
	const PADDING = "4px 8px";
	const BORDER_RADIUS = "4px";
	const FONT_SIZE = "1rem";
	const SMALL_FONT_SIZE = "0.9rem";
	const BORDER_STYLE = "1px solid rgba(128,128,128,0.2)";
	const GENERAL_BACKGROUND = "var(--yt-spec-base-background)";
	const TEXT_COLOR = "var(--yt-spec-text-primary)";
	const BOX_SHADOW = "0 2px 8px rgba(0,0,0,0.15)";
	const POPUP_ZINDEX = "1000000";
	const COLUMN_GAP_SM = "4px";
	const ICON_SIZE = "16px";

	// SEQUENTIAL PROCESSING //
	let isProcessing = false;
	let processingQueue = [];

	console.log("[WIP] YouTube Profile Card Info: Add-on started");

	// UI HELPERS //
	function applyAnimationStyles(el) {
		el.style.transition = "transform 0.3s ease, opacity 0.3s ease";
		el.style.transform = "translateY(-10px)";
		el.style.opacity = "0";
	}

	function styleInfoBox(el) {
		console.log("[WIP] YouTube Profile Card Info: Styling info box");
		el.style.background = GENERAL_BACKGROUND;
		el.style.color = TEXT_COLOR;
		el.style.padding = PADDING;
		el.style.borderRadius = BORDER_RADIUS;
		el.style.border = BORDER_STYLE;
		el.style.fontSize = FONT_SIZE;
		el.style.width = "fit-content";
		el.style.position = "relative";
	}

	function createInfoBox(icon, text) {
		console.log("[WIP] YouTube Profile Card Info: Creating info box", {
			icon,
			text,
		});
		if (!text || text === "N/A") return null;
		const box = document.createElement("div");
		box.className = "yt-enhanced-info-item";
		const iconSpan = document.createElement("span");
		iconSpan.textContent = icon;
		const textSpan = document.createElement("span");
		textSpan.textContent = " " + text;
		box.appendChild(iconSpan);
		box.appendChild(textSpan);
		styleInfoBox(box);
		return box;
	}

	function createBadgeBox(icon, badgeTitle, badgeSubtitle) {
		console.log("[WIP] YouTube Profile Card Info: Creating badge box", {
			icon,
			badgeTitle,
			badgeSubtitle,
		});
		if (!badgeTitle) return null;
		const box = document.createElement("div");
		box.className = "yt-enhanced-badge-item";

		const container = document.createElement("div");
		container.style.display = "flex";
		container.style.alignItems = "center";
		container.style.gap = "0px";

		const iconSpan = document.createElement("div");
		if (typeof icon === "string" && icon.startsWith("<img")) {
			const img = document.createElement("img");
			const srcMatch = icon.match(/src="([^"]+)"/);
			const styleMatch = icon.match(/style="([^"]+)"/);
			if (srcMatch) img.src = srcMatch[1];
			if (styleMatch) img.style.cssText = styleMatch[1];
			iconSpan.appendChild(img);
		} else {
			iconSpan.textContent = icon;
		}
		iconSpan.style.marginRight = "8px";
		iconSpan.style.display = "flex";
		iconSpan.style.alignItems = "center";
		iconSpan.style.height = "100%";

		const textContainer = document.createElement("div");
		textContainer.style.display = "flex";
		textContainer.style.flexDirection = "column";

		const titleElem = document.createElement("div");
		titleElem.textContent = badgeTitle;
		titleElem.style.fontWeight = "bold";
		textContainer.appendChild(titleElem);

		if (badgeSubtitle) {
			const subtitleElem = document.createElement("div");
			subtitleElem.textContent = badgeSubtitle;
			subtitleElem.style.fontSize = SMALL_FONT_SIZE;
			subtitleElem.style.marginTop = "2px";
			textContainer.appendChild(subtitleElem);
		}

		container.appendChild(iconSpan);
		container.appendChild(textContainer);
		box.appendChild(container);
		styleInfoBox(box);
		box.style.minWidth = "180px";
		return box;
	}

	function createRecentCommentsBox(label, commentEntries) {
		if (!label || !commentEntries || commentEntries.length === 0) return null;

		const wrapper = document.createElement("div");
		wrapper.style.position = "relative";
		wrapper.style.width = "fit-content";

		const box = document.createElement("div");
		box.className = "yt-enhanced-info-item";
		box.textContent = "🗨️ " + label;
		styleInfoBox(box);
		box.style.cursor = "pointer";
		wrapper.appendChild(box);

		let dropdown = null;
		let isOpen = false;

		function closeDropdown() {
			if (dropdown) {
				dropdown.style.transform = "translateY(-10px)";
				dropdown.style.opacity = "0";
				setTimeout(() => {
					if (dropdown) {
						dropdown.remove();
						dropdown = null;
					}
				}, 300);
			}
			isOpen = false;
		}

		box.addEventListener("click", (e) => {
			e.stopPropagation();

			if (isOpen && dropdown) {
				closeDropdown();
				return;
			}

			dropdown = document.createElement("div");
			dropdown.style.position = "absolute";
			dropdown.style.background = GENERAL_BACKGROUND;
			dropdown.style.color = TEXT_COLOR;
			dropdown.style.border = BORDER_STYLE;
			dropdown.style.borderRadius = BORDER_RADIUS;
			dropdown.style.boxShadow = BOX_SHADOW;
			dropdown.style.zIndex = POPUP_ZINDEX;
			dropdown.style.display = "table";
			dropdown.style.borderSpacing = COLUMN_GAP_SM;
			dropdown.style.padding = COLUMN_GAP_SM;
			dropdown.style.maxHeight = "300px";
			dropdown.style.overflowY = "auto";
			applyAnimationStyles(dropdown);

			commentEntries.forEach((entry) => {
				if (!entry.videoTitle && !entry.commentContent) return;

				const row = document.createElement("div");
				row.style.display = "table-row";

				const titleCell = document.createElement("div");
				titleCell.style.display = "table-cell";
				titleCell.style.padding = PADDING;
				titleCell.style.border = BORDER_STYLE;
				titleCell.style.borderRadius = BORDER_RADIUS;
				titleCell.style.fontSize = SMALL_FONT_SIZE;
				titleCell.style.fontWeight = "bold";
				titleCell.style.verticalAlign = "middle";
				titleCell.style.width = "50px";
				titleCell.style.whiteSpace = "normal";
				titleCell.style.wordBreak = "break-word";
				titleCell.textContent = entry.videoTitle || "";

				const contentCell = document.createElement("div");
				contentCell.style.display = "table-cell";
				contentCell.style.padding = PADDING;
				contentCell.style.border = BORDER_STYLE;
				contentCell.style.borderRadius = BORDER_RADIUS;
				contentCell.style.fontSize = SMALL_FONT_SIZE;
				contentCell.style.verticalAlign = "middle";
				contentCell.style.width = "100px";
				contentCell.style.whiteSpace = "normal";
				contentCell.style.wordBreak = "break-word";
				contentCell.textContent = entry.commentContent || "";

				row.appendChild(titleCell);
				row.appendChild(contentCell);
				dropdown.appendChild(row);
			});

			document.body.appendChild(dropdown);
			isOpen = true;

			const rect = box.getBoundingClientRect();
			dropdown.style.top = rect.bottom + window.scrollY + 4 + "px";
			dropdown.style.left = rect.left + window.scrollX + "px";

			requestAnimationFrame(() => {
				dropdown.style.transform = "translateY(0)";
				dropdown.style.opacity = "1";
			});

			const currentDropdown = dropdown;
			function onClickOutside(ev) {
				if (
					!wrapper.contains(ev.target) &&
					!currentDropdown.contains(ev.target)
				) {
					closeDropdown();
					document.removeEventListener("click", onClickOutside);
				}
			}
			document.addEventListener("click", onClickOutside);
		});

		return wrapper;
	}

	function createSubscriptionsBox(label, subEntries) {
		if (!label || !subEntries || subEntries.length === 0) return null;

		const wrapper = document.createElement("div");
		wrapper.style.width = "fit-content";

		const box = document.createElement("div");
		box.className = "yt-enhanced-info-item";
		box.textContent = "🔔 " + label;
		styleInfoBox(box);
		wrapper.appendChild(box);

		let tooltip = null;

		box.addEventListener("mouseover", () => {
			if (tooltip) return;

			tooltip = document.createElement("div");
			tooltip.style.position = "absolute";
			tooltip.style.background = GENERAL_BACKGROUND;
			tooltip.style.color = TEXT_COLOR;
			tooltip.style.border = BORDER_STYLE;
			tooltip.style.borderRadius = BORDER_RADIUS;
			tooltip.style.boxShadow = BOX_SHADOW;
			tooltip.style.zIndex = POPUP_ZINDEX;
			tooltip.style.display = "table";
			tooltip.style.borderSpacing = COLUMN_GAP_SM;
			tooltip.style.padding = COLUMN_GAP_SM;
			tooltip.style.maxHeight = "300px";
			tooltip.style.overflowY = "auto";
			applyAnimationStyles(tooltip);

			subEntries.forEach((entry) => {
				if (!entry.avatarSrc && !entry.channelName) return;

				const row = document.createElement("div");
				row.style.display = "table-row";

				const avatarCell = document.createElement("div");
				avatarCell.style.display = "table-cell";
				avatarCell.style.padding = PADDING;
				avatarCell.style.border = BORDER_STYLE;
				avatarCell.style.borderRadius = BORDER_RADIUS;
				avatarCell.style.verticalAlign = "middle";
				avatarCell.style.textAlign = "center";
				if (entry.avatarSrc) {
					const img = document.createElement("img");
					img.src = entry.avatarSrc;
					img.style.width = ICON_SIZE;
					img.style.height = ICON_SIZE;
					img.style.borderRadius = "50%";
					img.style.display = "block";
					avatarCell.appendChild(img);
				}

				const nameCell = document.createElement("div");
				nameCell.style.display = "table-cell";
				nameCell.style.padding = PADDING;
				nameCell.style.border = BORDER_STYLE;
				nameCell.style.borderRadius = BORDER_RADIUS;
				nameCell.style.fontSize = SMALL_FONT_SIZE;
				nameCell.style.verticalAlign = "middle";
				nameCell.textContent = entry.channelName || "";

				row.appendChild(avatarCell);
				row.appendChild(nameCell);
				tooltip.appendChild(row);
			});

			document.body.appendChild(tooltip);

			const rect = box.getBoundingClientRect();
			tooltip.style.top = rect.bottom + window.scrollY + 4 + "px";
			tooltip.style.left = rect.left + window.scrollX + "px";

			requestAnimationFrame(() => {
				tooltip.style.transform = "translateY(0)";
				tooltip.style.opacity = "1";
			});
		});

		box.addEventListener("mouseout", () => {
			if (tooltip) {
				tooltip.style.transform = "translateY(-10px)";
				tooltip.style.opacity = "0";
				setTimeout(() => {
					if (tooltip) {
						tooltip.remove();
						tooltip = null;
					}
				}, 300);
			}
		});

		return wrapper;
	}

	// DATA EXTRACTION //
	function extractProfileInfo() {
		console.log(
			"[WIP] YouTube Profile Card Info: Extracting profile info from popup",
		);
		const profileCard = document.querySelector(".ytProfileCardViewModelHost");
		if (!profileCard) {
			console.log("[WIP] YouTube Profile Card Info: No profile card found");
			return null;
		}

		const info = {
			userName: null,
			commentsCount: null,
			heartsReceived: null,
			pronouns: null,
			badges: [],
			recentCommentsLabel: null,
			recentComments: [],
			subscriptionsLabel: null,
			subscriptions: [],
		};

		// username
		const usernameElement = profileCard.querySelector(
			".yt-profile-identity-info-view-model__metadata-handle-with-bold-font",
		);
		if (usernameElement) {
			info.userName = usernameElement.textContent.trim();
			console.log(
				"[WIP] YouTube Profile Card Info: Username found",
				info.userName,
			);
		}

		// comments count + hearts received
		const sectionDescriptions = profileCard.querySelectorAll(
			".ytProfileInfoViewModelSectionDesc",
		);
		if (sectionDescriptions.length > 0) {
			const subtitles = sectionDescriptions[0].querySelectorAll(
				".ytProfileInfoViewModelSectionSubtitle",
			);
			if (subtitles.length > 0) {
				info.commentsCount = subtitles[0].textContent.trim();
				console.log(
					"[WIP] YouTube Profile Card Info: Comments count found",
					info.commentsCount,
				);
			}

			const heartIcon = sectionDescriptions[0].querySelector(
				".ytProfileInfoViewModelSectionHeartIcon",
			);
			if (heartIcon) {
				const heartSubtitle = heartIcon.nextElementSibling;
				if (
					heartSubtitle &&
					heartSubtitle.classList.contains(
						"ytProfileInfoViewModelSectionSubtitle",
					)
				) {
					info.heartsReceived = heartSubtitle.textContent.trim();
					console.log(
						"[WIP] YouTube Profile Card Info: Hearts received found",
						info.heartsReceived,
					);
				}
			}
		}

		// pronouns
		const pronounsElem = profileCard.querySelector(
			".yt-profile-identity-info-view-model__metadata-pronouns",
		);
		if (pronounsElem) {
			info.pronouns = pronounsElem.textContent.trim();
			console.log(
				"[WIP] YouTube Profile Card Info: Pronouns found",
				info.pronouns,
			);
		}

		// badges
		const badgeSection = profileCard.querySelector(
			".ytProfileInfoViewModelBadge",
		);
		if (badgeSection) {
			badgeSection
				.querySelectorAll(".profileBadgeViewModelHost")
				.forEach((badge) => {
					const badgeInfo = { title: null, subtitle: null, icon: null };

					const badgeTitleElem = badge.querySelector(
						".profileBadgeViewModelBadgeDescription",
					);
					if (badgeTitleElem)
						badgeInfo.title = badgeTitleElem.textContent.trim();

					const badgeSubtitleElem = badge.querySelector(
						".profileBadgeViewModelBadgeSubtitle",
					);
					if (badgeSubtitleElem)
						badgeInfo.subtitle = badgeSubtitleElem.textContent.trim();

					const badgeIconElem = badge.querySelector("img");
					if (badgeIconElem) badgeInfo.icon = badgeIconElem.src;

					info.badges.push(badgeInfo);
					console.log(
						"[WIP] YouTube Profile Card Info: Badge info found",
						badgeInfo,
					);
				});
		}

		// recent comments
		const allHeaderSections = profileCard.querySelectorAll(
			".ytProfileInfoViewModelHeader",
		);
		for (const headerSection of allHeaderSections) {
			const parentActivity = headerSection.closest(
				".ytProfileInfoViewModelActivity",
			);
			if (
				parentActivity &&
				parentActivity.querySelector(".ytCommentInteractionViewModelFrame")
			) {
				const headerTitle = headerSection.querySelector(
					".ytProfileInfoViewModelSectionTitle",
				);
				if (headerTitle) {
					info.recentCommentsLabel = headerTitle.textContent.trim();
					console.log(
						"[WIP] YouTube Profile Card Info: Recent comments label found",
						info.recentCommentsLabel,
					);
				}
				break;
			}
		}

		profileCard
			.querySelectorAll(".ytCommentInteractionViewModelFrame")
			.forEach((frame) => {
				const videoTitleElem = frame.querySelector(
					".ytCommentInteractionViewModelVideoTitle",
				);
				const commentContentElem = frame.querySelector(
					".ytCommentInteractionViewModelCommentContent",
				);

				// title is the last text node with length > 1 (skips Commented on ")
				let videoTitle = null;
				if (videoTitleElem) {
					const textNodes = Array.from(videoTitleElem.childNodes).filter(
						(n) =>
							n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 1,
					);
					videoTitle =
						textNodes.length > 0
							? textNodes[textNodes.length - 1].textContent.trim()
							: null;
				}

				const commentContent = commentContentElem
					? commentContentElem.textContent.trim()
					: null;
				if (videoTitle || commentContent)
					info.recentComments.push({ videoTitle, commentContent });
			});
		console.log(
			"[WIP] YouTube Profile Card Info: Recent comments scraped",
			info.recentComments,
		);

		// subscriptions
		const subHeaderSection = profileCard.querySelector(
			".ytProfileInfoViewModelSubHeader",
		);
		if (subHeaderSection) {
			const subHeaderTitle = subHeaderSection.querySelector(
				".ytProfileInfoViewModelSectionTitle",
			);
			if (subHeaderTitle) {
				info.subscriptionsLabel = subHeaderTitle.textContent.trim();
				console.log(
					"[WIP] YouTube Profile Card Info: Subscriptions label found",
					info.subscriptionsLabel,
				);
			}
		}

		profileCard
			.querySelectorAll(".ytProfileInfoViewModelSub")
			.forEach((sub) => {
				const imgElem = sub.querySelector("avatar-view-model img");
				const nameElem = sub.querySelector(
					".ytSharedSubscriptionViewModelChannelName",
				);
				const avatarSrc = imgElem ? imgElem.src : null;
				const channelName = nameElem ? nameElem.textContent.trim() : null;
				if (avatarSrc || channelName)
					info.subscriptions.push({ avatarSrc, channelName });
			});
		console.log(
			"[WIP] YouTube Profile Card Info: Subscriptions scraped",
			info.subscriptions,
		);

		return info;
	}

	async function getProfileInfo(profilePic) {
		console.log(
			"[WIP] YouTube Profile Card Info: Getting profile info for profilePic",
			profilePic,
		);
		return new Promise((resolve) => {
			profilePic.click();
			console.log("[WIP] YouTube Profile Card Info: Profile picture clicked");

			let attempts = 0;
			const checkInterval = setInterval(() => {
				attempts++;
				console.log(
					"[WIP] YouTube Profile Card Info: Checking for popup, attempt",
					attempts,
				);
				const profileInfo = extractProfileInfo();
				if (profileInfo || attempts >= POPUP_MAX_ATTEMPTS) {
					clearInterval(checkInterval);
					console.log(
						"[WIP] YouTube Profile Card Info: Popup found or max attempts reached",
					);
					setTimeout(() => {
						document.body.click();
						console.log("[WIP] YouTube Profile Card Info: Closing popup");
						setTimeout(() => {
							console.log(
								"[WIP] YouTube Profile Card Info: Profile info resolved",
								profileInfo,
							);
							resolve(profileInfo || {});
						}, POPUP_FULLY_CLOSED_DELAY);
					}, POPUP_CLOSE_DELAY);
				}
			}, POPUP_CHECK_INTERVAL);
		});
	}

	function getUsernameFromComment(commentElement) {
		const authorElement = commentElement.querySelector("#author-text");
		const username = authorElement ? authorElement.textContent.trim() : null;
		console.log(
			"[WIP] YouTube Profile Card Info: Username from comment",
			username,
		);
		return username;
	}

	// COMMENT PROCESSING //
	async function addProfileInfo(commentElement) {
		console.log(
			"[WIP] YouTube Profile Card Info: Adding profile info to comment",
			commentElement,
		);
		if (commentElement.querySelector(".yt-profile-info")) {
			console.log("[WIP] YouTube Profile Card Info: Comment already processed");
			processNextInQueue();
			return;
		}

		const authorElement = commentElement.querySelector(
			"div#header-author, .author",
		);
		if (!authorElement) {
			console.log("[WIP] YouTube Profile Card Info: No author element found");
			processNextInQueue();
			return;
		}

		const profilePic = commentElement.querySelector(
			"img.style-scope.yt-img-shadow",
		);
		if (!profilePic) {
			console.log("[WIP] YouTube Profile Card Info: No profile picture found");
			processNextInQueue();
			return;
		}

		const commentUsername = getUsernameFromComment(commentElement);
		if (!commentUsername) {
			console.log(
				"[WIP] YouTube Profile Card Info: No username found in comment",
			);
			processNextInQueue();
			return;
		}

		const infoContainer = document.createElement("div");
		infoContainer.className = "yt-profile-info";
		infoContainer.style.display = "flex";
		infoContainer.style.flexWrap = "wrap";
		infoContainer.style.gap = "8px";
		infoContainer.style.marginTop = "4px";
		infoContainer.style.marginBottom = "4px";
		infoContainer.style.width = "100%";
		infoContainer.style.maxWidth = "800px";
		authorElement.parentNode.insertBefore(
			infoContainer,
			authorElement.nextSibling,
		);
		console.log("[WIP] YouTube Profile Card Info: Info container inserted");

		try {
			const profileInfo = await getProfileInfo(profilePic);
			console.log(
				"[WIP] YouTube Profile Card Info: Profile info received",
				profileInfo,
			);

			if (
				!profileInfo ||
				!profileInfo.userName ||
				profileInfo.userName !== commentUsername
			) {
				console.log(
					"[WIP] YouTube Profile Card Info: Username mismatch or no profile info",
				);
				infoContainer.remove();
				processNextInQueue();
				return;
			}

			// left column: comments count, hearts received, pronouns
			const leftColumn = document.createElement("div");
			leftColumn.style.display = "flex";
			leftColumn.style.flexDirection = "column";
			leftColumn.style.gap = COLUMN_GAP_SM;

			// middle column: badges
			const middleColumn = document.createElement("div");
			middleColumn.style.display = "flex";
			middleColumn.style.flexDirection = "column";
			middleColumn.style.gap = "8px";

			// right column: recent comments, subscriptions
			const rightColumn = document.createElement("div");
			rightColumn.style.display = "flex";
			rightColumn.style.flexDirection = "column";
			rightColumn.style.gap = COLUMN_GAP_SM;

			if (profileInfo.commentsCount) {
				const commentsBox = createInfoBox("💬", profileInfo.commentsCount);
				if (commentsBox) leftColumn.appendChild(commentsBox);
			}
			if (profileInfo.heartsReceived) {
				const heartsBox = createInfoBox("❤️", profileInfo.heartsReceived);
				if (heartsBox) leftColumn.appendChild(heartsBox);
			}
			if (profileInfo.pronouns) {
				const pronounsBox = createInfoBox("👤", profileInfo.pronouns);
				if (pronounsBox) leftColumn.appendChild(pronounsBox);
			}

			if (profileInfo.badges.length > 0) {
				profileInfo.badges.forEach((badge) => {
					const badgeIcon = badge.icon
						? `<img src="${badge.icon}" style="height:${ICON_SIZE};width:${ICON_SIZE};vertical-align:middle;">`
						: "";
					const badgeBox = createBadgeBox(
						badgeIcon,
						badge.title,
						badge.subtitle,
					);
					if (badgeBox) middleColumn.appendChild(badgeBox);
				});
			}

			if (
				profileInfo.recentCommentsLabel &&
				profileInfo.recentComments.length > 0
			) {
				const recentCommentsBox = createRecentCommentsBox(
					profileInfo.recentCommentsLabel,
					profileInfo.recentComments,
				);
				if (recentCommentsBox) rightColumn.appendChild(recentCommentsBox);
			}
			if (
				profileInfo.subscriptionsLabel &&
				profileInfo.subscriptions.length > 0
			) {
				const subscriptionsBox = createSubscriptionsBox(
					profileInfo.subscriptionsLabel,
					profileInfo.subscriptions,
				);
				if (subscriptionsBox) rightColumn.appendChild(subscriptionsBox);
			}

			if (leftColumn.children.length > 0) infoContainer.appendChild(leftColumn);
			if (middleColumn.children.length > 0)
				infoContainer.appendChild(middleColumn);
			if (rightColumn.children.length > 0)
				infoContainer.appendChild(rightColumn);

			if (infoContainer.children.length === 0) {
				console.log(
					"[WIP] YouTube Profile Card Info: No info to display, removing container",
				);
				infoContainer.remove();
			} else {
				infoContainer.style.opacity = "0";
				infoContainer.style.transform = `translateY(-${ANIMATION_OFFSET}px)`;
				setTimeout(() => {
					infoContainer.style.transition = `transform ${ANIMATION_DURATION}s ease, opacity ${ANIMATION_DURATION}s ease`;
					infoContainer.style.transform = "translateY(0)";
					infoContainer.style.opacity = "1";
					console.log(
						"[WIP] YouTube Profile Card Info: Info container animated in",
					);
				}, ANIMATION_DELAY);
			}
		} catch (error) {
			console.log(
				"[WIP] YouTube Profile Card Info: Error adding profile info",
				error,
			);
			infoContainer.remove();
		}

		setTimeout(processNextInQueue, PROCESSING_DELAY);
	}

	function processNextInQueue() {
		console.log("[WIP] YouTube Profile Card Info: Processing next in queue");
		if (processingQueue.length === 0) {
			isProcessing = false;
			console.log("[WIP] YouTube Profile Card Info: Processing queue empty");
			return;
		}
		isProcessing = true;
		addProfileInfo(processingQueue.shift());
	}

	function queueCommentForProcessing(comment) {
		if (
			comment.dataset.processingQueued === "true" ||
			comment.querySelector(".yt-profile-info")
		) {
			console.log(
				"[WIP] YouTube Profile Card Info: Comment already queued or processed",
			);
			return;
		}
		comment.dataset.processingQueued = "true";
		processingQueue.push(comment);
		console.log(
			"[WIP] YouTube Profile Card Info: Comment queued for processing",
			comment,
		);
		if (!isProcessing) processNextInQueue();
	}

	function processExistingComments() {
		console.log(
			"[WIP] YouTube Profile Card Info: Processing existing comments",
		);
		document
			.querySelectorAll("ytd-comment-view-model")
			.forEach(queueCommentForProcessing);
	}

	// OBSERVERS & INIT //
	const commentObserver = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList") {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType !== 1) return;
					if (node.tagName === "YTD-COMMENT-VIEW-MODEL") {
						console.log(
							"[WIP] YouTube Profile Card Info: New comment node added",
						);
						queueCommentForProcessing(node);
					} else {
						node
							.querySelectorAll("ytd-comment-view-model")
							.forEach((comment) => {
								console.log(
									"[WIP] YouTube Profile Card Info: New comment found within added node",
								);
								queueCommentForProcessing(comment);
							});
					}
				});
			}
		}
	});

	function initialize() {
		console.log("[WIP] YouTube Profile Card Info: Initializing");
		processExistingComments();
		commentObserver.observe(document.body, { childList: true, subtree: true });
		setInterval(processExistingComments, REPROCESS_INTERVAL);
	}

	if (document.readyState === "complete") {
		console.log(
			"[WIP] YouTube Profile Card Info: Document ready, initializing",
		);
		initialize();
	} else {
		window.addEventListener("load", initialize);
	}
})();
