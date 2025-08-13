> What is this [add-on](https://addons.mozilla.org/firefox/addon/wip-yt-profile-card-info)?

This is a browser extension designed to make [Profile Cards](https://support.google.com/youtube/answer/9409333) useful by extracting data from it and displaying that data below YouTube comments' handles as info boxes.

> What does this add-on do?

It works by programmatically clicks on the commenter's profile picture to trigger YouTube's profile card popup. The add-on then extracts specific data points from this popup, closes it automatically, and displays the extracted information as info boxes beneath the commenter's handle.

The extracted information includes three primary data types:
- total comments the commenter has posted in all videos of a content creator's YouTube channel
- number of hearts received from said content creator
- any special badges associated with the commenter.

> What is this add-on's technical implementation?

The extension uses a sophisticated queuing system to manage profile data extraction sequentially, preventing multiple simultaneous popup interactions that could interfere with each other. Comments are processed one at a time with configurable delays between operations.

The system employs mutation observers to detect both existing comments on page load and new comments that appear during scrolling or dynamic loading (sort to Newest, clicking on Replies). This ensures comprehensive coverage regardless of how users navigate the comment section.


Data extraction relies on 
specific CSS selectors to locate elements within YouTube's profile card 
structure. The extension includes username verification to ensure the 
extracted profile data matches the intended comment author, preventing 
misattribution in cases where popup timing issues might occur.


Known Limitations


The extension faces several 
inherent constraints due to its operational approach. Since it depends 
on YouTube's profile card interface, any changes to YouTube's DOM 
structure or CSS classes could break the data extraction functionality. 
The extension currently targets specific URL patterns for YouTube 
videos, shorts, and community posts, which may not cover all areas where
 comments appear.


The sequential processing 
requirement introduces noticeable delays, particularly on pages with 
numerous comments. Each profile lookup requires opening and closing a 
popup, creating a processing bottleneck that becomes more apparent as 
comment volume increases.


The extension cannot extract 
profile information for users whose profiles are set to private or 
restricted, and it may encounter issues with comments from channels that
 have been deleted or suspended since the comment was posted.


Purpose and Value Proposition


The extension addresses a gap 
in YouTube's native comment interface by surfacing contextual 
information that typically requires manual investigation. Users can 
quickly assess a commenter's engagement level and credibility without 
needing to click through to individual profiles.


For content creators and 
community moderators, this information provides immediate context about 
comment authors' activity patterns and community standing. The hearts 
received metric indicates how frequently creators have acknowledged a 
user's contributions, while the comment count suggests their overall 
participation level across the platform.


The badge system highlights 
users with special recognition, such as long-term subscribers, top 
contributors, or other community achievements. This context can inform 
how users interpret and respond to comments, particularly in determining
 whether feedback comes from engaged community members versus casual 
observers.


The extension essentially 
transforms passive comment consumption into a more informed experience 
by providing relevant profile context without disrupting the natural 
comment reading flow. This can lead to more meaningful community 
interactions and help users identify valuable contributors within 
YouTube's comment ecosystem.

YouTube doesn’t provide a public API for Profile Card information, so 
this extension gathers it by opening each commenter’s profile popup and 
reading the details. This may cause brief delays while processing 
comments.
