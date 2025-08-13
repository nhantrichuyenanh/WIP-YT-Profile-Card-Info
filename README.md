## What is this [add-on](https://addons.mozilla.org/firefox/addon/wip-yt-profile-card-info)?
This is a browser extension designed to make [Profile Cards](https://support.google.com/youtube/answer/9409333) useful by extracting data from it and displaying that data below YouTube comments' handles as info boxes.

## What does this add-on do?
It works by programmatically clicking on the commenter's profile picture to trigger YouTube's Profile Card pop-up. The add-on then extracts specific data points from this pop-up, closes it automatically, and displays the extracted information as info boxes beneath the commenter's handle.

The extracted information includes three primary data types:
- `total comments` the commenter has posted in all videos of a content creator's YouTube channel
- number of `hearts received` from said content creator
- any special `badges` associated with the commenter

## What is the technical implementation of this add-on?
It uses a sophisticated queuing system to sequentially manage profile data extraction, *preventing multiple simultaneous pop-up interactions* that could interfere with each other. Comments are processed one at a time with delays between operations to make sure *information is properly extracted*. Handle verification is included to ensure the extracted profile information matches the intended commenter, *preventing misattribution in cases where pop-up timing issues might occur*.

It also employs mutation observers to detect both existing comments on page load and new comments that appear during scrolling or dynamic loading (sort to Newest, clicking on Replies). This ensures **comprehensive coverage regardless of how user navigate the comment section**.

## What are the known limitations of this add-on?
It faces several inherent constraints due to its operational approach:
- Since it depends on YouTube's profile card interface, any changes to YouTube's DOM structure or CSS classes could break the data extraction functionality.
- The more comments a YouTube video/short/community post has, the more it has to process, and it might miss one or two comments.
- Since YouTube comment section loads dynamically, the user will have to scroll down for more comments to load for the add-on to process more comments. Because of this, it might not include the badge icon for some commenters' info.
- Its operations could interfere with user's interaction, such as while searching in the search box. If user clicks while Profile Card is visible, information might not properly be extracted.

## What is this add-on's purpose?
Because helpful information is hidden in Profile Card, which is practically useless (user must manually **click** commenter's profile picture to access it, and barely anyone does that), this add-on makes it accessible at the user's **fingertips** (no pun intended 😅). For content creators, this information provides immediate context about commenters' activity patterns and community standing. For instance, the `hearts received` indicates how frequently creators have acknowledged them.
